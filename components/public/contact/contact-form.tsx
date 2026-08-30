"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { contactSchema, type ContactFormValues } from "@/lib/validators"

export function ContactForm() {
  const [pending, setPending] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  function onFormSubmit(_data: ContactFormValues) {
    setPending(true)
    setTimeout(() => {
      setPending(false)
      reset()
      toast.add({
        type: "success",
        title: "Message sent successfully",
        description: "Thanks for reaching out! Our team will reply within one business day.",
      })
    }, 600)
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Validation Error",
      description: "Please check the contact form fields and try again.",
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit, onFormError)}
      className="flex flex-col gap-4 rounded-lg border bg-card p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            placeholder="Jane Doe"
            {...register("name")}
          />
          {errors.name && <FieldError errors={[{ message: errors.name.message }]} />}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            {...register("email")}
          />
          {errors.email && <FieldError errors={[{ message: errors.email.message }]} />}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          placeholder="How can we help?"
          {...register("subject")}
        />
        {errors.subject && <FieldError errors={[{ message: errors.subject.message }]} />}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="Tell us a little more about your inquiry…"
          {...register("message")}
        />
        {errors.message && <FieldError errors={[{ message: errors.message.message }]} />}
      </div>
      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  )
}
