import db from "@/lib/prisma"
import { Prisma, type OrderStatus, type PaymentStatus } from "@prisma/client"

export interface OrderListResult {
  orders: Prisma.OrderGetPayload<object>[]
  counts: Record<OrderStatus | "all", number>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

/** Shipping rule mirror of lib/cart.ts, but on integer cents. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000 // $50
export const SHIPPING_FEE_CENTS = 999 // $9.99

export function computeShippingCents(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS || subtotalCents === 0
    ? 0
    : SHIPPING_FEE_CENTS
}

export const getAllOrders = async (
  page: number = 1,
  per_page: number = 6,
  search: string = "",
  status: OrderStatus | "all" = "all",
): Promise<OrderListResult> => {
  try {
    const skip = (page - 1) * per_page
    const limit = per_page

    const where: Prisma.OrderWhereInput = {}
    if (status !== "all") where.status = status

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search } },
      ]
    }

    const [total, orders, grouped] = await Promise.all([
      db.order.count({ where }),
      db.order.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ])

    const counts = Object.fromEntries(
      (["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const).map((s) => [
        s,
        0,
      ])
    ) as Record<OrderStatus | "all", number>

    counts.all = total
    for (const g of grouped) counts[g.status as OrderStatus] = g._count._all

    return {
      orders,
      counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error("Failed to fetch orders")
  }
}

export const getOrderById = async (id: string) => {
  try {
    return await db.order.findUnique({ where: { id } })
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error)
    throw new Error("Failed to fetch order")
  }
}

export const getOrderByOrderNumber = async (orderNumber: string) => {
  try {
    return await db.order.findUnique({
      where: { orderNumber: orderNumber.trim().toUpperCase() },
    })
  } catch (error) {
    console.error(`Error fetching order ${orderNumber}:`, error)
    throw new Error("Failed to fetch order")
  }
}

// ---------------------------------------------------------------------------
// Order number allocation (sequential, human-readable, race-safe)
// ---------------------------------------------------------------------------

const ORDER_NUMBER_PREFIX = "FA-"
const ORDER_NUMBER_MIN_WIDTH = 4

function parseOrderNumberSequence(orderNumber: string): number | null {
  const match = orderNumber.match(/^FA-(\d+)$/)
  if (!match) return null
  const parsed = Number(match[1])
  return Number.isSafeInteger(parsed) ? parsed : null
}

function formatOrderNumber(sequence: number): string {
  return `${ORDER_NUMBER_PREFIX}${String(sequence).padStart(ORDER_NUMBER_MIN_WIDTH, "0")}`
}

async function getMaxOrderNumberSequence(): Promise<number> {
  const orders = await db.order.findMany({ select: { orderNumber: true } })
  let max = 0
  for (const order of orders) {
    const parsed = parseOrderNumberSequence(order.orderNumber)
    if (parsed !== null && parsed > max) max = parsed
  }
  return max
}

export interface OrderCreateData {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: { street: string; city: string; zip: string; country: string }
  items: {
    productId: string
    productName: string
    productImage: string
    variant: string
    quantity: number
    /** Unit price in cents. */
    price: number
  }[]
  subtotal: number
  shipping: number
  total: number
}

/**
 * Creates an order with a sequentially allocated order number. Retries on a
 * unique conflict so concurrent checkouts never collide.
 */
export const createOrder = async (data: OrderCreateData) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = formatOrderNumber((await getMaxOrderNumberSequence()) + 1)
    try {
      return await db.order.create({
        data: {
          orderNumber,
          customerName: data.customerName.trim(),
          customerEmail: data.customerEmail.trim().toLowerCase(),
          customerPhone: data.customerPhone.trim(),
          shippingAddress: data.shippingAddress as object,
          items: data.items as object,
          subtotal: data.subtotal,
          shipping: data.shipping,
          total: data.total,
          status: "pending",
          paymentStatus: "pending",
          paymentMethod: "Cash on Delivery",
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        continue
      }
      console.error("Error creating order:", error)
      throw new Error("Failed to create order")
    }
  }
  throw new Error("Failed to create order: could not allocate an order number")
}

export const updateOrder = async (
  id: string,
  data: {
    status?: OrderStatus
    paymentStatus?: PaymentStatus
    trackingNumber?: string | null
    notes?: string | null
  },
) => {
  try {
    return await db.order.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.paymentStatus !== undefined && { paymentStatus: data.paymentStatus }),
        ...(data.trackingNumber !== undefined && { trackingNumber: data.trackingNumber }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })
  } catch (error) {
    console.error(`Error updating order ${id}:`, error)
    throw new Error("Failed to update order")
  }
}

export const getOrderDashboardCounts = async () => {
  try {
    const [total, openCount] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: { in: ["pending", "processing"] } } }),
    ])
    return { total, openCount }
  } catch (error) {
    console.error("Error fetching order dashboard counts:", error)
    throw new Error("Failed to fetch order dashboard counts")
  }
}

/** Aggregates order KPIs: total, open orders, and revenue (non-cancelled). */
export const getOrderDashboardStats = async () => {
  try {
    const [total, openCount, paid] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: { in: ["pending", "processing"] } } }),
      db.order.findMany({
        where: { status: { not: "cancelled" } },
        select: { total: true },
      }),
    ])
    const revenueCents = paid.reduce((sum, o) => sum + o.total, 0)
    return { total, openCount, revenue: revenueCents / 100 }
  } catch (error) {
    console.error("Error fetching order dashboard stats:", error)
    throw new Error("Failed to fetch order dashboard stats")
  }
}

/** Recent orders for the overview widget, newest first. */
export const getRecentOrders = async (limit = 5) => {
  try {
    return await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    throw new Error("Failed to fetch recent orders")
  }
}
