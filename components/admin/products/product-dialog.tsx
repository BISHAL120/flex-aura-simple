"use client"

import * as React from "react"
import Image from "next/image"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, Trash2Icon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { useAdminStore } from "@/components/admin/admin-store-provider"
import type { Product } from "@/lib/data"
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

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productToEdit?: Product | null
}

export function ProductDialog({
  open,
  onOpenChange,
  productToEdit,
}: ProductDialogProps) {
  const { products, addProduct, updateProduct } = useAdminStore()
  const isEditing = !!productToEdit

  const [tagsInput, setTagsInput] = React.useState("")

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 89,
      compareAtPrice: undefined,
      badge: "",
      tags: ["car", "best-seller"],
      image: "/products/product1.webp",
      images: ["/products/product1.webp"],
      variants: [
        { name: '24" × 15"', price: 75, compareAtPrice: 95 },
        { name: '30" × 18.5"', price: 89, compareAtPrice: 109 },
        { name: '36" × 22"', price: 109, compareAtPrice: 129 },
      ],
      rating: 5,
      reviewCount: 0,
    },
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  })

  const watchedImage = watch("image")
  const watchedPrice = watch("price")

  // Synchronize when opened or productToEdit changes
  React.useEffect(() => {
    if (open) {
      if (productToEdit) {
        setTagsInput(productToEdit.tags.join(", "))
        reset({
          name: productToEdit.name,
          slug: productToEdit.slug,
          description: productToEdit.description,
          price: productToEdit.price,
          compareAtPrice: productToEdit.compareAtPrice ?? undefined,
          badge: productToEdit.badge ?? "",
          tags: productToEdit.tags,
          image: productToEdit.image,
          images: productToEdit.images?.length ? productToEdit.images : [productToEdit.image],
          variants: productToEdit.variants?.length ? productToEdit.variants : [{ name: "Standard", price: productToEdit.price }],
          rating: productToEdit.rating ?? 5,
          reviewCount: productToEdit.reviewCount ?? 0,
        })
      } else {
        setTagsInput("car, best-seller")
        reset({
          name: "",
          slug: "",
          description: "",
          price: 89,
          compareAtPrice: undefined,
          badge: "",
          tags: ["car", "best-seller"],
          image: "/products/product1.webp",
          images: ["/products/product1.webp"],
          variants: [
            { name: '24" × 15"', price: 75, compareAtPrice: 95 },
            { name: '30" × 18.5"', price: 89, compareAtPrice: 109 },
            { name: '36" × 22"', price: 109, compareAtPrice: 129 },
          ],
          rating: 5,
          reviewCount: 0,
        })
      }
    }
  }, [open, productToEdit, reset])

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setValue("name", val, { shouldValidate: true })
    if (!isEditing) {
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

  function onFormSubmit(data: ProductFormValues) {
    const conflict = products.find(
      (p) => p.slug.toLowerCase() === data.slug.toLowerCase() && p.id !== productToEdit?.id
    )

    if (conflict) {
      setError("slug", { message: "This URL slug is already taken" })
      toast.add({
        type: "error",
        title: "Slug Conflict",
        description: "Please specify a unique URL slug.",
      })
      return
    }

    const finalBadge = data.badge?.trim() ? data.badge.trim() : undefined

    if (isEditing && productToEdit) {
      updateProduct(productToEdit.id, {
        ...data,
        badge: finalBadge,
        image: data.image,
        images: productToEdit.images?.length ? productToEdit.images : [data.image],
      })
    } else {
      addProduct({
        ...data,
        badge: finalBadge,
        image: data.image,
        images: [data.image],
      })
    }

    onOpenChange(false)
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Validation Error",
      description: "Please fill all required product fields correctly.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">
            {isEditing ? `Quick Edit: ${productToEdit?.name}` : "Add New Metal Art Product"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure laser-cut metal art details, pricing, dimensions, and visual assets.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="flex flex-col gap-5 py-2">
          {/* Row 1: Name & Slug */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dlg-prod-name" className="text-xs font-medium">
                Product Title
              </Label>
              <Input
                id="dlg-prod-name"
                {...register("name")}
                onChange={handleNameChange}
                placeholder="e.g. Porsche 911 GT3 RS — Rear"
                className="h-9 text-xs"
              />
              {errors.name && <FieldError errors={[{ message: errors.name.message }]} />}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dlg-prod-slug" className="text-xs font-medium">
                URL Slug
              </Label>
              <Input
                id="dlg-prod-slug"
                {...register("slug")}
                placeholder="e.g. porsche-911-gt3-rs-rear"
                className="h-9 text-xs font-mono"
              />
              {errors.slug && <FieldError errors={[{ message: errors.slug.message }]} />}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dlg-prod-desc" className="text-xs font-medium">
              Description
            </Label>
            <Textarea
              id="dlg-prod-desc"
              {...register("description")}
              rows={3}
              placeholder="Precision laser-cut 2mm metal wall art with matte black powder coat…"
              className="text-xs"
            />
            {errors.description && (
              <FieldError errors={[{ message: errors.description.message }]} />
            )}
          </div>

          {/* Row 2: Base Price, Compare Price, Badge */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dlg-prod-price" className="text-xs font-medium">
                Base Price ($)
              </Label>
              <Input
                id="dlg-prod-price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", { valueAsNumber: true })}
                className="h-9 text-xs font-semibold"
              />
              {errors.price && <FieldError errors={[{ message: errors.price.message }]} />}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dlg-prod-compare" className="text-xs font-medium">
                Compare At Price ($)
              </Label>
              <Input
                id="dlg-prod-compare"
                type="number"
                step="0.01"
                min="0"
                {...register("compareAtPrice", {
                  setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? undefined : Number(v)),
                })}
                placeholder="Optional"
                className="h-9 text-xs"
              />
              {errors.compareAtPrice && (
                <FieldError errors={[{ message: errors.compareAtPrice.message }]} />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dlg-prod-badge" className="text-xs font-medium">
                Badge
              </Label>
              <Input
                id="dlg-prod-badge"
                {...register("badge")}
                placeholder="Best Seller / New / Backlit"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dlg-prod-tags" className="text-xs font-medium">
              Tags (comma-separated)
            </Label>
            <Input
              id="dlg-prod-tags"
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder="best-seller, porsche, car, backlit"
              className="h-9 text-xs"
            />
            {errors.tags && <FieldError errors={[{ message: errors.tags.message }]} />}
          </div>

          {/* Image Picker */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium">Primary Artwork Image</Label>
            <div className="flex items-center gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                <Image
                  src={watchedImage || "/products/product1.webp"}
                  alt="Selected preview"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <select
                  {...register("image")}
                  className="h-9 w-full rounded-md border bg-background px-3 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {SAMPLE_IMAGE_OPTIONS.map((img) => (
                    <option key={img} value={img}>
                      {img.replace("/products/", "")}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Includes full 4-angle gallery views automatically.
                </p>
              </div>
            </div>
            {errors.image && <FieldError errors={[{ message: errors.image.message }]} />}
          </div>

          {/* Variants Table */}
          <div className="flex flex-col gap-2 border rounded-lg p-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Size Variants &amp; Pricing</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendVariant({
                    name: `Size ${variantFields.length + 1}`,
                    price: Number(watchedPrice) || 89,
                  })
                }
                className="h-7 text-xs gap-1"
              >
                <PlusIcon className="size-3" />
                <span>Add Variant</span>
              </Button>
            </div>

            {errors.variants && <FieldError errors={[{ message: errors.variants.message }]} />}

            <div className="flex flex-col gap-2">
              {variantFields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    {...register(`variants.${idx}.name` as const)}
                    placeholder='e.g. 30" × 18.5"'
                    className="h-8 text-xs flex-1"
                  />
                  <div className="relative w-24">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`variants.${idx}.price` as const, { valueAsNumber: true })}
                      className="h-8 pl-6 text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeVariant(idx)}
                    disabled={variantFields.length <= 1}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Publish Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
