"use client"

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  HomeIcon,
  LockKeyholeIcon,
  LogInIcon,
  UserPlusIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { ThemeToggle } from "@/components/site/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function UnauthenticatedPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar: brand + theme toggle */}
      <header className="flex items-center justify-between gap-4 border-b border-border/50 px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading text-sm font-black tracking-widest shadow-xs">
            FA
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
              Flex <span className="text-muted-foreground">Aura</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Laser-Cut Metal Art
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </header>

      {/* Centered content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Decorative status */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                <LockKeyholeIcon className="size-9 text-primary" aria-hidden="true" />
              </div>
              <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/10 motion-reduce:animate-none" />
            </div>
            <p className="mt-5 font-heading text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
              Sign In Required
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">
              Let&apos;s get you signed in.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              This area is reserved for Flex Aura account holders. Sign in to
              continue, or create an account if you&apos;re new here.
            </p>
          </div>

          {/* Actions card */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Continue to your account
              </CardTitle>
              <CardDescription className="text-xs">
                Pick up right where you left off after signing in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Button
                variant="default"
                size="lg"
                className="w-full gap-2 font-medium"
                render={<Link href="/sign-in" />}
                nativeButton={false}
              >
                <LogInIcon className="size-4" />
                Sign in
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 font-medium"
                render={<Link href="/sign-up" />}
                nativeButton={false}
              >
                <UserPlusIcon className="size-4" />
                Create an account
              </Button>
            </CardContent>
            <CardFooter className="justify-between border-t border-border/50 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeftIcon className="size-3.5" />
                Go back
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <HomeIcon className="size-3.5" />
                Home
              </Link>
            </CardFooter>
          </Card>

          {/* Help note */}
          <p className="text-center text-xs text-muted-foreground">
            Trouble signing in?{" "}
            <Link
              href="/contact"
              className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline underline-offset-4"
            >
              Contact support <ArrowRightIcon className="size-3" />
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-4 text-center text-xs text-muted-foreground sm:px-10">
        &copy; {new Date().getFullYear()} Flex Aura Metal Art.
      </footer>
    </div>
  )
}
