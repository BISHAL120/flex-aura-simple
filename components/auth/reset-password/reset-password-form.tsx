"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeftIcon, CheckCircle2Icon, Eye, EyeOff, Loader2, LockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { showError, showLoading, showSuccess } from "@/lib/toast"

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(50, { message: "Password must be at most 50 characters" }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof formSchema>

export function ResetPasswordForm({ token }: { token: string }) {
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [resetSuccess, setResetSuccess] = React.useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setLoading(true)
    showLoading("Resetting password...")

    try {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      })

      if (error) {
        setLoading(false)
        showError({
          message: error.message || "Failed to reset password. The link may have expired.",
        })
        return
      }

      setLoading(false)
      setResetSuccess(true)
      showSuccess({
        message: "Your password has been successfully reset! Please sign in with your new credentials.",
      })
      setTimeout(() => {
        router.push("/sign-in")
      }, 2000)
    } catch (error) {
      setLoading(false)
      const message = error instanceof Error ? error.message : "Failed to reset password."
      showError({ message })
    }
  }

  if (resetSuccess) {
    return (
      <Card className="border bg-card shadow-sm">
        <CardHeader className="text-center pb-3 space-y-2">
          <div className="mx-auto size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2Icon className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight font-heading">
            Password updated
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-sm mx-auto">
            Your password has been changed successfully. Redirecting you to sign in...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Button
            className="w-full gap-1.5"
            render={<Link href="/sign-in" />}
            nativeButton={false}
          >
            <ArrowLeftIcon className="size-4" />
            Sign in now
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight font-heading">
          Reset your password
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your new password below. Must be at least 8 characters.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="gap-4">
            {/* New Password */}
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                  {...register("password")}
                  className="pl-9 pr-9"
                />
                <LockIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
              <FieldError errors={[errors.password]} />
            </Field>

            {/* Confirm New Password */}
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                  {...register("confirmPassword")}
                  className="pl-9 pr-9"
                />
                <LockIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
              <FieldError errors={[errors.confirmPassword]} />
            </Field>

            {/* Submit Button */}
            <Button disabled={loading} type="submit" className="w-full font-medium">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
