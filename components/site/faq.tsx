import Image from "next/image"

import { Container } from "@/components/site/container"
import { SectionHeading } from "@/components/site/section-heading"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { faqs } from "@/lib/data"

const FAQ_IMAGE =
  "/products/product5.jpeg"

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20">
      <Container className="flex flex-col gap-10">
        {/* Heading on top, spanning the full width */}
        <SectionHeading
          align="left"
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Everything you need to know about shopping with Flex Aura. Can't find an answer? Reach out on our contact page."
        />

        {/* Image left, FAQs right */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg lg:aspect-auto lg:w-[42%] lg:min-h-[320px]">
            <Image
              src={FAQ_IMAGE}
              alt="Nissan GT-R R35 laser-cut metal wall art"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </div>

          <Accordion defaultValue={[faqs[0]?.question].filter(Boolean)} className="w-full rounded-lg lg:flex-1">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  )
}
