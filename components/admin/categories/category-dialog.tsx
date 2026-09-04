"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, UploadIcon } from "lucide-react"

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
import { slugify, categorySchema, type CategoryFormValues } from "@/lib/validators"
import {
  createCategory,
  patchCategory,
  uploadCategoryImage,
  checkCategorySlug,
  validateCategoryImage,
} from "@/lib/data-layer/admin/categories/category-actions"
import type { AdminCategory } from "@/lib/admin-categories-data"
import { deleteFirebaseImage } from "@/lib/firebase/deleteImage"

const PRESET_IMAGES = [
  "/products/product1.webp",
  "/products/product2.webp",
  "/products/product5.jpeg",
  "/products/product10.jpeg",
  "/products/product17.jpeg",
  "/products/product20.webp",
  "/products/product21.jpg",
  "/products/product24.jpg",
]

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryToEdit?: AdminCategory | null
}

export function CategoryDialog({
  open,
  onOpenChange,
  categoryToEdit,
}: CategoryDialogProps) {
  const isEditing = !!categoryToEdit
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [tagsInput, setTagsInput] = React.useState("")
  const [customImageUrl, setCustomImageUrl] = React.useState("")
  const [pickedFile, setPickedFile] = React.useState<File | null>(null)
  const [pickedPreview, setPickedPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image: "/products/product1.webp",
      tags: ["car", "automotive"],
      featured: false,
    },
  })

  const watchedImage = watch("image")
  const watchedFeatured = watch("featured")

  React.useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        setTagsInput(categoryToEdit.tags.join(", "))
        setCustomImageUrl("")
        setPickedFile(null)
        setPickedPreview(null)
        reset({
          name: categoryToEdit.name,
          slug: categoryToEdit.slug,
          description: categoryToEdit.description,
          image: categoryToEdit.image,
          tags: categoryToEdit.tags,
          featured: categoryToEdit.featured,
        })
      } else {
        setTagsInput("car, automotive")
        setCustomImageUrl("")
        setPickedFile(null)
        setPickedPreview(null)
        reset({
          name: "",
          slug: "",
          description: "",
          image: "/products/product1.webp",
          tags: ["car", "automotive"],
          featured: false,
        })
      }
    }
  }, [open, categoryToEdit, reset])

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
    setValue("tags", parsed.length > 0 ? parsed : ["car"], { shouldValidate: true })
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
  }

  async function onFormSubmit(data: CategoryFormValues) {
    setIsSubmitting(true)

    try {
      // Pre-flight unique checks BEFORE uploading anything, so a failed save
      // never leaves an orphaned image in Firebase.
      const slugExists = await checkCategorySlug(data.slug, categoryToEdit?.id)
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
      const previousImage = categoryToEdit?.image ?? null

      // Upload a locally-picked file to Firebase right before persisting, so
      // the upload only happens when the admin actually creates/saves.
      let imageUrl = data.image
      if (pickedFile) {
        uploadedUrl = await uploadCategoryImage(pickedFile)
        imageUrl = uploadedUrl
      }

      const payload = { ...data, image: imageUrl }

      try {
        if (isEditing && categoryToEdit) {
          await patchCategory(categoryToEdit.id, payload)
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
      if (uploadedUrl && previousImage && previousImage !== uploadedUrl) {
        await deleteFirebaseImage(previousImage)
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
        title: isEditing ? "Category Update Failed" : "Category Creation Failed",
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
      description: "Please check all required category fields.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">
            {isEditing ? `Edit Category: ${categoryToEdit?.name}` : "Create New Category"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Update category title, description, keywords, and banner image."
              : "Define a product collection category to organize laser-cut metal art."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="flex flex-col gap-4 py-2 text-xs">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-modal-name">Category Title</Label>
            <Input
              id="cat-modal-name"
              {...register("name")}
              onChange={handleNameChange}
              placeholder="e.g. Vintage Classics & Muscle Cars"
              className="h-9 text-xs font-semibold"
              disabled={isSubmitting}
            />
            {errors.name && <FieldError errors={[{ message: errors.name.message }]} />}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-modal-slug">URL Slug</Label>
            <Input
              id="cat-modal-slug"
              {...register("slug")}
              placeholder="vintage-classics"
              className="h-9 text-xs font-mono"
              disabled={isSubmitting}
            />
            {errors.slug && <FieldError errors={[{ message: errors.slug.message }]} />}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-modal-desc">Description</Label>
            <Textarea
              id="cat-modal-desc"
              {...register("description")}
              rows={3}
              placeholder="Laser-cut metal wall silhouettes of timeless classic automobiles..."
              className="text-xs leading-relaxed"
              disabled={isSubmitting}
            />
            {errors.description && (
              <FieldError errors={[{ message: errors.description.message }]} />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-modal-tags">Keywords / Tags (Comma-separated)</Label>
            <Input
              id="cat-modal-tags"
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder="classic, mustang, corvette, vintage"
              className="h-9 text-xs"
              disabled={isSubmitting}
            />
            {errors.tags && <FieldError errors={[{ message: errors.tags.message }]} />}
          </div>

          {/* Image selection */}
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
            <Label className="font-semibold">Cover Artwork Image</Label>
            <div className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                <Image
                  src={pickedPreview || customImageUrl.trim() || watchedImage || "/products/product1.webp"}
                  alt="Category preview"
                  fill
                  sizes="56px"
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
                  placeholder="Custom image URL (/products/...)"
                  className="h-8 text-xs font-mono"
                  disabled={isSubmitting}
                />
                <div className="flex flex-wrap gap-1">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => {
                        setValue("image", img, { shouldValidate: true })
                        setCustomImageUrl("")
                      }}
                      className={`relative size-7 overflow-hidden rounded border transition-all ${
                        watchedImage === img && !customImageUrl
                          ? "border-primary ring-2 ring-primary/40"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      disabled={isSubmitting}
                    >
                      <Image src={img} alt="preset" fill sizes="28px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {errors.image && <FieldError errors={[{ message: errors.image.message }]} />}
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-xs text-foreground">
                Feature on Store Navigation
              </span>
              <span className="text-[11px] text-muted-foreground">
                Highlight this category on homepage tabs and filter chips.
              </span>
            </div>
            <Switch
              checked={watchedFeatured}
              onCheckedChange={(checked) => setValue("featured", Boolean(checked))}
              disabled={isSubmitting}
            />
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
              {isSubmitting ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
