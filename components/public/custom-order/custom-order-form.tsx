"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, CheckCircle2Icon, ImagePlusIcon, Loader2Icon, SendIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { customOrderSchema, type CustomOrderFormValues } from "@/lib/validators"
import {
  submitCustomOrder,
  uploadReferenceImage,
  validateReferenceImage,
  type PublicCustomOrderResult,
} from "@/lib/data-layer/admin/custom-orders/custom-order-actions"

const SIZE_OPTIONS = [
  { value: "12x12", label: '12" × 12"' },
  { value: "18x18", label: '18" × 18"' },
  { value: "24x18", label: '24" × 18"' },
  { value: "30x20", label: '30" × 20"' },
  { value: "36x24", label: '36" × 24"' },
  { value: "custom", label: "Custom size" },
] as const

const COUNTRIES = [
  "Bangladesh",
  "India",
  "United Kingdom",
  "United States",
  "Other",
]

export function CustomOrderForm() {
  const [image, setImage] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const [result, setResult] = React.useState<PublicCustomOrderResult | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CustomOrderFormValues>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      country: "Bangladesh",
      deliveryAddress: "",
      designRequirement: "",
      sizeOption: "30x20",
      customDimensions: "",
      withBacklitLed: false,
      specialRequest: "",
      referenceImage: "",
    },
  })

  const watchedSize = watch("sizeOption")
  const watchedWithBacklit = watch("withBacklitLed")

  // Clean up object URL
  React.useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateReferenceImage(file)
    if (validationError) {
      toast.add({
        type: "error",
        title: "Invalid Image",
        description: validationError,
      })
      return
    }

    setImage(file)
    const preview = URL.createObjectURL(file)
    setImagePreview(preview)
    // Note: the blob preview is intentionally NOT written into the form value —
    // the uploaded Firebase URL is sent with the payload on submit.
  }

  async function onFormSubmit(data: CustomOrderFormValues) {
    if (pending) return
    setPending(true)
    setResult(null)

    try {
      // Upload a locally-picked reference image first; only after it succeeds
      // do we persist the order, so a failed upload never creates an order
      // without its reference art.
      let referenceImage: string | undefined
      if (image) {
        try {
          const validationError = validateReferenceImage(image)
          if (validationError) {
            toast.add({
              type: "error",
              title: "Invalid Image",
              description: validationError,
            })
            return
          }
          referenceImage = await uploadReferenceImage(image)
        } catch {
          toast.add({
            type: "error",
            title: "Image Upload Failed",
            description: "We couldn't upload your reference image. Please try again.",
          })
          return
        }
      }

      const selectedSize =
        data.sizeOption === "custom"
          ? "custom"
          : SIZE_OPTIONS.find((o) => o.value === data.sizeOption)?.label ?? data.sizeOption

      const payload = {
        ...data,
        sizeOption: selectedSize,
        referenceImage: referenceImage || undefined,
        deliveryAddress: data.deliveryAddress?.trim() || undefined,
        specialRequest: data.specialRequest?.trim() || undefined,
        customDimensions:
          data.sizeOption === "custom" ? data.customDimensions?.trim() : undefined,
      }
      const res = await submitCustomOrder(payload)
      setResult(res)

      if (res.ok) {
        toast.add({
          type: "success",
          title: "Order request submitted",
          description: `Your request ${res.order.orderNumber} is in our queue.`,
        })
        reset()
        setImage(null)
        setImagePreview(null)
      } else if (!res.ok && !("duplicate" in res)) {
        toast.add({
          type: "error",
          title: "Submission Failed",
          description: res.message,
        })
      }
    } finally {
      setPending(false)
    }
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Validation Error",
      description: "Please check all required fields in the custom order form.",
    })
  }

  function resetAfterSuccess() {
    setResult(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit, onFormError)}
      className="flex flex-col gap-6 rounded-lg border bg-card p-5 sm:p-6"
    >
      {/* Submission result banners */}
      {result && "ok" in result && result.ok && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-emerald-700 dark:text-emerald-300">
              Custom order request submitted!
            </p>
            <p className="text-xs text-muted-foreground">
              Your request number is{" "}
              <span className="font-mono font-semibold text-foreground">
                {result.order.orderNumber}
              </span>
              . Our workshop team will review your design and contact you on
              WhatsApp / email with a quote shortly.
            </p>
            <button
              type="button"
              onClick={resetAfterSuccess}
              className="mt-1 w-fit text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              Submit another custom order
            </button>
          </div>
        </div>
      )}

      {result && "duplicate" in result && result.duplicate && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <AlertCircleIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              You already have a custom order in progress
            </p>
            <p className="text-xs text-muted-foreground">
              We found an existing request for this phone / email — order{" "}
              <span className="font-mono font-semibold text-foreground">
                {result.order.orderNumber}
              </span>{" "}
              is still in the pipeline. Our team will reach out to you, so you
              don&apos;t need to submit it again.
            </p>
            <button
              type="button"
              onClick={resetAfterSuccess}
              className="mt-1 w-fit text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              I&apos;d still like to place a new request
            </button>
          </div>
        </div>
      )}

      {/* Contact details */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium">Contact details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="co-name">Full name</Label>
            <Input
              id="co-name"
              autoComplete="name"
              placeholder="Your name"
              {...register("customerName")}
            />
            {errors.customerName && (
              <FieldError errors={[{ message: errors.customerName.message }]} />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="co-email">Email address</Label>
            <Input
              id="co-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("customerEmail")}
            />
            {errors.customerEmail && (
              <FieldError errors={[{ message: errors.customerEmail.message }]} />
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="co-phone">Phone / WhatsApp number</Label>
            <Input
              id="co-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+880 1XXX-XXXXXX"
              {...register("customerPhone")}
            />
            {errors.customerPhone && (
              <FieldError errors={[{ message: errors.customerPhone.message }]} />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="co-country">Country</Label>
            <Input
              id="co-country"
              list="co-country-list"
              autoComplete="country-name"
              {...register("country")}
            />
            <datalist id="co-country-list">
              {COUNTRIES.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
            {errors.country && <FieldError errors={[{ message: errors.country.message }]} />}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="co-address">Delivery address</Label>
          <Input
            id="co-address"
            autoComplete="street-address"
            placeholder="House, road, area, district (needed for your quote & delivery)"
            {...register("deliveryAddress")}
          />
          {errors.deliveryAddress && (
            <FieldError errors={[{ message: errors.deliveryAddress.message }]} />
          )}
        </div>
      </fieldset>

      {/* Design requirement */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium">Your custom artwork</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="co-requirement">What would you like us to make?</Label>
          <Textarea
            id="co-requirement"
            rows={4}
            placeholder="Describe the art you want — car model, bike silhouette, logo, couple names, theme, style…"
            {...register("designRequirement")}
          />
          {errors.designRequirement && (
            <FieldError errors={[{ message: errors.designRequirement.message }]} />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="co-image">Reference image (optional)</Label>
          <div className="flex items-start gap-4">
            <label
              htmlFor="co-image"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-input/30 px-6 py-8 text-center text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ImagePlusIcon className="size-6" />
              <span>Click to upload a reference image</span>
              <span className="text-xs text-muted-foreground">JPG, PNG or WEBP — up to 5MB</span>
              <input
                id="co-image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageChange}
              />
            </label>
            {imagePreview ? (
              <div className="relative size-28 shrink-0 overflow-hidden rounded-md border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Reference preview"
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove reference image"
                  onClick={() => {
                    setImage(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                  <Trash2Icon className="size-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </fieldset>

      {/* Size Selection */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Choose a size</legend>
        <RadioGroup
          value={watchedSize}
          onValueChange={(value) => setValue("sizeOption", value, { shouldValidate: true })}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          {SIZE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors has-data-checked:border-foreground has-data-checked:bg-foreground has-data-checked:text-background",
                watchedSize === option.value && "border-foreground bg-foreground text-background"
              )}
            >
              <RadioGroupItem value={option.value} className="peer sr-only" />
              <span>{option.label}</span>
            </label>
          ))}
        </RadioGroup>
        {watchedSize === "custom" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="co-custom-size">Your custom dimensions</Label>
            <Input
              id="co-custom-size"
              placeholder='e.g. 48" × 30"'
              {...register("customDimensions")}
            />
          </div>
        )}
      </fieldset>

      {/* Lighting */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Finish &amp; Illumination</legend>
        <div className="flex items-center justify-between gap-4 rounded-md border p-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="co-light" className="text-sm">
              Backlit Warm LED Light
            </Label>
            <p className="text-xs text-muted-foreground">
              Add a warm LED glow behind the metal (great for custom signs &amp; garage art)
            </p>
          </div>
          <Switch
            id="co-light"
            checked={watchedWithBacklit}
            onCheckedChange={(checked) => setValue("withBacklitLed", Boolean(checked))}
          />
        </div>
      </fieldset>

      {/* Special request */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Anything else? (optional)</legend>
        <Textarea
          id="co-special"
          rows={2}
          placeholder="Special finish, mounting preference, deadline, or any other notes for the workshop…"
          {...register("specialRequest")}
        />
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending ? (
          <>
            <Loader2Icon className="animate-spin" />
            Submitting your request…
          </>
        ) : (
          <>
            <SendIcon />
            Submit Custom Order Request
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        We&apos;ll review your request and confirm a quote on WhatsApp or email
        before we start cutting.
      </p>
    </form>
  )
}
