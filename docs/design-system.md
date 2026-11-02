# GROZO original brand and UI system

Brand: GROZO. Tagline: Daily Needs. Delivered Faster.

assets/brand/logo.svg is an original geometric shopping-bag/leaf mark, green wordmark and orange accent. It contains no copied proprietary logo or remote assets. Retain its clear space and accessible text alternative; review trademark availability separately before commercial release.

## Tokens

assets/brand/tokens.json defines semantic color, radius, spacing and typography tokens. Use fresh green for primary actions, dark green for text, orange as an accent and pale neutral surfaces. Primary text on white must meet WCAG contrast targets; orange is decorative or paired with dark text rather than used as small white-on-orange text.

Start with system fonts to avoid unreviewed font dependencies. Devanagari text should use an available system fallback; verify real Hindi layout before release. Use 4/8-pixel spacing, 12–20-pixel card radii and at least 48-pixel touch targets. Reserve motion for feedback; respect reduced-motion settings.

## Customer design

Location and service availability are primary context. Home: location header, search, original seasonal banner, 12 category entries, essentials and genuine offers. Product cards show image/alt, product/brand, quantity, selling price, MRP, discount, stock and quantity/add control. Product details expose ingredients/descriptions and related products only when catalogue records exist.

Cart clearly separates item savings, coupon, tax included, delivery and payable. Explain minimum/maximum/serviceability before checkout. Address form supports house and landmark details plus map selection when connected. Payment and tracking show explicit unavailable/failed/stale states. Realistic estimates depend on actual operations.

## Admin and rider

Admin uses a compact desktop sidebar and mobile navigation with clear status filters, readable tables, change confirmation for sensitive actions and audit reasons. Chart empty states say no records; no hardcoded live statistics. Rider interface uses large controls, visible pickup/delivery details and a clear location-sharing indicator/stop behavior. Contact actions only reveal authorized current-task information.

## Required states and accessibility

Every screen must cover loading, empty, offline, permission denied, validation failure, provider unavailable, success and retry. Keep focus visible and return it after modal closure. Associate inputs/errors, announce cart/order changes accessibly, label icon buttons, support keyboard use and test screen-reader flow. Web dark-mode tokens are prepared; the current website/admin remain light. Native Compose uses light/dark system schemes, with physical-device visual validation pending.

## Asset provenance

Stage 2 adds original source-native product/category/hero illustrations in React and Compose. Real product photographs and commercial campaign media remain pending. Use owner-supplied images with rights records or appropriately licensed acquisitions; do not scrape competitors. The SVG logo is source, not an Android launcher icon asset set.
