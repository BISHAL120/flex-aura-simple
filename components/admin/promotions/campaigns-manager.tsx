"use client"

import * as React from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MegaphoneIcon, EditIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { campaigns, type Campaign } from "@/lib/data"
import { campaignSchema, type CampaignFormValues } from "@/lib/validators"

export function CampaignsManager() {
  const [editingCampaign, setEditingCampaign] = React.useState<Campaign | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      slug: "",
      title: "",
      description: "",
      image: "",
      discount: "",
      ctaLabel: "",
      productIds: [],
    },
  })

  function handleOpenEdit(campaign: Campaign) {
    setEditingCampaign(campaign)
    reset({
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description,
      image: campaign.image,
      discount: campaign.discount,
      ctaLabel: campaign.ctaLabel,
      productIds: campaign.productIds,
    })
    setDialogOpen(true)
  }

  function onFormSubmit(data: CampaignFormValues) {
    if (!editingCampaign) return
    toast.add({
      type: "success",
      title: "Campaign updated",
      description: `${data.title} campaign details saved.`,
    })
    setDialogOpen(false)
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Validation Error",
      description: "Please check the campaign details.",
    })
  }

  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg font-semibold tracking-tight flex items-center gap-2">
          <MegaphoneIcon className="size-4 text-primary" />
          Featured Campaigns &amp; Promotional Pages
        </CardTitle>
        <CardDescription className="text-xs">
          Manage landing pages, banner callouts, and curated product collections
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2">
        {campaigns.map((campaign: Campaign) => (
          <div
            key={campaign.slug}
            className="flex flex-col overflow-hidden rounded-lg border bg-muted/20"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              <Image
                src={campaign.image}
                alt={campaign.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <Badge className="bg-white text-black font-semibold text-[10px] mb-1">
                    {campaign.discount}
                  </Badge>
                  <h3 className="font-heading font-semibold text-base">{campaign.title}</h3>
                </div>
                <span className="text-[11px] text-white/80">
                  {campaign.productIds.length} featured items
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {campaign.description}
              </p>
              <div className="mt-auto pt-4 flex items-center justify-between border-t text-xs">
                <span className="font-mono text-[11px] text-muted-foreground">
                  /promotions/{campaign.slug}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(campaign)}
                    className="h-7 text-xs gap-1"
                  >
                    <EditIcon className="size-3" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Edit Campaign Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-base font-semibold">
              Edit Campaign: {editingCampaign?.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update marketing campaign banner text, badge, and CTA.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="flex flex-col gap-4 py-2 text-xs">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="camp-title">Campaign Title</Label>
              <Input
                id="camp-title"
                {...register("title")}
                className="h-9 text-xs font-semibold"
              />
              {errors.title && <FieldError errors={[{ message: errors.title.message }]} />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="camp-discount">Badge / Discount Tag</Label>
              <Input
                id="camp-discount"
                {...register("discount")}
                placeholder="e.g. Backlit LED or -20% Off"
                className="h-8 text-xs"
              />
              {errors.discount && <FieldError errors={[{ message: errors.discount.message }]} />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="camp-desc">Description</Label>
              <Textarea
                id="camp-desc"
                {...register("description")}
                rows={3}
                className="text-xs"
              />
              {errors.description && (
                <FieldError errors={[{ message: errors.description.message }]} />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="camp-cta">CTA Button Label</Label>
              <Input
                id="camp-cta"
                {...register("ctaLabel")}
                className="h-8 text-xs"
              />
              {errors.ctaLabel && <FieldError errors={[{ message: errors.ctaLabel.message }]} />}
            </div>

            <DialogFooter className="mt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Campaign</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
