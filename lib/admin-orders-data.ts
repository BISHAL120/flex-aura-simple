import type { OrderStatus as DbOrderStatus, PaymentStatus as DbPaymentStatus } from "@prisma/client"

export type OrderStatus = DbOrderStatus
export type PaymentStatus = DbPaymentStatus

export type OrderItem = {
  productId: string
  productName: string
  productImage: string
  variant: string
  quantity: number
  /** Unit price in integer cents at time of order. */
  price: number
}

export type AdminOrder = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: {
    street: string
    city: string
    zip: string
    country: string
  }
  items: OrderItem[]
  /** USD dollars (converted from DB cents at the mapper boundary). */
  subtotal: number
  shipping: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  trackingNumber?: string
  notes?: string
  createdAt: string
}
