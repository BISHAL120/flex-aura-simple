"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { getShipping } from "@/lib/cart"
import { formatPrice } from "@/lib/data"
import { writeStoredOrder } from "@/lib/order"
import { cn } from "@/lib/utils"
import {
  checkoutDetailsSchema,
  checkoutPaymentSchema,
  type CheckoutDetailsFormValues,
  type CheckoutPaymentFormValues,
} from "@/lib/validators"

type Step = "details" | "payment"

const CheckoutPage = () => {
  const router = useRouter()
  const { cartItems, subtotal, clearCart } = useStore()
  const [step, setStep] = React.useState<Step>("details")
  const [pending, setPending] = React.useState(false)
  const timerRef = React.useRef<number | null>(null)

  // Step 1 Form
  const detailsForm = useForm<CheckoutDetailsFormValues>({
    resolver: zodResolver(checkoutDetailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zip: "",
      country: "United States",
    },
  })

  // Step 2 Form
  const paymentForm = useForm<CheckoutPaymentFormValues>({
    resolver: zodResolver(checkoutPaymentSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  })

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const shipping = getShipping(subtotal)
  const total = subtotal + shipping

  function onDetailsSubmit(_data: CheckoutDetailsFormValues) {
    setStep("payment")
  }

  function onDetailsError() {
    toast.add({
      type: "error",
      title: "Details required",
      description: "Please fill in all shipping details before proceeding.",
    })
  }

  function onPaymentSubmit(_data: CheckoutPaymentFormValues) {
    if (pending || cartItems.length === 0) return

    setPending(true)
    const orderNumber = `FA-${(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)).slice(0, 8).toUpperCase()}`
    writeStoredOrder({ orderNumber, total })

    timerRef.current = window.setTimeout(() => {
      clearCart()
      setPending(false)
      toast.add({
        type: "success",
        title: "Order placed!",
        description: `Your order #${orderNumber} has been received.`,
      })
      router.push("/order-confirmation")
    }, 900)
  }

  function onPaymentError() {
    toast.add({
      type: "error",
      title: "Payment invalid",
      description: "Please check your payment information and try again.",
    })
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
            onSubmit={detailsForm.handleSubmit(onDetailsSubmit, onDetailsError)}
            className={cn("flex flex-col gap-4 rounded-lg border bg-card p-5", step !== "details" && "hidden")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chk-first-name">First name</Label>
                <Input
                  id="chk-first-name"
                  autoComplete="given-name"
                  placeholder="Jane"
                  {...detailsForm.register("firstName")}
                />
                {detailsForm.formState.errors.firstName && (
                  <FieldError errors={[{ message: detailsForm.formState.errors.firstName.message }]} />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chk-last-name">Last name</Label>
                <Input
                  id="chk-last-name"
                  autoComplete="family-name"
                  placeholder="Doe"
                  {...detailsForm.register("lastName")}
                />
                {detailsForm.formState.errors.lastName && (
                  <FieldError errors={[{ message: detailsForm.formState.errors.lastName.message }]} />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chk-email">Email</Label>
              <Input
                id="chk-email"
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                {...detailsForm.register("email")}
              />
              {detailsForm.formState.errors.email && (
                <FieldError errors={[{ message: detailsForm.formState.errors.email.message }]} />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chk-phone">Phone</Label>
              <Input
                id="chk-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                {...detailsForm.register("phone")}
              />
              {detailsForm.formState.errors.phone && (
                <FieldError errors={[{ message: detailsForm.formState.errors.phone.message }]} />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chk-address">Address</Label>
              <Input
                id="chk-address"
                autoComplete="street-address"
                placeholder="128 Market Street"
                {...detailsForm.register("address")}
              />
              {detailsForm.formState.errors.address && (
                <FieldError errors={[{ message: detailsForm.formState.errors.address.message }]} />
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chk-city">City</Label>
                <Input
                  id="chk-city"
                  autoComplete="address-level2"
                  placeholder="Austin"
                  {...detailsForm.register("city")}
                />
                {detailsForm.formState.errors.city && (
                  <FieldError errors={[{ message: detailsForm.formState.errors.city.message }]} />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chk-zip">ZIP</Label>
                <Input
                  id="chk-zip"
                  autoComplete="postal-code"
                  placeholder="78701"
                  {...detailsForm.register("zip")}
                />
                {detailsForm.formState.errors.zip && (
                  <FieldError errors={[{ message: detailsForm.formState.errors.zip.message }]} />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chk-country">Country</Label>
                <Input
                  id="chk-country"
                  autoComplete="country-name"
                  placeholder="United States"
                  {...detailsForm.register("country")}
                />
                {detailsForm.formState.errors.country && (
                  <FieldError errors={[{ message: detailsForm.formState.errors.country.message }]} />
                )}
              </div>
            </div>
            <Button type="submit" size="lg" className="mt-1">
              Continue to Payment
              <ArrowRightIcon />
            </Button>
          </form>

          {/* Step 2: payment */}
          <form
            onSubmit={paymentForm.handleSubmit(onPaymentSubmit, onPaymentError)}
            aria-busy={pending}
            className={cn("flex flex-col gap-4 rounded-lg border bg-card p-5", step !== "payment" && "hidden")}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LockIcon className="size-4" />
              This is a demo checkout — mock orders will be saved to your workshop.
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-name">Name on card</Label>
              <Input
                id="card-name"
                autoComplete="cc-name"
                placeholder="Jane Doe"
                {...paymentForm.register("cardName")}
              />
              {paymentForm.formState.errors.cardName && (
                <FieldError errors={[{ message: paymentForm.formState.errors.cardName.message }]} />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-number">Card number</Label>
              <Input
                id="card-number"
                autoComplete="cc-number"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                {...paymentForm.register("cardNumber")}
              />
              {paymentForm.formState.errors.cardNumber && (
                <FieldError errors={[{ message: paymentForm.formState.errors.cardNumber.message }]} />
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  {...paymentForm.register("expiry")}
                />
                {paymentForm.formState.errors.expiry && (
                  <FieldError errors={[{ message: paymentForm.formState.errors.expiry.message }]} />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  autoComplete="cc-csc"
                  placeholder="123"
                  {...paymentForm.register("cvc")}
                />
                {paymentForm.formState.errors.cvc && (
                  <FieldError errors={[{ message: paymentForm.formState.errors.cvc.message }]} />
                )}
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
                  {formatPrice(item.price * item.quantity)}
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

export default CheckoutPage

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
