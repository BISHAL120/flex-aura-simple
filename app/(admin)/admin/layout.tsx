import * as React from "react"
import { AdminStoreProvider } from "@/components/admin/admin-store-provider"
import { AdminShell } from "@/components/admin/admin-shell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminStoreProvider>
      <AdminShell>{children}</AdminShell>
    </AdminStoreProvider>
  )
}
