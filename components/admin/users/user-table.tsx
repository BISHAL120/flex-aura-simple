"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  SearchIcon,
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
import type { AdminUser, UserRole } from "@/lib/admin-users-data"
import { showError, showSuccess } from "@/lib/toast"

const ROLE_TABS = [
  { label: "All Roles", value: "ALL" },
  { label: "Admins", value: "ADMIN" },
  { label: "Managers", value: "MANAGER" },
  { label: "Users", value: "USER" },
]

const SEARCH_DEBOUNCE_MS = 500
const DEFAULT_PAGE_SIZE = 12

interface UserTableProps {
  users: AdminUser[]
  total: number
  totalPages: number
  activeCount: number
  bannedCount: number
  search: string
  role: string
  page: number
  pageSize: number
}

type CommittedState = {
  search: string
  role: string
  page: number
  pageSize: number
}

function buildQuery(state: CommittedState) {
  const params = new URLSearchParams()
  if (state.search) params.set("search", state.search)
  if (state.role) params.set("role", state.role)
  if (state.page !== 1) params.set("page", String(state.page))
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set("per_page", String(state.pageSize))
  const qs = params.toString()
  return qs ? `/admin/users?${qs}` : "/admin/users"
}

export function UserTable({
  users,
  total,
  totalPages,
  activeCount,
  bannedCount,
  search,
  role,
  page,
  pageSize,
}: UserTableProps) {
  const router = useRouter()

  // Local input state so typing feels instant; the URL is the source of truth.
  const [searchInput, setSearchInput] = React.useState(search)

  // While the input is focused, the typed value is authoritative. The URL is
  // only a delayed echo of what was typed, so syncing URL -> input mid-typing
  // (e.g. a slow navigation response landing after the user has kept typing)
  // would revert, truncate, or clear the value. Only sync URL -> input when
  // the input is not focused: back/forward navigation, reloads, clamping.
  const searchFocusedRef = React.useRef(false)

  // Last committed URL state. Every navigation merges onto this ref so a slow
  // debounce or a queued action can never drop a filter from the URL.
  const committedRef = React.useRef<CommittedState>({ search, role, page, pageSize })

  // Pending page size while DataPagination fires both size and page callbacks
  const pendingSizeRef = React.useRef<number | null>(null)

  // Dialog states
  const [selectedUserForBan, setSelectedUserForBan] = React.useState<AdminUser | null>(null)
  const [banDialogOpen, setBanDialogOpen] = React.useState(false)
  const [banLoading, setBanLoading] = React.useState(false)

  const [selectedUserForRole, setSelectedUserForRole] = React.useState<AdminUser | null>(null)
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false)
  const [roleLoading, setRoleLoading] = React.useState(false)

  // Action running state per user ID for inline buttons
  const [actionRunningUserId, setActionRunningUserId] = React.useState<string | null>(null)

  // Sync the committed URL state ref when server-rendered props change:
  // back/forward navigation, reloads, and server-side page clamping all land
  // here. This only reads props into a ref - it does not navigate, so it
  // cannot loop.
  React.useEffect(() => {
    committedRef.current = { search, role, page, pageSize }
  }, [search, role, page, pageSize])

  // Keep the input in sync with the URL, but never while the user is typing in
  // it. The URL search value is a delayed echo; writing it back mid-typing is
  // what caused the reverting/truncating/clearing bugs.
  React.useEffect(() => {
    if (searchFocusedRef.current) return
    setSearchInput(search)
  }, [search])

  // Flush any pending debounced search immediately when the input loses
  // focus (tabbing, clicking a role tab, navigating away) so the last
  // keystrokes aren't silently dropped.
  const handleSearchBlur = () => {
    searchFocusedRef.current = false
    const next = searchInput.trim()
    if (next !== committedRef.current.search) {
      navigate({ search: next, page: 1 })
    }
  }

  const navigate = React.useCallback((overrides: Partial<CommittedState>) => {
    const next: CommittedState = { ...committedRef.current, ...overrides }
    committedRef.current = next
    router.push(buildQuery(next), { scroll: false })
  }, [router])

  // Debounce typing into the URL. Compares against the committed state so it
  // never re-pushes a value that's already in the URL.
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next !== committedRef.current.search) {
        navigate({ search: next, page: 1 })
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput, navigate])

  // Cancel any pending debounced navigation from before focusing, so a stale
  // timer can never fire mid-session after the user has started editing.
  const handleSearchFocus = () => {
    searchFocusedRef.current = true
  }

  function handleRoleChange(value: string) {
    navigate({ role: value === "ALL" ? "" : value, page: 1 })
  }

  function handlePageChange(nextPage: number) {
    // If a size change is in flight, apply it now and clear it.
    const size = pendingSizeRef.current
    pendingSizeRef.current = null
    navigate(size !== null ? { pageSize: size, page: nextPage } : { page: nextPage })
  }

  function handlePageSizeChange(nextSize: number) {
    // Stash the size; DataPagination immediately calls onPageChange(1), which
    // performs the single navigation with both values applied.
    pendingSizeRef.current = nextSize
  }

  // Ban / Unban handler
  async function handleConfirmBan(user: AdminUser) {
    const nextBanned = !user.isBanned
    setBanLoading(true)
    setActionRunningUserId(user.id)

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: nextBanned }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "Failed to update account status")
      }

      showSuccess({
        title: nextBanned ? "User Account Banned" : "User Account Restored",
        message: `${user.name} (${user.email}) has been ${nextBanned ? "banned from accessing the store" : "unbanned and restored"}.`,
      })

      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to update account status",
      })
    } finally {
      setBanLoading(false)
      setActionRunningUserId(null)
      setBanDialogOpen(false)
      setSelectedUserForBan(null)
    }
  }

  // Role update handler
  async function handleSaveRoles(userId: string, newRoles: UserRole[]) {
    setRoleLoading(true)
    setActionRunningUserId(userId)

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRoles }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "Failed to update user roles")
      }

      showSuccess({
        title: "Roles Updated",
        message: `Assigned roles [${newRoles.join(", ")}] successfully.`,
      })

      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to update user roles",
      })
    } finally {
      setRoleLoading(false)
      setActionRunningUserId(null)
      setRoleDialogOpen(false)
      setSelectedUserForRole(null)
    }
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Role & Status Tabs / Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border bg-muted/30 p-1 text-xs">
            {ROLE_TABS.map((tab) => {
              const active = (tab.value === "ALL" && role === "") || role === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => handleRoleChange(tab.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Users Count Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="text-foreground">{users.length}</strong> of{" "}
          <strong className="text-foreground">{total}</strong> user accounts
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" /> Active (
            {activeCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-destructive" /> Banned (
            {bannedCount})
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
            {users.length === 0 ? (
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
              users.map((user) => {
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
                              className={`gap-2 cursor-pointer ${user.isBanned
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
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        pageSizeOptions={[6, 12, 24]}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
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
