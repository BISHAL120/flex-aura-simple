
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getServerSession } from "./get-session";

export async function isAdmin() {
  const session = await getServerSession();
  const user = session?.user;
  if (!user?.role?.includes("ADMIN") || user?.isBanned) {
    redirect("/unauthorize")
  }
  return user;
}

/**
 * Guard for API route handlers. Unlike `isAdmin()` (which throws a redirect
 * for page navigation), this returns a JSON 401/403 response so the route can
 * return proper HTTP status codes instead of swallowing NEXT_REDIRECT into a 500.
 */
export async function requireAdminApi(): Promise<
  | { ok: true; user: NonNullable<NonNullable<Awaited<ReturnType<typeof getServerSession>>>["user"]> }
  | { ok: false; response: NextResponse }
> {
  const session = await getServerSession();
  const user = session?.user;
  if (!user || user.isBanned) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!user.role?.includes("ADMIN")) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, user };
}
