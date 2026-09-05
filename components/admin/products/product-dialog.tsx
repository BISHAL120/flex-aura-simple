"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, Trash2Icon, Loader2Icon, UploadIcon } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
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

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productToEdit?: AdminProduct | null
  categories: AdminCategory[]
}

export function ProductDialog({
  open,
  onOpenChange,
  productToEdit,
  categories,
}: ProductDialogProps) {
  const isEditing = !!productToEdit
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [tagsInput, setTagsInput] = React.useState("")
  const [customImageUrl, setCustomImageUrl] = React.useState("")
  const [pickedFile, setPickedFile] = React.useState<File | null>(null)
  const [pickedPreview, setPickedPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 89,
      compareAtPrice: undefined,
      badge: "",
      tags: ["car", "best-seller"],
      image: "",
      images: [""],
      isBestSeller: false,
      isNewArrival: false,
      variants: [
        { name: '24" × 15"', price: 75, compareAtPrice: 95 },
        { name: '30" × 18.5"', price: 89, compareAtPrice: 109 },
        { name: '36" × 22"', price: 109, compareAtPrice: 129 },
      ],
      rating: 5,
      reviewCount: 0,
      categoryId: null,
    },
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  })

  const watchedImage = watch("image")
  const watchedPrice = watch("price")
  const watchedIsBestSeller = watch("isBestSeller")
  const watchedIsNewArrival = watch("isNewArrival")

  // Synchronize when opened or productToEdit changes
  React.useEffect(() => {
    if (open) {
      setCustomImageUrl("")
      setPickedFile(null)
      setPickedPreview(null)
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
          isBestSeller: productToEdit.isBestSeller ?? false,
          isNewArrival: productToEdit.isNewArrival ?? false,
          variants: productToEdit.variants?.length ? productToEdit.variants : [{ name: "Standard", price: productToEdit.price }],
          rating: productToEdit.rating ?? 5,
          reviewCount: productToEdit.reviewCount ?? 0,
          categoryId: productToEdit.categoryId ?? null,
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
          image: "",
          images: [""],
          isBestSeller: false,
          isNewArrival: false,
          variants: [
            { name: '24" × 15"', price: 75, compareAtPrice: 95 },
            { name: '30" × 18.5"', price: 89, compareAtPrice: 109 },
            { name: '36" × 22"', price: 109, compareAtPrice: 129 },
          ],
          rating: 5,
          reviewCount: 0,
          categoryId: null,
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

  function handleCustomUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  async function onFormSubmit(data: ProductFormInput) {
    setIsSubmitting(true)

    try {
      // Pre-flight unique checks BEFORE uploading anything, so a failed save
      // never leaves an orphaned image in Firebase.
      const slugExists = await checkProductSlug(data.slug, productToEdit?.id)
      if (slugExists) {
        setError("slug", { message: "This URL slug is already used" })
        toast.add({
          type: "error",
          title: "Slug Conflict",
          description: "Please specify a unique URL slug.",
        })
        return
      }

      let uploadedUrl: string | null = null
      const previousImage = productToEdit?.image ?? null

      // Upload a locally-picked file to Firebase right before persisting, so
      // the upload only happens when the admin actually creates/saves.
      let imageUrl = data.image
      if (pickedFile) {
        uploadedUrl = await uploadProductImage(pickedFile)
        imageUrl = uploadedUrl
      }

      const payload = { ...data, image: imageUrl }

      try {
        if (isEditing && productToEdit) {
          await patchProduct(productToEdit.id, payload)
          toast.add({
            type: "success",
            title: "Product updated",
            description: `${data.name} changes saved.`,
          })
        } else {
          await createProduct(payload)
          toast.add({
            type: "success",
            title: "Product added",
            description: `${data.name} has been published to catalog.`,
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
      if (uploadedUrl && previousImage && previousImage !== uploadedUrl) {
        await deleteFirebaseImageSafe(previousImage)
      }

      onOpenChange(false)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      if (message.toLowerCase().includes("slug")) {
        setError("slug", { message })
      }
      toast.add({
        type: "error",
        title: isEditing ? "Product Update Failed" : "Product Creation Failed",
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
      description: "Please fill all required product fields correctly.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {errors.slug && <FieldError errors={[{ message: errors.slug.message }]} />}
            </div>
          </div>

          {/* Category Select */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dlg-prod-category" className="text-xs font-medium">
              Category
            </Label>
            <select
              id="dlg-prod-category"
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            {errors.tags && <FieldError errors={[{ message: errors.tags.message }]} />}
          </div>

          {/* Storefront Placement Toggles */}
          <div className="flex flex-col gap-2 rounded-lg border p-3 bg-muted/20">
            <Label className="text-xs font-semibold">Storefront Placement</Label>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground">
                  Fan Favourite (Best Seller)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Show in the homepage best-sellers section
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground">
                  New Arrival / New Drop
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Show in the homepage new arrivals section
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
          </div>

          {/* Image Picker */}
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
            <Label className="text-xs font-medium">Primary Artwork Image</Label>
            <div className="flex items-center gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                <Image
                  src={pickedPreview || customImageUrl.trim() || watchedImage || ""}
                  alt="Selected preview"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={isSubmitting}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 w-fit text-xs"
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
                <Input
                  value={customImageUrl}
                  onChange={handleCustomUrlChange}
                  placeholder="pexels.com img only"
                  className="h-8 text-xs font-mono"
                  disabled={isSubmitting}
                />
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
                disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeVariant(idx)}
                    disabled={variantFields.length <= 1 || isSubmitting}
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
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Publishing..."
                : isEditing
                  ? "Save Changes"
                  : "Publish Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
