"use client"

import * as React from "react"
import { ImagePlusIcon, Loader2Icon, SendIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

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
  const [sizeChoice, setSizeChoice] = React.useState<string>("30x20")
  const [withLight, setWithLight] = React.useState(false)
  const [image, setImage] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  // Clean up the object URL when the preview image is replaced or unmounted.
  React.useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setImage(file)
    setImagePreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const form = event.currentTarget
    const formData = new FormData(form)
    const size =
      sizeChoice === "custom"
        ? (formData.get("customSize") as string)?.trim() || "Custom size (not specified)"
        : SIZE_OPTIONS.find((o) => o.value === sizeChoice)?.label ?? sizeChoice

    const details = [
      `Name: ${formData.get("name")}`,
      `Phone: ${formData.get("phone")}`,
      `Address: ${formData.get("address")}`,
      `Country: ${formData.get("country")}`,
      `Requirement: ${formData.get("requirement")}`,
      `Size: ${size}`,
      `Backlit: ${withLight ? "Yes (with LED light)" : "No (plain metal)"}`,
    ]
    if (formData.get("specialRequest")) {
      details.push(`Special request: ${formData.get("specialRequest")}`)
    }
    if (image) {
      details.push(`Reference image: ${image.name}`)
    }

    const message = encodeURIComponent(details.join("\n"))
    const waLink = `https://wa.me/8801623939834?text=${message}`
    const mailtoLink = `mailto:hello@flexaurametal.com?subject=${encodeURIComponent(
      "Custom Order Request"
    )}&body=${message}`

    setPending(true)
    window.open(waLink, "_blank", "noopener,noreferrer")
    // Offer email as a fallback in case WhatsApp doesn't open.
    window.setTimeout(() => {
      window.open(mailtoLink, "_blank", "noopener,noreferrer")
    }, 500)
    window.setTimeout(() => {
      setPending(false)
      form.reset()
      setSizeChoice("30x20")
      setWithLight(false)
      setImage(null)
      setImagePreview(null)
      toast.add({
        type: "success",
        title: "Request ready to send",
        description: "We've opened WhatsApp with your order details — just press send.",
      })
    }, 800)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-lg border bg-card p-5 sm:p-6"
    >
      {/* Contact details */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium">Contact details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="co-name">Full name</Label>
            <Input id="co-name" name="name" autoComplete="name" required placeholder="Your name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="co-phone">Phone / WhatsApp number</Label>
            <Input
              id="co-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="co-address">Delivery address</Label>
          <Textarea
            id="co-address"
            name="address"
            autoComplete="street-address"
            required
            rows={2}
            placeholder="Street, area, city, state, PIN code"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="co-country">Country</Label>
          <Input
            id="co-country"
            name="country"
            list="co-country-list"
            defaultValue="India"
            required
            autoComplete="country-name"
          />
          <datalist id="co-country-list">
            {COUNTRIES.map((country) => (
              <option key={country} value={country} />
            ))}
          </datalist>
        </div>
      </fieldset>

      {/* Design requirement */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium">Your design</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="co-requirement">What would you like us to make?</Label>
          <Textarea
            id="co-requirement"
            name="requirement"
            required
            rows={4}
            placeholder="Describe the art you want — car model, bike, logo, name, theme, style…"
          />
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
                name="image"
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
                  alt="Reference image preview"
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

      {/* Size */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Choose a size</legend>
        <RadioGroup
          value={sizeChoice}
          onValueChange={(value) => setSizeChoice(value as string)}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          {SIZE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors has-data-checked:border-foreground has-data-checked:bg-foreground has-data-checked:text-background",
                sizeChoice === option.value && "border-foreground bg-foreground text-background"
              )}
            >
              <RadioGroupItem value={option.value} className="peer sr-only" />
              <span>{option.label}</span>
            </label>
          ))}
        </RadioGroup>
        {sizeChoice === "custom" ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="co-custom-size">Your custom size</Label>
            <Input
              id="co-custom-size"
              name="customSize"
              placeholder='e.g. 48" × 30"'
            />
          </div>
        ) : null}
      </fieldset>

      {/* Lighting */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Finish</legend>
        <div className="flex items-center justify-between gap-4 rounded-md border p-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="co-light" className="text-sm">
              Backlit LED light
            </Label>
            <p className="text-xs text-muted-foreground">
              Add a warm LED glow behind the metal (great for signs &amp; logos)
            </p>
          </div>
          <Switch
            id="co-light"
            checked={withLight}
            onCheckedChange={(checked) => setWithLight(checked as boolean)}
          />
        </div>
      </fieldset>

      {/* Special request */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium">Anything else?</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="co-special">Special request or notes</Label>
          <Textarea
            id="co-special"
            name="specialRequest"
            rows={3}
            placeholder="Colour, mounting, deadline, quantity, packaging…"
          />
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending ? (
          <>
            <Loader2Icon className="animate-spin" />
            Preparing…
          </>
        ) : (
          <>
            <SendIcon />
            Send request
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
