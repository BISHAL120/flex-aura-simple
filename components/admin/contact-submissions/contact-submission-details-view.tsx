"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  MailIcon,
  UserIcon,
  CalendarIcon,
  ReplyIcon,
  Loader2Icon,
  SaveIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showError, showSuccess } from "@/lib/toast"
import {
  CONTACT_STATUS_LABELS,
  CONTACT_STATUSES,
  type AdminContactSubmission,
  type ContactStatus,
} from "@/lib/admin-contact-submissions-data"
import { patchContactSubmission } from "@/lib/data-layer/admin/contact-submissions/contact-submission-actions"

const statusBadgeClass: Record<ContactStatus, string> = {
  new: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  read: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  replied: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  archived: "bg-muted text-muted-foreground",
}

export function ContactSubmissionDetailsView({
  submission,
}: {
  submission: AdminContactSubmission
}) {
  const router = useRouter()
  const [status, setStatus] = React.useState<ContactStatus>(submission.status)
  const [saving, setSaving] = React.useState(false)

  const replied = status === "replied"

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (saving || status === submission.status) return
    setSaving(true)
    try {
      await patchContactSubmission(submission.id, status)
      showSuccess({
        title: "Status updated",
        message: `Marked as ${CONTACT_STATUS_LABELS[status]}.`,
      })
      router.refresh()
    } catch (err) {
      showError({ message: err instanceof Error ? err.message : "Failed to update status" })
    } finally {
      setSaving(false)
    }
  }

  const mailtoLink = `mailto:${submission.email}?subject=${encodeURIComponent(
    `Re: ${submission.subject}`
  )}`

  return (
    <div className="flex flex-col gap-8">
      {/* Top bar */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            render={<Link href="/admin/contact-submissions" />}
            nativeButton={false}
            title="Back to submissions"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                {submission.subject}
              </h1>
              <Badge variant="outline" className={`text-[10px] ${statusBadgeClass[submission.status]}`}>
                {CONTACT_STATUS_LABELS[submission.status]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Received on{" "}
              {new Date(submission.createdAt).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<a href={mailtoLink} />}
            nativeButton={false}
            className="gap-1.5 text-xs"
          >
            <ReplyIcon className="size-3.5" />
            <span>Reply by Email</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        {/* Message card */}
        <Card className="border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base font-semibold">Message</CardTitle>
            <CardDescription className="text-xs">
              {replied
                ? "Marked as replied — the customer has been contacted."
                : "Full message from the storefront contact form."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/20 p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {submission.message}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: sender + status */}
        <div className="flex flex-col gap-6">
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">Sender</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-2">
                <UserIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-foreground">{submission.name}</span>
              </div>
              <a
                href={`mailto:${submission.email}`}
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <MailIcon className="size-4 shrink-0" />
                {submission.email}
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="size-4 shrink-0" />
                {new Date(submission.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">Update Status</CardTitle>
              <CardDescription className="text-xs">
                Track how this message is being handled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="flex flex-col gap-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContactStatus)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {CONTACT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {CONTACT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving || status === submission.status}
                  className="gap-1.5 text-xs font-semibold"
                >
                  {saving ? <Loader2Icon className="size-3.5 animate-spin" /> : <SaveIcon className="size-3.5" />}
                  <span>{saving ? "Saving…" : "Save Status"}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
