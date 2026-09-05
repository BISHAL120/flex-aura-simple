import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Prisma, type CustomOrderStatus } from "@prisma/client"
import db from "@/lib/prisma"
import { updateCustomOrder } from "@/lib/data-layer/admin/custom-orders/custom-order-data-layer"
import { mapCustomOrderToAdminCustomOrder } from "@/lib/data-layer/admin/custom-orders/custom-order-mapper"
import { requireAdminApi } from "@/lib/check-Access"
import { CUSTOM_ORDER_STATUSES } from "@/lib/admin-custom-orders-data"

const CUSTOM_ORDER_STATUS_VALUES = CUSTOM_ORDER_STATUSES as unknown as [
  CustomOrderStatus,
  ...CustomOrderStatus[],
]

const updateSchema = z
  .object({
    quotedPrice: z.number().min(0).nullable().optional(),
    status: z.enum(CUSTOM_ORDER_STATUS_VALUES).optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const { id } = await params
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid custom order id" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      )
    }

    const existing = await db.customOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: "Custom order not found" }, { status: 404 })
    }

    const order = await updateCustomOrder(id, {
      quotedPrice:
        parsed.data.quotedPrice !== undefined
          ? parsed.data.quotedPrice != null
            ? Math.round(parsed.data.quotedPrice * 100) // dollars -> cents
            : null
          : undefined,
      status: parsed.data.status,
      notes: parsed.data.notes,
    })

    return NextResponse.json(
      { order: mapCustomOrderToAdminCustomOrder(order) },
      { status: 200 }
    )
  } catch (error) {
    // Race: order deleted between pre-check and update.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Custom order not found" }, { status: 404 })
    }
    console.error("Error updating custom order:", error)
    return NextResponse.json({ message: "Failed to update custom order" }, { status: 500 })
  }
}
