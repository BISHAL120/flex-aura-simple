"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, UserXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { initialUsers } from "@/lib/admin-users-data"
import { UserDetailsView } from "@/components/admin/users/user-details-view"

export default function AdminUserDetailsPage() {
  const params = useParams()
  const id = params?.id as string

  const user = React.useMemo(() => {
    return initialUsers.find(
      (u) => u.id === id || u.email.toLowerCase() === id?.toLowerCase()
    )
  }, [id])

  if (!user) {
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

  return <UserDetailsView key={user.id} initialUser={user} />
}
