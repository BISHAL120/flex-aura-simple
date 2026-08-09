import type { Metadata } from "next"
import Image from "next/image"
import { FlameIcon, RulerIcon, HeartHandshakeIcon, SparklesIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { PageShell } from "@/components/site/page-shell"
import { SectionHeading } from "@/components/site/section-heading"
import { Newsletter } from "@/components/site/newsletter"

export const metadata: Metadata = {
  title: "About Us — Flex Aura",
  description:
    "Flex Aura laser-cuts 2mm metal wall art of your favourite cars, bikes and custom designs — made to order, in your size.",
}

const HERO_IMAGE =
  "/products/product1.webp"

const WORKSHOP_IMAGE =
  "/products/product5.jpeg"

const values = [
  {
    icon: FlameIcon,
    title: "Laser precision",
    description:
      "Every piece is cut with a precision fibre laser from 2mm steel — clean lines, crisp details, no compromises.",
  },
  {
    icon: RulerIcon,
    title: "Made to your size",
    description:
      "Every design can be resized to fit your wall. We cut exactly what you need, exactly how you need it.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Custom first",
    description:
      "Car, bike, logo, name or date — if you can send it, we can cut it. Backlit LED versions available too.",
  },
  {
    icon: SparklesIcon,
    title: "Premium finish",
    description:
      "A durable black powder coat on every piece, plus a 3D floating shadow effect for real depth on the wall.",
  },
]

const stats = [
  { value: "20k+", label: "Pieces shipped" },
  { value: "4.8/5", label: "Average rating" },
  { value: "40+", label: "Countries served" },
  { value: "300+", label: "Custom designs made" },
]

export default function AboutPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative flex min-h-[320px] items-center sm:min-h-[400px]">
        <Image
          src={HERO_IMAGE}
          alt="Porsche 911 GT3 RS laser-cut metal wall art"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        <Container className="relative text-white">
          <div className="max-w-xl">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Cut in metal. Built to last.
            </h1>
            <p className="mt-4 text-sm text-white/85 sm:text-base">
              Flex Aura started in a workshop with a fibre laser and an idea:
              your favourite car, bike or design, precision-cut from 2mm steel
              and finished in premium black powder coat.
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
              title="From laser beam to showpiece"
            />
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              We&apos;re a small, obsessive team of designers and laser
              operators who believe walls deserve better than a poster. We
              model every piece, refine every line, and cut it in 2mm steel
              that feels as good as it looks.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              The result is metal art that turns a garage, living room or shop
              into a gallery — custom sizes, custom designs, and backlit LED
              pieces that glow at night.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[min(var(--radius-4xl),24px)]">
            <Image
              src={WORKSHOP_IMAGE}
              alt="Nissan GT-R R35 laser-cut metal art in a home"
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
            description="Four commitments that guide every cut we make."
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
