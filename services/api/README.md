# Shared catalogue API — read-only testing service

Run `node services/api/server.mjs` with Node 24.12+ (24.x). Default bind is 127.0.0.1:4000. Set API_HOST=0.0.0.0 only behind a correctly configured HTTPS reverse proxy. Exact CORS origins go in CUSTOMER_WEB_ORIGIN, comma separated. No dependencies or provider keys are needed.

Implemented: GET /health, /api/v1/capabilities, /api/v1/catalogue, /api/v1/categories, paginated /api/v1/products and allowlisted /api/v1/media/:filename. The catalogue contains 390 real source concepts and 104 reviewed photo mappings. Product variants are empty because merchant packs/prices/stock have not been provided. Zero-valued draft fields are not purchasable prices.

Authentication, cart, address, checkout, order, rider and provider endpoints return HTTP 503 NOT_IMPLEMENTED. No real personal data is accepted or persisted. PostgreSQL migrations remain unexecuted drafts. This small testing adapter does not replace the target NestJS/PostgreSQL modular monolith; see ADR 0005. The original commerce OpenAPI remains the target contract; read-only additions are documented in docs/final-api.md.
