# Code Style

- Prefers component-based architecture, splitting the UI into one component per section/feature (and reusing shared pieces like a container, page shell, product card, section heading). Calls this their usual way of working. Confidence: 0.8
- Prefers using CSS variables and design tokens for theme values (colors, border-radius scale, etc.) defined centrally in the global CSS rather than hard-coded values inline in components. Confidence: 0.8
- Values semantic, honest copy over marketing fluff in UI (e.g., replacing "Your payment details are encrypted and secure" with "This is a demo checkout — no payment is processed or stored"). Confidence: 0.7
- Wants website content (product images, names/descriptions, business identity) grounded in the real business and actual products — e.g., swapping generic/placeholder product images for the user's real local photos and rewriting the whole site around what the business actually sells (laser-cut metal art, car logos, custom designs, custom sizes) rather than keeping demo content. Confidence: 0.7
- When rebranding/customizing a site, wants the change applied consistently across every surface — homepage, all pages, metadata, nav links, footer, contact details, cart/checkout/confirmation copy — with all stale placeholder references (old brands, Unsplash URLs, fake addresses/emails, demo categories) actively searched for and removed, not just the visible homepage updated. Confidence: 0.6
- Serves customers primarily in India — customer-facing order forms should default the country to India. Confidence: 0.5
