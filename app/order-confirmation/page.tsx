"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2Icon, PackageIcon, MailIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { Button } from "@/components/ui/button"
import { clearStoredOrder, readStoredOrder } from "@/lib/order"

function subscribeToOrder(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

export default function OrderConfirmationPage() {
  // Read the order from sessionStorage synchronously (client-only, after
  // mount) so the confirmation renders without a flash of the fallback.
  const order = React.useSyncExternalStore(
    subscribeToOrder,
    () => readStoredOrder(),
    () => null
  )

  // Consume the stored receipt after reading it so a refresh doesn't show it.
  React.useEffect(() => {
    if (order) clearStoredOrder()
  }, [order])

  return (
    <Container className="flex flex-col items-center gap-6 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2Icon className="size-8" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Order confirmed!
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Thank you for shopping with Flex Aura. A confirmation email is on its way
          with all the details of your order.
        </p>
      </div>

      <div aria-live="polite" className="flex w-full max-w-sm flex-col gap-3">
        {order ? (
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Order number</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total paid</span>
              <span className="font-semibold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(order.total)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-lg border bg-card px-5 py-3 text-sm text-muted-foreground">
            <PackageIcon className="size-4" />
            Your order is being processed.
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MailIcon className="size-4" />
        Questions about your order? Email{" "}
        <a href="mailto:hello@flexaurametal.com" className="font-medium text-foreground underline underline-offset-2">
          hello@flexaurametal.com
        </a>
      </div>

      <Button size="lg" render={<Link href="/" />}>
        Continue shopping
      </Button>
    </Container>
  )
}
