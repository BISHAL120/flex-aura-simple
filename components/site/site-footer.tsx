import Link from "next/link"
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Container } from "@/components/site/container"

const shopLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "Custom Order Request", href: "/custom-order" },
  { label: "New Drops", href: "/#new-arrivals" },
  { label: "Fan Favourites", href: "/#best-sellers" },
]

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/#faq" },
]

const supportLinks = [
  { label: "Shipping & Delivery", href: "/contact" },
  { label: "Custom Order Help", href: "/contact" },
  { label: "Size & Mounting Guide", href: "/contact" },
  { label: "Order Tracking", href: "/contact" },
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
              Precision laser-cut 2mm metal wall art — cars, bikes, custom
              designs and backlit LED pieces. Made to order, in your size.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MailIcon className="size-4" /> hello@flexaurametal.com
              </span>
              <span className="inline-flex items-center gap-2">
                <PhoneIcon className="size-4" /> +880 1623-939834
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="size-4" /> Custom metal art, made to order
              </span>
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Support" links={supportLinks} />
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Flex Aura Metal Art. All rights reserved.</p>
          <p>Visa · Mastercard · Amex · PayPal · Cash on Delivery</p>
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
