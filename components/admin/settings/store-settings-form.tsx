"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  StoreIcon,
  TruckIcon,
  SaveIcon,
  RotateCcwIcon,
  AlertTriangleIcon,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FieldError } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAdminStore } from "@/components/admin/admin-store-provider"
import { storeSettingsSchema, type StoreSettingsFormValues } from "@/lib/validators"

export function StoreSettingsForm() {
  const { settings, updateSettings, resetToDefaults, hasHydrated } = useAdminStore()
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: settings,
  })

  const watchedIntl = watch("enableInternationalShipping")
  const watchedMaint = watch("maintenanceMode")

  // Re-sync form state upon hydration or store change (resolves H6)
  React.useEffect(() => {
    if (hasHydrated) {
      reset(settings)
    }
  }, [hasHydrated, settings, reset])

  function onFormSubmit(data: StoreSettingsFormValues) {
    updateSettings({
      ...data,
      freeShippingThreshold: Number.isFinite(data.freeShippingThreshold) ? data.freeShippingThreshold : 50,
      flatShippingFee: Number.isFinite(data.flatShippingFee) ? data.flatShippingFee : 9.99,
    })
  }

  function onFormError() {
    toast.add({
      type: "error",
      title: "Validation Error",
      description: "Please check the store settings configuration.",
    })
  }

  function handleConfirmReset() {
    resetToDefaults()
    setResetDialogOpen(false)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="flex flex-col gap-6 max-w-4xl">
      {/* General Store Information */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
            <StoreIcon className="size-4 text-primary" />
            Store Identity &amp; Branding
          </CardTitle>
          <CardDescription className="text-xs">
            Public-facing store name and contact coordinates
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="set-name">Store Name</Label>
            <Input
              id="set-name"
              {...register("storeName")}
              className="h-9 text-xs font-semibold"
            />
            {errors.storeName && <FieldError errors={[{ message: errors.storeName.message }]} />}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="set-email">Support Email</Label>
            <Input
              id="set-email"
              type="email"
              {...register("contactEmail")}
              className="h-9 text-xs"
            />
            {errors.contactEmail && (
              <FieldError errors={[{ message: errors.contactEmail.message }]} />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="set-phone">Support Phone</Label>
            <Input
              id="set-phone"
              {...register("contactPhone")}
              className="h-9 text-xs"
            />
            {errors.contactPhone && (
              <FieldError errors={[{ message: errors.contactPhone.message }]} />
            )}
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="set-wa">WhatsApp Direct Ordering Hotline</Label>
            <Input
              id="set-wa"
              {...register("whatsappNumber")}
              placeholder="+8801623939834"
              className="h-9 text-xs font-mono"
            />
            {errors.whatsappNumber && (
              <FieldError errors={[{ message: errors.whatsappNumber.message }]} />
            )}
            <p className="text-[11px] text-muted-foreground">
              Used in the floating WhatsApp button and custom order direct link.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Delivery Parameters */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
            <TruckIcon className="size-4 text-primary" />
            Shipping &amp; Delivery Thresholds
          </CardTitle>
          <CardDescription className="text-xs">
            Automatic free shipping rules and dispatch lead times
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="set-thresh">Free Shipping Threshold ($ USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                id="set-thresh"
                type="number"
                step="0.01"
                min="0"
                {...register("freeShippingThreshold", { valueAsNumber: true })}
                className="h-9 pl-7 text-xs font-semibold"
              />
            </div>
            {errors.freeShippingThreshold && (
              <FieldError errors={[{ message: errors.freeShippingThreshold.message }]} />
            )}
            <p className="text-[11px] text-muted-foreground">
              Orders at or above this amount receive free shipping at checkout.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="set-fee">Standard Flat Shipping Fee ($ USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                id="set-fee"
                type="number"
                step="0.01"
                min="0"
                {...register("flatShippingFee", { valueAsNumber: true })}
                className="h-9 pl-7 text-xs font-semibold"
              />
            </div>
            {errors.flatShippingFee && (
              <FieldError errors={[{ message: errors.flatShippingFee.message }]} />
            )}
            <p className="text-[11px] text-muted-foreground">
              Charged when subtotal is below the free shipping threshold.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="set-lead">Workshop Cutting Lead Time Notice</Label>
            <Input
              id="set-lead"
              {...register("workshopLeadTime")}
              className="h-9 text-xs"
            />
            {errors.workshopLeadTime && (
              <FieldError errors={[{ message: errors.workshopLeadTime.message }]} />
            )}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5 sm:col-span-2">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-xs text-foreground">
                Enable Worldwide Express Dispatch
              </span>
              <span className="text-[11px] text-muted-foreground">
                Accept international addresses with standard customs packing.
              </span>
            </div>
            <Switch
              checked={watchedIntl}
              onCheckedChange={(checked) =>
                setValue("enableInternationalShipping", Boolean(checked))
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5 sm:col-span-2">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-xs text-foreground">
                Storefront Maintenance Mode
              </span>
              <span className="text-[11px] text-muted-foreground">
                Display temporary maintenance notice on the customer storefront.
              </span>
            </div>
            <Switch
              checked={watchedMaint}
              onCheckedChange={(checked) => setValue("maintenanceMode", Boolean(checked))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons & Danger Zone */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t">
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs text-destructive hover:text-destructive gap-1.5"
              />
            }
          >
            <RotateCcwIcon className="size-3.5" />
            <span>Reset All Workshop Demo Data</span>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive font-heading">
                <AlertTriangleIcon className="size-5" />
                Reset All Workshop Data?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs leading-relaxed">
                This will restore all products, orders, categories, custom inquiries, and settings to their original factory defaults. Any changes saved in your local browser will be cleared.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmReset}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reset Demo Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button type="submit" size="lg" className="h-10 gap-2 text-xs font-semibold w-full sm:w-auto">
          <SaveIcon className="size-4" />
          <span>Save Store Settings</span>
        </Button>
      </div>
    </form>
  )
}
