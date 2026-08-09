import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { StoreProvider } from "@/components/store-provider"
import { CartSheet } from "@/components/site/cart-sheet"
import { Toaster } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
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
