# Multi-Origin Fulfillment System

## Environment Variables
The following environment variables are required in `.env.local`:
```
SENDCLOUD_PUBLIC_KEY=stub_public_key
SENDCLOUD_SECRET_KEY=stub_secret_key
SENDCLOUD_WEBHOOK_SECRET=stub_webhook_secret
RESEND_API_KEY=stub_resend_key
MARCO_EMAIL=marco@nutrifitness.ch
OMARE_EMAIL=omar@nutrifitness.ch
```

## Setup Steps
1. Run `npm install`
2. Apply Supabase schema: `node scripts/run-migrations.mjs`
3. Restart development server

## Routing Logic
- The system evaluates stock in Geneva and Portugal to classify products as COMMON, GENEVA_ONLY, or PORTUGAL_ONLY.
- Destination country rules and preferred origins determine where shipments are routed.
- Common destinations for Geneva: CH, LI, FR, DE, IT, AT.
- All other supported countries default to Portugal.

## Test Scenarios
To run routing logic tests:
`npm run test:routing`

## Real API Integration
- **Sendcloud**: Replace the `stub_` keys with real Sendcloud API keys to start making real API calls and generating actual shipping labels.
- **Resend**: Replace the `stub_` key with a real Resend key to send order and shipment emails.
