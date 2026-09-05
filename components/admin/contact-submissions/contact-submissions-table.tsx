"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MailIcon, SearchIcon, Loader2Icon, EyeIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataPagination } from "@/components/admin/common/data-pagination"
import { showError, showSuccess } from "@/lib/toast"
import {
  CONTACT_STATUS_LABELS,
  CONTACT_STATUSES,
  type AdminContactSubmission,
  type ContactStatus,
} from "@/lib/admin-contact-submissions-data"
import { patchContactSubmission } from "@/lib/data-layer/admin/contact-submissions/contact-submission-actions"

const SEARCH_DEBOUNCE_MS = 500
const DEFAULT_PAGE_SIZE = 8

type SubmissionCounts = Record<ContactStatus, number>

interface ContactSubmissionsTableProps {
  submissions: AdminContactSubmission[]
  counts: SubmissionCounts & { total: number }
  total: number
  totalPages: number
  search: string
  status: ContactStatus | "all"
  page: number
  pageSize: number
}

type CommittedState = {
  search: string
  status: ContactStatus | "all"
  page: number
  pageSize: number
}

function buildQuery(state: CommittedState) {
  const params = new URLSearchParams()
  if (state.search) params.set("search", state.search)
  if (state.status !== "all") params.set("status", state.status)
  if (state.page !== 1) params.set("page", String(state.page))
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set("per_page", String(state.pageSize))
  const qs = params.toString()
  return qs ? `/admin/contact-submissions?${qs}` : "/admin/contact-submissions"
}

const statusBadgeClass: Record<ContactStatus, string> = {
  new: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  read: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  replied: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  archived: "bg-muted text-muted-foreground",
}

export function ContactSubmissionsTable({
  submissions,
  counts,
  total,
  totalPages,
  search,
  status,
  page,
  pageSize,
}: ContactSubmissionsTableProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = React.useState(search)
  const searchFocusedRef = React.useRef(false)
  const committedRef = React.useRef<CommittedState>({ search, status, page, pageSize })
  const pendingSizeRef = React.useRef<number | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  React.useEffect(() => {
    committedRef.current = { search, status, page, pageSize }
  }, [search, status, page, pageSize])

  React.useEffect(() => {
    if (searchFocusedRef.current) return
    setSearchInput(search)
  }, [search])

  const navigate = React.useCallback(
    (overrides: Partial<CommittedState>) => {
      const next = { ...committedRef.current, ...overrides }
      committedRef.current = next
      router.push(buildQuery(next), { scroll: false })
    },
    [router]
  )

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next !== committedRef.current.search) navigate({ search: next, page: 1 })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput, navigate])

  const handleSearchBlur = () => {
    searchFocusedRef.current = false
    const next = searchInput.trim()
    if (next !== committedRef.current.search) navigate({ search: next, page: 1 })
  }
  const handleSearchFocus = () => {
    searchFocusedRef.current = true
  }

  function handleStatusChange(next: ContactStatus | "all") {
    navigate({ status: next, page: 1 })
  }

  function handlePageChange(nextPage: number) {
    const size = pendingSizeRef.current
    pendingSizeRef.current = null
    navigate(size !== null ? { pageSize: size, page: nextPage } : { page: nextPage })
  }
  function handlePageSizeChange(nextSize: number) {
    pendingSizeRef.current = nextSize
  }

  async function handleStatusUpdate(submission: AdminContactSubmission, next: ContactStatus) {
    if (busyId || submission.status === next) return
    setBusyId(submission.id)
    try {
      await patchContactSubmission(submission.id, next)
      showSuccess({
        title: "Status updated",
        message: `Marked "${submission.subject}" as ${CONTACT_STATUS_LABELS[next]}.`,
      })
      router.refresh()
    } catch (err) {
      showError({ message: err instanceof Error ? err.message : "Failed to update status" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Status Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Search by name, email, subject…"
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => handleStatusChange("all")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              status === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All ({counts.total})
          </button>
          {CONTACT_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusChange(s)}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {CONTACT_STATUS_LABELS[s]} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs">From</TableHead>
                <TableHead className="text-xs">Subject</TableHead>
                <TableHead className="max-w-sm text-xs">Message</TableHead>
                <TableHead className="text-xs">Received</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="w-[170px] text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <TableRow key={submission.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <MailIcon className="size-3.5" />
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground">{submission.name}</span>
                          <a
                            href={`mailto:${submission.email}`}
                            className="text-[11px] text-muted-foreground hover:text-primary"
                          >
                            {submission.email}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[160px]">
                      <p className="truncate text-xs font-semibold text-foreground">{submission.subject}</p>
                    </TableCell>
                    <TableCell className="max-w-sm">
                      <p className="line-clamp-2 text-xs text-muted-foreground">{submission.message}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusBadgeClass[submission.status]}`}>
                        {CONTACT_STATUS_LABELS[submission.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          render={<Link href={`/admin/contact-submissions/${submission.id}`} />}
                          nativeButton={false}
                          title="View details"
                        >
                          <EyeIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <select
                          value={submission.status}
                          onChange={(e) => handleStatusUpdate(submission, e.target.value as ContactStatus)}
                          disabled={busyId === submission.id}
                          aria-label="Update status"
                          className="h-7 rounded border bg-background px-1.5 text-[11px] font-medium text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                        >
                          {CONTACT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {CONTACT_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        {busyId === submission.id && <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    No contact submissions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          pageSizeOptions={[8, 12, 24]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemName="submissions"
        />
      </div>
    </div>
  )
}
