# Cloud Functions

Location: `functions/src/index.ts`

Functions shipped:

- `onSubscriptionCreated` (Firestore trigger): Runs when a subscription is created.
  - If `promocode_id` exists: increments `promocodes.redemption_count`, sets `linked_subscription_id` if empty.
  - If promo has `assigned_agent_id`: creates an `agent_promocode_commissions` document with `unpaid` status.
  - Commission amount = plan price (basic 49, pro 99, enterprise 199) * 20%.

- `monthlyCommissionSnapshot` (Scheduled): Runs 00:05 UTC on the 1st monthly.
  - Aggregates previous month commissions into `monthly_payouts/{YYYY-MM}` with totals per agent.

- `flouciWebhook` (HTTP): Placeholder webhook to attach transaction result to a subscription. Replace with real verification.

Build and deploy:

- `cd functions`
- `npm install`
- `npm run build`
- `npx firebase deploy --only functions`

Local emulation:

- `npm run serve` in `functions` (spins up Functions + Firestore emulators)

Notes:

- Update `.firebaserc` with your project id or run deploy with `-P <projectId>`.
- Secure the webhook using a secret header when integrating Flouci.

