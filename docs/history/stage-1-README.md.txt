# GROZO

**Daily Needs. Delivered Faster.**

Grocery commerce for Siyana, Bulandshahr, Uttar Pradesh, with a path to nearby towns.

## Current delivery — Stage 1

Architecture, folder structure, relational database draft, API design, brand system, security boundaries, credential setup and phased roadmap are provided. Executable TypeScript commerce rules and automated tests begin implementation.

**Maturity: foundation PROTOTYPE.** Android apps, website, admin panel, persistent backend, authentication, Maps, payments, notifications, tracking and AI are **NOT_IMPLEMENTED**. This package cannot accept customer orders. SQL and API contracts are designs, not running integrations.

Start with [architecture](docs/architecture.md), [folder structure](docs/project-structure.md), [roadmap](docs/roadmap.md) and [status](docs/status.md). Assumptions are recorded in [ADR 0001](docs/decisions/0001-foundation.md).

## Run the foundation

Prerequisite: Node.js 24.12 or later in the Node 24 line. No package installation, API key, network, database or Android SDK is needed for Stage 1.

```powershell
cd C:\Users\shiva\Documents\Codex\grozo
node scripts/check.mjs
node --test tests/commerce.test.mjs tests/contracts.test.mjs
node examples/quote.ts
```

The example uses fictional inputs. It calculates a basket; it does not create an order, charge a customer or establish tax treatment. Node strips TypeScript types without checking them; compiler verification remains required when dependencies are introduced.

## Selected target stack

| Component | Choice |
| --- | --- |
| Customer and rider Android | Kotlin, Compose, Material 3, MVVM, Coroutines/StateFlow, Navigation, Hilt, Room, Retrofit/OkHttp, Coil |
| Website and admin | React, TypeScript, Vite, Tailwind CSS; separate applications |
| Backend | NestJS with Express adapter, TypeScript, REST /api/v1 |
| Database | PostgreSQL 18; SQL migrations, parameterized queries |
| Background work | Separate Node worker using a PostgreSQL transactional outbox |
| Maps | Separate restricted Android, browser and server Google Maps credentials |
| Payments | Razorpay adapter, initially sandbox; COD configurable |
| Notifications | Firebase Cloud Messaging and a separately selected OTP/SMS provider |

These are architecture selections, not installed packages. Exact compatible versions, locks, vulnerability checks and third-party notices are a Stage 2 entry task.

## Contents

- docs/: architecture, database, API, design, integrations, security, setup and roadmap.
- database/: proposed migration and non-personal reference seed.
- packages/domain/src/: price calculation and role-aware order transitions.
- packages/contracts/openapi.json: planned contract with implementation labels.
- assets/brand/: original SVG logo and design tokens.
- apps/, services/, infra/: explicitly marked implementation destinations.
- .env.example: credential names with integrations disabled.

See [setup](docs/setup.md), [validation](docs/validation.md) and [requirement coverage](docs/requirements.md). Source ZIP delivery does not include an APK/AAB; those require later Android implementation and toolchain validation.

## Ownership

Owner: Shivam Kumar. No open-source license has been selected. Original material remains all rights reserved under LICENSE. No third-party grocery images, customer records or external model artifacts are included. Configure approved support details at launch; the brief's phone/email are not embedded in test fixtures.
