"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeftIcon,
  EyeIcon,
  Loader2Icon,
  UploadIcon
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
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
import type { AdminCategory } from "@/lib/admin-categories-data"
import {
  checkCategorySlug,
  createCategory,
  patchCategory,
  uploadCategoryImage,
  validateCategoryImage,
} from "@/lib/data-layer/admin/categories/category-actions"
import { deleteFirebaseImage, deleteFirebaseImageSafe } from "@/lib/firebase/deleteImage"
import { categorySchema, slugify, type CategoryFormValues } from "@/lib/validators"

interface CategoryFormProps {
  category?: AdminCategory | null
  mode: "create" | "edit"
  productCount?: number
}

export function CategoryForm({ category, mode, productCount = 0 }: CategoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [pickedFile, setPickedFile] = React.useState<File | null>(null)
  const [pickedPreview, setPickedPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [customImageUrl, setCustomImageUrl] = React.useState("")
  const [tagsInput, setTagsInput] = React.useState(
    category ? category.tags.join(", ") : "car, automotive"
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      image: category?.image ?? "",
      tags: category?.tags ?? ["car", "automotive"],
      featured: category?.featured ?? false,
    },
  })

  const watchedName = watch("name")
  const watchedDescription = watch("description")
  const watchedFeatured = watch("featured")

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setValue("name", val, { shouldValidate: true })
    if (mode === "create") {
      setValue("slug", slugify(val), { shouldValidate: true })
    }
  }

  function handleTagsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setTagsInput(raw)
    const parsed = raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    setValue("tags", parsed.length > 0 ? parsed : [watchedName.toLowerCase() || "car"], {
      shouldValidate: true,
    })
  }

  function handleCustomImageUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setCustomImageUrl(val)
    if (val.trim()) {
      setValue("image", val.trim(), { shouldValidate: true })
    }
  }

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type, format, and size right when the file is picked.
    const validationError = validateCategoryImage(file)
    if (validationError) {
      toast.add({
        type: "error",
        title: "Invalid Image",
        description: validationError,
      })
      return
    }

    // Keep the file local; the Firebase upload happens when the form is
    // submitted so nothing is permanently uploaded if the user cancels.
    setPickedFile(file)
    setPickedPreview(URL.createObjectURL(file))
    setValue("image", file.name)
  }

  // Count of products currently assigned to this category (server-provided).
  const matchingProductsCount = productCount

  async function onFormSubmit(data: CategoryFormValues) {
    setIsSubmitting(true)

    try {
      // Pre-flight unique checks BEFORE uploading anything, so a failed save
      // never leaves an orphaned image in Firebase.
      const slugExists = await checkCategorySlug(data.slug, category?.id)
      if (slugExists) {
        setError("slug", { message: "This category slug is already used" })
        toast.add({
          type: "error",
          title: "Slug Conflict",
          description: "Please specify a unique URL slug for this category.",
        })
        return
      }

      let uploadedUrl: string | null = null

      // Upload a locally-picked file to Firebase right before persisting, so
      // the upload only happens when the admin actually creates/saves.
      let imageUrl = data.image
      if (pickedFile) {
        uploadedUrl = await uploadCategoryImage(pickedFile)
        imageUrl = uploadedUrl
      }

      const payload = { ...data, image: imageUrl }

      try {
        if (mode === "edit" && category) {
          await patchCategory(category.id, payload)
          toast.add({
            type: "success",
            title: "Category updated",
            description: `${data.name} changes saved.`,
          })
        } else {
          await createCategory(payload)
          toast.add({
            type: "success",
            title: "Category created",
            description: `${data.name} has been created.`,
          })
        }
      } catch (err) {
        // DB write failed after upload — remove the orphaned image.
        if (uploadedUrl) {
          await deleteFirebaseImage(uploadedUrl)
        }
        throw err
      }

      // New image uploaded while editing — remove the old Firebase image
      // now that the DB points at the new one.
      if (uploadedUrl && category?.image && category.image !== uploadedUrl) {
        await deleteFirebaseImageSafe(category.image)
      }

      router.push("/admin/categories")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      if (message.toLowerCase().includes("slug")) {
        setError("slug", { message })
      }
      toast.add({
        type: "error",
        title: mode === "edit" ? "Category Update Failed" : "Category Creation Failed",
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            render={<Link href="/admin/categories" />}
            nativeButton={false}
            title="Back to categories"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {mode === "create" ? "Add New Category" : `Edit Category: ${category?.name}`}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "create"
                ? "Organize laser-cut metal artworks into structured store categories."
                : `Category ID: ${category?.id} · Shop Route: /shop?category=${category?.slug}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            render={<Link href="/admin/categories" />}
            nativeButton={false}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="gap-1.5 text-xs font-semibold" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="size-3.5 animate-spin" />}
            <span>
              {isSubmitting
                ? mode === "create" ? "Creating..." : "Saving..."
                : mode === "create" ? "Create Category" : "Save Category"}
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
                Category Metadata
              </CardTitle>
              <CardDescription className="text-xs">
                Display name, URL slug, and summary description for the shop catalog
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-name">Category Name</Label>
                <Input
                  id="cat-name"
                  {...register("name")}
                  onChange={handleNameChange}
                  placeholder="e.g. Exotic Supercars & Track Silhouettes"
                  className="h-9 text-xs font-semibold"
                  disabled={isSubmitting}
                />
                {errors.name && <FieldError errors={[{ message: errors.name.message }]} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-slug">URL Identifier / Slug</Label>
                <Input
                  id="cat-slug"
                  {...register("slug")}
                  placeholder="exotic-supercars"
                  className="h-9 text-xs font-mono"
                  disabled={isSubmitting}
                />
                {errors.slug && <FieldError errors={[{ message: errors.slug.message }]} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-desc">Category Description</Label>
                <Textarea
                  id="cat-desc"
                  {...register("description")}
                  rows={4}
                  placeholder="Precision laser-cut 2mm metal wall silhouettes of world-class automotive icons..."
                  className="text-xs leading-relaxed"
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <FieldError errors={[{ message: errors.description.message }]} />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-tags">Mapped Product Tags (Comma-separated)</Label>
                <Input
                  id="cat-tags"
                  value={tagsInput}
                  onChange={handleTagsChange}
                  placeholder="car, porsche, ferrari, lamborghini"
                  className="h-9 text-xs"
                  disabled={isSubmitting}
                />
                {errors.tags && <FieldError errors={[{ message: errors.tags.message }]} />}
                <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                  <div className="flex flex-wrap gap-1">
                    {tagsInput
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                  <span className="font-medium text-foreground">
                    {matchingProductsCount} products currently matched
                  </span>
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5 mt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-xs text-foreground">
                    Featured Collection
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Display prominently on the homepage navigation pills and header.
                  </span>
                </div>
                <Switch
                  checked={watchedFeatured}
                  onCheckedChange={(checked) => setValue("featured", Boolean(checked))}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Cover Photo & Live Storefront Preview */}
        <div className="flex flex-col gap-6">
          {/* Cover Photo Selector */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Category Cover Banner
              </CardTitle>
              <CardDescription className="text-xs">
                Featured image representing this collection
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={pickedPreview || ""}
                  alt={watchedName || "Category banner"}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
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
                <Label htmlFor="cat-custom-url">Custom Image URL</Label>
                <Input
                  id="cat-custom-url"
                  value={customImageUrl}
                  onChange={handleCustomImageUrlChange}
                  placeholder="pixels.com img only"
                  className="h-8 text-xs font-mono"
                  disabled={isSubmitting}
                />
                {errors.image && <FieldError errors={[{ message: errors.image.message }]} />}
              </div>
            </CardContent>
          </Card>

          {/* Live Category Card Preview */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-sm font-semibold flex items-center gap-1.5 text-muted-foreground">
                <EyeIcon className="size-3.5" />
                Store Category Card Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-xs">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  <Image
                    src={pickedPreview || ""}
                    alt={watchedName || "Preview"}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                  {watchedFeatured && (
                    <Badge className="absolute top-2 left-2 text-[10px] shadow-sm bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  )}
                  <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {matchingProductsCount} pieces
                  </span>
                </div>
                <div className="flex flex-col p-3.5 gap-1">
                  <span className="font-heading text-sm font-bold text-foreground">
                    {watchedName || "Untitled Category"}
                  </span>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {watchedDescription || "Category description will appear here..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
