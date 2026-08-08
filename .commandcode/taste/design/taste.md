# Design

- Prefers simple design and layout — "keep it simple" in terms of design. Confidence: 0.8
- Wants designs responsive across mobile, tablet, laptop, and large monitor screens, with a hamburger menu on mobile and proper navigation on all devices. Confidence: 0.9
- Prefers page content in a centered max-width container (mx-auto), e.g., a 1500px cap with horizontal padding. Confidence: 0.7
- Prefers subtle border radius on cards and controls — visibly rounded but restrained; explicitly rejects overly large radii ("too much") and fully flat/square corners ("don't fully remove"). Confidence: 0.9
- Prefers product cards in a grid to be uniform in height with titles clamped to a max of 2 lines, so cards with 1-line and 2-line titles render identically and the grid rows stay aligned (no "broken" layout). Confidence: 0.8
- Prefers the primary card action (e.g., Add to Cart) pinned to the very bottom of the card, full-width, and with a generous/tall height so buttons align and stay prominent across all cards. Confidence: 0.7
- Prefers border radius defined as a small set of reusable utility classes (e.g., `.radius-sm`/`.radius-md`/`.radius-lg`) in the global CSS and applied via CSS classes, rather than hard-coded radius values inline in each component. Confidence: 0.8
- Wants complete end-to-end purchase flows from the customer's perspective: an auto-opening cart sheet on add-to-cart (with quantity +/−, remove, view cart/checkout), a full cart page, a checkout with customer details + payment, and an order confirmation — not just a toast or stub. Confidence: 0.8
