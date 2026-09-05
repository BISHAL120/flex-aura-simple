import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Prisma, type ContactStatus } from "@prisma/client"
import db from "@/lib/prisma"
import {
  updateContactSubmissionStatus,
} from "@/lib/data-layer/admin/contact-submissions/contact-submission-data-layer"
import { mapContactSubmissionToAdmin } from "@/lib/data-layer/admin/contact-submissions/contact-submission-mapper"
import { requireAdminApi } from "@/lib/check-Access"
import { CONTACT_STATUSES } from "@/lib/admin-contact-submissions-data"

const statusSchema = z.object({
  status: z.enum(CONTACT_STATUSES as [ContactStatus, ...ContactStatus[]]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi()
    if (!auth.ok) return auth.response

    const { id } = await params
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Invalid submission id" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = statusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid status" },
        { status: 400 }
      )
    }

    const existing = await db.contactSubmission.findFirst({
      where: { id, isDeleted: false },
    })
    if (!existing) {
      return NextResponse.json({ message: "Contact submission not found" }, { status: 404 })
    }

    const submission = await updateContactSubmissionStatus(id, parsed.data.status)

    return NextResponse.json(
      { submission: mapContactSubmissionToAdmin(submission) },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Contact submission not found" }, { status: 404 })
    }
    console.error("Error updating contact submission:", error)
    return NextResponse.json(
      { message: "Failed to update contact submission" },
      { status: 500 }
    )
  }
}
