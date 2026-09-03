"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  BanIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  GlobeIcon,
  KeyIcon,
  LaptopIcon,
  Loader2Icon,
  MailCheckIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  Trash2Icon,
  UserCheckIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserBanDialog } from "@/components/admin/users/user-ban-dialog"
import { UserRoleDialog } from "@/components/admin/users/user-role-dialog"
import type { AdminUser, UserRole } from "@/lib/admin-users-data"
import { showError, showSuccess } from "@/lib/toast"
import { patchUser, revokeSession } from "@/lib/data-layer/admin/users/user-actions"

interface UserDetailsViewProps {
  initialUser: AdminUser
}

export function UserDetailsView({ initialUser }: UserDetailsViewProps) {
  const router = useRouter()
  const [user, setUser] = React.useState<AdminUser>(initialUser)

  // Ban dialog state
  const [banDialogOpen, setBanDialogOpen] = React.useState(false)
  const [banLoading, setBanLoading] = React.useState(false)

  // Role dialog state
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false)
  const [roleLoading, setRoleLoading] = React.useState(false)

  // Edit Profile dialog state
  const [editProfileOpen, setEditProfileOpen] = React.useState(false)
  const [editProfileLoading, setEditProfileLoading] = React.useState(false)
  const [editForm, setEditForm] = React.useState({
    firstName: user.firstName,
    lastName: user.lastName || "",
    phoneNumber: user.phoneNumber || "",
    location: user.location || "",
    bio: user.bio || "",
  })

  // Inline field editing state (profile card)
  const [editingField, setEditingField] = React.useState<"phoneNumber" | "location" | null>(null)
  const [fieldValue, setFieldValue] = React.useState("")
  const [fieldSaving, setFieldSaving] = React.useState(false)

  // Revoke session loading state (session ID)
  const [revokingSessionId, setRevokingSessionId] = React.useState<string | null>(null)

  // Handlers
  async function handleConfirmBan(targetUser: AdminUser) {
    const nextBanned = !targetUser.isBanned
    setBanLoading(true)

    try {
      await patchUser(targetUser.id, { isBanned: nextBanned })

      setUser((prev) => ({ ...prev, isBanned: nextBanned, updatedAt: new Date().toISOString() }))

      showSuccess({
        title: nextBanned ? "User Account Banned" : "User Account Restored",
        message: `${targetUser.name} (${targetUser.email}) has been ${
          nextBanned ? "banned from accessing the store" : "unbanned and restored"
        }.`,
      })

      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to update account status",
      })
    } finally {
      setBanLoading(false)
      setBanDialogOpen(false)
    }
  }

  async function handleSaveRoles(userId: string, newRoles: UserRole[]) {
    setRoleLoading(true)

    try {
      await patchUser(userId, { role: newRoles })

      setUser((prev) => ({ ...prev, role: newRoles, updatedAt: new Date().toISOString() }))

      showSuccess({
        title: "Roles Saved",
        message: `User roles set to [${newRoles.join(", ")}].`,
      })

      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to update user roles",
      })
    } finally {
      setRoleLoading(false)
      setRoleDialogOpen(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setEditProfileLoading(true)

    try {
      await patchUser(user.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber,
        location: editForm.location,
        bio: editForm.bio,
      })

      const updatedName = `${editForm.firstName} ${editForm.lastName}`.trim()

      setUser((prev) => ({
        ...prev,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim() || null,
        name: updatedName,
        phoneNumber: editForm.phoneNumber.trim() || null,
        location: editForm.location.trim() || null,
        bio: editForm.bio.trim() || null,
        updatedAt: new Date().toISOString(),
      }))

      showSuccess({
        title: "Profile Updated",
        message: "User details have been saved successfully.",
      })

      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to save user profile",
      })
    } finally {
      setEditProfileLoading(false)
      setEditProfileOpen(false)
    }
  }

  async function handleRevokeSession(sessionId: string) {
    setRevokingSessionId(sessionId)

    try {
      await revokeSession(user.id, sessionId)

      setUser((prev) => ({
        ...prev,
        sessions: prev.sessions.filter((s) => s.id !== sessionId),
        updatedAt: new Date().toISOString(),
      }))

      showSuccess({
        title: "Session Terminated",
        message: "The authentication session was successfully revoked.",
      })

      router.refresh()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to revoke session",
      })
    } finally {
      setRevokingSessionId(null)
    }
  }

  function handleCopyId() {
    navigator.clipboard.writeText(user.id)
    showSuccess({
      title: "Copied to Clipboard",
      message: `User ID ${user.id} copied.`,
    })
  }

  // Inline field editing handlers
  function startEditingField(field: "phoneNumber" | "location") {
    setEditingField(field)
    setFieldValue(field === "phoneNumber" ? user.phoneNumber || "" : user.location || "")
  }

  function cancelEditingField() {
    setEditingField(null)
    setFieldValue("")
  }

  async function handleSaveField() {
    if (!editingField || fieldSaving) return
    setFieldSaving(true)

    try {
      await patchUser(user.id, {
        [editingField]: fieldValue,
      })

      setUser((prev) => ({
        ...prev,
        [editingField]: fieldValue.trim() || null,
        updatedAt: new Date().toISOString(),
      }))

      showSuccess({
        title: editingField === "phoneNumber" ? "Phone Updated" : "Location Updated",
        message:
          editingField === "phoneNumber"
            ? "The phone number has been updated successfully."
            : "The location has been updated successfully.",
      })

      router.refresh()
      cancelEditingField()
    } catch (err) {
      showError({
        message: err instanceof Error ? err.message : "Failed to update user profile",
      })
    } finally {
      setFieldSaving(false)
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl pb-10">
      {/* Top Bar Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            render={<Link href="/admin/users" />}
            nativeButton={false}
            title="Back to Users list"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-bold tracking-tight sm:text-xl">
                {user.name}
              </h1>
              {user.isBanned ? (
                <Badge variant="destructive" className="gap-1 text-[11px]">
                  <BanIcon className="size-3" />
                  Banned
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 text-[11px] border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              User ID: <span className="font-mono">{user.id}</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Edit Roles */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={roleLoading || banLoading}
            onClick={() => setRoleDialogOpen(true)}
            className="gap-1.5 text-xs"
          >
            <ShieldCheckIcon className="size-3.5" />
            Roles
          </Button>

          {/* Edit Profile */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={editProfileLoading || banLoading}
            onClick={() => {
              cancelEditingField()
              setEditForm({
                firstName: user.firstName,
                lastName: user.lastName || "",
                phoneNumber: user.phoneNumber || "",
                location: user.location || "",
                bio: user.bio || "",
              })
              setEditProfileOpen(true)
            }}
            className="gap-1.5 text-xs"
          >
            <PencilIcon className="size-3.5" />
            Edit Profile
          </Button>

          {/* Ban / Unban Toggle Button */}
          <Button
            type="button"
            variant={user.isBanned ? "default" : "destructive"}
            size="sm"
            disabled={banLoading}
            onClick={() => setBanDialogOpen(true)}
            className="gap-1.5 text-xs"
          >
            {banLoading && <Loader2Icon className="size-3.5 animate-spin" />}
            {user.isBanned ? (
              <>
                <CheckCircle2Icon className="size-3.5" />
                Unban User
              </>
            ) : (
              <>
                <BanIcon className="size-3.5" />
                Ban User
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: User Summary & Profile Card (1 col) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Profile Overview Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary font-heading text-xl font-bold border shadow-xs">
                  {getInitials(user.name)}
                </div>
                <div className="space-y-1">
                  <CardTitle className="font-heading text-base font-semibold flex items-center justify-center gap-1.5">
                    {user.name}
                    {user.emailVerified && (
                      <span title="Email address verified">
                        <MailCheckIcon className="size-4 text-emerald-500" />
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {user.email}
                  </CardDescription>
                </div>

                {/* Role Badges */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {user.role.map((r) => (
                    <Badge
                      key={r}
                      variant={r === "ADMIN" ? "default" : "secondary"}
                      className="text-[10px] px-2 py-0.5"
                    >
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-2 text-xs border-t">
              {user.bio && (
                <div className="rounded-lg bg-muted/40 p-2.5 text-muted-foreground italic leading-relaxed text-[11px]">
                  &ldquo;{user.bio}&rdquo;
                </div>
              )}

              <div className="space-y-2">
                {/* Phone - inline editable */}
                {editingField === "phoneNumber" ? (
                  <div className="flex items-center justify-between gap-2 text-muted-foreground">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <PhoneIcon className="size-3.5" /> Phone
                    </span>
                    <div className="flex items-center gap-1">
                      <Input
                        autoFocus
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                        disabled={fieldSaving}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleSaveField()
                          }
                          if (e.key === "Escape") cancelEditingField()
                        }}
                        aria-label="Edit phone number"
                        className="h-7 w-36 text-[11px]"
                      />
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        disabled={fieldSaving}
                        onClick={handleSaveField}
                        title="Save phone number"
                        aria-label="Save phone number"
                      >
                        {fieldSaving ? (
                          <Loader2Icon className="size-3.5 animate-spin" />
                        ) : (
                          <CheckIcon className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        disabled={fieldSaving}
                        onClick={cancelEditingField}
                        title="Cancel editing"
                        aria-label="Cancel editing phone number"
                      >
                        <XIcon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group/row flex items-center justify-between gap-2 text-muted-foreground">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <PhoneIcon className="size-3.5" /> Phone
                    </span>
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="font-medium text-foreground truncate">
                        {user.phoneNumber || "Not set"}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditingField("phoneNumber")}
                        className="text-muted-foreground/50 hover:text-foreground transition-colors opacity-60 sm:opacity-0 sm:group-hover/row:opacity-100 focus-visible:opacity-100"
                        title="Edit phone number"
                        aria-label="Edit phone number"
                      >
                        <PencilIcon className="size-3" />
                      </button>
                    </span>
                  </div>
                )}

                {/* Location - inline editable */}
                {editingField === "location" ? (
                  <div className="flex items-center justify-between gap-2 text-muted-foreground">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <MapPinIcon className="size-3.5" /> Location
                    </span>
                    <div className="flex items-center gap-1">
                      <Input
                        autoFocus
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                        disabled={fieldSaving}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleSaveField()
                          }
                          if (e.key === "Escape") cancelEditingField()
                        }}
                        aria-label="Edit location"
                        className="h-7 w-36 text-[11px]"
                      />
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        disabled={fieldSaving}
                        onClick={handleSaveField}
                        title="Save location"
                        aria-label="Save location"
                      >
                        {fieldSaving ? (
                          <Loader2Icon className="size-3.5 animate-spin" />
                        ) : (
                          <CheckIcon className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        disabled={fieldSaving}
                        onClick={cancelEditingField}
                        title="Cancel editing"
                        aria-label="Cancel editing location"
                      >
                        <XIcon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group/row flex items-center justify-between gap-2 text-muted-foreground">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <MapPinIcon className="size-3.5" /> Location
                    </span>
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="font-medium text-foreground text-right truncate max-w-[170px]">
                        {user.location || "Not set"}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditingField("location")}
                        className="text-muted-foreground/50 hover:text-foreground transition-colors opacity-60 sm:opacity-0 sm:group-hover/row:opacity-100 focus-visible:opacity-100"
                        title="Edit location"
                        aria-label="Edit location"
                      >
                        <PencilIcon className="size-3" />
                      </button>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="size-3.5" /> Member Since
                  </span>
                  <span className="font-medium text-foreground">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <UserCheckIcon className="size-3.5" /> Email Verified
                  </span>
                  <Badge
                    variant={user.emailVerified ? "outline" : "secondary"}
                    className={
                      user.emailVerified
                        ? "text-emerald-600 border-emerald-500/30 text-[10px]"
                        : "text-[10px]"
                    }
                  >
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>

              {/* Copy User ID */}
              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex w-full items-center justify-between rounded-lg border bg-muted/20 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                >
                  <span className="font-mono truncate">{user.id}</span>
                  <CopyIcon className="size-3 shrink-0 ml-2" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Summary Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-sm font-semibold flex items-center gap-2">
                <KeyIcon className="size-4 text-primary" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">First Name</span>
                <span className="font-medium text-foreground">{user.firstName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Name</span>
                <span className="font-medium text-foreground">
                  {user.lastName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auth System Name</span>
                <span className="font-medium text-foreground">{user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium text-foreground">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Columns: Connected Accounts & Active Sessions (2 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Linked Authentication Accounts */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
                    <GlobeIcon className="size-4 text-primary" />
                    Connected Accounts ({user.accounts.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Linked sign-in providers matching the Prisma Account model
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.accounts.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No authentication accounts linked to this user.
                </p>
              ) : (
                user.accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-3.5 gap-3 bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-background border shadow-2xs font-semibold text-xs text-primary">
                        {acc.providerId === "google" ? "G" : "PW"}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            {acc.providerId}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {acc.providerId === "google"
                              ? "OAuth Social Provider"
                              : "Email & Password"}
                          </Badge>
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          Account ID: {acc.accountId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex flex-col text-right">
                        <span className="text-[11px]">Linked on</span>
                        <span className="font-medium text-foreground text-[11px]">
                          {new Date(acc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
                    <LaptopIcon className="size-4 text-primary" />
                    Active Sessions ({user.sessions.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Current active devices logged in under this account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.sessions.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                  <p>No active sessions found for this user.</p>
                  <p className="text-[11px] mt-0.5">
                    {user.isBanned
                      ? "User is currently banned; all active sessions were terminated."
                      : "User is currently signed out on all devices."}
                  </p>
                </div>
              ) : (
                user.sessions.map((sess) => {
                  const isRevoking = revokingSessionId === sess.id
                  const isMobile = sess.userAgent?.includes("iPhone") || sess.userAgent?.includes("Android") || sess.userAgent?.includes("iPad")
                  return (
                    <div
                      key={sess.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-3.5 gap-3 bg-muted/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background border shadow-2xs text-muted-foreground">
                          {isMobile ? (
                            <SmartphoneIcon className="size-4.5" />
                          ) : (
                            <LaptopIcon className="size-4.5" />
                          )}
                        </div>
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {isMobile ? "Mobile Device" : "Desktop Computer"}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                            >
                              Active Session
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {sess.userAgent || "Unknown user agent"}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span>IP: <code className="font-mono text-foreground">{sess.ipAddress || "Unknown"}</code></span>
                            <span>•</span>
                            <span>Created: {new Date(sess.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Expires: {new Date(sess.expiresAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Revoke Session Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={isRevoking || banLoading}
                        onClick={() => handleRevokeSession(sess.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 self-end sm:self-center"
                      >
                        {isRevoking ? (
                          <Loader2Icon className="size-3 animate-spin" />
                        ) : (
                          <Trash2Icon className="size-3" />
                        )}
                        {isRevoking ? "Revoking..." : "Revoke"}
                      </Button>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={(val) => !editProfileLoading && setEditProfileOpen(val)}>
        <DialogContent className="max-w-lg p-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-heading text-base font-semibold">
                Edit User Profile
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update account details for {user.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs">First Name *</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                  disabled={editProfileLoading}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  disabled={editProfileLoading}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="phoneNumber" className="text-xs">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  disabled={editProfileLoading}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="location" className="text-xs">Location / City</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. San Francisco, CA, USA"
                  disabled={editProfileLoading}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bio" className="text-xs">Bio / Notes</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Customer preferences, collector notes..."
                  disabled={editProfileLoading}
                  rows={3}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={editProfileLoading}
                onClick={() => setEditProfileOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editProfileLoading || !editForm.firstName.trim()}
                className="gap-2"
              >
                {editProfileLoading && <Loader2Icon className="size-4 animate-spin" />}
                {editProfileLoading ? "Saving Profile..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ban / Unban Dialog */}
      <UserBanDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        user={user}
        onConfirm={handleConfirmBan}
        isLoading={banLoading}
      />

      {/* Role Management Dialog */}
      <UserRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        user={user}
        onSaveRoles={handleSaveRoles}
        isLoading={roleLoading}
      />
    </div>
  )
}
