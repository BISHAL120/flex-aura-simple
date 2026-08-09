"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CreditCardIcon,
  LockIcon,
  ShoppingBagIcon,
} from "lucide-react"

import { Container } from "@/components/site/container"
import { SectionHeading } from "@/components/site/section-heading"
import { useStore } from "@/components/store-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/data"
import { getShipping } from "@/lib/cart"
import { writeStoredOrder } from "@/lib/order"
import { cn } from "@/lib/utils"

type Step = "details" | "payment"

const CARD_NUMBER_PATTERN = "[0-9 ]{13,23}"
const EXPIRY_PATTERN = "(0[1-9]|1[0-2])/[0-9]{2}"
const CVC_PATTERN = "[0-9]{3,4}"

function isValidCardNumber(value: string) {
  const digits = value.replace(/[^0-9]/g, "")
  return digits.length >= 13 && digits.length <= 19
}

export function CheckoutView() {
  const router = useRouter()
  const { cartItems, subtotal, clearCart } = useStore()
  const [step, setStep] = React.useState<Step>("details")
  const [pending, setPending] = React.useState(false)
  const paymentFormRef = React.useRef<HTMLFormElement>(null)
  const timerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      // Don't let a pending payment redirect fire after the component unmounts
      // (e.g. the user navigates away mid-"processing").
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const shipping = getShipping(subtotal)
  const total = subtotal + shipping

  function handleDetailsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStep("payment")
    // Move focus into the payment form so keyboard/screen-reader users aren't
    // left on the now-hidden details button.
    paymentFormRef.current
      ?.querySelector<HTMLElement>("input")
      ?.focus()
  }

  function handlePaymentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    if (cartItems.length === 0) return

    const form = event.currentTarget
    const cardNumber = new FormData(form).get("cardNumber")
    if (typeof cardNumber === "string" && !isValidCardNumber(cardNumber)) {
      form.querySelector<HTMLElement>('input[name="cardNumber"]')?.focus()
      return
    }

    setPending(true)

    // Placeholder for a real order API. A production build would POST the
    // cart to a route handler/server action that re-validates prices.
    const orderNumber = `FA-${(crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8).toUpperCase()}`
    writeStoredOrder({ orderNumber, total })

    // Keep the cart intact while "processing", then clear it and navigate.
    // Clearing before the redirect would swap the checkout page to the empty
    // state mid-flight and strand the user.
    timerRef.current = window.setTimeout(() => {
      clearCart()
      setPending(false)
      router.push("/order-confirmation")
    }, 900)
  }

  if (cartItems.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-5 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBagIcon className="size-7 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-semibold">Nothing to check out</h1>
          <p className="text-sm text-muted-foreground">
            Your cart is empty — add some products first.
          </p>
        </div>
        <Button size="lg" render={<Link href="/" />} nativeButton={false}>
          Continue shopping
        </Button>
      </Container>
    )
  }

  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading
        align="left"
        eyebrow="Secure checkout"
        title={step === "details" ? "Customer details" : "Payment"}
        className="mb-6"
      />

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-3 text-sm">
        <StepChip active={step === "details"} done={step === "payment"} label="Details" />
        <span className="h-px w-10 bg-border" />
        <StepChip active={step === "payment"} done={false} label="Payment" />
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          {/* Step 1: customer details */}
          <form
            onSubmit={handleDetailsSubmit}
            className={cn("flex flex-col gap-4 rounded-lg border bg-card p-5", step !== "details" && "hidden")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  name="firstName"
                  autoComplete="given-name"
                  required
                  placeholder="Jane"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  name="lastName"
                  autoComplete="family-name"
                  required
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-email">Email</Label>
              <Input
                id="checkout-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jane@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                autoComplete="street-address"
                required
                placeholder="128 Market Street"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" autoComplete="address-level2" required placeholder="Dhaka" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" name="zip" autoComplete="postal-code" required placeholder="94105" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" autoComplete="country-name" required placeholder="United States" />
              </div>
            </div>
            <Button type="submit" size="lg" className="mt-1">
              Continue to Payment
              <ArrowRightIcon />
            </Button>
          </form>

          {/* Step 2: payment */}
          <form
            ref={paymentFormRef}
            onSubmit={handlePaymentSubmit}
            aria-busy={pending}
            className={cn("flex flex-col gap-4 rounded-lg border bg-card p-5", step !== "payment" && "hidden")}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LockIcon className="size-4" />
              This is a demo checkout — no payment is processed or stored.
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-name">Name on card</Label>
              <Input
                id="card-name"
                name="cardName"
                autoComplete="cc-name"
                required
                placeholder="Jane Doe"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-number">Card number</Label>
              <Input
                id="card-number"
                name="cardNumber"
                autoComplete="cc-number"
                required
                inputMode="numeric"
                pattern={CARD_NUMBER_PATTERN}
                title="Card number must be 13–19 digits"
                placeholder="4242 4242 4242 4242"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  name="expiry"
                  autoComplete="cc-exp"
                  required
                  inputMode="numeric"
                  pattern={EXPIRY_PATTERN}
                  title="Expiry must be in MM/YY format"
                  placeholder="MM/YY"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  name="cvc"
                  autoComplete="cc-csc"
                  required
                  inputMode="numeric"
                  pattern={CVC_PATTERN}
                  title="CVC must be 3–4 digits"
                  placeholder="123"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("details")}
                disabled={pending}
              >
                <ArrowLeftIcon />
                Back
              </Button>
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Processing…" : "Pay"}
                {!pending && <CreditCardIcon />}
              </Button>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-heading text-base font-semibold">Order summary</h2>
          <div className="flex flex-col gap-3">
            {cartItems.map((item) => (
              <div key={`${item.product.id}-${item.variant}`} className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="my-1 border-t" />
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

function StepChip({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <span
      aria-current={active ? "step" : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        active && "border-foreground bg-foreground text-background",
        done && "border-primary bg-primary/10 text-primary",
        !active && !done && "border-border text-muted-foreground"
      )}
    >
      {done ? <LockIcon className="size-3" /> : null}
      {label}
    </span>
  )
}
