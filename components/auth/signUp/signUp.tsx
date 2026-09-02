"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, LockIcon, MailIcon, UserIcon } from "lucide-react"

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

const formSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name must be at most 50 characters" }),
    email: z.string().min(1, "Email is required").email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(50, { message: "Password must be at most 50 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm password must be at least 8 characters" })
      .max(50, { message: "Confirm password must be at most 50 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type SignUpFormValues = z.infer<typeof formSchema>

export function SignupForm() {
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: SignUpFormValues) {
    setLoading(true)
    showLoading("Creating account...")
    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        // callbackURL: "/verify-email",
      })

      console.log("Sign Up Error: ", error);

      if (error) {
        setLoading(false)
        showError({
          message: error.message || "Failed to create account. Please try again.",
        })
        return
      }

      setLoading(false)
      showSuccess({
        message: "Account created successfully! Welcome to Flex Aura.",
      })
      router.push("/admin")
    } catch (err: unknown) {
      setLoading(false)
      const errorMsg = err instanceof Error ? err.message : "Failed to create account."
      showError({ message: errorMsg })
    }
  }

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight font-heading">
          Create an account
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your details below to set up your Flex Aura profile
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="gap-4">
            {/* Full Name */}
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="Alexandre Dumas"
                  autoComplete="name"
                  disabled={loading}
                  {...register("name")}
                  className="pl-9"
                />
                <UserIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <FieldError errors={[errors.name]} />
            </Field>

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
              <FieldLabel htmlFor="password">Password</FieldLabel>
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

            {/* Confirm Password Field */}
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <FieldDescription className="text-center text-xs pt-2">
              Already have an account?{" "}
              <Link
                href={"/sign-in"}
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
