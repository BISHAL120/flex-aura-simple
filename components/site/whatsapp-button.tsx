import Link from "next/link"

const WHATSAPP_NUMBER = "+8801623939834" // country code + number, digits only
const WHATSAPP_MESSAGE = "Hi Flex Aura! I want to order a customized product."
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export function WhatsAppButton() {
  return (
    <Link
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
    >
      {/* WhatsApp glyph (not in lucide) */}
      <svg viewBox="0 0 32 32" className="size-6 fill-current" aria-hidden="true">
        <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.72 6.4L3.2 28.8l6.6-1.68a12.74 12.74 0 0 0 6.2 1.6h.01c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.72-12.81-12.72zm0 23.36h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.1 1.05 1.09-4-.25-.39a10.56 10.56 0 0 1-1.62-5.65c0-5.86 4.77-10.62 10.64-10.62 2.84 0 5.51 1.11 7.52 3.12a10.56 10.56 0 0 1 3.11 7.52c0 5.86-4.77 10.68-10.59 10.68zm5.82-7.95c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.34-.5-2.56-1.58-.94-.84-1.58-1.88-1.77-2.2-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.14 3.09 1.3 3.3c.16.21 2.25 3.44 5.45 4.82.76.33 1.36.53 1.82.68.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z" />
      </svg>
    </Link>
  )
}
