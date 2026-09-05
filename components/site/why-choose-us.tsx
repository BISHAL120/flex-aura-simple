import { Container } from "@/components/site/container"
import { SectionHeading } from "@/components/site/section-heading"
import {
  ScissorsIcon,
  LightbulbIcon,
  RulerIcon,
  MessageCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
} from "lucide-react"

const reasons = [
  {
    icon: ScissorsIcon,
    title: "Precision laser cutting",
    description:
      "Every piece is cut from 2mm steel on a fibre laser and finished in a premium matte-black powder coat that resists rust and scratches.",
  },
  {
    icon: LightbulbIcon,
    title: "Backlit LED available",
    description:
      "Turn any design into a glowing statement — names, logos and silhouettes come alive with a warm LED backlight for night-time wow.",
  },
  {
    icon: RulerIcon,
    title: "Made to your exact size",
    description:
      "Pick a standard size or give us your wall's measurements. We'll resize any design so it fits perfectly the first time.",
  },
  {
    icon: MessageCircleIcon,
    title: "Personal design support",
    description:
      "Send any car, bike, logo or idea — we confirm every custom order personally on WhatsApp before a single cut is made.",
  },
  {
    icon: TruckIcon,
    title: "Careful packaging & delivery",
    description:
      "Orders ship worldwide in protective crates. Across Bangladesh we deliver fast, with easy Cash on Delivery for local buyers.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Made to last, guaranteed",
    description:
      "Powder-coated steel built for years on your wall, with responsive after-sales support whenever you need us.",
  },
]

export function WhyChooseUs() {
  return (
    <section aria-labelledby="why-choose-us-heading" className="py-14 sm:py-20">
      <Container>
        <SectionHeading
          id="why-choose-us-heading"
          eyebrow="Why Flex Aura"
          title="Cut with care, made for your wall"
          description="From the first WhatsApp sketch to the final powder coat, here's why customers across Bangladesh and worldwide trust us with their custom metal art."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="flex flex-col gap-3 rounded-lg border bg-card p-6 transition-colors hover:bg-muted/40"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <reason.icon className="size-5" />
              </span>
              <h3 className="font-heading text-base font-semibold tracking-tight">
                {reason.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
