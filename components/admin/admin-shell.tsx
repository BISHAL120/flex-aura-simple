"use client"

import * as React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export interface AdminDashboardCounts {
  pendingOrders: number
  newCustomOrders: number
}

interface AdminShellProps {
  children: React.ReactNode
  customOrderCounts: {
    total: number
    openCount: number
    inProductionCount: number
  }
}

export function AdminShell({ children, customOrderCounts }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar (fixed/sticky) */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="fixed inset-y-0 z-40 flex w-64 flex-col">
          <AdminSidebar
            newCustomOrdersCount={customOrderCounts.openCount}
          />
        </div>
      </div>

      {/* Main Content Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main id="admin-main" data-admin-content className="admin-content flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
