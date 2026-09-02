"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeftIcon,
  SaveIcon,
  EyeIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { initialCategories, type AdminCategory } from "@/lib/admin-data"
import { products } from "@/lib/data"
import { categorySchema, slugify, type CategoryFormValues } from "@/lib/validators"

const PRESET_IMAGES = [
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
  "/products/product17.jpeg",
  "/products/product20.webp",
  "/products/product21.jpg",
  "/products/product24.jpg",
]

interface CategoryFormProps {
  category?: AdminCategory | null
  mode: "create" | "edit"
}

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter()
  const categories = initialCategories
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
      image: category?.image ?? "/products/product1.webp",
      tags: category?.tags ?? ["car", "automotive"],
      featured: category?.featured ?? false,
    },
  })

  const watchedName = watch("name")
  const watchedImage = watch("image")
  const watchedDescription = watch("description")
  const watchedFeatured = watch("featured")
  const watchedTags = watch("tags")

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

  function handleSelectPreset(img: string) {
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

  // Count matching products
  const matchingProductsCount = React.useMemo(() => {
    if (!watchedTags || watchedTags.length === 0) return 0
    return products.filter((p) =>
      p.tags.some((pt) => watchedTags.includes(pt.toLowerCase()))
    ).length
  }, [products, watchedTags])

  function onFormSubmit(data: CategoryFormValues) {
    const conflict = categories.find(
      (c) => c.slug.toLowerCase() === data.slug.toLowerCase() && c.id !== category?.id
    )

    if (conflict) {
      setError("slug", { message: "This category slug is already used" })
      toast.add({
        type: "error",
        title: "Slug Conflict",
        description: "Please specify a unique URL slug for this category.",
      })
      return
    }

    if (mode === "edit" && category) {
      toast.add({
        type: "success",
        title: "Category updated",
        description: `${data.name} changes saved.`,
      })
    } else {
      toast.add({
        type: "success",
        title: "Category created",
        description: `${data.name} has been created.`,
      })
    }

    router.push("/admin/categories")
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
                : `Category ID: ${category?.id} · Shop Route: /shop?category=${encodeURIComponent(category?.name ?? "")}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            render={<Link href="/admin/categories" />}
            nativeButton={false}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="gap-1.5 text-xs font-semibold">
            <SaveIcon className="size-3.5" />
            <span>{mode === "create" ? "Create Category" : "Save Category"}</span>
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
                  src={watchedImage || "/products/product1.webp"}
                  alt={watchedName || "Category banner"}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-custom-url">Custom Image URL</Label>
                <Input
                  id="cat-custom-url"
                  value={customImageUrl}
                  onChange={handleCustomImageUrlChange}
                  placeholder="/products/product1.webp or https://..."
                  className="h-8 text-xs font-mono"
                />
                {errors.image && <FieldError errors={[{ message: errors.image.message }]} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Or Select from Workshop Artworks</Label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto rounded-md border p-2 bg-muted/20">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => handleSelectPreset(img)}
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
                    src={watchedImage || "/products/product1.webp"}
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
