"use client"

import { uploadImageFirebase } from "@/lib/firebase/upload"
import { deleteFirebaseImage } from "@/lib/firebase/deleteImage"

async function parseError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null)
  return data?.message || "Unexpected server error. Please try again."
}

// ---------------------------------------------------------------------------
// Image upload / delete (direct from the client)
// ---------------------------------------------------------------------------

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]

export const MAX_IMAGE_SIZE_MB = 5
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

export function validateCategoryImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Unsupported file type. Use JPG, PNG, WebP, AVIF, or GIF."
  }

  // Double-check by extension as a fallback (some browsers give a generic
  // type for unusual formats).
  const ext = file.name.split(".").pop()?.toLowerCase() || ""
  const extAllowed = ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(ext)
  if (!file.type.startsWith("image/") && !extAllowed) {
    return "Unsupported file format. Use JPG, PNG, WebP, AVIF, or GIF."
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image is too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`
  }

  if (file.size === 0) {
    return "The selected file is empty."
  }

  return null
}

export async function uploadCategoryImage(file: File): Promise<string> {
  const error = validateCategoryImage(file)
  if (error) throw new Error(error)

  const result = await uploadImageFirebase(file, "Categories")
  return result.url
}


export async function checkCategorySlug(slug: string, excludeId?: string) {
  const params = new URLSearchParams({ slug })
  if (excludeId) params.set("excludeId", excludeId)

  const res = await fetch(`/api/admin/categories/check-slug?${params.toString()}`)

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  const data = await res.json()
  return data.exists as boolean
}

export async function createCategory(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}

export async function patchCategory(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}

export async function deleteCategory(id: string) {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}

export async function restoreCategory(id: string) {
  const res = await fetch(`/api/admin/categories/${id}/restore`, {
    method: "POST",
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}

export async function permanentDeleteCategory(id: string) {
  const res = await fetch(`/api/admin/categories/${id}/permanent`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}
