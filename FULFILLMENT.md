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
- **Packlink PRO**: Configured with live API key (`PACKLINK_API_KEY`). Connects directly to `https://api.packlink.com/v1` for real-time European courier rates (UPS, DPD, SEUR, Correos) from Portugal, shipment tracking, and shipping label generation.
- **Sendcloud**: Used for Swiss Post and backup carrier fulfillment. Replace stub keys with live keys when ready.
- **Resend**: Replace the `stub_` key with a real Resend key to send order and shipment emails.

## Packlink PRO Endpoints
- `GET /api/packlink/` : Returns connected account status, account email, and registered shipments count.
- `POST /api/packlink/` : Quotes live carrier rates (`action: "rates"`) or generates draft shipments (`action: "create_draft"`).
- `POST /api/fulfillment/rates/` : Dynamically queries Packlink PRO for European shipments originating from Portugal.
