import { NextResponse } from 'next/server';
import { sendMetaConversionEvent } from '@/lib/meta-capi';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Extract headers for IP and User Agent
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || undefined;
    const clientUserAgent = req.headers.get('user-agent') || undefined;

    // Extract fbp and fbc from cookies header
    const cookieHeader = req.headers.get('cookie') || '';
    const fbpMatch = cookieHeader.match(/(?:^|; )_fbp=([^;]*)/);
    const fbcMatch = cookieHeader.match(/(?:^|; )_fbc=([^;]*)/);
    const fbp = fbpMatch ? decodeURIComponent(fbpMatch[1]) : body.fbp;
    const fbc = fbcMatch ? decodeURIComponent(fbcMatch[1]) : body.fbc;

    // Consent enforcement: check nf_consent cookie
    const consentMatch = cookieHeader.match(/(?:^|; )nf_consent=([^;]*)/);
    if (consentMatch) {
      try {
        const consent = JSON.parse(decodeURIComponent(consentMatch[1]));
        if (consent && consent.marketing === false) {
          // Analytics-only or declined users must not trigger Meta marketing events
          return NextResponse.json({ ok: true, skipped: true, reason: 'Marketing consent not granted' });
        }
      } catch {
        // ignore parse errors
      }
    }

    const {
      event_name = 'Purchase',
      event_id,
      value,
      currency,
      email,
      phone,
      items,
      event_source_url,
    } = body;

    if (!event_id) {
      return NextResponse.json({ error: 'Missing event_id' }, { status: 400 });
    }

    const contents = Array.isArray(items)
      ? items.map((it: any) => ({
          id: String(it.id || it.item_id),
          quantity: Number(it.quantity) || 1,
          item_price: Number(it.item_price || it.price) || 0,
        }))
      : undefined;

    const result = await sendMetaConversionEvent({
      eventName: event_name,
      eventId: String(event_id),
      eventSourceUrl: event_source_url,
      value: typeof value === 'number' ? value : undefined,
      currency: typeof currency === 'string' ? currency : undefined,
      email: typeof email === 'string' ? email : undefined,
      phone: typeof phone === 'string' ? phone : undefined,
      clientIp,
      clientUserAgent,
      fbp,
      fbc,
      contents,
      numItems: contents ? contents.reduce((acc: number, c: any) => acc + c.quantity, 0) : undefined,
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
