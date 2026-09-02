import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { StoreProvider } from "@/components/store-provider"
import { CartSheet } from "@/components/site/cart-sheet"
import { Toaster } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontHeading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata = {
  title: "Flex Aura — Laser-Cut Metal Art",
  description:
    "Precision laser-cut 2mm metal wall art of your favourite cars, bikes and custom designs. Premium black powder coat, custom sizes, backlit LED options.",
  openGraph: {
    title: "Flex Aura — Laser-Cut Metal Art",
    description:
      "Laser-cut 2mm metal wall art — cars, bikes, custom designs and backlit LED pieces, made to order in your size.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontHeading.variable,
        fontMono.variable,
        "font-sans"
      )}
    >
      <body>
        <ThemeProvider>
          <StoreProvider>
            {children}
            <CartSheet />
            <Toaster />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
