import type { Metadata } from "next"
import * as React from "react"

import { ShopView } from "@/components/site/shop-view"

export const metadata: Metadata = {
  title: "Shop Metal Art — Flex Aura",
  description:
    "Laser-cut 2mm metal wall art — cars, bikes, custom designs and backlit LED pieces, made to order in your size.",
}

export default function ShopPage() {
  {/* TODO: Add Skeloton page fpr the shop page */ }
  return (
  < React.Suspense fallback={null} >
    <ShopView />
  </React.Suspense >

  )
}
