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
