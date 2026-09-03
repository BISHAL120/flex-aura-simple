import * as React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { UserTable } from "@/components/admin/users/user-table"
import { getAllUsers } from "@/lib/data-layer/admin/users/user-data-layer"
import { mapUsersToAdminUsers } from "@/lib/data-layer/admin/users/user-mapper"

export const metadata: Metadata = {
  title: "User Management — Flex Aura Admin",
  description: "Manage registered customers, workshop managers, administrator permissions, and ban statuses.",
}

const VALID_ROLES = ["ADMIN", "MANAGER", "USER"]
const VALID_PAGE_SIZES = [6, 12, 24]
const DEFAULT_PAGE_SIZE = 12

const AdminUsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const search = (params?.search || "").trim();
  const rawRole = params?.role || "";
  const role = VALID_ROLES.includes(rawRole) ? rawRole : "";

  const parsedPage = Number(params?.page);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;

  const parsedSize = Number(params?.per_page);
  const pageSize = VALID_PAGE_SIZES.includes(parsedSize) ? parsedSize : DEFAULT_PAGE_SIZE;

  const result = await getAllUsers(page, pageSize, search, role);
  const users = mapUsersToAdminUsers(result.users);

  // If the requested page is out of range (e.g. after a filter narrows the
  // results), send the user back to a valid page in one round trip.
  if (page > result.pagination.totalPages && result.pagination.totalPages > 0) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set("per_page", String(pageSize));
    params.set("page", "1");
    redirect(`/admin/users?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">
          View registered customer accounts, manage administrator &amp; workshop manager roles, inspect active sessions, and moderate user access.
        </p>
      </div>

      <UserTable
        users={users}
        total={result.pagination.total}
        totalPages={result.pagination.totalPages}
        activeCount={result.counts.active}
        bannedCount={result.counts.banned}
        search={search}
        role={role}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}

export default AdminUsersPage;
