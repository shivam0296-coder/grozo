# Completed and pending features

## Customer website — local development implemented

Home/brand/category navigation; 18 synthetic products across 12 categories; instant search; category/price filters; product details/related items; add/remove/increment/decrement basket; minimum/maximum/discount/delivery calculations; local coupon; saved address add/edit/remove; development session/profile/preferences; development checkout, confirmation, history and placed-order cancellation; local support tickets; about/contact and draft privacy/terms/refund pages.

Loading skeleton, explicit error/retry and empty previews are available through the development state selector. Success/error messages, keyboard-accessible controls, native modal dialogs and responsive phone/desktop layouts are implemented.

Pending: real identity/OTP, server inventory/quotes/orders, actual recommendation quality, verified contact channels, final legal policies, real serviceability/Maps/ETA/payment/push, production data export/deletion and wallet if separately chosen.

## Customer Android — development build implemented

Splash/onboarding; Compose navigation; home/categories/search and price filters; saved local searches; product details/related items; MRP/selling-price display; quantities/basket/bill; saved fictional addresses; local checkout/coupon/confirmation/history/cancellation; development profile/session/preferences/support; order-progress and provider placeholders. Hilt/Room/StateFlow/ViewModel/Retrofit/Coroutines/Coil are wired into the shared library. Tablet catalogue columns adapt by available screen configuration.

Pending: physical-device UI validation, real auth/API mapping, verified tax configuration, external integrations and a signed release/AAB process. The APK is debug-signed and does not establish operational delivery quality.

## Rider Android — development build implemented

Development registration, online/offline state, synthetic offers, accept/decline, accepted pickup details, pickup confirmation, active delivery, simulated cash collection/completion, history, derived development earnings, profile and privacy states. State persists locally. No location permission is requested.

Pending: real partner onboarding/approval, actual notifications/assignments, navigation/tracking/contact, proof of delivery, real earnings/payout ledger and physical-device UI testing.

## Admin — local management implemented

Responsive sidebar/drawer navigation; actual local-record aggregates/charts; product creation/edit/availability/stock; validated prices and quantities; order filtering/detail/confirmation/packing/partner assignment/dispatch/simulated completion/cancellation; partner availability; sample zone toggles; campaign dates/occasion and coupon forms; derived delivered-product report/CSV; support creation/resolution; editable commerce rules and local activity log.

Read-only/integration boundaries: real customer account management, secure role/store enforcement, category/brand/supplier master-data CRUD, secure image upload/storage, geographical zone boundary editing, campaign targeting/performance, real finance/refund/payout processing and tamper-resistant audit require later backend-connected implementation. These are not represented as completed live capabilities.

## Shared and packaging

Original Stage 1 protected files retained. Synthetic fixtures are outside database seeds/production data. Typed HTTP adapters reject missing/unavailable services instead of returning samples. Source package includes both Android app modules, web/admin source, shared libraries, all Stage 1 files, locks, notices, tests, reports, screenshots and guides. It excludes toolchains, caches, generated builds, secrets and private signing keys. APKs are delivered separately.

Local development repositories are prototypes: no cross-origin/app synchronization, distributed concurrency or production persistence/authorization claim. A successful build is not a full device or production acceptance test.
