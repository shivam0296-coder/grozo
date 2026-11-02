# Credentials and integrations setup

**No API key is required for Stages 1–2.** Stage 2 interfaces have labelled placeholders; external integrations are NOT_IMPLEMENTED and disabled in .env.example. Do not send secret values in chat or commit them. Configure local secret files or the deployment secret store when the relevant adapter is ready.

## Google Maps Platform

1. After approval of billing and a bounded usage budget, choose a dedicated Google Cloud project. Enable only the APIs needed by the implemented feature.
2. Create separate customer Android and rider Android keys. Restrict each by its final package name, signing-certificate SHA-1 and required Maps/Places APIs. Debug and release signatures need separate restriction entries.
3. Create a browser key restricted by approved website referrers and Maps JavaScript/Places APIs as needed. Browser keys are visible by design; restrict them. Do not reuse a server secret.
4. Create a server key restricted to the backend's approved egress IPs and only the necessary Geocoding/Routes APIs. Keep it in MAPS_SERVER_API_KEY, never VITE_* or Android resources.
5. Keep Android values in ignored Gradle properties and inject them through a reviewed secrets workflow. Restrict production and development separately.
6. Configure quotas and billing alerts, then test an allowed app/referrer and a denied source. A budget alert is not a hard spending cap; inspect applicable quotas and per-SKU billing.
7. Implement address autocomplete with appropriate session usage, manual pin/address entry, permission-denied fallback and saved address ownership. Observe provider attribution, storage/caching and terms.
8. Test real routes, unavailable/stale location, zone containment and permission revocation before enabling tracking. Do not manufacture coordinates or delivery estimates.

Primary sources: [Maps key security](https://developers.google.com/maps/api-security-best-practices), [cost controls](https://developers.google.com/maps/billing-and-pricing/manage-costs). Package names/signing hashes/domains and exact enabled API list are pending actual app builds.

## Razorpay

1. Choose/approve the merchant account and use test mode first. Keep live and test databases/secrets separated.
2. Store RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and a distinct RAZORPAY_WEBHOOK_SECRET server-side. Only the public key ID and provider order details may reach checkout.
3. Backend creates a provider order from its persisted amount/currency/reference. Client success is provisional; the backend verifies the provider signature and reconciles actual captured payment status.
4. Webhooks require a reachable HTTPS endpoint later. Verify bounded raw request bytes with the webhook secret, deduplicate provider events, handle retries and out-of-order events, and never let a browser choose payment status.
5. Test amount/currency tampering, forged/replayed signatures, timeout/retry, capture failure, expired reservations, duplicate success and partial/full refund limits.
6. Enable live mode only after merchant approval and complete real integration evidence. COD is a separate configurable business option, disabled initially.

Use current official [Razorpay integration documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) and [webhook guidance](https://razorpay.com/docs/webhooks/). Exact adapter calls and merchant requirements must be verified during Stage 4. No merchant credentials or charge was used here.

## OTP and authentication

FCM is not a phone OTP service. Select an OTP/SMS provider or a properly evaluated phone-auth offering. Review delivery region, abuse controls, relevant sender/template setup, pricing and data processing before approval. No provider is connected.

Use short-lived challenges, hashed OTPs with a server secret, attempt limits, resend cooldown, per-phone/IP/device throttles and non-enumerating responses. Never log codes. Test only approved numbers. Staff MFA, secure bootstrap and session revocation must pass before admin access.

## Firebase Cloud Messaging

Register each Android app under the correct Firebase project and configure its application identifiers. Client configuration is not a server credential. Keep server service-account access in a secret manager/workload identity; never bundle the private key. GOOGLE_APPLICATION_CREDENTIALS points to a local ignored credential file where required.

Request notification permission at the appropriate point, register/rotate/revoke device tokens, honor promotional opt-outs and avoid private address/payment details in lock-screen content. Prove delivery on actual devices; a queued outbox row is not proof of receipt. [Official Android setup](https://firebase.google.com/docs/cloud-messaging/android/get-started) describes runtime permission requirements.

## Storage and AI

Choose private object storage after hosting review. Validate actual decoded image content, dimensions, size, allowed formats and rights metadata; re-encode and publish only safe approved derivatives. Keep storage credentials server-side.

AI_PROVIDER stays disabled. No model or external AI API has been selected, and no external AI key is needed for the initial commerce workflow. Any future model-backed feature needs an evaluated purpose, user-data boundary, cost and dependency/license review.
