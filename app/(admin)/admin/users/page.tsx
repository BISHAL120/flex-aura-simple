import * as React from "react"
import type { Metadata } from "next"
import { UserTable } from "@/components/admin/users/user-table"

export const metadata: Metadata = {
  title: "User Management — Flex Aura Admin",
  description: "Manage registered customers, workshop managers, administrator permissions, and ban statuses.",
}

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">
          View registered customer accounts, manage administrator &amp; workshop manager roles, inspect active sessions, and moderate user access.
        </p>
      </div>

      <UserTable />
    </div>
  )
}
