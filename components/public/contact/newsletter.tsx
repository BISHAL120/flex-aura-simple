"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailIcon, SendIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Container } from "@/components/site/container"
import { newsletterSchema, type NewsletterFormValues } from "@/lib/validators"

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [submitting, setSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  })

  function onFormSubmit(_data: NewsletterFormValues) {
    if (submitting) return
    setSubmitting(true)
    toast.add({
      type: "success",
      title: "Subscribed!",
      description: "Thanks for joining the Flex Aura metal art newsletter.",
    })
    reset()
    window.setTimeout(() => setSubmitting(false), 400)
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Invalid Email",
      description: "Please enter a valid email address.",
    })
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
          onSubmit={handleSubmit(onFormSubmit, onFormError)}
          className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
        >
          <div className="flex-1 flex flex-col items-start">
            <Input
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
              {...register("email")}
              className="h-10 w-full border-transparent bg-white/10 placeholder:text-primary-foreground/60 focus-visible:border-white/40 focus-visible:ring-white/30"
            />
            {errors.email && (
              <span className="text-[11px] text-destructive-foreground/90 mt-1 font-medium">
                {errors.email.message}
              </span>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="bg-white text-black hover:bg-white/90 shrink-0"
          >
            <SendIcon />
            Subscribe
          </Button>
        </form>
      </div>
    </Container>
  )
}
