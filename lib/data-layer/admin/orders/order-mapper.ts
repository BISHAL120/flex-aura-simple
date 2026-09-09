import type { Order } from "@prisma/client"
import type { AdminOrder, OrderItem } from "@/lib/admin-orders-data"

/** Integer cents -> USD dollars. */
const fromCents = (cents: number) => cents / 100

type OrderItemsJson = {
  productId: string
  productName: string
  productImage: string
  variant: string
  quantity: number
  price: number
}[]

type ShippingAddressJson = {
  street: string
  city: string
  zip: string
  country: string
}

function parseItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (i): i is OrderItemsJson[number] =>
        !!i &&
        typeof i === "object" &&
        typeof (i as OrderItemsJson[number]).productId === "string" &&
        typeof (i as OrderItemsJson[number]).productName === "string" &&
        typeof (i as OrderItemsJson[number]).variant === "string"
    )
    .map((i) => ({
      productId: i.productId,
      productName: i.productName,
      productImage: typeof i.productImage === "string" ? i.productImage : "",
      variant: i.variant,
      quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
      price: Math.max(0, Math.round(Number(i.price) || 0)),
    }))
}

function parseShippingAddress(value: unknown): ShippingAddressJson {
  const fallback: ShippingAddressJson = { street: "", city: "", zip: "", country: "" }
  if (!value || typeof value !== "object") return fallback
  const v = value as Record<string, unknown>
  return {
    street: typeof v.street === "string" ? v.street : "",
    city: typeof v.city === "string" ? v.city : "",
    zip: typeof v.zip === "string" ? v.zip : "",
    country: typeof v.country === "string" ? v.country : "",
  }
}

export function mapOrderToAdminOrder(order: Order): AdminOrder {
  const items = parseItems(order.items)
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: parseShippingAddress(order.shippingAddress),
    items,
    subtotal: fromCents(order.subtotal),
    shipping: fromCents(order.shipping),
    total: fromCents(order.total),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    trackingNumber: order.trackingNumber ?? undefined,
    notes: order.notes ?? undefined,
    createdAt: order.createdAt.toISOString(),
  }
}

export function mapOrdersToAdminOrders(orders: Order[]): AdminOrder[] {
  return orders.map(mapOrderToAdminOrder)
}
