export type ProductVariant = {
  /** Size / option label, e.g. `30" × 18.5"`. */
  name: string
  price: number
  compareAtPrice?: number
}

export type Product = {
  id: string
  slug: string
  name: string
  description: string
  /** Base price, used for cards and sorting. Variants may override it. */
  price: number
  compareAtPrice?: number
  image: string
  images: string[]
  badge?: string
  variants: ProductVariant[]
  rating: number
  reviewCount: number
  tags: string[]
}

export type FAQ = {
  question: string
  answer: string
}

export const faqs: FAQ[] = [
  {
    question: "What is the metal art made of?",
    answer:
      "Every piece is laser-cut from 2mm steel and finished with a premium black powder coat for a smooth, durable matte surface that resists rust and scratches.",
  },
  {
    question: "How is it mounted on the wall?",
    answer:
      "Each piece ships with an imported transparent wall hook. Most designs also include a 16cm spacer screw that lifts the art off the wall for a beautiful 3D floating shadow effect.",
  },
  {
    question: "Can I get a custom size?",
    answer:
      "Yes. Every design can be resized to fit your wall — we'll adjust the price based on the size you choose. Just contact us with your measurements.",
  },
  {
    question: "Can you make custom designs, logos or names?",
    answer:
      "Absolutely. Send us any car, bike, logo, name, date or design and we'll laser-cut it in metal. We also make backlit LED versions of custom pieces for a stunning glow at night.",
  },
  {
    question: "How long does an order take?",
    answer:
      "In-stock pieces ship within 1–2 business days. Custom orders typically take 3–5 business days to cut and finish, then ship. Delivery is 3–5 business days standard.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship worldwide. Shipping costs and delivery times are calculated at checkout. We pack every piece carefully so it arrives in perfect condition.",
  },
]

export function getVariant(product: Product, name: string): ProductVariant | undefined {
  return product.variants.find((v) => v.name === name)
}

/** Price for a specific variant, falling back to the product base price. */
export function getVariantPrice(product: Product, name: string): number {
  return getVariant(product, name)?.price ?? product.price
}

/** The first variant, or undefined for products without variants. */
export function getDefaultVariant(product: Product): ProductVariant | undefined {
  return product.variants[0]
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}
