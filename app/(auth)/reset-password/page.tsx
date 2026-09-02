import Link from "next/link"
import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResetPasswordForm } from "@/components/auth/reset-password/reset-password-form"

export const metadata = {
  title: "Reset Password | Flex Aura Metal Art",
  description: "Create a new password for your Flex Aura account.",
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    return (
      <Card className="border bg-card/70 backdrop-blur-sm shadow-md">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <AlertCircleIcon className="size-6" />
          </div>
          <CardTitle className="font-heading text-xl font-bold">Invalid or Expired Link</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            This password reset link is missing, expired, or has already been used.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-2">
          <Button
            className="w-full"
            render={<Link href="/forgot-password" />}
            nativeButton={false}
          >
            Request New Reset Link
          </Button>
          <Button
            variant="outline"
            className="w-full gap-1.5"
            render={<Link href="/sign-in" />}
            nativeButton={false}
          >
            <ArrowLeftIcon className="size-4" />
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <ResetPasswordForm token={token} />
}