import { Container } from "@/components/site/container"
import { TruckIcon, ScissorsIcon, RulerIcon, HeadsetIcon } from "lucide-react"

const perks = [
  {
    icon: ScissorsIcon,
    title: "Laser-Cut Precision",
    description: "2mm steel, cut to the finest detail",
  },
  {
    icon: RulerIcon,
    title: "Custom Sizes",
    description: "Any design, resized to fit your wall",
  },
  {
    icon: TruckIcon,
    title: "Free Shipping",
    description: "On all orders over $50",
  },
  {
    icon: HeadsetIcon,
    title: "24/7 Support",
    description: "WhatsApp & email, always open",
  },
]

export function Perks() {
  return (
    <Container>
      <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
        {perks.map((perk) => (
          <div key={perk.title} className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
              <perk.icon className="size-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{perk.title}</p>
              <p className="text-xs text-muted-foreground">{perk.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
