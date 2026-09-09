import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import db from "@/lib/prisma"
import { updateOrder } from "@/lib/data-layer/admin/orders/order-data-layer"
import { mapOrderToAdminOrder } from "@/lib/data-layer/admin/orders/order-mapper"
import { requireAdminApi } from "@/lib/check-Access"

const updateSchema = z
  .object({
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
    paymentStatus: z.enum(["pending", "paid", "refunded"]).optional(),
    trackingNumber: z.string().max(200).nullable().optional(),
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
      return NextResponse.json({ message: "Invalid order id" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      )
    }

    const existing = await db.order.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    const order = await updateOrder(id, {
      status: parsed.data.status,
      paymentStatus: parsed.data.paymentStatus,
      trackingNumber:
        parsed.data.trackingNumber !== undefined
          ? parsed.data.trackingNumber?.trim() || null
          : undefined,
      notes:
        parsed.data.notes !== undefined
          ? parsed.data.notes?.trim() || null
          : undefined,
    })

    return NextResponse.json({ order: mapOrderToAdminOrder(order) }, { status: 200 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    console.error("Error updating order:", error)
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 })
  }
}
