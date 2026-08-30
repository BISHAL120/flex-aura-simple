"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlusIcon, Loader2Icon, SendIcon, Trash2Icon } from "lucide-react"

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

const SIZE_OPTIONS = [
  { value: "12x12", label: '12" × 12"' },
  { value: "18x18", label: '18" × 18"' },
  { value: "24x18", label: '24" × 18"' },
  { value: "30x20", label: '30" × 20"' },
  { value: "36x24", label: '36" × 24"' },
  { value: "custom", label: "Custom size" },
] as const

const COUNTRIES = [
  "India",
  "Bangladesh",
  "United Kingdom",
  "United States",
  "Other",
]

export function CustomOrderForm() {
  const [image, setImage] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

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
      country: "India",
      designRequirement: "",
      sizeOption: "30x20",
      customDimensions: "",
      withBacklitLed: false,
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
    setImage(file)
    const preview = URL.createObjectURL(file)
    setImagePreview(preview)
    setValue("referenceImage", preview)
  }

  function onFormSubmit(data: CustomOrderFormValues) {
    if (pending) return
    setPending(true)

    const size =
      data.sizeOption === "custom"
        ? data.customDimensions?.trim() || "Custom size"
        : SIZE_OPTIONS.find((o) => o.value === data.sizeOption)?.label ?? data.sizeOption

    const details = [
      `Name: ${data.customerName}`,
      `Email: ${data.customerEmail}`,
      `Phone: ${data.customerPhone}`,
      `Country: ${data.country}`,
      `Requirement: ${data.designRequirement}`,
      `Size: ${size}`,
      `Backlit: ${data.withBacklitLed ? "Yes (with LED light)" : "No (plain metal)"}`,
    ]

    if (image) {
      details.push(`Reference image attached: ${image.name}`)
    }

    const message = encodeURIComponent(details.join("\n"))
    const waLink = `https://wa.me/8801623939834?text=${message}`
    const mailtoLink = `mailto:hello@flexaurametal.com?subject=${encodeURIComponent(
      "Custom Metal Art Order Request"
    )}&body=${message}`

    window.open(waLink, "_blank", "noopener,noreferrer")
    window.setTimeout(() => {
      window.open(mailtoLink, "_blank", "noopener,noreferrer")
    }, 500)

    window.setTimeout(() => {
      setPending(false)
      reset()
      setImage(null)
      setImagePreview(null)
      toast.add({
        type: "success",
        title: "Order request ready to send",
        description: "We've prepared WhatsApp with your custom order details.",
      })
    }, 800)
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Validation Error",
      description: "Please check all required fields in the custom order form.",
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit, onFormError)}
      className="flex flex-col gap-6 rounded-lg border bg-card p-5 sm:p-6"
    >
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
              placeholder="+91 98765 43210"
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
                    setValue("referenceImage", "")
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

      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending ? (
          <>
            <Loader2Icon className="animate-spin" />
            Preparing order request…
          </>
        ) : (
          <>
            <SendIcon />
            Send Custom Order Request
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Submitting opens WhatsApp with your order details. You can also send them
        by email to hello@flexaurametal.com.
      </p>
    </form>
  )
}
