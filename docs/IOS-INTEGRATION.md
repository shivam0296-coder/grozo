# Future iOS integration

Use the same HTTPS /api/v1 endpoints, source product UUIDs and category hierarchy. Keep authoritative pricing, stock reservations, permissions, idempotent checkout and assignment on the backend; a mobile cache never proves stock or order success. The current API only exposes read-only catalogue data and explicit missing commerce endpoints.

Retain photo credits/licences and resolve reviewed media URLs against the API host. Missing merchant price/pack/stock remains unavailable. Complete common authentication, secure Keychain storage, refresh/revocation, owned addresses/carts/history, idempotency and structured error/version handling before orders. Browser cookie/CSRF and native bearer flows need separate security review while sharing account identity.

Use macOS/Xcode and owner-controlled Apple signing/provisioning for a future Swift/SwiftUI or owner-approved app. Maps, APNs and payment integrations need restricted platform-specific credentials, current Apple requirements and real-device tests. No iOS build, simulator, APNs delivery or App Store readiness is claimed from this Windows task.