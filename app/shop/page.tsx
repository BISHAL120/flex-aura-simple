import type { Metadata } from "next"
import * as React from "react"

import { PageShell } from "@/components/site/page-shell"
import { ShopView } from "@/components/site/shop-view"

export const metadata: Metadata = {
  title: "Shop All — Flex Aura",
  description: "Browse the full Flex Aura collection — fashion, accessories, home and tech.",
}

export default function ShopPage() {
  return (
    <PageShell>
      <React.Suspense fallback={null}>
        <ShopView />
      </React.Suspense>
    </PageShell>
  )
}
