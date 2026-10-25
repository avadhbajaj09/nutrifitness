import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = getAdminSupabase();
    const payload = await req.json();

    // Resend webhook events
    const eventType = payload.type || 'email.received';
    const emailData = payload.data || payload;

    // Handle incoming received email
    const from = emailData.from || '';
    const fromEmail = typeof from === 'string' && from.includes('<')
      ? from.match(/<([^>]+)>/)?.[1] || from
      : from;
    const fromName = typeof from === 'string' && from.includes('<')
      ? from.split('<')[0].trim().replace(/["']/g, '')
      : fromEmail;

    const toEmails = Array.isArray(emailData.to) ? emailData.to : [emailData.to || 'info@nutrifitness.ch'];
    const subject = emailData.subject || '(Sans objet)';
    const bodyHtml = emailData.html || null;
    const bodyText = emailData.text || null;
    const snippet = (bodyText || bodyHtml?.replace(/<[^>]+>/g, ' ') || subject).slice(0, 160).trim();

    const attachments = (emailData.attachments || []).map((att: any) => ({
      filename: att.filename || att.name || 'piece_jointe',
      contentType: att.content_type || att.type || 'application/octet-stream',
      size: att.size || 0,
      url: att.url || null,
    }));

    const { data: inserted, error } = await supabase
      .from('emails')
      .insert({
        resend_id: emailData.email_id || emailData.id || null,
        message_id: emailData.message_id || null,
        folder: 'inbox',
        from_name: fromName || fromEmail,
        from_email: fromEmail || 'inconnu@client.ch',
        to_emails: toEmails,
        subject: subject,
        snippet: snippet,
        body_text: bodyText,
        body_html: bodyHtml,
        attachments: attachments,
        is_read: false,
        metadata: {
          webhook_event: eventType,
          raw_headers: emailData.headers || {},
        },
      })
      .select()
      .single();

    if (error) {
      console.error('[Resend Webhook] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: inserted?.id });
  } catch (err: any) {
    console.error('[Resend Webhook Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
