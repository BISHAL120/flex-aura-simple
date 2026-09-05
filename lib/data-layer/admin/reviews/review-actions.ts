"use client"

async function parseError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null)
  return data?.message || "Unexpected server error. Please try again."
}

export async function createReview(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function patchReview(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function deleteReview(id: string) {
  const res = await fetch(`/api/admin/reviews/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function restoreReview(id: string) {
  const res = await fetch(`/api/admin/reviews/${id}/restore`, {
    method: "POST",
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function permanentDeleteReview(id: string) {
  const res = await fetch(`/api/admin/reviews/${id}/permanent`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}
