import { AdminShell } from "@/components/admin/admin-shell"
import { isAdmin } from "@/lib/check-Access"
import * as React from "react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {

  await isAdmin()

  return (
    <AdminShell>{children}</AdminShell>
  )
}
