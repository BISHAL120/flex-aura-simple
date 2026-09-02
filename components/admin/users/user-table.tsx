"use client"

import * as React from "react"
import Link from "next/link"
import {
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  BanIcon,
  CheckCircle2Icon,
  EyeIcon,
  UsersIcon,
  MailCheckIcon,
  PhoneIcon,
  MapPinIcon,
  Loader2Icon,
  MoreVerticalIcon,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataPagination } from "@/components/admin/common/data-pagination"
import { UserBanDialog } from "@/components/admin/users/user-ban-dialog"
import { UserRoleDialog } from "@/components/admin/users/user-role-dialog"
import { initialUsers, type AdminUser, type UserRole } from "@/lib/admin-users-data"
import { toast } from "@/components/ui/toast"

const ROLE_TABS = [
  { label: "All Roles", value: "ALL" },
  { label: "Admins", value: "ADMIN" },
  { label: "Managers", value: "MANAGER" },
  { label: "Users", value: "USER" },
]

const STATUS_FILTERS = [
  { label: "All Statuses", value: "all" },
  { label: "Active Only", value: "active" },
  { label: "Banned Only", value: "banned" },
  { label: "Verified Only", value: "verified" },
]

export function UserTable() {
  const [users, setUsers] = React.useState<AdminUser[]>(initialUsers)
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  // Dialog states
  const [selectedUserForBan, setSelectedUserForBan] = React.useState<AdminUser | null>(null)
  const [banDialogOpen, setBanDialogOpen] = React.useState(false)
  const [banLoading, setBanLoading] = React.useState(false)

  const [selectedUserForRole, setSelectedUserForRole] = React.useState<AdminUser | null>(null)
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false)
  const [roleLoading, setRoleLoading] = React.useState(false)

  // Action running state per user ID for inline buttons
  const [actionRunningUserId, setActionRunningUserId] = React.useState<string | null>(null)

  // Filtered and searched users
  const filteredUsers = React.useMemo(() => {
    let list = [...users]

    // Role filter
    if (roleFilter !== "ALL") {
      list = list.filter((u) => u.role.includes(roleFilter as UserRole))
    }

    // Status filter
    if (statusFilter === "active") {
      list = list.filter((u) => !u.isBanned)
    } else if (statusFilter === "banned") {
      list = list.filter((u) => u.isBanned)
    } else if (statusFilter === "verified") {
      list = list.filter((u) => u.emailVerified)
    }

    // Search query
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q)) ||
          (u.location && u.location.toLowerCase().includes(q)) ||
          u.id.toLowerCase().includes(q)
      )
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [users, roleFilter, statusFilter, search])

  // Pagination calculation
  const totalItems = filteredUsers.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const safePage = Math.max(1, Math.min(page, totalPages))

  const paginatedUsers = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, safePage, pageSize])

  // Reset to page 1 on filter/search change
  React.useEffect(() => {
    setPage(1)
  }, [search, roleFilter, statusFilter, pageSize])

  // Ban / Unban handler
  async function handleConfirmBan(user: AdminUser) {
    const nextBanned = !user.isBanned
    setBanLoading(true)
    setActionRunningUserId(user.id)

    toast.add({
      type: "info",
      title: "Updating Account Status",
      description: `${nextBanned ? "Banning" : "Unbanning"} user ${user.name}...`,
    })

    // Simulate async server call
    await new Promise((resolve) => setTimeout(resolve, 800))

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, isBanned: nextBanned, updatedAt: new Date().toISOString() }
          : u
      )
    )

    toast.add({
      type: "success",
      title: nextBanned ? "User Account Banned" : "User Account Restored",
      description: `${user.name} (${user.email}) has been ${
        nextBanned ? "banned from accessing the store" : "unbanned and restored"
      }.`,
    })

    setBanLoading(false)
    setActionRunningUserId(null)
    setBanDialogOpen(false)
    setSelectedUserForBan(null)
  }

  // Role update handler
  async function handleSaveRoles(userId: string, newRoles: UserRole[]) {
    setRoleLoading(true)
    setActionRunningUserId(userId)

    toast.add({
      type: "info",
      title: "Updating User Roles",
      description: "Applying new role permissions...",
    })

    // Simulate async server call
    await new Promise((resolve) => setTimeout(resolve, 750))

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: newRoles, updatedAt: new Date().toISOString() }
          : u
      )
    )

    toast.add({
      type: "success",
      title: "Roles Updated",
      description: `Assigned roles [${newRoles.join(", ")}] successfully.`,
    })

    setRoleLoading(false)
    setActionRunningUserId(null)
    setRoleDialogOpen(false)
    setSelectedUserForRole(null)
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, email, phone, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Role & Status Tabs / Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border bg-muted/30 p-1 text-xs">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  roleFilter === tab.value
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter users by account status"
            className="h-9 rounded-md border bg-background px-3 text-xs text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Count Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="text-foreground">{paginatedUsers.length}</strong> of{" "}
          <strong className="text-foreground">{totalItems}</strong> user accounts
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" /> Active (
            {users.filter((u) => !u.isBanned).length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-destructive" /> Banned (
            {users.filter((u) => u.isBanned).length})
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[280px]">User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Location &amp; Phone</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UsersIcon className="size-8 text-muted-foreground/50" />
                    <p className="text-sm font-semibold text-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Try adjusting your search criteria or role filters to find registered accounts.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => {
                const isOperating = actionRunningUserId === user.id
                return (
                  <TableRow key={user.id} className="group">
                    {/* User Info Column */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-heading text-xs font-semibold">
                          {getInitials(user.name)}
                        </div>
                        <div className="flex flex-col truncate">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="font-medium text-xs text-foreground hover:text-primary transition-colors truncate"
                            >
                              {user.name}
                            </Link>
                            {user.emailVerified && (
                              <span title="Email Verified">
                                <MailCheckIcon className="size-3.5 text-emerald-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Roles Column */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.role.map((r) => {
                          let badgeVariant: "default" | "secondary" | "outline" = "outline"
                          let customClass = ""
                          if (r === "ADMIN") {
                            badgeVariant = "default"
                            customClass = "bg-primary text-primary-foreground font-semibold"
                          } else if (r === "MANAGER") {
                            badgeVariant = "secondary"
                            customClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          }
                          return (
                            <Badge
                              key={r}
                              variant={badgeVariant}
                              className={`text-[10px] px-1.5 py-0 ${customClass}`}
                            >
                              {r}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
                      {user.isBanned ? (
                        <Badge
                          variant="destructive"
                          className="gap-1 text-[11px] font-medium"
                        >
                          <BanIcon className="size-3" />
                          Banned
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1.5 text-[11px] font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </Badge>
                      )}
                    </TableCell>

                    {/* Location & Phone */}
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-[11px] text-foreground">
                          <MapPinIcon className="size-3 text-muted-foreground" />
                          {user.location || "Not provided"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <PhoneIcon className="size-2.5 text-muted-foreground" />
                          {user.phoneNumber || "No phone"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Details button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          render={<Link href={`/admin/users/${user.id}`} />}
                          nativeButton={false}
                          title="View user details"
                        >
                          <EyeIcon className="size-3.5" />
                        </Button>

                        {/* Ban / Unban quick toggle button */}
                        <Button
                          type="button"
                          variant={user.isBanned ? "outline" : "ghost"}
                          size="icon-xs"
                          disabled={isOperating}
                          onClick={() => {
                            setSelectedUserForBan(user)
                            setBanDialogOpen(true)
                          }}
                          className={
                            user.isBanned
                              ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                              : "text-destructive hover:text-destructive hover:bg-destructive/10"
                          }
                          title={user.isBanned ? "Unban user" : "Ban user"}
                        >
                          {isOperating ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                          ) : user.isBanned ? (
                            <CheckCircle2Icon className="size-3.5" />
                          ) : (
                            <BanIcon className="size-3.5" />
                          )}
                        </Button>

                        {/* More menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                disabled={isOperating}
                                title="More options"
                              />
                            }
                          >
                            <MoreVerticalIcon className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">
                              User Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              render={<Link href={`/admin/users/${user.id}`} />}
                              className="gap-2 cursor-pointer"
                            >
                              <EyeIcon className="size-3.5" />
                              View Full Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForRole(user)
                                setRoleDialogOpen(true)
                              }}
                              className="gap-2 cursor-pointer"
                            >
                              <ShieldCheckIcon className="size-3.5" />
                              Change Roles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForBan(user)
                                setBanDialogOpen(true)
                              }}
                              className={`gap-2 cursor-pointer ${
                                user.isBanned
                                  ? "text-emerald-600"
                                  : "text-destructive"
                              }`}
                            >
                              {user.isBanned ? (
                                <>
                                  <CheckCircle2Icon className="size-3.5" />
                                  Unban Account
                                </>
                              ) : (
                                <>
                                  <BanIcon className="size-3.5" />
                                  Ban Account
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination component */}
      <DataPagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={[6, 12, 24]}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
        itemName="users"
      />

      {/* Ban / Unban Dialog */}
      <UserBanDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        user={selectedUserForBan}
        onConfirm={handleConfirmBan}
        isLoading={banLoading}
      />

      {/* Role Management Dialog */}
      <UserRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        user={selectedUserForRole}
        onSaveRoles={handleSaveRoles}
        isLoading={roleLoading}
      />
    </div>
  )
}
