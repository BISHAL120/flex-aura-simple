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
  SaveIcon,
  EyeIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { formatPrice, products, type Product } from "@/lib/data"
import { productSchema, slugify, type ProductFormValues } from "@/lib/validators"

const SAMPLE_IMAGE_OPTIONS = [
  "/products/product1.webp",
  "/products/product2.webp",
  "/products/product3.webp",
  "/products/product4.webp",
  "/products/product5.jpeg",
  "/products/product6.jpeg",
  "/products/product7.jpeg",
  "/products/product8.jpeg",
  "/products/product9.jpeg",
  "/products/product10.jpeg",
  "/products/product11.jpeg",
  "/products/product12.jpeg",
  "/products/product13.jpeg",
  "/products/product14.jpeg",
  "/products/product15.jpeg",
  "/products/product16.jpeg",
  "/products/product17.jpeg",
  "/products/product18.jpeg",
  "/products/product19.jpeg",
  "/products/product20.webp",
  "/products/product21.jpg",
  "/products/product22.jpg",
  "/products/product23.jpg",
  "/products/product24.jpg",
  "/products/product25.jpg",
  "/products/product26.jpg",
  "/products/product27.jpg",
]

const BADGE_OPTIONS = [
  "None",
  "Best Seller",
  "New",
  "Backlit",
  "Custom",
  "Classic",
]

interface ProductFormProps {
  product?: Product | null
  mode: "create" | "edit"
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter()
  const [customImageUrl, setCustomImageUrl] = React.useState("")
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
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 89,
      compareAtPrice: product?.compareAtPrice ?? undefined,
      badge: product?.badge ?? "None",
      image: product?.image ?? "/products/product1.webp",
      images: product?.images ?? ["/products/product1.webp"],
      tags: product?.tags ?? ["car", "precision-cut"],
      variants: defaultVariants,
      rating: product?.rating ?? 5.0,
      reviewCount: product?.reviewCount ?? 0,
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

  function handleSelectPresetImage(img: string) {
    setValue("image", img, { shouldValidate: true })
    setCustomImageUrl("")
  }

  function handleCustomImageUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setCustomImageUrl(val)
    if (val.trim()) {
      setValue("image", val.trim(), { shouldValidate: true })
    }
  }

  function onFormSubmit(data: ProductFormValues) {
    // Validate slug uniqueness
    const slugConflict = products.find(
      (p) => p.slug.toLowerCase() === data.slug.toLowerCase() && p.id !== product?.id
    )

    if (slugConflict) {
      setError("slug", { message: "This URL slug is already used by another product" })
      toast.add({
        type: "error",
        title: "Slug Conflict",
        description: "Please choose a unique URL slug.",
      })
      return
    }

    const finalBadge = data.badge === "None" || !data.badge ? undefined : data.badge
    const finalImage = data.image

    // Synchronize images array
    const existingImages = product?.images ?? []
    const updatedImages = [
      finalImage,
      ...existingImages.filter((img) => img !== finalImage),
    ]

    if (mode === "edit" && product) {
      toast.add({
        type: "success",
        title: "Product updated",
        description: `${data.name} changes saved.`,
      })
    } else {
      toast.add({
        type: "success",
        title: "Product created",
        description: `${data.name} published to catalog.`,
      })
    }

    router.push("/admin/products")
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
            render={<Link href="/admin/products" />}
            nativeButton={false}
            title="Back to products list"
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
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="gap-1.5 text-xs font-semibold">
            <SaveIcon className="size-3.5" />
            <span>{mode === "create" ? "Publish Product" : "Save Changes"}</span>
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
                  />
                  {errors.slug && <FieldError errors={[{ message: errors.slug.message }]} />}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prod-badge">Product Badge / Tag</Label>
                  <select
                    id="prod-badge"
                    {...register("badge")}
                    className="h-9 rounded-md border bg-background px-3 text-xs focus-visible:ring-2 focus-visible:ring-ring"
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
                <Label htmlFor="prod-desc">Product Description &amp; Material Details</Label>
                <Textarea
                  id="prod-desc"
                  {...register("description")}
                  rows={4}
                  placeholder="High-precision 2mm electro-galvanized laser cut steel with matte black electrostatic powder coating..."
                  className="text-xs leading-relaxed"
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
                          />
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            disabled={variantFields.length <= 1}
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
                Select from workshop library or provide custom URL
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={watchedImage || "/products/product1.webp"}
                  alt={watchedName || "Product preview"}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="custom-url">Custom Image URL</Label>
                <Input
                  id="custom-url"
                  value={customImageUrl}
                  onChange={handleCustomImageUrlChange}
                  placeholder="https://... or /products/sample.jpg"
                  className="h-8 text-xs font-mono"
                />
                {errors.image && <FieldError errors={[{ message: errors.image.message }]} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Or Pick from Workshop Artworks</Label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto rounded-md border p-2 bg-muted/20">
                  {SAMPLE_IMAGE_OPTIONS.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => handleSelectPresetImage(img)}
                      className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                        watchedImage === img && !customImageUrl
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt="preset" fill sizes="60px" className="object-cover" />
                    </button>
                  ))}
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
                    src={watchedImage || "/products/product1.webp"}
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
