import { z } from "zod"

/**
 * Slug regex: lower-case alphanumeric separated by single hyphens
 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) {
    return false
  }
  return trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")
}

// ---------------------------------------------------------------------------
// Product Schemas
// ---------------------------------------------------------------------------

export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant dimension label is required"),
  price: z.number().min(0, "Price must be at least 0"),
  compareAtPrice: z.number().min(0, "Compare at price must be at least 0").optional(),
})

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(SLUG_REGEX, "Slug must be lowercase alphanumeric with hyphens (e.g. porsche-911)"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.number().min(0, "Base price must be at least 0"),
  compareAtPrice: z.number().min(0, "Compare at price must be at least 0").optional(),
  image: z.string().min(1, "Main product image is required"),
  images: z.array(z.string()),
  badge: z.string().optional(),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  tags: z.array(z.string()).min(1, "At least one category tag is required"),
  variants: z.array(productVariantSchema).min(1, "At least one size variant is required"),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
  categoryId: z
    .string()
    .min(1, "Select a category")
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
})

export type ProductFormValues = z.infer<typeof productSchema>
/** Pre-transform input shape (categoryId accepts "" for "Uncategorized"). */
export type ProductFormInput = z.input<typeof productSchema>

// ---------------------------------------------------------------------------
// Category Schemas
// ---------------------------------------------------------------------------

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(SLUG_REGEX, "Slug must be lowercase alphanumeric with hyphens (e.g. cars-supercars)"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  image: z.string().min(1, "Cover image is required"),
  tags: z.array(z.string()).min(1, "At least one matching product tag is required"),
  featured: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

// ---------------------------------------------------------------------------
// Store Settings Schema
// ---------------------------------------------------------------------------

export const storeSettingsSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  contactEmail: z.string().email("Valid email address is required"),
  contactPhone: z.string().min(5, "Contact phone is required"),
  whatsappNumber: z.string().min(5, "WhatsApp phone is required"),
  freeShippingThreshold: z.number().min(0, "Threshold must be >= 0"),
  flatShippingFee: z.number().min(0, "Flat shipping fee must be >= 0"),
  currency: z.string(),
  currencySymbol: z.string(),
  workshopLeadTime: z.string().min(1, "Lead time notice is required"),
  enableInternationalShipping: z.boolean(),
  maintenanceMode: z.boolean(),
})

export type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>

// ---------------------------------------------------------------------------
// Custom Order Inquiry Schema
// ---------------------------------------------------------------------------

export const customOrderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Valid email address is required"),
  customerPhone: z
    .string()
    .min(6, "Phone number must be at least 6 digits")
    .regex(/^[+]?[\d\s()-]{6,20}$/, "Enter a valid phone / WhatsApp number"),
  country: z.string().min(2, "Country is required"),
  deliveryAddress: z.string().optional(),
  designRequirement: z.string().min(10, "Please provide at least 10 characters describing your request"),
  sizeOption: z.string().min(1, "Please select a size option"),
  customDimensions: z.string().optional(),
  withBacklitLed: z.boolean(),
  specialRequest: z.string().optional(),
  referenceImage: z.string().optional(),
})

export type CustomOrderFormValues = z.infer<typeof customOrderSchema>

/** Server-side shape after zod coercion, used by the submit API. */
export type CustomOrderSubmitInput = z.infer<typeof customOrderSchema> & {
  deliveryAddress?: string
}

// ---------------------------------------------------------------------------
// Contact Form Schema
// ---------------------------------------------------------------------------

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export type ContactFormValues = z.infer<typeof contactSchema>

// ---------------------------------------------------------------------------
// Newsletter Schema
// ---------------------------------------------------------------------------

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type NewsletterFormValues = z.infer<typeof newsletterSchema>

// ---------------------------------------------------------------------------
// Hero Slide & Campaign Schemas
// ---------------------------------------------------------------------------

export const heroSlideSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title is required"),
  subtitle: z.string().min(2, "Subtitle is required"),
  image: z.string().min(1, "Slide image is required"),
  alt: z.string().min(2, "Alt text is required"),
  ctaLabel: z.string().min(2, "CTA label is required"),
  ctaHref: z
    .string()
    .min(1, "CTA link is required")
    .refine(isSafeUrl, "Link must be an internal path (e.g. /shop) or valid http/https URL"),
  order: z.number().int().min(0, "Order must be 0 or greater").default(0),
  isActive: z.boolean().default(true),
})

export type HeroSlideFormValues = z.output<typeof heroSlideSchema>
/** Pre-transform input shape (order/isActive optional, defaulted by zod). */
export type HeroSlideFormInput = z.input<typeof heroSlideSchema>

export const campaignSchema = z.object({
  slug: z.string().min(2).regex(SLUG_REGEX, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(2, "Campaign title is required"),
  description: z.string().min(5, "Campaign description is required"),
  image: z.string().min(1, "Cover image is required"),
  discount: z.string().min(1, "Discount text is required (e.g. 20% OFF)"),
  ctaLabel: z.string().min(2, "CTA label is required"),
  productSlugs: z.array(z.string()),
})

export type CampaignFormValues = z.infer<typeof campaignSchema>

// ---------------------------------------------------------------------------
// Review Schema
// ---------------------------------------------------------------------------

export const reviewSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Customer name is required"),
  rating: z.number().min(1).max(5),
  date: z.string().min(1, "Review date is required"),
  title: z.string().min(2, "Review title is required"),
  body: z.string().min(5, "Review body is required"),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>

// ---------------------------------------------------------------------------
// Checkout Schemas
// ---------------------------------------------------------------------------

export const checkoutDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(5, "Phone number is required"),
  address: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  zip: z.string().min(2, "ZIP / postal code is required"),
  country: z.string().min(2, "Country is required"),
})

export type CheckoutDetailsFormValues = z.infer<typeof checkoutDetailsSchema>

export const checkoutPaymentSchema = z.object({
  cardName: z.string().min(2, "Name on card is required"),
  cardNumber: z
    .string()
    .min(13, "Card number must be at least 13 digits")
    .regex(/^[0-9\s]{13,23}$/, "Invalid card number format"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Expiry must be in MM/YY format"),
  cvc: z.string().regex(/^[0-9]{3,4}$/, "CVC must be 3 or 4 digits"),
})

export type CheckoutPaymentFormValues = z.infer<typeof checkoutPaymentSchema>
