"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon, Loader2Icon, StarIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import type { AdminReview } from "@/lib/admin-reviews-data"
import {
  createReview,
  patchReview,
} from "@/lib/data-layer/admin/reviews/review-actions"
import { reviewSchema, type ReviewFormInput } from "@/lib/validators"

interface ReviewFormProps {
  review?: AdminReview | null
  mode: "create" | "edit"
}

/** Converts a Date to a yyyy-mm-dd value usable by <input type="date">. */
function toDateInputValue(date: Date): string {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export function ReviewForm({ review, mode }: ReviewFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: review?.name ?? "",
      rating: review?.rating ?? 5,
      date: review ? toDateInputValue(new Date(review.date)) : toDateInputValue(new Date()),
      title: review?.title ?? "",
      body: review?.body ?? "",
      isActive: review?.isActive ?? true,
    },
  })

  const watchedRating = watch("rating")
  const watchedActive = watch("isActive")

  async function onFormSubmit(data: ReviewFormInput) {
    setIsSubmitting(true)
    try {
      if (mode === "edit" && review) {
        await patchReview(review.id, data)
        toast.add({
          type: "success",
          title: "Review updated",
          description: `${data.name}'s review has been saved.`,
        })
      } else {
        await createReview(data)
        toast.add({
          type: "success",
          title: "Review created",
          description: `${data.name}'s review has been published.`,
        })
      }
      router.push("/admin/reviews")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        type: "error",
        title: mode === "edit" ? "Review Update Failed" : "Review Creation Failed",
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
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            render={<Link href="/admin/reviews" />}
            nativeButton={false}
            title="Back to reviews"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {mode === "create" ? "Add New Review" : `Edit Review: ${review?.name}`}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "create"
                ? "Publish a customer testimonial to the storefront reviews section."
                : `Review ID: ${review?.id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            render={<Link href="/admin/reviews" />}
            nativeButton={false}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="gap-1.5 text-xs font-semibold" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="size-3.5 animate-spin" />}
            <span>
              {isSubmitting
                ? mode === "create" ? "Creating..." : "Saving..."
                : mode === "create" ? "Create Review" : "Save Review"}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Left: Review Content */}
        <Card className="border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base font-semibold">Review Content</CardTitle>
            <CardDescription className="text-xs">
              Customer name, star rating, headline, and testimonial body
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rev-name">Customer Name</Label>
                <Input
                  id="rev-name"
                  {...register("name")}
                  placeholder="e.g. Rahim Uddin"
                  className="h-9 text-xs font-semibold"
                  disabled={isSubmitting}
                />
                {errors.name && <FieldError errors={[{ message: errors.name.message }]} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rev-date">Review Date</Label>
                <Input
                  id="rev-date"
                  type="date"
                  {...register("date")}
                  className="h-9 text-xs font-mono"
                  disabled={isSubmitting}
                />
                {errors.date && <FieldError errors={[{ message: errors.date.message }]} />}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rev-title">Review Headline</Label>
              <Input
                id="rev-title"
                {...register("title")}
                placeholder="e.g. Exactly as pictured"
                className="h-9 text-xs"
                disabled={isSubmitting}
              />
              {errors.title && <FieldError errors={[{ message: errors.title.message }]} />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rev-body">Review Body</Label>
              <Textarea
                id="rev-body"
                {...register("body")}
                rows={4}
                placeholder="The laser cut is clean, the powder coat is flawless, and delivery was fast..."
                className="text-xs leading-relaxed"
                disabled={isSubmitting}
              />
              {errors.body && <FieldError errors={[{ message: errors.body.message }]} />}
            </div>
          </CardContent>
        </Card>

        {/* Right: Rating + Visibility */}
        <div className="flex flex-col gap-6">
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">Rating</CardTitle>
              <CardDescription className="text-xs">
                How many stars did the customer give?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue("rating", star, { shouldValidate: true })}
                    disabled={isSubmitting}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <StarIcon
                      className={cn(
                        "size-7",
                        star <= Number(watchedRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
                <span className="ml-1 text-sm font-semibold text-foreground">
                  {Number(watchedRating)}/5
                </span>
              </div>
              {errors.rating && <FieldError errors={[{ message: errors.rating.message }]} />}
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">Visibility</CardTitle>
              <CardDescription className="text-xs">
                Inactive reviews are hidden from the storefront
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-foreground">Published on storefront</span>
                  <span className="text-[11px] text-muted-foreground">
                    Show this review in the homepage reviews section.
                  </span>
                </div>
                <Switch
                  checked={watchedActive}
                  onCheckedChange={(checked) => setValue("isActive", Boolean(checked))}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
