"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeftIcon,
  PlusIcon,
  Trash2Icon,
  EyeIcon,
  Loader2Icon,
  UploadIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { formatPrice } from "@/lib/data"
import { productSchema, slugify, type ProductFormInput } from "@/lib/validators"
import {
  createProduct,
  patchProduct,
  uploadProductImage,
  checkProductSlug,
  validateProductImage,
} from "@/lib/data-layer/admin/products/product-actions"
import type { AdminProduct } from "@/lib/admin-products-data"
import type { AdminCategory } from "@/lib/admin-categories-data"
import { deleteFirebaseImage, deleteFirebaseImageSafe } from "@/lib/firebase/deleteImage"

const BADGE_OPTIONS = [
  "None",
  "Best Seller",
  "New",
  "Backlit",
  "Custom",
  "Classic",
]

interface ProductFormProps {
  product?: AdminProduct | null
  categories: AdminCategory[]
  mode: "create" | "edit"
}

export function ProductForm({ product, categories, mode }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [customImageUrl, setCustomImageUrl] = React.useState("")
  const [pickedFile, setPickedFile] = React.useState<File | null>(null)
  const [pickedPreview, setPickedPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [tagsInput, setTagsInput] = React.useState(
    product ? product.tags.join(", ") : "car, precision-cut"
  )

  const defaultVariants = product?.variants && product.variants.length > 0
    ? product.variants
    : [
        { name: '24" × 15"', price: 75, compareAtPrice: 95 },
        { name: '30" × 18.5"', price: 89, compareAtPrice: 109 },
        { name: '36" × 22"', price: 109, compareAtPrice: 129 },
      ]

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 89,
      compareAtPrice: product?.compareAtPrice ?? undefined,
      badge: product?.badge ?? "None",
      image: product?.image ?? "",
      images: product?.images ?? [""],
      tags: product?.tags ?? ["car", "precision-cut"],
      variants: defaultVariants,
      rating: product?.rating ?? 5.0,
      reviewCount: product?.reviewCount ?? 0,
      categoryId: product?.categoryId ?? null,
    },
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  })

  const watchedName = watch("name")
  const watchedPrice = watch("price")
  const watchedCompareAt = watch("compareAtPrice")
  const watchedBadge = watch("badge")
  const watchedImage = watch("image")
  const watchedVariants = watch("variants")

  // Auto-slug on create
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
    setValue("tags", parsed.length > 0 ? parsed : ["laser-cut"], { shouldValidate: true })
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
    const validationError = validateProductImage(file)
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
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Validation Error",
      description: "Please correct the highlighted fields before saving.",
    })
  }

  async function onFormSubmit(data: ProductFormInput) {
    setIsSubmitting(true)

    try {
      // Pre-flight unique checks BEFORE uploading anything, so a failed save
      // never leaves an orphaned image in Firebase.
      const slugExists = await checkProductSlug(data.slug, product?.id)
      if (slugExists) {
        setError("slug", { message: "This URL slug is already used by another product" })
        toast.add({
          type: "error",
          title: "Slug Conflict",
          description: "Please choose a unique URL slug.",
        })
        return
      }

      let uploadedUrl: string | null = null

      // Upload a locally-picked file to Firebase right before persisting, so
      // the upload only happens when the admin actually creates/saves.
      let imageUrl = data.image
      if (pickedFile) {
        uploadedUrl = await uploadProductImage(pickedFile)
        imageUrl = uploadedUrl
      }

      const finalBadge = data.badge === "None" || !data.badge ? undefined : data.badge

      // Synchronize images array: main image first, keep existing extras.
      const existingImages = product?.images ?? []
      const updatedImages = [imageUrl, ...existingImages.filter((img) => img !== imageUrl)]

      const payload = { ...data, badge: finalBadge, image: imageUrl, images: updatedImages }

      try {
        if (mode === "edit" && product) {
          await patchProduct(product.id, payload)
          toast.add({
            type: "success",
            title: "Product updated",
            description: `${data.name} changes saved.`,
          })
        } else {
          await createProduct(payload)
          toast.add({
            type: "success",
            title: "Product created",
            description: `${data.name} published to catalog.`,
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
      if (uploadedUrl && product?.image && product.image !== uploadedUrl) {
        await deleteFirebaseImageSafe(product.image)
      }

      router.push("/admin/products")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      if (message.toLowerCase().includes("slug")) {
        setError("slug", { message })
      }
      toast.add({
        type: "error",
        title: mode === "edit" ? "Product Update Failed" : "Product Creation Failed",
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
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
            render={<Link href="/admin/products" />}
            nativeButton={false}
            title="Back to products list"
            disabled={isSubmitting}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {mode === "create" ? "Add New Metal Art Product" : `Edit: ${product?.name}`}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "create"
                ? "Configure 2mm laser-cut product specifications, dimensions, and pricing."
                : `Product ID: ${product?.id} · Route: /products/${product?.slug}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            render={<Link href="/admin/products" />}
            nativeButton={false}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="gap-1.5 text-xs font-semibold" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="size-3.5 animate-spin" />}
            <span>
              {isSubmitting
                ? mode === "create" ? "Publishing..." : "Saving..."
                : mode === "create" ? "Publish Product" : "Save Changes"}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Left Column: Form Fields */}
        <div className="flex flex-col gap-6">
          {/* Basic Details */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                General Product Information
              </CardTitle>
              <CardDescription className="text-xs">
                Artwork title, URL slug, and customer-facing description
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-name">Artwork Title</Label>
                <Input
                  id="prod-name"
                  {...register("name")}
                  onChange={handleNameChange}
                  placeholder="e.g. Porsche 911 GT3 RS Metal Silhouette"
                  className="h-9 text-xs font-semibold"
                  disabled={isSubmitting}
                />
                {errors.name && <FieldError errors={[{ message: errors.name.message }]} />}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prod-slug">URL Slug</Label>
                  <Input
                    id="prod-slug"
                    {...register("slug")}
                    placeholder="porsche-911-gt3-rs"
                    className="h-9 text-xs font-mono"
                    disabled={isSubmitting}
                  />
                  {errors.slug && <FieldError errors={[{ message: errors.slug.message }]} />}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prod-badge">Product Badge / Tag</Label>
                  <select
                    id="prod-badge"
                    {...register("badge")}
                    className="h-9 rounded-md border bg-background px-3 text-xs focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isSubmitting}
                  >
                    {BADGE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-category">Category</Label>
                <select
                  id="prod-category"
                  {...register("categoryId")}
                  className="h-9 rounded-md border bg-background px-3 text-xs focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={isSubmitting}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-desc">Product Description &amp; Material Details</Label>
                <Textarea
                  id="prod-desc"
                  {...register("description")}
                  rows={4}
                  placeholder="High-precision 2mm electro-galvanized laser cut steel with matte black electrostatic powder coating..."
                  className="text-xs leading-relaxed"
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <FieldError errors={[{ message: errors.description.message }]} />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-tags">Tags (Comma-separated)</Label>
                <Input
                  id="prod-tags"
                  value={tagsInput}
                  onChange={handleTagsChange}
                  placeholder="cars, porsche, german, best-seller"
                  className="h-9 text-xs"
                  disabled={isSubmitting}
                />
                {errors.tags && <FieldError errors={[{ message: errors.tags.message }]} />}
                <div className="flex flex-wrap gap-1 mt-1">
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
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Base Cost */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Base Pricing
              </CardTitle>
              <CardDescription className="text-xs">
                Starting price displayed on catalog listings
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-price">Base Price ($ USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="prod-price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("price", { valueAsNumber: true })}
                    className="h-9 pl-7 text-xs font-semibold"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.price && <FieldError errors={[{ message: errors.price.message }]} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-compare">Original / Compare-At Price ($ USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="prod-compare"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("compareAtPrice", {
                      setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? undefined : Number(v)),
                    })}
                    placeholder="Optional original price (e.g. 119.00)"
                    className="h-9 pl-7 text-xs"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.compareAtPrice && (
                  <FieldError errors={[{ message: errors.compareAtPrice.message }]} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sizing & Dimensions Matrix */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading text-base font-semibold">
                  Dimension Sizes &amp; Variant Pricing
                </CardTitle>
                <CardDescription className="text-xs">
                  Available laser-cut dimension cuts with specific pricing
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() =>
                  appendVariant({
                    name: '40" × 25"',
                    price: Number(watchedPrice) || 99,
                    compareAtPrice: Number(watchedCompareAt) || undefined,
                  })
                }
                className="h-8 text-xs gap-1"
              >
                <PlusIcon className="size-3.5" />
                <span>Add Size Row</span>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              {errors.variants && (
                <FieldError errors={[{ message: errors.variants.message }]} />
              )}
              <div className="rounded-lg border bg-muted/20 p-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="pb-2 pl-2">Size Dimensions</th>
                      <th className="pb-2">Price ($)</th>
                      <th className="pb-2">Compare At ($)</th>
                      <th className="pb-2 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {variantFields.map((field, idx) => (
                      <tr key={field.id} className="py-2">
                        <td className="py-2 pl-2 pr-2">
                          <Input
                            {...register(`variants.${idx}.name` as const)}
                            placeholder='e.g. 30" × 18.5"'
                            className="h-8 text-xs font-medium"
                            disabled={isSubmitting}
                          />
                          {errors.variants?.[idx]?.name && (
                            <span className="text-[10px] text-destructive">
                              {errors.variants[idx]?.name?.message}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`variants.${idx}.price` as const, { valueAsNumber: true })}
                            className="h-8 text-xs font-semibold"
                            disabled={isSubmitting}
                          />
                          {errors.variants?.[idx]?.price && (
                            <span className="text-[10px] text-destructive">
                              {errors.variants[idx]?.price?.message}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`variants.${idx}.compareAtPrice` as const, {
                              setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? undefined : Number(v)),
                            })}
                            placeholder="Optional"
                            className="h-8 text-xs"
                            disabled={isSubmitting}
                          />
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            disabled={variantFields.length <= 1 || isSubmitting}
                            onClick={() => removeVariant(idx)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Image Selector & Live Preview */}
        <div className="flex flex-col gap-6">
          {/* Artwork Image Selector */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Artwork Artwork &amp; Photo
              </CardTitle>
              <CardDescription className="text-xs">
                Select from workshop library, upload a file, or provide a custom URL
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={pickedPreview || watchedImage || ""}
                  alt={watchedName || "Product preview"}
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
                <Label htmlFor="custom-url">Custom Image URL</Label>
                <Input
                  id="custom-url"
                  value={customImageUrl}
                  onChange={handleCustomImageUrlChange}
                  placeholder="https://... image URL"
                  className="h-8 text-xs font-mono"
                  disabled={isSubmitting}
                />
                {errors.image && <FieldError errors={[{ message: errors.image.message }]} />}
              </div>
            </CardContent>
          </Card>

          {/* Live Storefront Card Preview */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-sm font-semibold flex items-center gap-1.5 text-muted-foreground">
                <EyeIcon className="size-3.5" />
                Storefront Listing Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col overflow-hidden rounded-lg border bg-background shadow-xs">
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <Image
                    src={watchedImage || ""}
                    alt={watchedName || "Preview"}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                  {watchedBadge && watchedBadge !== "None" && (
                    <Badge className="absolute top-2 left-2 text-[10px] shadow-sm">
                      {watchedBadge}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col p-3 gap-1">
                  <span className="font-heading text-xs font-semibold text-foreground line-clamp-1">
                    {watchedName || "Untitled Artwork"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">
                      {formatPrice(Number(watchedPrice) || 89)}
                    </span>
                    {watchedCompareAt && Number(watchedCompareAt) > 0 && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        {formatPrice(Number(watchedCompareAt))}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {watchedVariants?.length || 0} sizes available
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
