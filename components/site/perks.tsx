import { Container } from "@/components/site/container"
import { TruckIcon, RotateCcwIcon, ShieldCheckIcon, HeadsetIcon } from "lucide-react"

const perks = [
  {
    icon: TruckIcon,
    title: "Free Shipping",
    description: "On all orders over $50",
  },
  {
    icon: RotateCcwIcon,
    title: "Easy Returns",
    description: "30-day hassle-free returns",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure Payment",
    description: "PCI-DSS compliant checkout",
  },
  {
    icon: HeadsetIcon,
    title: "24/7 Support",
    description: "We're here whenever you need",
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
