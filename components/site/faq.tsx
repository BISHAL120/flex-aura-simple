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
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20">
      <Container className="grid items-start gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Everything you need to know about shopping with Flex Aura. Can't find an answer? Reach out on our contact page."
          />
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-[16/10]">
            <Image
              src={FAQ_IMAGE}
              alt="Flex Aura support team"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        <Accordion className="rounded-lg">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  )
}
