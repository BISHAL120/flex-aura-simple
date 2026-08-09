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

/** Local product images live in /public/products. */
const productImg = (file: string) => `/products/${file}`

export const products: Product[] = [
  {
    id: "p1",
    slug: "porsche-911-gt3-rs-rear",
    name: "Porsche 911 GT3 RS — Rear",
    description:
      "The unmistakable rear of the GT3 RS — big wing, wide haunches and centre exhaust — precision laser-cut from 2mm metal.",
    price: 89,
    compareAtPrice: 109,
    image: productImg("product1.webp"),
    images: [productImg("product1.webp")],
    badge: "Best Seller",
    variants: ["30\" × 18.5\""],
    rating: 4.9,
    reviewCount: 214,
    tags: ["best-seller", "porsche", "car"],
  },
  {
    id: "p2",
    slug: "porsche-911-gt3-rs-side",
    name: "Porsche 911 GT3 RS — Side Profile",
    description:
      "Sleek side profile of the GT3 RS with its signature aero lines, cut in flowing line-art from 2mm powder-coated metal.",
    price: 99,
    image: productImg("product2.webp"),
    images: [productImg("product2.webp")],
    badge: "New",
    variants: ["36\" × 10.5\""],
    rating: 4.8,
    reviewCount: 178,
    tags: ["new-arrival", "porsche", "car"],
  },
  {
    id: "p3",
    slug: "chevrolet-corvette-c8",
    name: "Chevrolet Corvette C8",
    description:
      "Mid-engine icon in a bold three-quarter view. Clean lines, sharp angles — a showpiece for any garage or man cave.",
    price: 95,
    compareAtPrice: 120,
    image: productImg("product3.webp"),
    images: [productImg("product3.webp")],
    badge: "-21%",
    variants: ["36\" × 13.5\""],
    rating: 4.7,
    reviewCount: 342,
    tags: ["best-seller", "chevrolet", "car"],
  },
  {
    id: "p4",
    slug: "bmw-m3-g80-front",
    name: "BMW M3 G80 — Front",
    description:
      "The aggressive face of the M3 G80, with its huge kidney grilles and sharp headlights, rendered in black metal line-art.",
    price: 92,
    image: productImg("product4.webp"),
    images: [productImg("product4.webp")],
    badge: "New",
    variants: ["30\" × 20.5\""],
    rating: 4.6,
    reviewCount: 96,
    tags: ["new-arrival", "bmw", "car"],
  },
  {
    id: "p5",
    slug: "nissan-gtr-r35-side",
    name: "Nissan GT-R R35 — Side",
    description:
      "Godzilla in line-art form. The R35's muscular silhouette and iconic details cut from 2mm premium black metal.",
    price: 85,
    compareAtPrice: 105,
    image: productImg("product5.jpeg"),
    images: [productImg("product5.jpeg")],
    badge: "Best Seller",
    variants: ["30\" × 12.5\""],
    rating: 4.8,
    reviewCount: 421,
    tags: ["best-seller", "nissan", "car"],
  },
  {
    id: "p6",
    slug: "audi-a3",
    name: "Audi A3 — Side",
    description:
      "A refined side profile of the Audi A3 Sportback, balancing the brand's precise, understated design language.",
    price: 88,
    image: productImg("product6.jpeg"),
    images: [productImg("product6.jpeg")],
    variants: ["30\" × 16.5\""],
    rating: 4.7,
    reviewCount: 158,
    tags: ["audi", "car"],
  },
  {
    id: "p7",
    slug: "mercedes-amg-sl63",
    name: "Mercedes-AMG SL63",
    description:
      "Open-top elegance. The SL63's long bonnet and muscular haunches in flowing black metal line-art with a floating 3D effect.",
    price: 97,
    compareAtPrice: 119,
    image: productImg("product7.jpeg"),
    images: [productImg("product7.jpeg")],
    badge: "-18%",
    variants: ["30\" × 12.5\""],
    rating: 4.8,
    reviewCount: 87,
    tags: ["mercedes", "car"],
  },
  {
    id: "p8",
    slug: "nissan-gtr-rear",
    name: "Nissan GT-R — Rear",
    description:
      "Round tail-lights, diffuser and that famous wing. The GT-R rear view is a legend in itself — now on your wall.",
    price: 84,
    image: productImg("product8.jpeg"),
    images: [productImg("product8.jpeg")],
    variants: ["30\" × 12.5\""],
    rating: 4.5,
    reviewCount: 302,
    tags: ["nissan", "car"],
  },
  {
    id: "p9",
    slug: "f22-raptor",
    name: "F-22 Raptor — Top View",
    description:
      "Aviation meets metal. The Raptor's diamond wings and twin tails in a striking top-down line-art cutout.",
    price: 110,
    image: productImg("product9.jpeg"),
    images: [productImg("product9.jpeg")],
    badge: "New",
    variants: ["36\" × 16\""],
    rating: 4.9,
    reviewCount: 121,
    tags: ["new-arrival", "aviation"],
  },
  {
    id: "p10",
    slug: "porsche-911-gt3-rs-front",
    name: "Porsche 911 GT3 RS — Front",
    description:
      "Low, wide and purposeful. The GT3 RS front end with its huge intakes and splitter, precision-cut in black metal.",
    price: 91,
    image: productImg("product10.jpeg"),
    images: [productImg("product10.jpeg")],
    variants: ["30\" × 12.5\""],
    rating: 4.7,
    reviewCount: 64,
    tags: ["porsche", "car"],
  },
  {
    id: "p11",
    slug: "dodge-charger-1970",
    name: "1970 Dodge Charger",
    description:
      "Classic muscle. The iconic 1970 Charger with its aggressive stance and signature grille in bold metal silhouette.",
    price: 105,
    image: productImg("product11.jpeg"),
    images: [productImg("product11.jpeg")],
    badge: "Classic",
    variants: ["36\" × 14\""],
    rating: 4.8,
    reviewCount: 143,
    tags: ["dodge", "muscle", "car"],
  },
  {
    id: "p12",
    slug: "optical-illusion",
    name: "Optical Illusion",
    description:
      "A hypnotic geometric vortex that plays with depth and movement. Pure abstract metal art for modern spaces.",
    price: 75,
    image: productImg("product12.jpeg"),
    images: [productImg("product12.jpeg")],
    variants: ["24\" × 24\""],
    rating: 4.6,
    reviewCount: 256,
    tags: ["abstract", "home"],
  },
  {
    id: "p13",
    slug: "porsche-911-side",
    name: "Porsche 911 — Side",
    description:
      "The timeless 911 profile — flowing roofline, round headlight era, rear-engine stance — in minimalist line-art.",
    price: 89,
    image: productImg("product13.jpeg"),
    images: [productImg("product13.jpeg")],
    badge: "Best Seller",
    variants: ["36\" × 10\""],
    rating: 4.8,
    reviewCount: 312,
    tags: ["best-seller", "porsche", "car"],
  },
  {
    id: "p14",
    slug: "nissan-gtr-r35-36",
    name: "Nissan GT-R R35 — 36\"",
    description:
      "A longer, grander take on the R35 silhouette for bigger walls. Same precision cut, more presence.",
    price: 115,
    image: productImg("product14.jpeg"),
    images: [productImg("product14.jpeg")],
    variants: ["36\" × 10\""],
    rating: 4.7,
    reviewCount: 98,
    tags: ["nissan", "car"],
  },
  {
    id: "p15",
    slug: "toyota-supra-mk4",
    name: "1998 Toyota Supra MK4",
    description:
      "JDM royalty. The legendary MK4 Supra in sleek line-art, celebrating the icon of the 90s and the big screen.",
    price: 108,
    image: productImg("product15.jpeg"),
    images: [productImg("product15.jpeg")],
    badge: "Icon",
    variants: ["36\" × 10\""],
    rating: 4.9,
    reviewCount: 187,
    tags: ["toyota", "jdm", "car"],
  },
  {
    id: "p16",
    slug: "bugatti-chiron",
    name: "Bugatti Chiron — Custom",
    description:
      "Eight-litres of French hypercar. The Chiron's dramatic silhouette in flowing black metal, custom-cut to order.",
    price: 135,
    image: productImg("product16.jpeg"),
    images: [productImg("product16.jpeg")],
    badge: "Custom",
    variants: ["Custom size"],
    rating: 4.9,
    reviewCount: 76,
    tags: ["bugatti", "hypercar", "car", "custom"],
  },
  {
    id: "p17",
    slug: "khalid-hero-backlit",
    name: "Khalid Hero — Backlit Bike",
    description:
      "A custom backlit motorcycle piece with a rider in full gear. Warm LED glow brings the cutout to life at night.",
    price: 149,
    image: productImg("product17.jpeg"),
    images: [productImg("product17.jpeg")],
    badge: "Backlit",
    variants: ["Custom size"],
    rating: 5.0,
    reviewCount: 41,
    tags: ["custom", "backlit", "motorcycle", "led"],
  },
  {
    id: "p18",
    slug: "xtreme-backlit-bike",
    name: "XTREME — Backlit Sport Bike",
    description:
      "Streetfighter attitude in black metal with warm LED backlighting. A statement piece for riders and garages.",
    price: 139,
    image: productImg("product18.jpeg"),
    images: [productImg("product18.jpeg")],
    badge: "Backlit",
    variants: ["Custom size"],
    rating: 4.9,
    reviewCount: 33,
    tags: ["custom", "backlit", "motorcycle", "led"],
  },
  {
    id: "p19",
    slug: "rajib-jenny-couple",
    name: "Rajib & Jenny — Couple Art",
    description:
      "A personalised couple's piece — two hands forming a heart, names and a date laser-cut with warm LED backlight.",
    price: 129,
    image: productImg("product19.jpeg"),
    images: [productImg("product19.jpeg")],
    badge: "Personalised",
    variants: ["Custom size"],
    rating: 5.0,
    reviewCount: 28,
    tags: ["custom", "backlit", "personalised", "led"],
  },
  {
    id: "p20",
    slug: "dr-atiya-medical-sign",
    name: "Dr. Atiya — Clinic Sign",
    description:
      "A professional backlit clinic sign — stethoscope with floral scrollwork and a name, laser-cut and LED-lit.",
    price: 119,
    image: productImg("product20.webp"),
    images: [productImg("product20.webp")],
    badge: "Business",
    variants: ["Custom size"],
    rating: 4.8,
    reviewCount: 19,
    tags: ["custom", "backlit", "business", "led"],
  },
  {
    id: "p21",
    slug: "land-cruiser-80-backlit",
    name: "Land Cruiser 80 — Backlit",
    description:
      "The go-anywhere 80 Series in black metal with warm LED glow — built for the off-road enthusiast's wall.",
    price: 155,
    image: productImg("product21.jpg"),
    images: [productImg("product21.jpg")],
    badge: "Backlit",
    variants: ["Custom size"],
    rating: 4.9,
    reviewCount: 52,
    tags: ["custom", "backlit", "suv", "led"],
  },
  {
    id: "p22",
    slug: "only-sukoon-sign",
    name: "Only Sukoon — Logo Sign",
    description:
      "A brand sign for Only Sukoon — elegant intertwined monogram with warm LED backlight. Custom logos welcome.",
    price: 125,
    image: productImg("product22.jpg"),
    images: [productImg("product22.jpg")],
    badge: "Custom Logo",
    variants: ["Custom size"],
    rating: 4.9,
    reviewCount: 24,
    tags: ["custom", "backlit", "business", "logo", "led"],
  },
  {
    id: "p23",
    slug: "kolkata-barbershop-sign",
    name: "Kolkata Hair Fashion — Sign",
    description:
      "A barbershop classic — two profiles, crossed scissors and razor, with the name cut out and backlit in warm LED.",
    price: 129,
    image: productImg("product23.jpg"),
    images: [productImg("product23.jpg")],
    badge: "Business",
    variants: ["Custom size"],
    rating: 4.7,
    reviewCount: 15,
    tags: ["custom", "backlit", "business", "led"],
  },
  {
    id: "p24",
    slug: "harley-street-glide",
    name: "Harley Street Glide",
    description:
      "Born to be wild. The Street Glide's long, low cruiser lines in flowing black metal line-art with saddlebags and fairing.",
    price: 98,
    image: productImg("product24.jpg"),
    images: [productImg("product24.jpg")],
    badge: "New",
    variants: ["36\" × 12\""],
    rating: 4.8,
    reviewCount: 67,
    tags: ["new-arrival", "harley", "motorcycle"],
  },
  {
    id: "p25",
    slug: "lamborghini-aventador",
    name: "Lamborghini Aventador",
    description:
      "The Aventador's razor-edged silhouette in black metal — pure drama, pure V12. A statement piece for any wall.",
    price: 112,
    image: productImg("product25.jpg"),
    images: [productImg("product25.jpg")],
    badge: "Best Seller",
    variants: ["36\" × 14\""],
    rating: 4.9,
    reviewCount: 203,
    tags: ["best-seller", "lamborghini", "car"],
  },
  {
    id: "p26",
    slug: "dodge-challenger-scat-pack",
    name: "Dodge Challenger Scat Pack",
    description:
      "Modern muscle with a mean face. The Challenger Scat Pack's broad stance and hood scoops in bold metal cut.",
    price: 102,
    image: productImg("product26.jpg"),
    images: [productImg("product26.jpg")],
    variants: ["36\" × 13\""],
    rating: 4.7,
    reviewCount: 89,
    tags: ["dodge", "muscle", "car"],
  },
  {
    id: "p27",
    slug: "sportbike-line-art",
    name: "Sport Bike — Line Art",
    description:
      "A naked sportbike in minimalist line-art, cut from 2mm black metal. Built for riders who love clean design.",
    price: 92,
    image: productImg("product27.jpg"),
    images: [productImg("product27.jpg")],
    variants: ["30\" × 11\""],
    rating: 4.8,
    reviewCount: 54,
    tags: ["motorcycle"],
  },
]

export const heroSlides: HeroSlide[] = [
  {
    id: "h1",
    title: "Laser-Cut Metal Art",
    subtitle:
      "Precision-cut 2mm steel wall art of your favourite cars, bikes and custom designs — finished in premium black powder coat.",
    image: productImg("product1.webp"),
    alt: "Porsche 911 GT3 RS laser-cut black metal wall art",
    ctaLabel: "Shop the Collection",
    ctaHref: "/shop",
  },
  {
    id: "h2",
    title: "Custom & Backlit Pieces",
    subtitle:
      "Names, logos, dates and designs — we cut it in metal and light it with warm LEDs. Made to your exact spec.",
    image: productImg("product19.jpeg"),
    alt: "Custom couple's metal art with warm LED backlight",
    ctaLabel: "Start a Custom Order",
    ctaHref: "/contact",
  },
  {
    id: "h3",
    title: "Made to Your Size",
    subtitle:
      "Every piece can be custom-sized to fit your wall. Choose any car, bike or design — we'll cut it just for you.",
    image: productImg("product5.jpeg"),
    alt: "Nissan GT-R R35 black metal wall art",
    ctaLabel: "Explore Custom Sizes",
    ctaHref: "/shop",
  },
]

export const campaigns: Campaign[] = [
  {
    slug: "custom-metal-art",
    title: "Custom Metal Art",
    description:
      "Send us any car, bike, logo, name or design — we laser-cut it in 2mm metal with your choice of size and finish.",
    image: productImg("product19.jpeg"),
    discount: "Custom order",
    ctaLabel: "Order custom art",
    productIds: ["p16", "p17", "p18", "p19", "p22", "p23"],
  },
  {
    slug: "backlit-collection",
    title: "Backlit LED Collection",
    description:
      "Our backlit range glows with warm LED light — custom bikes, signs and personal pieces that come alive at night.",
    image: productImg("product17.jpeg"),
    discount: "Backlit LED",
    ctaLabel: "Shop backlit",
    productIds: ["p17", "p18", "p20", "p21", "p22", "p23"],
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
