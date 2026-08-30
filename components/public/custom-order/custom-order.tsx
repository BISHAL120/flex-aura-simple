import { PaletteIcon, RulerIcon, LightbulbIcon, TruckIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { SectionHeading } from "@/components/site/section-heading"
import { CustomOrderForm } from "@/components/public/custom-order/custom-order-form"

const steps = [
  {
    icon: PaletteIcon,
    title: "Tell us your design",
    description: "Describe the art you want and upload a reference image if you have one.",
  },
  {
    icon: RulerIcon,
    title: "Pick your size",
    description: "Choose a standard size or enter your own custom dimensions.",
  },
  {
    icon: LightbulbIcon,
    title: "Add light or keep it plain",
    description: "Plain black powder-coated metal, or a warm backlit LED version.",
  },
  {
    icon: TruckIcon,
    title: "We cut & ship",
    description: "We confirm your quote on WhatsApp or email, then laser-cut and deliver.",
  },
]

export default function CustomOrderPage() {
  return (
    <div>
      <section className="py-14 sm:py-20">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Made to order"
            title="Request a custom piece"
            as="h1"
            description="Any car, bike, logo, name or design — laser-cut from 2mm metal, in any size, with or without backlit LED light. Tell us what you need and we'll make it."
          />

          <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
            {/* Form */}
            <CustomOrderForm />

            {/* Sidebar */}
            <aside className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
                <h2 className="font-heading text-base font-semibold">How it works</h2>
                <ol className="flex flex-col gap-4">
                  {steps.map((step, index) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {index + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <p className="flex items-center gap-1.5 text-sm font-medium">
                          <step.icon className="size-4 text-muted-foreground" />
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-5 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Good to know</p>
                <ul className="list-disc space-y-1.5 pl-4 text-xs">
                  <li>Every piece is cut from 2mm steel with a premium black powder coat.</li>
                  <li>Custom sizes are priced based on the dimensions you choose.</li>
                  <li>Backlit LED pieces come with a warm light strip and power cord.</li>
                  <li>We confirm every quote personally before cutting.</li>
                  <li>Free shipping on orders over $50, worldwide.</li>
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </div>
  )
}
