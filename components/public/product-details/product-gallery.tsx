"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = React.useState(0)

  function step(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + images.length) % images.length)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg border bg-muted sm:max-w-lg">
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`${name} — image ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            aria-hidden={index !== activeIndex}
            className={cn(
              "object-cover transition-opacity duration-300",
              index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          />
        ))}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => step(-1)}
              className="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-sm transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => step(1)}
              className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-sm transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {/* Thumbnails */}
      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label="Product images"
          className="flex w-full max-w-md justify-start gap-2 overflow-x-auto pb-1 sm:max-w-lg sm:justify-center"
        >
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square w-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-16 md:w-20",
                index === activeIndex
                  ? "border-foreground"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
