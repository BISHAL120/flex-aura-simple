"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  HomeIcon,
  LifeBuoyIcon,
  ShieldXIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { authClient } from "@/lib/auth-client"

interface UnauthorizePageProps {
  user?: {
    name?: string | null
    email?: string | null
  } | null
}

export function UnauthorizePage({ user }: UnauthorizePageProps) {
  const router = useRouter()
  const displayName = user?.name || user?.email

  const handleAccountSwitch = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  }

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
              <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                <ShieldXIcon className="size-9 text-destructive" aria-hidden="true" />
              </div>
              <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-destructive/10 motion-reduce:animate-none" />
            </div>
            <p className="mt-5 font-heading text-xs font-semibold uppercase tracking-[0.2em] text-destructive/80">
              Access Denied
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">
              {displayName ? (
                <>You can&apos;t get in here, {displayName}.</>
              ) : (
                <>That area is off limits.</>
              )}
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your account doesn&apos;t have the permission level needed to view this
              area. If you believe this is a mistake, contact an administrator to
              upgrade your access.
            </p>
          </div>

          {/* Actions card */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                What would you like to do?
              </CardTitle>
              <CardDescription className="text-xs">
                You can head back to the store, or request access from your team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Button
                variant="default"
                size="lg"
                className="w-full gap-2 font-medium"
                render={<Link href="/" />}
                nativeButton={false}
              >
                <HomeIcon className="size-4" />
                Back to the store
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 font-medium"
                render={<Link href="/contact" />}
                nativeButton={false}
              >
                <LifeBuoyIcon className="size-4" />
                Contact support
              </Button>
            </CardContent>
            <CardFooter className="justify-center border-t border-border/50 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeftIcon className="size-3.5" />
                Go back to the previous page
              </button>
            </CardFooter>
          </Card>

          {/* Sign in as different user */}
          <p className="text-center text-xs text-muted-foreground">
            Signed in as someone else?{" "}
            <button
              type="button"
              onClick={() => handleAccountSwitch()}
              className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline underline-offset-4"
            >
              Switch account <ArrowRightIcon className="size-3" />
            </button>
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
