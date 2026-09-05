import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AdminReview } from "@/lib/admin-reviews-data"

export function ReviewCard({ review }: { review: AdminReview }) {
  const initials = review.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)

  return (
    <figure className="flex h-full flex-col gap-3 rounded-lg border bg-card p-5">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={i}
            className={cn(
              "size-4",
              i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <blockquote className="flex flex-1 flex-col gap-2">
        <p className="text-sm font-medium">{review.title}</p>
        <p className="text-sm text-muted-foreground">&ldquo;{review.body}&rdquo;</p>
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {initials}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{review.name}</span>
          <time className="text-xs text-muted-foreground">
            {new Date(review.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </figcaption>
    </figure>
  )
}
