import { Container } from "@/components/site/container"
import { SectionHeading } from "@/components/site/section-heading"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { faqs } from "@/lib/data"

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

        <Accordion defaultValue={[faqs[0]?.question].filter(Boolean)} className="w-full rounded-lg">
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
