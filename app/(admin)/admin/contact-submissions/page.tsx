import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { ContactStatus } from "@prisma/client"
import { ContactSubmissionsTable } from "@/components/admin/contact-submissions/contact-submissions-table"
import { getAllContactSubmissions } from "@/lib/data-layer/admin/contact-submissions/contact-submission-data-layer"
import { mapContactSubmissionsToAdmin } from "@/lib/data-layer/admin/contact-submissions/contact-submission-mapper"
import { CONTACT_STATUSES } from "@/lib/admin-contact-submissions-data"

export const metadata: Metadata = {
  title: "Contact Submissions — Flex Aura Admin",
  description: "Review messages sent through the storefront contact form.",
}

const VALID_PAGE_SIZES = [8, 12, 24]
const DEFAULT_PAGE_SIZE = 8

export default async function AdminContactSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const search = (params?.search || "").trim()
  const rawStatus = params?.status || "all"
  const status: ContactStatus | "all" =
    rawStatus !== "all" && CONTACT_STATUSES.includes(rawStatus as ContactStatus)
      ? (rawStatus as ContactStatus)
      : "all"

  const parsedPage = Number(params?.page)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1
  const parsedSize = Number(params?.per_page)
  const pageSize = VALID_PAGE_SIZES.includes(parsedSize) ? parsedSize : DEFAULT_PAGE_SIZE

  const result = await getAllContactSubmissions(page, pageSize, search, status)
  const submissions = mapContactSubmissionsToAdmin(result.submissions)

  if (page > result.pagination.totalPages && result.pagination.totalPages > 0) {
    const redirectParams = new URLSearchParams()
    if (search) redirectParams.set("search", search)
    if (status !== "all") redirectParams.set("status", status)
    if (pageSize !== DEFAULT_PAGE_SIZE) redirectParams.set("per_page", String(pageSize))
    redirectParams.set("page", "1")
    redirect(`/admin/contact-submissions?${redirectParams.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Contact Submissions
        </h1>
        <p className="text-sm text-muted-foreground">
          Messages sent through the storefront contact form.
        </p>
      </div>

      <ContactSubmissionsTable
        submissions={submissions}
        counts={result.counts}
        total={result.pagination.total}
        totalPages={result.pagination.totalPages}
        search={search}
        status={status}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}
