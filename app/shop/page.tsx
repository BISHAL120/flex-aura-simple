import type { Metadata } from "next"
import * as React from "react"

import { PageShell } from "@/components/site/page-shell"
import { ShopView } from "@/components/site/shop-view"

export const metadata: Metadata = {
  title: "Shop Metal Art — Flex Aura",
  description:
    "Laser-cut 2mm metal wall art — cars, bikes, custom designs and backlit LED pieces, made to order in your size.",
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
