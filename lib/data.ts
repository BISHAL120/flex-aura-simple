export type Product = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  image: string
  images: string[]
  badge?: string
  variants: string[]
  rating: number
  reviewCount: number
  tags: string[]
}

export type HeroSlide = {
  id: string
  title: string
  subtitle: string
  image: string
  alt: string
  ctaLabel: string
  ctaHref: string
}

export type Campaign = {
  slug: string
  title: string
  description: string
  image: string
  discount: string
  ctaLabel: string
  productIds: string[]
}

export type Review = {
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

const img = (photoId: string, w = 1200) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&q=80`

export const products: Product[] = [
  {
    id: "p1",
    slug: "aurora-linen-shirt",
    name: "Aurora Linen Shirt",
    description: "Breathable, relaxed-fit linen shirt with a soft drape for warm days.",
    price: 49,
    compareAtPrice: 65,
    image: img("photo-1598033129183-c4f50c736f10"),
    images: [
      img("photo-1598033129183-c4f50c736f10"),
      img("photo-1434389677669-e08b4cac3105"),
      img("photo-1543076447-215ad9ba6923"),
    ],
    badge: "Best Seller",
    variants: ["S", "M", "L", "XL"],
    rating: 4.8,
    reviewCount: 214,
    tags: ["best-seller", "fashion", "summer-sale"],
  },
  {
    id: "p2",
    slug: "minimal-leather-tote",
    name: "Minimal Leather Tote",
    description: "Everyday tote in full-grain leather with an interior laptop sleeve.",
    price: 129,
    image: img("photo-1548036328-c9fa89d128fa"),
    images: [
      img("photo-1548036328-c9fa89d128fa"),
      img("photo-1627123424574-724758594e93"),
      img("photo-1553062407-98eeb64c6a62"),
    ],
    badge: "Best Seller",
    variants: ["Tan", "Black", "Olive"],
    rating: 4.9,
    reviewCount: 178,
    tags: ["best-seller", "accessories", "summer-sale"],
  },
  {
    id: "p3",
    slug: "sierra-travel-backpack",
    name: "Sierra Travel Backpack",
    description: "40L carry-on backpack with padded straps and weather-resistant shell.",
    price: 95,
    compareAtPrice: 120,
    image: img("photo-1553062407-98eeb64c6a62"),
    images: [
      img("photo-1553062407-98eeb64c6a62"),
      img("photo-1548036328-c9fa89d128fa"),
      img("photo-1627123424574-724758594e93"),
    ],
    badge: "-21%",
    variants: ["30L", "40L"],
    rating: 4.7,
    reviewCount: 342,
    tags: ["best-seller", "accessories", "summer-sale"],
  },
  {
    id: "p4",
    slug: "solace-ceramic-mug",
    name: "Solace Ceramic Mug",
    description: "Hand-glazed 12oz stoneware mug with a comfortable handle.",
    price: 18,
    image: img("photo-1514228742587-6b1558fcca3d"),
    images: [
      img("photo-1514228742587-6b1558fcca3d"),
      img("photo-1485955900006-10f4d324d411"),
      img("photo-1507473885765-e6ed057f782c"),
    ],
    variants: ["Sage", "Sand", "Slate"],
    rating: 4.6,
    reviewCount: 96,
    tags: ["best-seller", "home", "clearance"],
  },
  {
    id: "p5",
    slug: "hush-wireless-earbuds",
    name: "Hush Wireless Earbuds",
    description: "Active noise cancelling earbuds with 30h battery and wireless case.",
    price: 89,
    compareAtPrice: 119,
    image: img("photo-1590658268037-6bf12165a8df"),
    images: [
      img("photo-1590658268037-6bf12165a8df"),
      img("photo-1523275335684-37898b6baf30"),
      img("photo-1587829741301-dc798b83add3"),
    ],
    badge: "-25%",
    variants: ["White", "Black"],
    rating: 4.5,
    reviewCount: 421,
    tags: ["best-seller", "tech", "clearance"],
  },
  {
    id: "p6",
    slug: "drift-wool-blend-sweater",
    name: "Drift Wool-Blend Sweater",
    description: "Cozy merino-blend crewneck with ribbed cuffs and hem.",
    price: 74,
    image: img("photo-1434389677669-e08b4cac3105"),
    images: [
      img("photo-1434389677669-e08b4cac3105"),
      img("photo-1598033129183-c4f50c736f10"),
      img("photo-1543076447-215ad9ba6923"),
    ],
    variants: ["S", "M", "L", "XL"],
    rating: 4.7,
    reviewCount: 158,
    tags: ["best-seller", "fashion", "clearance"],
  },
  {
    id: "p7",
    slug: "ember-brass-lamp",
    name: "Ember Brass Lamp",
    description: "Warm ambient desk lamp with dimmable LED and solid brass base.",
    price: 68,
    compareAtPrice: 85,
    image: img("photo-1507473885765-e6ed057f782c"),
    images: [
      img("photo-1507473885765-e6ed057f782c"),
      img("photo-1514228742587-6b1558fcca3d"),
      img("photo-1485955900006-10f4d324d411"),
    ],
    badge: "-20%",
    variants: ["Brass", "Matte Black"],
    rating: 4.8,
    reviewCount: 87,
    tags: ["home", "summer-sale"],
  },
  {
    id: "p8",
    slug: "pulse-smart-watch",
    name: "Pulse Smart Watch",
    description: "Slim fitness watch with heart-rate tracking and 7-day battery.",
    price: 149,
    compareAtPrice: 199,
    image: img("photo-1523275335684-37898b6baf30"),
    images: [
      img("photo-1523275335684-37898b6baf30"),
      img("photo-1590658268037-6bf12165a8df"),
      img("photo-1587829741301-dc798b83add3"),
    ],
    badge: "New",
    variants: ["41mm", "45mm"],
    rating: 4.4,
    reviewCount: 302,
    tags: ["new-arrival", "tech"],
  },
  {
    id: "p9",
    slug: "terra-denim-jacket",
    name: "Terra Denim Jacket",
    description: "Classic trucker jacket in organic cotton denim with a lived-in wash.",
    price: 84,
    image: img("photo-1543076447-215ad9ba6923"),
    images: [
      img("photo-1543076447-215ad9ba6923"),
      img("photo-1598033129183-c4f50c736f10"),
      img("photo-1434389677669-e08b4cac3105"),
    ],
    badge: "New",
    variants: ["S", "M", "L", "XL"],
    rating: 4.6,
    reviewCount: 121,
    tags: ["new-arrival", "fashion"],
  },
  {
    id: "p10",
    slug: "nook-plant-pot",
    name: "Nook Plant Pot Set",
    description: "Matte ceramic pot trio with drainage trays for your indoor jungle.",
    price: 32,
    image: img("photo-1485955900006-10f4d324d411"),
    images: [
      img("photo-1485955900006-10f4d324d411"),
      img("photo-1514228742587-6b1558fcca3d"),
      img("photo-1507473885765-e6ed057f782c"),
    ],
    badge: "New",
    variants: ["Terracotta", "Cream", "Charcoal"],
    rating: 4.7,
    reviewCount: 64,
    tags: ["new-arrival", "home"],
  },
  {
    id: "p11",
    slug: "cinch-slim-wallet",
    name: "Cinch Slim Wallet",
    description: "RFID-blocking bifold wallet that fits card and cash with zero bulk.",
    price: 35,
    compareAtPrice: 45,
    image: img("photo-1627123424574-724758594e93"),
    images: [
      img("photo-1627123424574-724758594e93"),
      img("photo-1548036328-c9fa89d128fa"),
      img("photo-1553062407-98eeb64c6a62"),
    ],
    badge: "New",
    variants: ["Black", "Brown"],
    rating: 4.5,
    reviewCount: 143,
    tags: ["new-arrival", "accessories"],
  },
  {
    id: "p12",
    slug: "lumen-mechanical-keyboard",
    name: "Lumen Mechanical Keyboard",
    description: "Hot-swappable 75% keyboard with gasket mount and south-facing RGB.",
    price: 109,
    compareAtPrice: 139,
    image: img("photo-1587829741301-dc798b83add3"),
    images: [
      img("photo-1587829741301-dc798b83add3"),
      img("photo-1523275335684-37898b6baf30"),
      img("photo-1590658268037-6bf12165a8df"),
    ],
    badge: "-22%",
    variants: ["Black", "White"],
    rating: 4.8,
    reviewCount: 256,
    tags: ["tech", "summer-sale"],
  },
  {
    id: "p13",
    slug: "vale-oversized-blazer",
    name: "Vale Oversized Blazer",
    description: "Relaxed single-button blazer in a stretch wool blend.",
    price: 118,
    image: img("photo-1594938298603-c8148c4dae35"),
    images: [
      img("photo-1594938298603-c8148c4dae35"),
      img("photo-1598033129183-c4f50c736f10"),
      img("photo-1434389677669-e08b4cac3105"),
    ],
    variants: ["S", "M", "L"],
    rating: 4.3,
    reviewCount: 52,
    tags: ["fashion", "clearance"],
  },
  {
    id: "p14",
    slug: "grove-cedar-diffuser",
    name: "Grove Cedar Diffuser",
    description: "Slow-release reed diffuser with cedarwood and bergamot notes.",
    price: 26,
    compareAtPrice: 32,
    image: img("photo-1602874801007-bd458bb1b8b6"),
    images: [
      img("photo-1602874801007-bd458bb1b8b6"),
      img("photo-1514228742587-6b1558fcca3d"),
      img("photo-1507473885765-e6ed057f782c"),
    ],
    variants: ["Cedar", "Bergamot", "Eucalyptus"],
    rating: 4.6,
    reviewCount: 78,
    tags: ["home", "clearance"],
  },
]

export const heroSlides: HeroSlide[] = [
  {
    id: "h1",
    title: "Summer Sale — Up to 40% Off",
    subtitle:
      "Refresh your wardrobe and home with handpicked essentials. Limited time only.",
    image: img("photo-1441986300917-64674bd600d8", 2000),
    alt: "Bright summer fashion display",
    ctaLabel: "Shop Summer Sale",
    ctaHref: "/promotions/summer-sale",
  },
  {
    id: "h2",
    title: "New Season, New Arrivals",
    subtitle:
      "Discover the latest drops in tech, fashion and home — freshly added this week.",
    image: img("photo-1490481651871-ab68de25d43d", 2000),
    alt: "Latest collection lookbook",
    ctaLabel: "Explore New Arrivals",
    ctaHref: "/#new-arrivals",
  },
  {
    id: "h3",
    title: "Clearance Finds, Big Savings",
    subtitle:
      "End-of-line favorites at unbeatable prices while stock lasts.",
    image: img("photo-1441984904996-e0b6ba687e04", 2000),
    alt: "Stylish clearance items",
    ctaLabel: "Shop Clearance",
    ctaHref: "/promotions/clearance",
  },
]

export const campaigns: Campaign[] = [
  {
    slug: "summer-sale",
    title: "Summer Sale",
    description:
      "Up to 40% off selected fashion, accessories and home goods. Perfect for sun-ready styling.",
    image: img("photo-1441984904996-e0b6ba687e04", 1600),
    discount: "Up to 40% off",
    ctaLabel: "Shop Summer Sale",
    productIds: ["p1", "p2", "p3", "p7", "p12", "p4"],
  },
  {
    slug: "clearance",
    title: "Clearance Deals",
    description:
      "Final-chance pricing on outgoing lines. When they're gone, they're gone.",
    image: img("photo-1441986300917-64674bd600d8", 1600),
    discount: "Save up to 50%",
    ctaLabel: "Shop Clearance",
    productIds: ["p4", "p5", "p6", "p13", "p14", "p11"],
  },
]

export const reviews: Review[] = [
  { name: "Ava Thompson", rating: 5, date: "2026-07-28", title: "Exactly as pictured", body: "Quality is superb and the shipping was faster than promised. The fit is true to size and I get compliments every time I wear it." },
  { name: "Liam Carter", rating: 5, date: "2026-07-25", title: "New favorite brand", body: "I've ordered three times now and every single item has exceeded expectations. Customer support even helped me swap a size quickly." },
  { name: "Sofia Reyes", rating: 4, date: "2026-07-22", title: "Great value", body: "Lovely materials for the price. I wish there were more color options, but I'll definitely be back for the new arrivals." },
  { name: "Noah Bennett", rating: 5, date: "2026-07-19", title: "Perfect gift", body: "Bought the leather tote for my partner and it was an instant hit. Packaged beautifully with a handwritten note. Five stars." },
  { name: "Mia Nguyen", rating: 5, date: "2026-07-16", title: "Comfy and stylish", body: "The linen shirt is my go-to now. Lightweight, breathable, and it looks even better in person than in the photos." },
  { name: "Ethan Brooks", rating: 4, date: "2026-07-14", title: "Solid quality", body: "The backpack handles daily commuting easily. Zippers are smooth and the padding is comfortable. Would recommend." },
  { name: "Isabella Costa", rating: 5, date: "2026-07-11", title: "Fast delivery", body: "Ordered Monday, arrived Wednesday. The earbuds sound fantastic and the case is wonderfully compact." },
  { name: "James Okafor", rating: 5, date: "2026-07-08", title: "Worth every penny", body: "The mechanical keyboard is a dream to type on. Hot-swap sockets mean I can experiment with switches too." },
  { name: "Charlotte Duval", rating: 4, date: "2026-07-05", title: "Lovely home finds", body: "The brass lamp adds such a warm glow to my desk. Assembly took two minutes. Packaging was fully recyclable, which I loved." },
  { name: "Oliver Grant", rating: 5, date: "2026-07-02", title: "Great return policy", body: "Had to exchange a sweater for a smaller size and it was painless. The new one fits perfectly and feels premium." },
  { name: "Amelia Fisher", rating: 5, date: "2026-06-28", title: "Obsessed", body: "The plant pot set looks stunning on my windowsill. The glazes are unique and the drainage trays are a thoughtful touch." },
  { name: "Lucas Meyer", rating: 4, date: "2026-06-25", title: "Good purchase", body: "Smart watch battery genuinely lasts a week. Setup was easy and the app is clean. Wish the strap was a bit longer." },
  { name: "Harper Singh", rating: 5, date: "2026-06-22", title: "Beautiful denim", body: "The trucker jacket has the perfect lived-in wash. It's already my most-worn item this season." },
  { name: "Benjamin Fox", rating: 5, date: "2026-06-19", title: "Top tier service", body: "Asked a sizing question over email and got a detailed reply within an hour. The product arrived and it was perfect." },
  { name: "Zoe Patel", rating: 4, date: "2026-06-16", title: "Almost perfect", body: "Love the wallet's slim profile and the RFID protection. The leather is a little stiff at first but it softens up nicely." },
  { name: "Henry Clarke", rating: 5, date: "2026-06-13", title: "Repeat customer", body: "Fourth order from Flex Aura and still consistently great. Their summer sale is an absolute steal." },
  { name: "Ella Novak", rating: 5, date: "2026-06-10", title: "High quality", body: "The wool sweater is thick, warm and beautifully stitched. You can tell real care goes into every piece." },
  { name: "Daniel Kim", rating: 4, date: "2026-06-07", title: "Nice find", body: "The diffuser fills my living room with a subtle, natural scent. Lasts way longer than the cheap ones from big box stores." },
  { name: "Grace Albright", rating: 5, date: "2026-06-04", title: "Exceeded expectations", body: "The oversized blazer is exactly the relaxed silhouette I wanted. Fabric feels expensive and drapes beautifully." },
  { name: "Leo Martinez", rating: 5, date: "2026-06-01", title: "Smooth experience", body: "From checkout to unboxing, everything was seamless. The ceramic mug is my new desk companion." },
  { name: "Ruby Collins", rating: 4, date: "2026-05-28", title: "Very happy", body: "The sneakers look great and arrived in perfect condition. Sizing runs slightly big so size down if between sizes." },
  { name: "Arthur White", rating: 5, date: "2026-05-25", title: "Outstanding", body: "Customer support helped me track my order and even followed up after delivery. Rare to see that level of care." },
  { name: "Luna Rossi", rating: 5, date: "2026-05-22", title: "Gorgeous pieces", body: "Every item feels curated, not mass produced. You can really taste the difference with this brand." },
  { name: "Owen Price", rating: 4, date: "2026-05-19", title: "Great overall", body: "Shipping took a couple days longer than expected but the product quality made up for it. Would order again." },
  { name: "Stella Grant", rating: 5, date: "2026-05-16", title: "Fan for life", body: "The tote, the mug, the jacket — everything I've bought has been impeccable. Flex Aura is now my default store." },
  { name: "Marcus Webb", rating: 5, date: "2026-05-13", title: "Simply the best", body: "I compared three other brands before landing here and nothing came close. The quality-to-price ratio is unbeatable." },
]

export const faqs: FAQ[] = [
  {
    question: "How long does shipping take?",
    answer:
      "Orders ship within 1–2 business days. Standard delivery takes 3–5 business days, and express delivery takes 1–2 business days. Free standard shipping applies to all orders over $50.",
  },
  {
    question: "What is your return policy?",
    answer:
      "You have 30 days from delivery to return any item in its original condition for a full refund. Returns are free — just start a return from your account or contact support and we'll send a prepaid label.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to over 40 countries. Shipping costs and delivery times are calculated at checkout. Duties and taxes are shown before you pay, so there are never surprise fees.",
  },
  {
    question: "How do I find my correct size?",
    answer:
      "Every product page includes a detailed size guide with measurements in both inches and centimeters. If you're between sizes, most customers size down for a snug fit. You can also reach out and we'll help you measure.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Absolutely. As soon as your order ships you'll receive an email with a tracking link, and you can follow progress in real time from your account dashboard.",
  },
  {
    question: "Are my payment details secure?",
    answer:
      "Yes. All transactions are encrypted with industry-standard TLS and processed through PCI-DSS compliant payment providers. We never store your card details on our servers.",
  },
]

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getCampaignBySlug(slug: string) {
  return campaigns.find((c) => c.slug === slug)
}

export function getProductsByIds(ids: string[]) {
  return products.filter((p) => ids.includes(p.id))
}

export function getBestSellers() {
  return products.filter((p) => p.tags.includes("best-seller"))
}

export function getNewArrivals() {
  return products.filter((p) => p.tags.includes("new-arrival"))
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}
