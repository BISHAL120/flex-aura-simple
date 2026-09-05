import { NextRequest, NextResponse } from "next/server"
import { contactSchema } from "@/lib/validators"
import { createContactSubmission } from "@/lib/data-layer/admin/contact-submissions/contact-submission-data-layer"

export const runtime = "nodejs"

/**
 * Public endpoint for the contact page form. Validates and persists the
 * message so the admin team can review it in the dashboard.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid contact data" },
        { status: 400 }
      )
    }

    const data = parsed.data
    await createContactSubmission({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return NextResponse.json(
      { message: "Failed to send message. Please try again." },
      { status: 500 }
    )
  }
}
