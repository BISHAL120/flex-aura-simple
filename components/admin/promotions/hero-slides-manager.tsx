"use client"

import * as React from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EditIcon, LayersIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAdminStore } from "@/components/admin/admin-store-provider"
import type { HeroSlide } from "@/lib/data"
import { heroSlideSchema, type HeroSlideFormValues } from "@/lib/validators"

export function HeroSlidesManager() {
  const { heroSlides, updateHeroSlide } = useAdminStore()
  const [editingSlide, setEditingSlide] = React.useState<HeroSlide | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HeroSlideFormValues>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      image: "",
      alt: "",
      ctaLabel: "",
      ctaHref: "",
    },
  })

  function handleOpenEdit(slide: HeroSlide) {
    setEditingSlide(slide)
    reset({
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image,
      alt: slide.alt,
      ctaLabel: slide.ctaLabel,
      ctaHref: slide.ctaHref,
    })
    setDialogOpen(true)
  }

  function onFormSubmit(data: HeroSlideFormValues) {
    if (!editingSlide) return
    updateHeroSlide(editingSlide.id, data)
    setDialogOpen(false)
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Validation Error",
      description: "Please check the hero slide details and ensure the link is a valid path or URL.",
    })
  }

  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg font-semibold tracking-tight flex items-center gap-2">
          <LayersIcon className="size-4 text-primary" />
          Homepage Hero Carousel Slides
        </CardTitle>
        <CardDescription className="text-xs">
          Manage the high-impact banner slides displayed on the store homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-col overflow-hidden rounded-lg border bg-muted/20"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                Slide {index + 1}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-semibold text-sm text-foreground">{slide.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {slide.subtitle}
              </p>
              <div className="mt-auto pt-3 flex items-center justify-between border-t text-xs">
                <span className="font-medium text-muted-foreground">
                  CTA: <strong className="text-foreground">{slide.ctaLabel}</strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(slide)}
                  className="h-7 text-xs gap-1"
                >
                  <EditIcon className="size-3" />
                  <span>Edit Slide</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Edit Slide Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-base font-semibold">
              Edit Hero Slide: {editingSlide?.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update heading, message copy, and destination link for this carousel slide.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="flex flex-col gap-4 py-2 text-xs">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slide-title">Slide Headline</Label>
              <Input
                id="slide-title"
                {...register("title")}
                className="h-9 text-xs font-semibold"
              />
              {errors.title && <FieldError errors={[{ message: errors.title.message }]} />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slide-subtitle">Subtitle Copy</Label>
              <Textarea
                id="slide-subtitle"
                {...register("subtitle")}
                rows={3}
                className="text-xs"
              />
              {errors.subtitle && <FieldError errors={[{ message: errors.subtitle.message }]} />}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slide-cta-label">Button Label</Label>
                <Input
                  id="slide-cta-label"
                  {...register("ctaLabel")}
                  className="h-8 text-xs"
                />
                {errors.ctaLabel && <FieldError errors={[{ message: errors.ctaLabel.message }]} />}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slide-cta-href">Button Link</Label>
                <Input
                  id="slide-cta-href"
                  {...register("ctaHref")}
                  placeholder="/shop or https://..."
                  className="h-8 text-xs font-mono"
                />
                {errors.ctaHref && <FieldError errors={[{ message: errors.ctaHref.message }]} />}
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Slide</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
