import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ReviewForm } from "@/components/admin/reviews/review-form"
import { getReviewById } from "@/lib/data-layer/admin/reviews/review-data-layer"
import { mapReviewToAdminReview } from "@/lib/data-layer/admin/reviews/review-mapper"

export const metadata: Metadata = {
  title: "Edit Review — Flex Aura Admin",
  description: "Update a customer review's content, rating, or visibility.",
}

export default async function AdminEditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dbReview = await getReviewById(id)

  if (!dbReview) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Review Not Found</h2>
        <p className="max-w-sm text-xs text-muted-foreground">
          No customer review matching ID &quot;{id}&quot; was found.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/reviews" />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to Reviews
        </Button>
      </div>
    )
  }

  return (
    <ReviewForm
      key={dbReview.id}
      review={mapReviewToAdminReview(dbReview)}
      mode="edit"
    />
  )
}
