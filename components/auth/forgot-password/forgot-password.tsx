"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeftIcon, CheckCircle2Icon, Loader2, MailIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { showError, showLoading, showSuccess } from "@/lib/toast"

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email({ message: "Invalid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof formSchema>

export function ForgotPasswordForm() {
  const [loading, setLoading] = React.useState(false)
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      setLoading(true)
      showLoading("Sending password reset email...")

      const { data, error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      })

      if (error) {
        setLoading(false)
        showError({
          message: error.message || "Failed to send reset email. Please verify your address.",
        })
        return
      }

      setLoading(false)
      setSubmittedEmail(values.email)
      showSuccess({
        message: data?.message || "Password reset instructions have been sent to your email.",
      })
    } catch (error) {
      setLoading(false)
      const message = error instanceof Error ? error.message : "Failed to send reset email."
      showError({ message })
    }
  }

  if (submittedEmail) {
    return (
      <Card className="border bg-card shadow-sm">
        <CardHeader className="text-center pb-3 space-y-2">
          <div className="mx-auto size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2Icon className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight font-heading">
            Check your inbox
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-sm mx-auto">
            We sent a password reset link to <strong className="text-foreground">{submittedEmail}</strong>. Follow the instructions in the email to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => setSubmittedEmail(null)}
          >
            Try another email address
          </Button>
          <Button
            variant="ghost"
            className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            render={<Link href="/sign-in" />}
            nativeButton={false}
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight font-heading">
          Forgot password?
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your registered email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={loading}
                  {...register("email")}
                  className="pl-9"
                />
                <MailIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <FieldError errors={[errors.email]} />
            </Field>

            <Button disabled={loading} type="submit" className="w-full font-medium">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <FieldDescription className="text-center text-xs pt-2">
              Remember your password?{" "}
              <Link
                href="/sign-in"
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Back to sign in
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
