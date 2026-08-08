export const ORDER_STORAGE_KEY = "flex-aura-last-order"

export type StoredOrder = {
  orderNumber: string
  total: number
}

export function isStoredOrder(value: unknown): value is StoredOrder {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as StoredOrder).orderNumber === "string" &&
    typeof (value as StoredOrder).total === "number" &&
    Number.isFinite((value as StoredOrder).total)
  )
}

export function readStoredOrder(): StoredOrder | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(ORDER_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isStoredOrder(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeStoredOrder(order: StoredOrder) {
  try {
    window.sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order))
  } catch {
    // storage unavailable — order still completes, just without a persisted receipt
  }
}

export function clearStoredOrder() {
  try {
    window.sessionStorage.removeItem(ORDER_STORAGE_KEY)
  } catch {
    // ignore
  }
}
