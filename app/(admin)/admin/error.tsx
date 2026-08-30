"use client"

import * as React from "react"
import { AlertTriangleIcon, RotateCcwIcon, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  function handleResetStorage() {
    try {
      window.localStorage.removeItem("flex-aura-admin-data-v1")
      window.localStorage.removeItem("flex-aura-cart-v1")
    } catch {
      // ignore
    }
    window.location.href = "/admin"
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <Card className="max-w-md border bg-card p-6 shadow-md flex flex-col items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="size-6" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-bold">Admin Panel Error</h2>
          <p className="text-xs text-muted-foreground">
            An unexpected error occurred while rendering the admin workshop interface.
          </p>
        </div>

        {error?.message && (
          <div className="w-full rounded bg-muted/60 p-3 text-left font-mono text-[11px] text-muted-foreground overflow-x-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => reset()} className="text-xs gap-1.5">
            <RefreshCwIcon className="size-3.5" />
            <span>Try Again</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetStorage}
            className="text-xs gap-1.5"
          >
            <RotateCcwIcon className="size-3.5" />
            <span>Reset Defaults &amp; Reload</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
