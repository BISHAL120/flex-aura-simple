import type { Metadata } from "next"
import { MailIcon, MapPinIcon, PhoneIcon, ClockIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { PageShell } from "@/components/site/page-shell"
import { SectionHeading } from "@/components/site/section-heading"
import { ContactForm } from "@/components/site/contact-form"
import { Newsletter } from "@/components/site/newsletter"

export const metadata: Metadata = {
  title: "Contact Us — Flex Aura",
  description:
    "Questions about a piece, a custom design or an order? The Flex Aura metal art team is here to help — reach out any time.",
}

const contactDetails = [
  {
    icon: MailIcon,
    label: "Email",
    value: "hello@flexaurametal.com",
    note: "We reply within one business day",
  },
  {
    icon: PhoneIcon,
    label: "Phone / WhatsApp",
    value: "+880 1623-939834",
    note: "Fastest for custom order enquiries",
  },
  {
    icon: MapPinIcon,
    label: "Workshop",
    value: "Custom metal art, made to order",
    note: "We ship worldwide",
  },
  {
    icon: ClockIcon,
    label: "Support hours",
    value: "24/7 online support",
    note: "WhatsApp and email always open",
  },
]

export default function ContactPage() {
  return (
    <PageShell>
      <section className="py-14 sm:py-20">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Contact"
            title="Let's cut something great"
            description="Custom design enquiries, size questions, or just to say hi — pick whichever channel works best."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contact info */}
            <div className="flex flex-col gap-4">
              {contactDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-start gap-4 rounded-2xl border bg-card p-5"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
                    <detail.icon className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-medium">{detail.label}</h3>
                    <p className="text-sm">{detail.value}</p>
                    <p className="text-xs text-muted-foreground">{detail.note}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <ContactForm />
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Newsletter />
      </section>
    </PageShell>
  )
}
