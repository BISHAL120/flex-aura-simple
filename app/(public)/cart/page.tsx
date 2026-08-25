import CartPage from "@/components/public/cart-page/cart-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Your Cart — Flex Aura",
  description: "Review the metal art pieces in your Flex Aura cart before checking out.",
}

const page = () => {
  return (
    <div>
      <CartPage />
    </div>
  )
}

export default page