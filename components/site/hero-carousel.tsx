"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { heroSlides } from "@/lib/data"

const AUTOPLAY_MS = 5000

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>(undefined)
  const [current, setCurrent] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  // Bumped on manual interactions so the autoplay timer restarts and never
  // double-scrolls right after a user click.
  const [interactionKey, setInteractionKey] = React.useState(0)
  // Respect prefers-reduced-motion: never auto-advance for those users.
  const [reduceMotion, setReduceMotion] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    queueMicrotask(() => setReduceMotion(mq.matches))
    const onChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  React.useEffect(() => {
    if (!api || paused || reduceMotion) return
    const timer = window.setInterval(() => {
      api.scrollNext()
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [api, paused, interactionKey, reduceMotion])

  function handleManualInteraction(action: () => void) {
    setInteractionKey((key) => key + 1)
    action()
  }

  return (
    <section
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        aria-label="Featured promotions"
        className="mx-auto w-full max-w-[1500px] overflow-hidden"
      >
        <CarouselContent className="-ml-0">
          {heroSlides.map((slide, slideIndex) => (
            <CarouselItem key={slide.id} className="pl-0">
              <div className="relative h-[420px] sm:h-[480px] lg:h-[560px]">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={slideIndex === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="max-w-xl text-white">
                      {slideIndex === 0 ? (
                        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                          {slide.title}
                        </h1>
                      ) : (
                        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                          {slide.title}
                        </h2>
                      )}
                      <p className="mt-4 text-sm text-white/80 sm:text-base">
                        {slide.subtitle}
                      </p>
                      <Button
                        render={<Link href={slide.ctaHref} />}
                        nativeButton={false}
                        size="lg"
                        className="group/cta mt-6 bg-white text-black hover:bg-white/90"
                      >
                        {slide.ctaLabel}
                        <ArrowRightIcon className="transition-transform group-hover/cta:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Sliding prev/next buttons */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => handleManualInteraction(() => api?.scrollPrev())}
          className="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur transition-colors hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none sm:left-6"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => handleManualInteraction(() => api?.scrollNext())}
          className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur transition-colors hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none sm:right-6"
        >
          <ChevronRightIcon className="size-5" />
        </button>

        {/* Slider indicator (dots) */}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={current === index ? "true" : undefined}
              onClick={() => handleManualInteraction(() => api?.scrollTo(index))}
              className={cn(
                "h-2 rounded-full p-2 -m-2 transition-all focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none bg-clip-content",
                current === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      </Carousel>
    </section>
  )
}
