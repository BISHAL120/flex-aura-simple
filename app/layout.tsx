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
  title: "Flex Aura — Shop the Collection",
  description:
    "Flex Aura is your destination for curated fashion, accessories, home and tech. Best sellers, new arrivals and seasonal deals.",
  openGraph: {
    title: "Flex Aura — Shop the Collection",
    description:
      "Curated fashion, accessories, home and tech. Best sellers, new arrivals and seasonal deals.",
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
