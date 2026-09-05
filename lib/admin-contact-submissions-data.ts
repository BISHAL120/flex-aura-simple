import type { ContactStatus } from "@prisma/client"

export type { ContactStatus }

export type AdminContactSubmission = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: ContactStatus
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export const CONTACT_STATUSES: ContactStatus[] = ["new", "read", "replied", "archived"]

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
}
