"use client"

import { uploadImageFirebase } from "@/lib/firebase/upload"

async function parseError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null)
  return data?.message || "Unexpected server error. Please try again."
}

// ---------------------------------------------------------------------------
// Image upload (direct from the client)
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

export function validateHeroSlideImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Unsupported file type. Use JPG, PNG, WebP, AVIF, or GIF."
  }

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

export async function uploadHeroSlideImage(file: File): Promise<string> {
  const error = validateHeroSlideImage(file)
  if (error) throw new Error(error)

  const result = await uploadImageFirebase(file, "flex-aura/Carousels")
  return result.url
}

// ---------------------------------------------------------------------------
// CRUD API calls
// ---------------------------------------------------------------------------

export async function createHeroSlide(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/hero-sliders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}

export async function patchHeroSlide(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/hero-sliders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}

export async function deleteHeroSlide(id: string) {
  const res = await fetch(`/api/admin/hero-sliders/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}

export async function restoreHeroSlide(id: string) {
  const res = await fetch(`/api/admin/hero-sliders/${id}/restore`, {
    method: "POST",
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}

export async function moveHeroSlide(id: string, direction: -1 | 1) {
  const res = await fetch("/api/admin/hero-sliders/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, direction }),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}

export async function permanentDeleteHeroSlide(id: string) {
  const res = await fetch(`/api/admin/hero-sliders/${id}/permanent`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}
