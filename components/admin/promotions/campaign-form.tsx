"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon, EyeIcon, Loader2Icon, UploadIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import type { AdminCampaign } from "@/lib/admin-campaigns-data"
import {
  patchCampaign,
  uploadCampaignImage,
  validateCampaignImage,
} from "@/lib/data-layer/admin/campaigns/campaign-actions"
import { deleteFirebaseImage } from "@/lib/firebase/deleteImage"
import { slugify, campaignSchema, type CampaignFormInput } from "@/lib/validators"

interface CampaignFormProps {
  campaign: AdminCampaign
}

export function CampaignForm({ campaign }: CampaignFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [pickedFile, setPickedFile] = React.useState<File | null>(null)
  const [pickedPreview, setPickedPreview] = React.useState<string | null>(null)
  const [customImageUrl, setCustomImageUrl] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description,
      image: campaign.image,
      badge: campaign.badge,
      ctaLabel: campaign.ctaLabel,
      isActive: campaign.isActive,
    },
  })

  const watchedTitle = watch("title")
  const watchedBadge = watch("badge")
  const watchedDescription = watch("description")
  const watchedCta = watch("ctaLabel")
  const watchedActive = watch("isActive")
  const watchedImage = watch("image")

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setValue("title", val, { shouldValidate: true })
    setValue("slug", slugify(val), { shouldValidate: true })
  }

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const validationError = validateCampaignImage(file)
    if (validationError) {
      toast.add({ type: "error", title: "Invalid Image", description: validationError })
      return
    }
    setPickedFile(file)
    setPickedPreview(URL.createObjectURL(file))
    setCustomImageUrl("")
    setValue("image", file.name)
  }

  function handleCustomImageUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setCustomImageUrl(val)
    setPickedFile(null)
    setPickedPreview(null)
    setValue("image", val.trim(), { shouldValidate: true })
  }

  async function onFormSubmit(data: CampaignFormInput) {
    setIsSubmitting(true)
    try {
      let uploadedUrl: string | null = null
      let imageUrl = data.image
      if (pickedFile) {
        uploadedUrl = await uploadCampaignImage(pickedFile)
        imageUrl = uploadedUrl
      }

      const payload = { ...data, image: imageUrl }

      try {
        await patchCampaign(campaign.id, payload)
        toast.add({
          type: "success",
          title: "Campaign updated",
          description: `${data.title} card content saved.`,
        })
      } catch (err) {
        if (uploadedUrl) await deleteFirebaseImage(uploadedUrl)
        throw err
      }

      router.push("/admin/promotions")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        type: "error",
        title: "Campaign Update Failed",
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
            render={<Link href="/admin/promotions" />}
            nativeButton={false}
            title="Back to campaigns"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Edit Campaign: {campaign.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Homepage feature card at /promotions/{campaign.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            render={<Link href="/admin/promotions" />}
            nativeButton={false}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="gap-1.5 text-xs font-semibold" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="size-3.5 animate-spin" />}
            <span>{isSubmitting ? "Saving..." : "Save Campaign"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Left Column: Content */}
        <Card className="border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base font-semibold">Card Content</CardTitle>
            <CardDescription className="text-xs">
              Badge, title, description, and button text shown on the homepage feature card
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="camp-title">Card Title</Label>
                <Input
                  id="camp-title"
                  {...register("title")}
                  onChange={handleNameChange}
                  placeholder="e.g. Custom Metal Art"
                  className="h-9 text-xs font-semibold"
                  disabled={isSubmitting}
                />
                {errors.title && <FieldError errors={[{ message: errors.title.message }]} />}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="camp-slug">URL Slug</Label>
                <Input
                  id="camp-slug"
                  {...register("slug")}
                  className="h-9 font-mono text-xs"
                  disabled={isSubmitting}
                />
                {errors.slug && <FieldError errors={[{ message: errors.slug.message }]} />}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="camp-badge">Badge Label</Label>
              <Input
                id="camp-badge"
                {...register("badge")}
                placeholder="e.g. Custom order"
                className="h-9 text-xs"
                disabled={isSubmitting}
              />
              {errors.badge && <FieldError errors={[{ message: errors.badge.message }]} />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="camp-desc">Description</Label>
              <Textarea
                id="camp-desc"
                {...register("description")}
                rows={4}
                placeholder="Describe this collection for the homepage card..."
                className="text-xs leading-relaxed"
                disabled={isSubmitting}
              />
              {errors.description && (
                <FieldError errors={[{ message: errors.description.message }]} />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="camp-cta">Button Label</Label>
              <Input
                id="camp-cta"
                {...register("ctaLabel")}
                placeholder="e.g. Order custom art"
                className="h-9 text-xs"
                disabled={isSubmitting}
              />
              {errors.ctaLabel && <FieldError errors={[{ message: errors.ctaLabel.message }]} />}
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">Active on homepage</span>
                <span className="text-[11px] text-muted-foreground">
                  Show this card in the &quot;Custom &amp; Backlit&quot; section.
                </span>
              </div>
              <Switch
                checked={watchedActive}
                onCheckedChange={(checked) => setValue("isActive", Boolean(checked))}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Image + Preview */}
        <div className="flex flex-col gap-6">
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">Card Image</CardTitle>
              <CardDescription className="text-xs">
                Wide banner image (16:10) shown behind the card content
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={pickedPreview || watchedImage || ""}
                  alt={watchedTitle || "Campaign banner"}
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
                <Label htmlFor="camp-custom-url">Custom Image URL</Label>
                <Input
                  id="camp-custom-url"
                  value={customImageUrl}
                  onChange={handleCustomImageUrlChange}
                  placeholder="https://... or /products/... (optional)"
                  className="h-8 font-mono text-xs"
                  disabled={isSubmitting}
                />
                {errors.image && <FieldError errors={[{ message: errors.image.message }]} />}
              </div>
            </CardContent>
          </Card>

          {/* Live preview */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                <EyeIcon className="size-3.5" />
                Homepage Card Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="group relative block aspect-[16/10] overflow-hidden rounded-lg border">
                <Image
                  src={pickedPreview || watchedImage || ""}
                  alt={watchedTitle || "Card preview"}
                  fill
                  sizes="600px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                  {watchedBadge && (
                    <span className="mb-2 w-fit rounded bg-white px-2 py-0.5 text-[10px] font-bold text-black">
                      {watchedBadge}
                    </span>
                  )}
                  <span className="font-heading text-lg font-semibold">
                    {watchedTitle || "Untitled campaign"}
                  </span>
                  <p className="mt-1 line-clamp-2 text-xs text-white/80">
                    {watchedDescription}
                  </p>
                  <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-md border border-white/40 px-3 py-1 text-xs font-medium">
                    {watchedCta || "Shop now"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
