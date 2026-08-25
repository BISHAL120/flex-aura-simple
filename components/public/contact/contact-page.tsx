import { ContactForm } from "@/components/public/contact/contact-form"
import { Container } from "@/components/site/container"
import { Newsletter } from "@/components/public/contact/newsletter"
import { SectionHeading } from '@/components/site/section-heading'
import { LucideIcon } from "lucide-react"

interface ContactPageProps {
    icon: LucideIcon
    label: string
    value: string
    note: string
}

const ConatctPage = ({ contactDetails }: { contactDetails: ContactPageProps[] }) => {
    return (
        <div>
            <section className="py-14 sm:py-20">
                <Container className="flex flex-col gap-10">
                    <SectionHeading
                        eyebrow="Contact"
                        title="Let's cut something great"
                        description="Custom design enquiries, size questions, or just to say hi — pick whichever channel works best."
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Contact info */}
                        <div className="flex flex-col gap-4">
                            {contactDetails.map((detail) => {
                                return (
                                    <div
                                        key={detail.label}
                                        className="flex items-start gap-4 rounded-2xl border bg-card p-5"
                                    >
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
                                            <detail.icon className="size-5" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <h3 className="text-sm font-medium">{detail.label}</h3>
                                            <p className="text-sm">{detail.value}</p>
                                            <p className="text-xs text-muted-foreground">{detail.note}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Contact form */}
                        <ContactForm />
                    </div>
                </Container>
            </section>

            <section className="pb-14 sm:pb-20">
                <Newsletter />
            </section>
        </div>
    )
}

export default ConatctPage