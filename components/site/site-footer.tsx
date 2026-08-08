import Link from "next/link"
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { Newsletter } from "@/components/site/newsletter"

const shopLinks = [
  { label: "Summer Sale", href: "/promotions/summer-sale" },
  { label: "Clearance", href: "/promotions/clearance" },
  { label: "New Arrivals", href: "/#new-arrivals" },
  { label: "Best Sellers", href: "/#best-sellers" },
]

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/#faq" },
]

const supportLinks = [
  { label: "Shipping & Delivery", href: "/contact" },
  { label: "Returns & Exchanges", href: "/contact" },
  { label: "Order Tracking", href: "/contact" },
  { label: "Size Guide", href: "/contact" },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Link href="/" className="font-heading text-xl font-semibold tracking-tight">
              Flex <span className="text-muted-foreground">Aura</span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              Curated fashion, accessories, home and tech — thoughtfully picked,
              fairly priced, and delivered to your door.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MailIcon className="size-4" /> hello@flexaura.com
              </span>
              <span className="inline-flex items-center gap-2">
                <PhoneIcon className="size-4" /> +1 (555) 123-4567
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="size-4" /> 128 Market Street, San Francisco, CA
              </span>
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Support" links={supportLinks} />
        </div>

        <div className="mt-12 border-t pt-8">
          <Newsletter compact />
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Flex Aura. All rights reserved.</p>
          <p>Visa · Mastercard · Amex · PayPal · Apple Pay</p>
        </div>
      </Container>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
