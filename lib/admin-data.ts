export type OrderStatus =
  | "pending"
  | "processing"
  | "in-production"
  | "powder-coating"
  | "shipped"
  | "delivered"
  | "cancelled"

export type PaymentStatus = "paid" | "pending" | "refunded"

export type OrderItem = {
  productId: string
  productName: string
  productImage: string
  variant: string
  quantity: number
  price: number
}

export type AdminOrder = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: {
    street: string
    city: string
    zip: string
    country: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  trackingNumber?: string
  notes?: string
  createdAt: string
}

export type StoreSettings = {
  storeName: string
  contactEmail: string
  contactPhone: string
  whatsappNumber: string
  freeShippingThreshold: number
  flatShippingFee: number
  currency: string
  currencySymbol: string
  workshopLeadTime: string
  enableInternationalShipping: boolean
  maintenanceMode: boolean
}

export const initialOrders: AdminOrder[] = [
  {
    id: "ord-101",
    orderNumber: "FA-9842A1",
    customerName: "Alexandre Dumas",
    customerEmail: "alex.dumas@gmail.com",
    customerPhone: "+1 (555) 234-5678",
    shippingAddress: {
      street: "742 Evergreen Terrace",
      city: "Austin",
      zip: "78701",
      country: "United States",
    },
    items: [
      {
        productId: "p1",
        productName: "Porsche 911 GT3 RS — Rear",
        productImage: "",
        variant: '30" × 18.5"',
        quantity: 1,
        price: 89,
      },
      {
        productId: "p5",
        productName: "Nissan GT-R R35 — Side",
        productImage: "",
        variant: '30" × 12.5"',
        quantity: 1,
        price: 85,
      },
    ],
    subtotal: 174,
    shipping: 0,
    total: 174,
    status: "in-production",
    paymentStatus: "paid",
    paymentMethod: "Credit Card (Visa ···· 4242)",
    notes: "Customer requested 16cm wall spacers included.",
    createdAt: "2026-08-30T14:22:00Z",
  },
  {
    id: "ord-102",
    orderNumber: "FA-7712B9",
    customerName: "Liam Carter",
    customerEmail: "liam.carter@outlook.com",
    customerPhone: "+44 20 7946 0912",
    shippingAddress: {
      street: "14 Baker Mews",
      city: "London",
      zip: "W1U 3BW",
      country: "United Kingdom",
    },
    items: [
      {
        productId: "p17",
        productName: "Khalid Hero — Backlit Bike",
        productImage: "",
        variant: "Medium",
        quantity: 1,
        price: 149,
      },
    ],
    subtotal: 149,
    shipping: 0,
    total: 149,
    status: "powder-coating",
    paymentStatus: "paid",
    paymentMethod: "PayPal",
    createdAt: "2026-08-29T18:45:00Z",
  },
  {
    id: "ord-103",
    orderNumber: "FA-6381C4",
    customerName: "Elena Rostova",
    customerEmail: "elena.rostova@techcorp.io",
    customerPhone: "+49 30 1234567",
    shippingAddress: {
      street: "Friedrichstraße 43",
      city: "Berlin",
      zip: "10117",
      country: "Germany",
    },
    items: [
      {
        productId: "p25",
        productName: "Lamborghini Aventador",
        productImage: "",
        variant: '36" × 14"',
        quantity: 1,
        price: 112,
      },
    ],
    subtotal: 112,
    shipping: 0,
    total: 112,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit Card (Mastercard ···· 8812)",
    trackingNumber: "DHL-982341772DE",
    createdAt: "2026-08-28T09:15:00Z",
  },
  {
    id: "ord-104",
    orderNumber: "FA-5520D8",
    customerName: "Tanvir Rahman",
    customerEmail: "tanvir.r@gmail.com",
    customerPhone: "+880 1711-223344",
    shippingAddress: {
      street: "House 24, Road 11, Banani",
      city: "Dhaka",
      zip: "1213",
      country: "Bangladesh",
    },
    items: [
      {
        productId: "p15",
        productName: "1998 Toyota Supra MK4",
        productImage: "",
        variant: '36" × 10"',
        quantity: 2,
        price: 108,
      },
    ],
    subtotal: 216,
    shipping: 0,
    total: 216,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Cash on Delivery",
    trackingNumber: "REDX-8821943",
    createdAt: "2026-08-26T11:30:00Z",
  },
  {
    id: "ord-105",
    orderNumber: "FA-4419E2",
    customerName: "Sophia Reyes",
    customerEmail: "sophia.reyes@yahoo.com",
    customerPhone: "+1 (305) 987-6543",
    shippingAddress: {
      street: "1200 Ocean Drive, Apt 4B",
      city: "Miami",
      zip: "33139",
      country: "United States",
    },
    items: [
      {
        productId: "p12",
        productName: "Optical Illusion",
        productImage: "",
        variant: '19" × 19"',
        quantity: 1,
        price: 64,
      },
    ],
    subtotal: 64,
    shipping: 0,
    total: 64,
    status: "pending",
    paymentStatus: "paid",
    paymentMethod: "Apple Pay",
    createdAt: "2026-08-30T19:10:00Z",
  },
  {
    id: "ord-106",
    orderNumber: "FA-3108F7",
    customerName: "Kenji Sato",
    customerEmail: "kenji.sato@garage-works.jp",
    customerPhone: "+81 3 5555 0143",
    shippingAddress: {
      street: "2-14-1 Shibuya",
      city: "Tokyo",
      zip: "150-0002",
      country: "Japan",
    },
    items: [
      {
        productId: "p3",
        productName: "Chevrolet Corvette C8",
        productImage: "",
        variant: '43" × 16"',
        quantity: 1,
        price: 114,
      },
      {
        productId: "p24",
        productName: "Harley Street Glide",
        productImage: "",
        variant: '36" × 12"',
        quantity: 1,
        price: 98,
      },
    ],
    subtotal: 212,
    shipping: 0,
    total: 212,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit Card (Amex ···· 3001)",
    trackingNumber: "FEDEX-9988112344",
    createdAt: "2026-08-27T16:00:00Z",
  },
]

export const initialStoreSettings: StoreSettings = {
  storeName: "Flex Aura Metal Art",
  contactEmail: "hello@flexaurametal.com",
  contactPhone: "+880 1623-939834",
  whatsappNumber: "+8801623939834",
  freeShippingThreshold: 50,
  flatShippingFee: 9.99,
  currency: "USD",
  currencySymbol: "$",
  workshopLeadTime: "1–2 days stock / 3–5 days custom",
  enableInternationalShipping: true,
  maintenanceMode: false,
}

export const revenueMonthlyData = [
  { month: "Mar", revenue: 24500, orders: 218, customOrders: 18 },
  { month: "Apr", revenue: 28900, orders: 254, customOrders: 22 },
  { month: "May", revenue: 31200, orders: 278, customOrders: 29 },
  { month: "Jun", revenue: 36800, orders: 320, customOrders: 34 },
  { month: "Jul", revenue: 39400, orders: 352, customOrders: 38 },
  { month: "Aug", revenue: 42850, orders: 384, customOrders: 42 },
]

export const categorySalesData = [
  { name: "Cars", value: 58, count: 224, fill: "var(--color-chart-1)" },
  { name: "Motorcycles", value: 22, count: 84, fill: "var(--color-chart-2)" },
  { name: "Backlit & Custom", value: 14, count: 54, fill: "var(--color-chart-3)" },
  { name: "Aviation & Abstract", value: 6, count: 22, fill: "var(--color-chart-4)" },
]
