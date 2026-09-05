import type { Metadata } from "next"
import { ReviewForm } from "@/components/admin/reviews/review-form"

export const metadata: Metadata = {
  title: "New Review — Flex Aura Admin",
  description: "Create and publish a customer review to the storefront.",
}

export default function AdminNewReviewPage() {
  return <ReviewForm mode="create" />
}
