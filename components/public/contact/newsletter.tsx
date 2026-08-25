"use client"

import * as React from "react"
import { MailIcon, SendIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Container } from "@/components/site/container"

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || submitting) return
    setSubmitting(true)
    toast.add({
      type: "success",
      title: "Subscribed!",
      description: "Thanks for joining the Flex Aura metal art newsletter.",
    })
    setEmail("")
    // Release the guard after the toast animation so rapid double-clicks
    // don't fire duplicate toasts.
    window.setTimeout(() => setSubmitting(false), 400)
  }

  return (
    <Container>
      <div className="flex flex-col items-center gap-4 rounded-lg bg-primary px-6 py-10 text-center text-primary-foreground sm:px-10">
        <div className="flex size-11 items-center justify-center rounded-md bg-white/10">
          <MailIcon className="size-5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-xl font-semibold sm:text-2xl">
            {compact ? "Join our newsletter" : "Stay in the loop"}
          </h2>
          <p className="max-w-md text-sm text-primary-foreground/80">
            New cuts, custom designs and backlit LED drops — straight to your
            inbox. No spam, ever.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
        >
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
            className="h-10 flex-1 border-transparent bg-white/10 placeholder:text-primary-foreground/60 focus-visible:border-white/40 focus-visible:ring-white/30"
          />
          <Button
            type="submit"
            size="lg"
            className="bg-white text-black hover:bg-white/90"
          >
            <SendIcon />
            Subscribe
          </Button>
        </form>
      </div>
    </Container>
  )
}
