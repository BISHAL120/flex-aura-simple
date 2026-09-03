import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon, UserXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { UserDetailsView } from "@/components/admin/users/user-details-view"
import { getUserById, getUserByEmail } from "@/lib/data-layer/admin/users/user-data-layer"
import { mapUserToAdminUser } from "@/lib/data-layer/admin/users/user-mapper"

export const metadata: Metadata = {
  title: "User Details — Flex Aura Admin",
  description: "View and manage a registered user account.",
}

export default async function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // The details URL uses the user ID, but links can also arrive by email.
  // Fall back to an email lookup so both link styles keep working.
  const dbUser = (await getUserById(id)) ?? (await getUserByEmail(id))

  if (!dbUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <UserXIcon className="size-7" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold">User Not Found</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            No registered user matching &quot;{id}&quot; was found in the database.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/users" />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to User Management
        </Button>
      </div>
    )
  }

  return <UserDetailsView key={dbUser.id} initialUser={mapUserToAdminUser(dbUser)} />
}
