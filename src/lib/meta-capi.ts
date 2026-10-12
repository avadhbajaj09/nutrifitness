import crypto from 'crypto';

export interface MetaCapiEventParams {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  numItems?: number;
}

export function hashSha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Sends a server-side event to Meta Conversions API (Graph API v19.0).
 * Never logs or exposes the access token.
 */
export async function sendMetaConversionEvent(params: MetaCapiEventParams): Promise<{
  ok: boolean;
  skipped?: boolean;
  error?: string;
}> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;

  if (!pixelId || !accessToken) {
    // Skipped gracefully when credentials are not configured in environment
    return { ok: true, skipped: true };
  }

  const userData: Record<string, unknown> = {};

  if (params.email) {
    const norm = normalizeEmail(params.email);
    if (norm) userData.em = [hashSha256(norm)];
  }

  if (params.phone) {
    const norm = normalizePhone(params.phone);
    if (norm) userData.ph = [hashSha256(norm)];
  }

  if (params.clientIp) {
    userData.client_ip_address = params.clientIp;
  }

  if (params.clientUserAgent) {
    userData.client_user_agent = params.clientUserAgent;
  }

  if (params.fbp) {
    userData.fbp = params.fbp;
  }

  if (params.fbc) {
    userData.fbc = params.fbc;
  }

  const customData: Record<string, unknown> = {};
  if (params.value !== undefined) customData.value = params.value;
  if (params.currency) customData.currency = params.currency;
  if (params.contents && params.contents.length > 0) {
    customData.contents = params.contents;
    customData.content_type = 'product';
  }
  if (params.numItems !== undefined) {
    customData.num_items = params.numItems;
  }

  const eventPayload = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        event_source_url: params.eventSourceUrl || 'https://nutrifitness.ch/commande',
        action_source: 'website',
        user_data: userData,
        custom_data: Object.keys(customData).length > 0 ? customData : undefined,
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { ok: false, error: `Meta CAPI error (HTTP ${res.status}): ${errText.slice(0, 100)}` };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}
