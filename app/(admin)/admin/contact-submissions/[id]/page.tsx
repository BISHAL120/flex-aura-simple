import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ContactSubmissionDetailsView } from "@/components/admin/contact-submissions/contact-submission-details-view"
import { getContactSubmissionById } from "@/lib/data-layer/admin/contact-submissions/contact-submission-data-layer"
import { mapContactSubmissionToAdmin } from "@/lib/data-layer/admin/contact-submissions/contact-submission-mapper"

export const metadata: Metadata = {
  title: "Contact Submission — Flex Aura Admin",
  description: "View a message sent through the storefront contact form.",
}

export default async function AdminContactSubmissionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const submission = await getContactSubmissionById(id)

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-heading text-xl font-bold">Contact Submission Not Found</h2>
        <p className="max-w-sm text-xs text-muted-foreground">
          No contact submission matching ID &quot;{id}&quot; was found.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/contact-submissions" />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to Contact Submissions
        </Button>
      </div>
    )
  }

  return (
    <ContactSubmissionDetailsView
      key={submission.id}
      submission={mapContactSubmissionToAdmin(submission)}
    />
  )
}
