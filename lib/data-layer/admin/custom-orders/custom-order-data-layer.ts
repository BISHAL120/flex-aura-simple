import db from "@/lib/prisma"
import { Prisma, type CustomOrderStatus } from "@prisma/client"
import { CUSTOM_ORDER_OPEN_STATUSES } from "@/lib/admin-custom-orders-data"

export interface CustomOrderListResult {
  orders: Prisma.CustomOrderGetPayload<object>[]
  counts: Record<CustomOrderStatus | "all", number>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

/** Normalizes a user-typed order number (CUST-XXXX) for lookups. */
export function normalizeOrderNumber(value: string): string {
  return value.trim().toUpperCase()
}

export const getAllCustomOrders = async (
  page: number = 1,
  per_page: number = 6,
  search: string = "",
  status: CustomOrderStatus | "all" = "all"
): Promise<CustomOrderListResult> => {
  try {
    const skip = (page - 1) * per_page
    const limit = per_page

    const where: Prisma.CustomOrderWhereInput = {}
    if (status !== "all") where.status = status

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search } },
        { country: { contains: search, mode: "insensitive" } },
        { designRequirement: { contains: search, mode: "insensitive" } },
        { deliveryAddress: { contains: search, mode: "insensitive" } },
      ]
    }

    const [total, orders, grouped] = await Promise.all([
      db.customOrder.count({ where }),
      db.customOrder.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      db.customOrder.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ])

    const counts = Object.fromEntries(
      (["all", "new", "quoted", "approved", "inProduction", "completed", "declined"] as const).map(
        (s) => [s, 0]
      )
    ) as Record<CustomOrderStatus | "all", number>

    counts.all = total
    for (const g of grouped) counts[g.status as CustomOrderStatus] = g._count._all

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
    console.error("Error fetching custom orders:", error)
    throw new Error("Failed to fetch custom orders")
  }
}

export const getCustomOrderById = async (id: string) => {
  try {
    return await db.customOrder.findUnique({ where: { id } })
  } catch (error) {
    console.error(`Error fetching custom order ${id}:`, error)
    throw new Error("Failed to fetch custom order")
  }
}

export const getCustomOrderByOrderNumber = async (orderNumber: string) => {
  try {
    return await db.customOrder.findUnique({
      where: { orderNumber: normalizeOrderNumber(orderNumber) },
    })
  } catch (error) {
    console.error(`Error fetching custom order ${orderNumber}:`, error)
    throw new Error("Failed to fetch custom order")
  }
}

/**
 * Returns an open (non-terminal) custom order matching the same phone OR
 * email, so the storefront can warn customers that they already have a
 * request in the pipeline instead of creating a duplicate.
 */
export const findOpenCustomOrderByContact = async (contact: {
  customerEmail: string
  customerPhone: string
}) => {
  try {
    return await db.customOrder.findFirst({
      where: {
        status: { in: CUSTOM_ORDER_OPEN_STATUSES },
        OR: [
          { customerEmail: contact.customerEmail.trim().toLowerCase() },
          { customerPhone: contact.customerPhone.trim() },
        ],
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Error finding open custom order by contact:", error)
    throw new Error("Failed to check for existing custom order")
  }
}

export interface CustomOrderCreateData {
  customerName: string
  customerEmail: string
  customerPhone: string
  country: string
  deliveryAddress?: string | null
  designRequirement: string
  sizeOption: string
  customDimensions?: string | null
  withBacklitLed: boolean
  specialRequest?: string | null
  referenceImage?: string | null
}

const ORDER_NUMBER_PREFIX = "CUST-"
const ORDER_NUMBER_MIN_WIDTH = 4

/**
 * Parses the numeric sequence from an order number like `CUST-0001`.
 * Returns null when the value doesn't match the expected pattern (e.g. a
 * legacy or hand-typed number), so callers can safely fall back to 1.
 */
function parseOrderNumberSequence(orderNumber: string): number | null {
  const match = orderNumber.match(/^CUST-(\d+)$/)
  if (!match) return null
  const parsed = Number(match[1])
  return Number.isSafeInteger(parsed) ? parsed : null
}

function formatOrderNumber(sequence: number): string {
  return `${ORDER_NUMBER_PREFIX}${String(sequence).padStart(ORDER_NUMBER_MIN_WIDTH, "0")}`
}

/** Highest sequence currently in use, or 0 when the collection is empty. */
async function getMaxOrderNumberSequence(): Promise<number> {
  const orders = await db.customOrder.findMany({
    select: { orderNumber: true },
  })
  let max = 0
  for (const order of orders) {
    const parsed = parseOrderNumberSequence(order.orderNumber)
    if (parsed !== null && parsed > max) max = parsed
  }
  return max
}

export const createCustomOrder = async (data: CustomOrderCreateData) => {
  // The next order number is derived from the highest sequence in use and
  // retried on a unique-conflict so concurrent submissions never collide.
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = formatOrderNumber((await getMaxOrderNumberSequence()) + 1)

    try {
      return await db.customOrder.create({
        data: {
          orderNumber,
          customerName: data.customerName.trim(),
          customerEmail: data.customerEmail.trim().toLowerCase(),
          customerPhone: data.customerPhone.trim(),
          country: data.country.trim(),
          deliveryAddress: data.deliveryAddress?.trim() || null,
          designRequirement: data.designRequirement.trim(),
          sizeOption: data.sizeOption,
          customDimensions: data.customDimensions?.trim() || null,
          withBacklitLed: data.withBacklitLed,
          specialRequest: data.specialRequest?.trim() || null,
          referenceImage: data.referenceImage || null,
          status: "new",
        },
      })
    } catch (error) {
      // Unique violation on orderNumber means another request won the race;
      // recompute and try again.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue
      }
      console.error("Error creating custom order:", error)
      throw new Error("Failed to create custom order")
    }
  }

  throw new Error("Failed to create custom order: could not allocate an order number")
}

export const updateCustomOrder = async (
  id: string,
  data: {
    quotedPrice?: number | null
    status?: CustomOrderStatus
    notes?: string | null
  }
) => {
  try {
    return await db.customOrder.update({
      where: { id },
      data: {
        ...(data.quotedPrice !== undefined && { quotedPrice: data.quotedPrice }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })
  } catch (error) {
    console.error(`Error updating custom order ${id}:`, error)
    throw new Error("Failed to update custom order")
  }
}

/** Counts used by the admin dashboard widgets. */
export const getCustomOrderDashboardCounts = async () => {
  try {
    const [total, openCount, inProductionCount] = await Promise.all([
      db.customOrder.count(),
      db.customOrder.count({ where: { status: { in: CUSTOM_ORDER_OPEN_STATUSES } } }),
      db.customOrder.count({ where: { status: "inProduction" } }),
    ])
    return { total, openCount, inProductionCount }
  } catch (error) {
    console.error("Error fetching custom order dashboard counts:", error)
    throw new Error("Failed to fetch custom order dashboard counts")
  }
}

/** Recent open orders for the overview pipeline widget. */
export const getRecentOpenCustomOrders = async (limit = 4) => {
  try {
    return await db.customOrder.findMany({
      where: { status: { in: ["new", "quoted", "approved"] } },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  } catch (error) {
    console.error("Error fetching recent custom orders:", error)
    throw new Error("Failed to fetch recent custom orders")
  }
}
