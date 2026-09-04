import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeftIcon, SparklesIcon, ShieldCheckIcon, StarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/site/theme-toggle"

export const metadata = {
  title: "Account | Flex Aura Metal Art",
  description: "Sign in or create your Flex Aura account to manage orders, track shipments, and request custom laser-cut metal art commissions.",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col lg:grid lg:grid-cols-12">
      {/* Form Column */}
      <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-12 lg:col-span-6 xl:col-span-5 relative z-10">
        {/* Top Header Navigation */}
        <header className="flex items-center justify-between gap-4 pb-6">
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground font-heading font-black text-sm tracking-widest shadow-xs">
              FA
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                Flex <span className="text-muted-foreground">Aura</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-muted-foreground font-medium">
                Laser-Cut Metal Art
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/" />}
              nativeButton={false}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <ArrowLeftIcon className="size-3.5" />
              <span className="hidden sm:inline">Store</span>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Auth Content Container */}
        <main className="flex-1 flex items-center justify-center py-6 sm:py-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Footer info */}
        <footer className="pt-6 border-t border-border/50 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Flex Aura Metal Art.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/about" className="hover:text-foreground transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Support</Link>
            <Link href="/custom-order" className="hover:text-foreground transition-colors">Custom Orders</Link>
          </div>
        </footer>
      </div>

      {/* Right Column: Premium Metal Art Showcase (Large Screens) */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative bg-neutral-800 text-white overflow-hidden flex-col justify-between p-12 xl:p-16 border-l border-border/20">
        {/* Background Artwork */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/products/product1.webp"
            alt="Porsche 911 GT3 RS Laser Cut Metal Wall Art"
            fill
            priority
            className="object-cover object-center opacity-45 scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Gradients to blend image cleanly into the luxury dark container */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </div>

        {/* Top Feature Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <Badge
            variant="outline"
            className="bg-white/10 backdrop-blur-md border-white/20 text-white px-3 py-1 text-xs gap-1.5 uppercase tracking-wider font-semibold"
          >
            <SparklesIcon className="size-3.5 text-amber-400" />
            Bespoke Metal Artistry
          </Badge>
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="size-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-white/80 ml-1 font-medium">4.9/5 (1,200+ Reviews)</span>
          </div>
        </div>

        {/* Center/Bottom Highlight Card */}
        <div className="relative z-10 max-w-xl space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight font-heading leading-tight text-white drop-shadow-sm">
              Art engineered with automotive obsession.
            </h2>
            <p className="text-sm xl:text-base text-neutral-300 leading-relaxed">
              Every silhouette is precision laser-cut from 2mm structural steel, hand-finished with an architectural matte black powder coat, and mounted with wall standoffs for deep dimensional drop shadows.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md p-3.5">
              <div className="flex items-center gap-2 text-white font-medium text-xs mb-1">
                <ShieldCheckIcon className="size-4 text-emerald-400" />
                Lifetime Rust Guarantee
              </div>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Industrial electrostatic coating resistant to indoor and patio humidity.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md p-3.5">
              <div className="flex items-center gap-2 text-white font-medium text-xs mb-1">
                <SparklesIcon className="size-4 text-sky-400" />
                Ambient Standoff Shadows
              </div>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Includes 1.5cm elevation spacers for realistic floating gallery presence.
              </p>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="border-l-2 border-primary/80 pl-4 py-1">
            <p className="text-xs text-neutral-300 italic">
              &ldquo;The finish and silhouette precision of the GT3 RS exceeded every expectation. It immediately became the focal point of my garage gallery.&rdquo;
            </p>
            <p className="text-[11px] text-neutral-400 font-medium mt-1">
              — Alexandre D., Verified Collector
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
