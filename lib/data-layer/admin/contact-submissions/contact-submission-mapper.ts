import type { ContactSubmission } from "@prisma/client"
import type { AdminContactSubmission } from "@/lib/admin-contact-submissions-data"

export function mapContactSubmissionToAdmin(
  submission: ContactSubmission
): AdminContactSubmission {
  return {
    id: submission.id,
    name: submission.name,
    email: submission.email,
    subject: submission.subject,
    message: submission.message,
    status: submission.status,
    isDeleted: submission.isDeleted,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
  }
}

export function mapContactSubmissionsToAdmin(
  submissions: ContactSubmission[]
): AdminContactSubmission[] {
  return submissions.map(mapContactSubmissionToAdmin)
}
