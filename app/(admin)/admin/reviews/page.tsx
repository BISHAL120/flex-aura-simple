import * as React from "react"
import type { Metadata } from "next"
import { ReviewModerator } from "@/components/admin/reviews/review-moderator"

export const metadata: Metadata = {
  title: "Customer Reviews Moderation — Flex Aura Admin",
  description: "Moderate verified reviews, monitor rating distribution, and feature testimonials.",
}

export default function AdminReviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Customer Reviews &amp; Feedback
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor customer satisfaction, 3D shadow floating reviews, and moderate testimonials.
        </p>
      </div>

      <ReviewModerator />
    </div>
  )
}
