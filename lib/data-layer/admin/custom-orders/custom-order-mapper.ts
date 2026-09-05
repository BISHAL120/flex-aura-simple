import type { CustomOrder } from "@prisma/client"
import type { AdminCustomOrder } from "@/lib/admin-custom-orders-data"

export function mapCustomOrderToAdminCustomOrder(order: CustomOrder): AdminCustomOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    country: order.country,
    deliveryAddress: order.deliveryAddress,
    designRequirement: order.designRequirement,
    sizeOption: order.sizeOption,
    customDimensions: order.customDimensions,
    withBacklitLed: order.withBacklitLed,
    specialRequest: order.specialRequest,
    referenceImage: order.referenceImage,
    quotedPrice: order.quotedPrice,
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}

export function mapCustomOrdersToAdminCustomOrders(orders: CustomOrder[]): AdminCustomOrder[] {
  return orders.map(mapCustomOrderToAdminCustomOrder)
}
