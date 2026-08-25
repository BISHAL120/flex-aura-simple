"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

export function ContactForm() {
  const [pending, setPending] = React.useState(false)
  const timerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    // Simulate a short submit, then confirm.
    timerRef.current = window.setTimeout(() => {
      setPending(false)
      event.currentTarget.reset()
      toast.add({
        type: "success",
        title: "Message sent",
        description: "Thanks for reaching out — we'll reply within one business day.",
      })
    }, 600)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border bg-card p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required placeholder="Jane Doe" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="jane@example.com"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required placeholder="How can we help?" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us a little more…"
        />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  )
}
