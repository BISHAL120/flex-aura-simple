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

export type Review = {
  id?: string
  name: string
  rating: number
  date: string
  title: string
  body: string
}

export type FAQ = {
  question: string
  answer: string
}

export type Campaign = {
  slug: string
  title: string
  description: string
  image: string
  discount: string
  ctaLabel: string
  /** Product slugs included in this promotion (DB-backed catalog). */
  productSlugs: string[]
}

/** Local promo/banner images live in /public/products. */
const promoImage = (file: string) => `/products/${file}`

export const campaigns: Campaign[] = [
  {
    slug: "custom-metal-art",
    title: "Custom Metal Art",
    description:
      "Send us any car, bike, logo, name or design — we laser-cut it in 2mm metal with your choice of size and finish.",
    image: promoImage("product19.jpeg"),
    discount: "Custom order",
    ctaLabel: "Order custom art",
    productSlugs: ["porsche-911-gt3-rs-rear", "porsche-911-gt3-rs-side"],
  },
  {
    slug: "backlit-collection",
    title: "Backlit LED Collection",
    description:
      "Our backlit range glows with warm LED light — custom bikes, signs and personal pieces that come alive at night.",
    image: promoImage("product17.jpeg"),
    discount: "Backlit LED",
    ctaLabel: "Shop backlit",
    productSlugs: ["porsche-911-gt3-rs-rear", "porsche-911-gt3-rs-side"],
  },
]

export const reviews: Review[] = [
  { name: "Ava Thompson", rating: 5, date: "2026-07-28", title: "Exactly as pictured", body: "The GT3 RS rear is stunning. The black powder coat is flawless and the 3D floating shadow effect looks incredible on my wall." },
  { name: "Liam Carter", rating: 5, date: "2026-07-25", title: "New favourite brand", body: "Ordered the R35 for my garage and it exceeded expectations. The laser cut is clean and precise. Shipping was fast too." },
  { name: "Sofia Reyes", rating: 4, date: "2026-07-22", title: "Great quality", body: "The Supra piece is beautiful and well-packaged. I wish there were more size options on the site, but custom sizes are available." },
  { name: "Noah Bennett", rating: 5, date: "2026-07-19", title: "Perfect gift", body: "Bought the custom couple's piece for my brother's wedding. The names and date were cut perfectly and the LED glow is magical." },
  { name: "Mia Nguyen", rating: 5, date: "2026-07-16", title: "Comfy and stylish", body: "The Charger silhouette is my husband's favourite piece in the house. He's already asking for the Challenger to match." },
  { name: "Ethan Brooks", rating: 4, date: "2026-07-14", title: "Solid quality", body: "The backlit Khalid Hero bike looks amazing on the wall. The cord could be a little longer but the piece itself is top-notch." },
  { name: "Isabella Costa", rating: 5, date: "2026-07-11", title: "Fast delivery", body: "Ordered the optical illusion art on Monday, arrived Wednesday. The cut is razor sharp and the shadow effect adds real depth." },
  { name: "James Okafor", rating: 5, date: "2026-07-08", title: "Worth every penny", body: "The Aventador is a showstopper. People ask about it every time they visit. The 2mm metal feels properly premium." },
  { name: "Charlotte Duval", rating: 4, date: "2026-07-05", title: "Beautiful work", body: "The Land Cruiser backlit piece is perfect for my husband's off-road room. Warm light, clean lines, easy to hang." },
  { name: "Oliver Grant", rating: 5, date: "2026-07-02", title: "Great custom service", body: "Sent them my logo and they made it into a backlit sign for my shop. Communication was excellent from start to finish." },
  { name: "Amelia Fisher", rating: 5, date: "2026-06-28", title: "Obsessed", body: "The Rajib & Jenny piece made my fiancée cry happy tears. The attention to detail on the names is incredible." },
  { name: "Lucas Meyer", rating: 4, date: "2026-06-25", title: "Good purchase", body: "The SL63 line art is beautiful. The floating shadow effect is exactly as advertised. Slight delay in dispatch but worth it." },
  { name: "Harper Singh", rating: 5, date: "2026-06-22", title: "Beautiful craftsmanship", body: "The F-22 Raptor top view is a masterpiece. Clean lines, sturdy metal, and it looks amazing above the TV." },
  { name: "Benjamin Fox", rating: 5, date: "2026-06-19", title: "Top tier service", body: "Asked for a custom size on the Porsche 911 and they adjusted the price accordingly. Arrived perfectly sized to my wall." },
  { name: "Zoe Patel", rating: 4, date: "2026-06-16", title: "Almost perfect", body: "Love the Barbershop Kolkata sign for my salon. The backlight is warm and welcoming. Wish it came with a switch on the cord." },
  { name: "Henry Clarke", rating: 5, date: "2026-06-13", title: "Repeat customer", body: "Third order from Flex Aura and still consistently great. The custom Only Sukoon sign came out even better than the mockup." },
  { name: "Ella Novak", rating: 5, date: "2026-06-10", title: "High quality", body: "The Harley Street Glide piece is a gift for my dad. The metal is thick, the lines are crisp, and it arrived immaculate." },
  { name: "Daniel Kim", rating: 4, date: "2026-06-07", title: "Nice find", body: "The Challenger Scat Pack cut is aggressive and clean. Hangs easily with the included transparent hook." },
  { name: "Grace Albright", rating: 5, date: "2026-06-04", title: "Exceeded expectations", body: "The Corvette C8 is my daily driver and now it's on my wall too. The three-quarter view is spot on." },
  { name: "Leo Martinez", rating: 5, date: "2026-06-01", title: "Smooth experience", body: "From the WhatsApp order to unboxing, everything was seamless. The custom Dr. Atiya clinic sign looks professional." },
  { name: "Ruby Collins", rating: 4, date: "2026-05-28", title: "Very happy", body: "The XTREME backlit bike looks great in the living room. The LED glow is warm and the cut is detailed." },
  { name: "Arthur White", rating: 5, date: "2026-05-25", title: "Outstanding", body: "The BMW M3 G80 front is aggressive and accurate. You can tell real care goes into every cut." },
  { name: "Luna Rossi", rating: 5, date: "2026-05-22", title: "Gorgeous piece", body: "The Bugatti Chiron custom design is museum quality. Everyone who sees it asks where it's from." },
  { name: "Owen Price", rating: 4, date: "2026-05-19", title: "Great overall", body: "The Audi A3 silhouette is clean and minimal. Shipping took a couple days longer than expected but the quality made up for it." },
  { name: "Stella Grant", rating: 5, date: "2026-05-16", title: "Fan for life", body: "The Porsche 911 side profile, the optical illusion, the Charger — everything I've bought has been impeccable." },
  { name: "Marcus Webb", rating: 5, date: "2026-05-13", title: "Simply the best", body: "Compared three other metal art sellers before landing here and nothing came close. The quality-to-price ratio is unbeatable." },
]

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

export function getCampaignBySlug(slug: string) {
  return campaigns.find((campaign) => campaign.slug === slug)
}
