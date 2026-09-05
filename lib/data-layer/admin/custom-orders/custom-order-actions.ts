"use client"

import { uploadImageFirebase } from "@/lib/firebase/upload"

async function parseError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null)
  return data?.message || "Unexpected server error. Please try again."
}

// ---------------------------------------------------------------------------
// Reference image upload (direct from the client, public + admin)
// ---------------------------------------------------------------------------

export const ACCEPTED_REFERENCE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]

export const MAX_REFERENCE_IMAGE_MB = 5
export const MAX_REFERENCE_IMAGE_BYTES = MAX_REFERENCE_IMAGE_MB * 1024 * 1024

export function validateReferenceImage(file: File): string | null {
  if (!ACCEPTED_REFERENCE_IMAGE_TYPES.includes(file.type)) {
    return "Unsupported file type. Use JPG, PNG, WebP, AVIF, or GIF."
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || ""
  const extAllowed = ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(ext)
  if (!file.type.startsWith("image/") && !extAllowed) {
    return "Unsupported file format. Use JPG, PNG, WebP, AVIF, or GIF."
  }
  if (file.size > MAX_REFERENCE_IMAGE_BYTES) {
    return `Image is too large. Maximum size is ${MAX_REFERENCE_IMAGE_MB}MB.`
  }
  if (file.size === 0) {
    return "The selected file is empty."
  }
  return null
}

/** Uploads a customer reference image to the Demo/Orders folder and returns its URL. */
export async function uploadReferenceImage(file: File): Promise<string> {
  const error = validateReferenceImage(file)
  if (error) throw new Error(error)
  const result = await uploadImageFirebase(file, "flex-aura/OrdersPayment")
  return result.url
}

// ---------------------------------------------------------------------------
// Public submission
// ---------------------------------------------------------------------------

export type PublicCustomOrderPayload = {
  customerName: string
  customerEmail: string
  customerPhone: string
  country: string
  deliveryAddress?: string
  designRequirement: string
  sizeOption: string
  customDimensions?: string
  withBacklitLed: boolean
  specialRequest?: string
  referenceImage?: string
}

export type PublicCustomOrderResult =
  | { ok: true; order: { id: string; orderNumber: string; status: string } }
  | { ok: false; duplicate: true; order: { id: string; orderNumber: string; status: string } }
  | { ok: false; duplicate?: false; message: string }

export async function submitCustomOrder(
  payload: PublicCustomOrderPayload
): Promise<PublicCustomOrderResult> {
  try {
    const res = await fetch("/api/custom-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => null)

    if (res.status === 409 && data?.duplicate) {
      return { ok: false, duplicate: true, order: data.order }
    }
    if (!res.ok) {
      return { ok: false, message: data?.message || "Something went wrong. Please try again." }
    }
    return { ok: true, order: data.order }
  } catch {
    return { ok: false, message: "Network error — please check your connection and try again." }
  }
}

// ---------------------------------------------------------------------------
// Admin API calls
// ---------------------------------------------------------------------------

export async function patchCustomOrder(
  id: string,
  body: Record<string, unknown>
) {
  const res = await fetch(`/api/admin/custom-orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}
