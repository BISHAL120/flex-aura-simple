import type { Metadata } from "next"

import { PageShell } from "@/components/site/page-shell"
import { CartView } from "@/components/site/cart-view"

export const metadata: Metadata = {
  title: "Your Cart — Flex Aura",
  description: "Review the items in your Flex Aura cart before checking out.",
}

export default function CartPage() {
  return (
    <PageShell>
      <CartView />
    </PageShell>
  )
}
