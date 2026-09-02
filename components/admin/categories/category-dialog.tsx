"use client"

import * as React from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
import { initialCategories, type AdminCategory } from "@/lib/admin-data"
import { categorySchema, slugify, type CategoryFormValues } from "@/lib/validators"

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
  const categories = initialCategories
  const isEditing = !!categoryToEdit

  const [tagsInput, setTagsInput] = React.useState("")
  const [customImageUrl, setCustomImageUrl] = React.useState("")

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

  function onFormSubmit(data: CategoryFormValues) {
    const conflict = categories.find(
      (c) => c.slug.toLowerCase() === data.slug.toLowerCase() && c.id !== categoryToEdit?.id
    )

    if (conflict) {
      setError("slug", { message: "This slug is already in use by another category" })
      toast.add({
        type: "error",
        title: "Slug Conflict",
        description: "Please specify a unique URL slug for this category.",
      })
      return
    }

    if (isEditing && categoryToEdit) {
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

    onOpenChange(false)
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Validation Error",
      description: "Please check all required category fields.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            />
            {errors.tags && <FieldError errors={[{ message: errors.tags.message }]} />}
          </div>

          {/* Image selection */}
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
            <Label className="font-semibold">Cover Artwork Image</Label>
            <div className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                <Image
                  src={customImageUrl.trim() || watchedImage || "/products/product1.webp"}
                  alt="Category preview"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Input
                  value={customImageUrl}
                  onChange={handleCustomUrlChange}
                  placeholder="Custom image URL (/products/...)"
                  className="h-8 text-xs font-mono"
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
            />
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
              {isEditing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
