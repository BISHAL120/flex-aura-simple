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
  Image as ImageIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { formatPrice } from "@/lib/data"
import { productSchema, slugify, isSafeUrl, type ProductFormInput } from "@/lib/validators"
import {
  createProduct,
  patchProduct,
  uploadProductImage,
  checkProductSlug,
  validateProductImage,
} from "@/lib/data-layer/admin/products/product-actions"
import type { AdminProduct } from "@/lib/admin-products-data"
import type { AdminCategory } from "@/lib/admin-categories-data"
import { deleteFirebaseImageSafe } from "@/lib/firebase/deleteImage"

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

/** Gallery image pending or confirmed: a local file (uploaded on submit) or an
 * already-resolved URL (existing DB image or a custom URL the admin typed). */
type GalleryItem =
  | { key: string; kind: "file"; file: File; preview: string }
  | { key: string; kind: "url"; url: string }

function makeGalleryKey() {
  return crypto.randomUUID()
}

export function ProductForm({ product, categories, mode }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [customImageUrl, setCustomImageUrl] = React.useState("")
  const [pickedFile, setPickedFile] = React.useState<File | null>(null)
  const [pickedPreview, setPickedPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>(
    (product?.images ?? [])
      .filter((url) => url !== product?.image)
      .map((url) => ({ key: url, kind: "url", url }))
  )
  const [galleryUrlInput, setGalleryUrlInput] = React.useState("")
  const galleryFileInputRef = React.useRef<HTMLInputElement>(null)
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
      isBestSeller: product?.isBestSeller ?? false,
      isNewArrival: product?.isNewArrival ?? false,
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
  const watchedIsBestSeller = watch("isBestSeller")
  const watchedIsNewArrival = watch("isNewArrival")

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
    setValue("image", file.name)
  }

  function handleGalleryFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const valid: GalleryItem[] = []
    for (const file of files) {
      const validationError = validateProductImage(file)
      if (validationError) {
        toast.add({
          type: "error",
          title: "Invalid Image",
          description: validationError,
        })
        continue
      }
      valid.push({ key: makeGalleryKey(), kind: "file", file, preview: URL.createObjectURL(file) })
    }

    if (valid.length > 0) {
      setGalleryItems((prev) => [...prev, ...valid])
    }

    // Reset so picking the same file again re-fires the change event.
    e.target.value = ""
  }

  function handleGalleryUrlAdd() {
    const val = galleryUrlInput.trim()
    if (!val) return

    if (!isSafeUrl(val)) {
      toast.add({
        type: "error",
        title: "Invalid Image URL",
        description: "Image URL must be a valid http(s) or internal path.",
      })
      return
    }

    // Avoid duplicate URLs in the gallery.
    const duplicate = galleryItems.some(
      (item) => item.kind === "url" && item.url === val
    )
    if (duplicate) {
      toast.add({
        type: "error",
        title: "Duplicate URL",
        description: "This image URL is already in the gallery.",
      })
      return
    }

    setGalleryItems((prev) => [...prev, { key: makeGalleryKey(), kind: "url", url: val }])
    setGalleryUrlInput("")
  }

  function handleGalleryUrlKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleGalleryUrlAdd()
    }
  }

  function handleGalleryRemove(key: string) {
    setGalleryItems((prev) => prev.filter((item) => item.key !== key))
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

      let imageUrl = data.image
      const uploadedUrls: string[] = []

      try {
        // Upload a locally-picked thumbnail to Firebase right before persisting,
        // so the upload only happens when the admin actually creates/saves.
        if (pickedFile) {
          const uploadedUrl = await uploadProductImage(pickedFile)
          uploadedUrls.push(uploadedUrl)
          imageUrl = uploadedUrl
        }

        // Resolve gallery items: local files upload to Firebase now, URLs pass
        // through unchanged.
        const galleryUrls: string[] = []
        for (const item of galleryItems) {
          if (item.kind === "file") {
            const uploadedUrl = await uploadProductImage(item.file)
            uploadedUrls.push(uploadedUrl)
            galleryUrls.push(uploadedUrl)
          } else {
            galleryUrls.push(item.url)
          }
        }

        const finalBadge = data.badge === "None" || !data.badge ? undefined : data.badge

        // Synchronize images array: main image first, then gallery extras.
        // Filter out gallery URLs that duplicate the main image.
        const updatedImages = [imageUrl, ...galleryUrls.filter((url) => url !== imageUrl)]

        const payload = { ...data, badge: finalBadge, image: imageUrl, images: updatedImages }

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

        // Success. While editing, delete any images the DB no longer references
        // (swapped thumbnail or removed gallery images).
        if (mode === "edit" && product) {
          const oldImages = [product.image, ...(product.images ?? [])]
          const removedImages = oldImages.filter((img) => !updatedImages.includes(img))
          for (const img of removedImages) {
            await deleteFirebaseImageSafe(img)
          }
        }
      } catch (err) {
        // Any failure after at least one upload (partial upload chain, DB write,
        // etc.) — remove every image uploaded in this attempt.
        for (const url of uploadedUrls) {
          await deleteFirebaseImageSafe(url)
        }
        throw err
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

          {/* Storefront Placement */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Storefront Placement
              </CardTitle>
              <CardDescription className="text-xs">
                Featured sections on the homepage — toggle to show this product there
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-xs text-foreground">
                    Fan Favourite (Best Seller)
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Show this product in the &quot;Fan Favourites&quot; / best-sellers section on
                    the homepage.
                  </span>
                </div>
                <Switch
                  checked={watchedIsBestSeller}
                  onCheckedChange={(checked) =>
                    setValue("isBestSeller", Boolean(checked), { shouldValidate: true })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-xs text-foreground">
                    New Arrival / New Drop
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Show this product in the &quot;New Arrivals&quot; section on the homepage.
                  </span>
                </div>
                <Switch
                  checked={watchedIsNewArrival}
                  onCheckedChange={(checked) =>
                    setValue("isNewArrival", Boolean(checked), { shouldValidate: true })
                  }
                  disabled={isSubmitting}
                />
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
                Artwork &amp; Photo
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
                  placeholder="pixels.com img only"
                  className="h-8 text-xs font-mono"
                  disabled={isSubmitting}
                />
                {errors.image && <FieldError errors={[{ message: errors.image.message }]} />}
              </div>

              {/* Additional Gallery Images */}
              <div className="flex flex-col gap-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gallery-url" className="flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-muted-foreground" />
                    Additional Gallery Images
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    {galleryItems.length} image{galleryItems.length === 1 ? "" : "s"}
                  </span>
                </div>

                {galleryItems.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {galleryItems.map((item) => (
                      <div
                        key={item.key}
                        className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                      >
                        <Image
                          src={item.kind === "file" ? item.preview : item.url}
                          alt="Gallery image"
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-xs"
                          disabled={isSubmitting}
                          onClick={() => handleGalleryRemove(item.key)}
                          className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                          title="Remove image"
                        >
                          <Trash2Icon className="size-3" />
                        </Button>
                        {item.kind === "file" && (
                          <span className="absolute left-1 bottom-1 rounded bg-black/60 px-1 py-0.5 text-[8px] font-medium text-white">
                            NEW
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={isSubmitting}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="gap-1.5 text-xs"
                >
                  <UploadIcon className="size-3.5" />
                  Upload Gallery Images
                </Button>
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryFileChange}
                />

                <div className="flex gap-1.5">
                  <Input
                    id="gallery-url"
                    value={galleryUrlInput}
                    onChange={(e) => setGalleryUrlInput(e.target.value)}
                    onKeyDown={handleGalleryUrlKeyDown}
                    placeholder="https://… (add gallery image URL)"
                    className="h-8 flex-1 text-xs font-mono"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGalleryUrlAdd}
                    disabled={isSubmitting || !galleryUrlInput.trim()}
                    className="h-8 text-xs gap-1"
                  >
                    <PlusIcon className="size-3.5" />
                    Add
                  </Button>
                </div>
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
                    src={pickedPreview || watchedImage || ""}
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
