import type { Metadata } from "next"

import { PageShell } from "@/components/site/page-shell"
import { CheckoutView } from "@/components/site/checkout-view"

export const metadata: Metadata = {
  title: "Checkout — Flex Aura",
  description: "Complete your metal art purchase at Flex Aura.",
}

export default function CheckoutPage() {
  return (
    <PageShell>
      <CheckoutView />
    </PageShell>
  )
}
