import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"
import type { Metadata } from "next"

import ConatctPage from "@/components/public/contact/contact-page"

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
    <ConatctPage contactDetails={contactDetails} />
  )
}
