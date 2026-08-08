export const FREE_SHIPPING_THRESHOLD = 50
export const SHIPPING_FEE = 9.99

/** Shipping is free at or above the threshold, or when the cart is empty. */
export function getShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE
}
