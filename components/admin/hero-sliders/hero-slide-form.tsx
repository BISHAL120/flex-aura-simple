"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon, EyeIcon, Loader2Icon, UploadIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import type { AdminHeroSlide } from "@/lib/admin-hero-sliders-data"
import {
  createHeroSlide,
  patchHeroSlide,
  uploadHeroSlideImage,
  validateHeroSlideImage,
} from "@/lib/data-layer/admin/hero-sliders/hero-slider-actions"
import { deleteFirebaseImage } from "@/lib/firebase/deleteImage"
import { heroSlideSchema, type HeroSlideFormInput } from "@/lib/validators"

interface HeroSlideFormProps {
  slide?: AdminHeroSlide | null
  mode: "create" | "edit"
  nextOrder?: number
}

export function HeroSlideForm({ slide, mode, nextOrder = 0 }: HeroSlideFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [pickedFile, setPickedFile] = React.useState<File | null>(null)
  const [pickedPreview, setPickedPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [customImageUrl, setCustomImageUrl] = React.useState(slide?.image ?? "")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HeroSlideFormInput>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: {
      title: slide?.title ?? "",
      subtitle: slide?.subtitle ?? "",
      image: slide?.image ?? "",
      alt: slide?.alt ?? "",
      ctaLabel: slide?.ctaLabel ?? "",
      ctaHref: slide?.ctaHref ?? "/shop",
      order: slide?.order ?? nextOrder,
      isActive: slide?.isActive ?? true,
    },
  })

  const watchedTitle = watch("title")
  const watchedSubtitle = watch("subtitle")
  const watchedActive = watch("isActive")
  const watchedImage = watch("image")
  const watchedCtaLabel = watch("ctaLabel")

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateHeroSlideImage(file)
    if (validationError) {
      toast.add({
        type: "error",
        title: "Invalid Image",
        description: validationError,
      })
      return
    }

    // A freshly picked file becomes the active image: clear any typed custom
    // URL so the two sources can never silently conflict on submit.
    setPickedFile(file)
    setPickedPreview(URL.createObjectURL(file))
    setCustomImageUrl("")
    setValue("image", file.name)
  }

  function handleCustomImageUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setCustomImageUrl(val)
    // A typed URL becomes the active image: discard any picked file so the
    // file upload doesn't silently override the URL on submit. Clearing the
    // field also clears the form image — the required-image validator then
    // blocks an accidental save with no banner.
    setPickedFile(null)
    setPickedPreview(null)
    setValue("image", val.trim(), { shouldValidate: true })
  }

  async function onFormSubmit(data: HeroSlideFormInput) {
    setIsSubmitting(true)

    try {
      let uploadedUrl: string | null = null
      let imageUrl = data.image
      if (pickedFile) {
        uploadedUrl = await uploadHeroSlideImage(pickedFile)
        imageUrl = uploadedUrl
      }

      const payload = { ...data, image: imageUrl }

      try {
        if (mode === "edit" && slide) {
          await patchHeroSlide(slide.id, payload)
          toast.add({
            type: "success",
            title: "Hero slide updated",
            description: `${data.title} banner changes saved.`,
          })
        } else {
          await createHeroSlide(payload)
          toast.add({
            type: "success",
            title: "Hero slide created",
            description: `${data.title} has been added to the carousel.`,
          })
        }
      } catch (err) {
        // DB write failed after upload — remove the orphaned image.
        if (uploadedUrl) {
          await deleteFirebaseImage(uploadedUrl)
        }
        throw err
      }

      // Note: replacing an existing slide image deletes the old Firebase
      // object server-side (in the PATCH route) after the DB write lands, so
      // there is no double-cleanup window here.

      router.push("/admin/hero-sliders")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        type: "error",
        title: mode === "edit" ? "Hero Slide Update Failed" : "Hero Slide Creation Failed",
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Validation Error",
      description: "Please correct the highlighted fields before saving.",
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="flex flex-col gap-8">
      {/* Top Header Controls */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            render={<Link href="/admin/hero-sliders" />}
            nativeButton={false}
            title="Back to hero sliders"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {mode === "create" ? "Add New Hero Slide" : `Edit Hero Slide: ${slide?.title}`}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "create"
                ? "Create a high-impact banner slide for the store homepage carousel."
                : `Slide ID: ${slide?.id} · Order: ${slide?.order}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            render={<Link href="/admin/hero-sliders" />}
            nativeButton={false}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="gap-1.5 text-xs font-semibold" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="size-3.5 animate-spin" />}
            <span>
              {isSubmitting
                ? mode === "create" ? "Creating..." : "Saving..."
                : mode === "create" ? "Create Slide" : "Save Changes"}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Left Column: Form Fields */}
        <div className="flex flex-col gap-6">
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Slide Content
              </CardTitle>
              <CardDescription className="text-xs">
                Headline, supporting copy, and call-to-action for this banner
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slide-title">Slide Headline</Label>
                <Input
                  id="slide-title"
                  {...register("title")}
                  placeholder="e.g. Laser-Cut Metal Art"
                  className="h-9 text-xs font-semibold"
                  disabled={isSubmitting}
                />
                {errors.title && <FieldError errors={[{ message: errors.title.message }]} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slide-subtitle">Subtitle Copy</Label>
                <Textarea
                  id="slide-subtitle"
                  {...register("subtitle")}
                  rows={3}
                  placeholder="Precision-cut 2mm steel wall art of your favourite cars, bikes and custom designs..."
                  className="text-xs leading-relaxed"
                  disabled={isSubmitting}
                />
                {errors.subtitle && (
                  <FieldError errors={[{ message: errors.subtitle.message }]} />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slide-alt">Image Alt Text</Label>
                <Input
                  id="slide-alt"
                  {...register("alt")}
                  placeholder="e.g. Porsche 911 GT3 RS laser-cut black metal wall art"
                  className="h-9 text-xs"
                  disabled={isSubmitting}
                />
                {errors.alt && <FieldError errors={[{ message: errors.alt.message }]} />}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="slide-cta-label">Button Label</Label>
                  <Input
                    id="slide-cta-label"
                    {...register("ctaLabel")}
                    placeholder="e.g. Shop the Collection"
                    className="h-9 text-xs"
                    disabled={isSubmitting}
                  />
                  {errors.ctaLabel && (
                    <FieldError errors={[{ message: errors.ctaLabel.message }]} />
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="slide-cta-href">Button Link</Label>
                  <Input
                    id="slide-cta-href"
                    {...register("ctaHref")}
                    placeholder="/shop or https://..."
                    className="h-9 text-xs font-mono"
                    disabled={isSubmitting}
                  />
                  {errors.ctaHref && (
                    <FieldError errors={[{ message: errors.ctaHref.message }]} />
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="slide-order">Display Order</Label>
                  <Input
                    id="slide-order"
                    type="number"
                    min={0}
                    {...register("order", { valueAsNumber: true })}
                    className="h-9 text-xs font-mono"
                    disabled={isSubmitting}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Lower numbers appear first in the carousel.
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-foreground">Active</span>
                    <span className="text-[11px] text-muted-foreground">
                      Show this slide on the homepage carousel.
                    </span>
                  </div>
                  <Switch
                    checked={watchedActive}
                    onCheckedChange={(checked) => setValue("isActive", Boolean(checked))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Banner Image & Live Preview */}
        <div className="flex flex-col gap-6">
          {/* Banner Image Selector */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Slide Banner Image
              </CardTitle>
              <CardDescription className="text-xs">
                Wide landscape image (16:7-ish) that fills the hero area
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={pickedPreview || watchedImage || ""}
                  alt={watchedTitle || "Hero slide banner"}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={isSubmitting}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs"
                >
                  <UploadIcon className="size-3.5" />
                  {pickedFile ? "Replace Image" : "Upload Image"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slide-custom-url">Custom Image URL</Label>
                <Input
                  id="slide-custom-url"
                  value={customImageUrl}
                  onChange={handleCustomImageUrlChange}
                  placeholder="https://... or /products/... (optional)"
                  className="h-8 text-xs font-mono"
                  disabled={isSubmitting}
                />
                {errors.image && <FieldError errors={[{ message: errors.image.message }]} />}
              </div>
            </CardContent>
          </Card>

          {/* Live Slide Preview */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                <EyeIcon className="size-3.5" />
                Homepage Carousel Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={pickedPreview || watchedImage || ""}
                  alt={watchedTitle || "Slide preview"}
                  fill
                  sizes="600px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-black/10" />
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full px-5 sm:px-8">
                    <div className="max-w-md text-white">
                      <h3 className="font-heading text-xl font-semibold text-balance sm:text-2xl">
                        {watchedTitle || "Slide headline preview"}
                      </h3>
                      {watchedSubtitle && (
                        <p className="mt-2 text-xs text-white/80 line-clamp-2 sm:text-sm">
                          {watchedSubtitle}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black">
                        {watchedCtaLabel || "Shop Now"}
                      </span>
                    </div>
                  </div>
                </div>
                {!watchedActive && (
                  <Badge className="absolute top-2 left-2 bg-black/60 text-[10px] text-white">
                    Inactive
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
