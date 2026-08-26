import Link from "next/link"
import { ChevronRightIcon, RotateCcwIcon, TruckIcon, WrenchIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { ProductGrid } from "@/components/site/product-grid"
import { SectionHeading } from "@/components/site/section-heading"
import { Newsletter } from "@/components/public/contact/newsletter"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { ProductGallery } from "@/components/public/product-details/product-gallery"
import { ProductInfo } from "@/components/public/product-details/product-info"
import { faqs, type Product } from "@/lib/data"

const DETAILS_BULLETS = [
  "Precision laser-cut from 2mm premium steel.",
  "Hand-polished and finished with a matte black powder coat.",
  "Ships with elevation screws and a hanging attachment for an easy 3D floating effect.",
  "Packaged in sturdy boxes so it arrives in perfect condition.",
]

const SHIPPING_PARAGRAPHS = [
  "Orders ship within 1–2 business days for in-stock pieces and 3–5 business days for custom orders.",
  "Delivery is 3–5 business days standard. We ship worldwide.",
  "Free shipping on all orders over $50.",
]

const CUSTOM_ORDER_STEPS = [
  { title: "Place your order", description: "Tell us the design, size and finish you want." },
  { title: "We create the design", description: "Our team drafts your piece — usually within 1–3 working days." },
  { title: "You confirm", description: "We send the design for your approval and adjust it to your liking." },
  { title: "We cut & ship", description: "Once approved, we laser-cut, powder coat and ship your art." },
]

export function ProductDetails({
  product,
  related,
}: {
  product: Product
  related: Product[]
}) {
  return (
    <div>
      {/* Breadcrumb */}
      <Container className="pt-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRightIcon className="size-3.5" aria-hidden="true" />
          <Link href="/shop" className="transition-colors hover:text-foreground">
            Shop
          </Link>
          <ChevronRightIcon className="size-3.5" aria-hidden="true" />
          <span aria-current="page" className="font-medium text-foreground">
            {product.name}
          </span>
        </nav>
      </Container>

      {/* Main product layout */}
      <Container className="grid gap-8 py-8 sm:gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-12 lg:py-12">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </Container>

      {/* Details, shipping & returns, custom orders — stacked sections */}
      <Container className="flex flex-col gap-10 pb-14 sm:pb-20">
        <section aria-labelledby="details-heading">
          <h2 id="details-heading" className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Details
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            {DETAILS_BULLETS.map((bullet) => (
              <li key={bullet} className="text-sm text-muted-foreground sm:text-base">
                {bullet}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="shipping-heading">
          <h2 id="shipping-heading" className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Shipping &amp; Returns
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {SHIPPING_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph} className="text-sm text-muted-foreground sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section aria-labelledby="custom-orders-heading">
          <h2 id="custom-orders-heading" className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Custom Orders
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Can&apos;t find the exact design or size you want? We&apos;ll cut any
            car, bike, logo or idea to your spec.
          </p>
          <ol className="mt-4 space-y-3">
            {CUSTOM_ORDER_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4">
            <Link href="/custom-order" className="font-medium underline underline-offset-3">
              Start your custom order
            </Link>
          </p>
        </section>
      </Container>

      {/* Trust / perks strip */}
      <section className="border-y bg-muted/30 py-8 sm:py-10">
        <Container>
          <div className="grid gap-6 text-center sm:grid-cols-3">
            <PerkItem icon={TruckIcon} title="Free Shipping" description="On all orders over $50" />
            <PerkItem icon={RotateCcwIcon} title="30-Day Returns" description="Easy returns, no questions asked" />
            <PerkItem icon={WrenchIcon} title="Made to Order" description="Cut in your size, just for you" />
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Everything you need to know before you order."
            className="mb-8"
          />
          <Accordion>
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </section>

      {/* Related products */}
      <section className="pb-14 sm:pb-20">
        <Container className="mb-8 flex items-end justify-between gap-4">
          <SectionHeading
            align="left"
            eyebrow="You may also like"
            title="Complete the collection"
            description="Pieces that pair well with this one."
          />
          <Link
            href="/shop"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground sm:inline-flex"
          >
            View all
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </Container>
        <ProductGrid products={related} />
      </section>

      <section className="pb-14 sm:pb-20">
        <Newsletter compact />
      </section>
    </div>
  )
}

function PerkItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
