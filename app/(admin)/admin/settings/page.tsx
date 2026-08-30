import * as React from "react"
import type { Metadata } from "next"
import { StoreSettingsForm } from "@/components/admin/settings/store-settings-form"

export const metadata: Metadata = {
  title: "Store Settings — Flex Aura Admin",
  description: "Configure shipping thresholds, WhatsApp ordering hotline, support contacts, and workshop lead times.",
}

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Store &amp; Workshop Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure storefront identity, customer support channels, shipping rules, and workshop dispatch parameters.
        </p>
      </div>

      <StoreSettingsForm />
    </div>
  )
}
