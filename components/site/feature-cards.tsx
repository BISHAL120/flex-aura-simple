import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon } from "lucide-react"

import { Container } from "@/components/site/container"
import { Badge } from "@/components/ui/badge"
import { getActiveCampaigns } from "@/lib/data-layer/admin/campaigns/campaign-data-layer"

/** Server component: renders the active homepage feature cards from the DB. */
export async function FeatureCards() {
  const campaigns = await getActiveCampaigns(2)

  if (campaigns.length === 0) return null

  return (
    <Container>
      <div className="grid gap-5 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={`/promotions/${campaign.slug}`}
            className="group relative block aspect-[4/3] overflow-hidden rounded-lg sm:aspect-[16/10]"
          >
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-8">
              <Badge className="mb-3 w-fit bg-white text-black">{campaign.badge}</Badge>
              <h3 className="font-heading text-xl font-semibold sm:text-2xl">
                {campaign.title}
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/80 line-clamp-2">
                {campaign.description}
              </p>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-white/40 bg-transparent px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black">
                {campaign.ctaLabel}
                <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
