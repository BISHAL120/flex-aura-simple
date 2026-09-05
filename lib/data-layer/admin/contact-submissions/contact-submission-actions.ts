"use client"

import type { ContactStatus } from "@prisma/client"

async function parseError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null)
  return data?.message || "Unexpected server error. Please try again."
}

export type PublicContactPayload = {
  name: string
  email: string
  subject: string
  message: string
}

export type PublicContactResult =
  | { ok: true }
  | { ok: false; message: string }

export async function submitContactForm(
  payload: PublicContactPayload
): Promise<PublicContactResult> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      return { ok: false, message: data?.message || "Something went wrong. Please try again." }
    }
    return { ok: true }
  } catch {
    return { ok: false, message: "Network error — please check your connection and try again." }
  }
}

export async function patchContactSubmission(id: string, status: ContactStatus) {
  const res = await fetch(`/api/admin/contact-submissions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}
