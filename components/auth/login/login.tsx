"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, LockIcon, MailIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { showError, showLoading, showSuccess } from "@/lib/toast"

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(50, { message: "Password must be at most 50 characters" }),
})

type SignInFormValues = z.infer<typeof formSchema>

export function SignInForm({ joinAs }: { joinAs: string | null }) {
  const [loading, setLoading] = React.useState(false)
  const [socialLoading, setSocialLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: SignInFormValues) {
    setLoading(true)
    showLoading("Signing in...")
    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: rememberMe,
      })

      if (error) {
        setLoading(false)
        showError({
          message: error.message || "Invalid credentials. Please try again.",
        })
        return
      }

      setLoading(false)
      showSuccess({
        message: "Welcome back! Login successful.",
      })
      router.push("/admin")
    } catch (err: unknown) {
      setLoading(false)
      const errorMsg = err instanceof Error ? err.message : "Failed to sign in. Please try again."
      showError({ message: errorMsg })
    }
  }

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight font-heading">
          Welcome back
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your email and password to access your Flex Aura account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="gap-4">
            {/* Email Field */}
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

            {/* Password Field */}
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-0.5">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
              />
              <Label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer select-none">
                Remember me on this device
              </Label>
            </div>

            {/* Submit Button */}
            <Button disabled={loading} type="submit" className="w-full font-medium">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <FieldSeparator>Or continue with</FieldSeparator>

            {/* Google OAuth Button */}
            <Button
              variant="outline"
              type="button"
              className="w-full bg-background hover:bg-muted/60"
              disabled={socialLoading || loading}
              onClick={() => {
                setSocialLoading(true)
                authClient.signIn.social({
                  provider: "google",
                  additionalData: { joinas: joinAs },
                })
              }}
            >
              {socialLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 mr-2">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Sign in with Google
            </Button>

            <FieldDescription className="text-center text-xs pt-2">
              Don&apos;t have an account?{" "}
              <Link
                href={joinAs ? `/sign-up?joinas=${joinAs}` : "/sign-up"}
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Create an account
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
