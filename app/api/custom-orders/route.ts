import { NextRequest, NextResponse } from "next/server"
import { customOrderSchema } from "@/lib/validators"
import {
  createCustomOrder,
  findOpenCustomOrderByContact,
} from "@/lib/data-layer/admin/custom-orders/custom-order-data-layer"

export const runtime = "nodejs"

/**
 * Public endpoint for submitting a custom metal art order request.
 *
 * Flow:
 *  1. Validate the payload (zod).
 *  2. Reject duplicate submissions: if the same phone OR email already has an
 *     open (non-terminal) custom order, return 409 with the existing order so
 *     the storefront can show "you already have a request in progress".
 *  3. Persist the order with status `new` and a generated order number.
 *
 * Reference images are uploaded by the client directly to Firebase before
 * submit (same pattern as admin product/category images), so this route only
 * stores the resulting URL — it never accepts file uploads.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = customOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid custom order data" },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Duplicate guard: any open order (new → in production) for the same
    // contact means the customer already has a request in the pipeline.
    const existing = await findOpenCustomOrderByContact({
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
    })

    if (existing) {
      return NextResponse.json(
        {
          message: "You already have a custom order request in progress.",
          duplicate: true,
          order: {
            id: existing.id,
            orderNumber: existing.orderNumber,
            status: existing.status,
            createdAt: existing.createdAt.toISOString(),
          },
        },
        { status: 409 }
      )
    }

    const order = await createCustomOrder({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      country: data.country,
      deliveryAddress: data.deliveryAddress || null,
      designRequirement: data.designRequirement,
      sizeOption: data.sizeOption,
      customDimensions: data.customDimensions || null,
      withBacklitLed: data.withBacklitLed,
      specialRequest: data.specialRequest || null,
      referenceImage: data.referenceImage || null,
    })

    return NextResponse.json(
      {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error submitting custom order:", error)
    return NextResponse.json(
      { message: "Failed to submit custom order. Please try again." },
      { status: 500 }
    )
  }
}
