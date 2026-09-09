import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import db from "@/lib/prisma"
import {
  createOrder,
  computeShippingCents,
} from "@/lib/data-layer/admin/orders/order-data-layer"

export const runtime = "nodejs"

const lineItemSchema = z.object({
  productId: z.string().min(1),
  variant: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
})

/** Mongo ObjectIds are 24-char hex strings. */
function isObjectId(value: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(value)
}

const checkoutDetailsSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  address: z.string().min(3),
  city: z.string().min(2),
  zip: z.string().min(2),
  country: z.string().min(2),
})

const orderRequestSchema = z.object({
  details: checkoutDetailsSchema,
  items: z.array(lineItemSchema).min(1, "Cart is empty"),
})

/**
 * Public order submission.
 *
 * Server-authoritative: prices, availability, shipping and totals are all
 * recomputed here from the database — the client payload only carries which
 * product/variant + quantity is wanted. Line items are snapshotted so later
 * catalog edits never rewrite order history.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = orderRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid order data" },
        { status: 400 }
      )
    }

    const { details, items } = parsed.data

    // Fetch the requested products in one query (only active, non-deleted).
    // Only well-formed ObjectIds are queried — malformed ids are treated as
    // unavailable lines rather than crashing the Mongo query.
    const validIds = items
      .map((i) => i.productId)
      .filter(isObjectId)
    const products = await db.product.findMany({
      where: { id: { in: Array.from(new Set(validIds)) }, isDeleted: false, isActive: true },
      include: { variants: true },
    })
    const productById = new Map(products.map((p) => [p.id, p]))

    // Rebuild each line from the DB with the authoritative cents price. If any
    // requested item is unavailable (deleted/hidden/unknown product or a
    // variant that no longer exists), reject the whole order so the customer
    // never pays for a subset of what they approved.
    const resolvedLines: {
      productId: string
      productName: string
      productImage: string
      variant: string
      quantity: number
      price: number
    }[] = []

    let unavailableCount = 0
    for (const item of items) {
      const product = productById.get(item.productId)
      const variant = product?.variants.find((v) => v.name === item.variant)
      if (!product || !variant) {
        unavailableCount += 1
        continue
      }
      resolvedLines.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        variant: variant.name,
        quantity: item.quantity,
        price: variant.price,
      })
    }

    if (unavailableCount > 0) {
      return NextResponse.json(
        {
          message:
            unavailableCount === items.length
              ? "None of the items in your cart are available right now."
              : "Some items in your cart are no longer available. Please review your cart and try again.",
        },
        { status: 400 }
      )
    }

    const subtotal = resolvedLines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0
    )
    const shipping = computeShippingCents(subtotal)
    const total = subtotal + shipping

    const order = await createOrder({
      customerName: `${details.firstName.trim()} ${details.lastName.trim()}`.trim(),
      customerEmail: details.email,
      customerPhone: details.phone,
      shippingAddress: {
        street: details.address.trim(),
        city: details.city.trim(),
        zip: details.zip.trim(),
        country: details.country.trim(),
      },
      items: resolvedLines,
      subtotal,
      shipping,
      total,
    })

    return NextResponse.json(
      {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total / 100,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error placing order:", error)
    return NextResponse.json(
      { message: "Failed to place your order. Please try again." },
      { status: 500 }
    )
  }
}
