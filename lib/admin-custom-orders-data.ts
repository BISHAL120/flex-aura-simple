import type { CustomOrderStatus } from "@prisma/client"

export type { CustomOrderStatus }

/** Admin/UI-facing shape for a custom order (mirrors the DB record). */
export type AdminCustomOrder = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  country: string
  deliveryAddress: string | null
  designRequirement: string
  sizeOption: string
  customDimensions: string | null
  withBacklitLed: boolean
  specialRequest: string | null
  referenceImage: string | null
  /** quotedPrice in integer cents (DB stores cents, UI shows dollars). */
  quotedPrice: number | null
  status: CustomOrderStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export const CUSTOM_ORDER_STATUSES: CustomOrderStatus[] = [
  "new",
  "quoted",
  "approved",
  "inProduction",
  "completed",
  "declined",
]

/** Terminal statuses — orders in these are no longer "open" for duplicate checks. */
export const CUSTOM_ORDER_OPEN_STATUSES: CustomOrderStatus[] = [
  "new",
  "quoted",
  "approved",
  "inProduction",
]

export const CUSTOM_ORDER_STATUS_LABELS: Record<CustomOrderStatus, string> = {
  new: "New (Needs Pricing)",
  quoted: "Priced (Awaiting Customer Confirmation)",
  approved: "Approved / Deposit Paid",
  inProduction: "In Laser Production & Coating",
  completed: "Completed & Delivered",
  declined: "Declined",
}
