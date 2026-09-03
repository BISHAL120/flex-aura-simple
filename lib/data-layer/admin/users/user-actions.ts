"use client"

async function parseError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null)
  return data?.message || "Unexpected server error. Please try again."
}

export async function patchUser(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}

export async function revokeSession(userId: string, sessionId: string) {
  const res = await fetch(`/api/admin/users/${userId}/sessions/${sessionId}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json()
}
