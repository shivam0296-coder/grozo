# ADR 0005 — Final Android/testing and catalogue publication

2026-11-01. The owner explicitly requested final debug APKs, source preservation/backup, GitHub publication and website deployment where access permits. The original source ZIP was backed up before edits. Retain the monorepo and protected commerce rules/contracts/migrations. Update only the owner-authorized tagline/support identity and approved existing image library.

Build code-5 debug APKs. Do not invent a release signing identity, merchant price/pack/stock or API URL. Native debug browsing remains bundled with explicit HTTPS API checks; existing synthetic customer/rider flows remain labelled local tests.

Public builds default to the actual pre-launch catalogue. Development shopping/admin remain available locally. A Node built-in read-only HTTP adapter serves the same verified source catalogue for testing, without new dependencies. It does not replace the target NestJS/PostgreSQL monolith. Missing commerce APIs return 503 NOT_IMPLEMENTED. Original commerce OpenAPI is unchanged; new read-only endpoints are separately documented.

No real customer/rider information, paid service, emulator, GPU or external AI is used. Photo licences/credits remain separate from the unchanged repository licence. The user chose to proceed without a phone; physical installation/UI and actual Safari checks remain pending. PostgreSQL/auth/provider and production-readiness claims require their implementations and end-to-end evidence. A remote commit and a successful hosting result are separate required proofs.