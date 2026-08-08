import type { Metadata } from "next"
import Image from "next/image"
import { GemIcon, LeafIcon, HeartHandshakeIcon, SparklesIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { PageShell } from "@/components/site/page-shell"
import { SectionHeading } from "@/components/site/section-heading"
import { Newsletter } from "@/components/site/newsletter"

export const metadata: Metadata = {
  title: "About Us — Flex Aura",
  description:
    "Flex Aura curates fashion, accessories, home and tech with a focus on quality, fair pricing and customer care.",
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"

const TEAM_IMAGE =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"

const values = [
  {
    icon: GemIcon,
    title: "Quality first",
    description:
      "Every product is hand-picked and tested by our team before it earns a place on the shelf.",
  },
  {
    icon: LeafIcon,
    title: "Responsible sourcing",
    description:
      "We work with makers who share our values — sustainable materials and ethical production.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Customers first",
    description:
      "Easy returns, fast shipping and real humans on support. Your happiness is the whole point.",
  },
  {
    icon: SparklesIcon,
    title: "Fair pricing",
    description:
      "No inflated markups. We price things honestly so great design stays within reach.",
  },
]

const stats = [
  { value: "20k+", label: "Happy customers" },
  { value: "4.8/5", label: "Average rating" },
  { value: "40+", label: "Countries served" },
  { value: "300+", label: "Curated products" },
]

export default function AboutPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative flex min-h-[320px] items-center sm:min-h-[400px]">
        <Image
          src={HERO_IMAGE}
          alt="The Flex Aura team collaborating"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        <Container className="relative text-white">
          <div className="max-w-xl">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Thoughtfully curated. Honestly priced.
            </h1>
            <p className="mt-4 text-sm text-white/85 sm:text-base">
              Flex Aura started with a simple idea: shopping for the things you love
              should feel good — from the moment you browse to the moment you unbox.
            </p>
          </div>
        </Container>
      </section>

      {/* Mission */}
      <section className="py-14 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <SectionHeading
              align="left"
              eyebrow="Our story"
              title="Built for the way you live"
            />
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              We bring together a small, obsessive team of buyers, designers and
              support specialists who believe everyday objects should be a little
              extraordinary. We travel to find makers, test every product ourselves,
              and refuse to stock anything we wouldn&apos;t put in our own homes.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              The result is a store that feels more like a recommendation from a
              friend — dependable quality, honest prices and service that actually
              answers.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[min(var(--radius-4xl),24px)]">
            <Image
              src={TEAM_IMAGE}
              alt="Members of the Flex Aura team working together"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-12">
        <Container className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-heading text-2xl font-semibold sm:text-3xl">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </Container>
      </section>

      {/* Values */}
      <section className="py-14 sm:py-20">
        <Container className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="What we stand for"
            title="Our values"
            description="Four commitments that guide every decision we make."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-5"
              >
                <div className="flex size-10 items-center justify-center rounded-2xl bg-muted">
                  <value.icon className="size-5" />
                </div>
                <h3 className="text-sm font-medium">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Newsletter />
      </section>
    </PageShell>
  )
}
