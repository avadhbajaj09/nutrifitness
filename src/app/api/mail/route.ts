import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { getMailCounts } from '@/lib/email/mail-db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = getAdminSupabase();
    const { searchParams } = new URL(req.url);

    const folder = searchParams.get('folder') || 'inbox';
    const search = searchParams.get('search')?.trim();
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || 50)));
    const offset = Math.max(0, Number(searchParams.get('offset') || 0));

    // Base query for current folder
    let query = supabase
      .from('emails')
      .select('id, resend_id, folder, from_name, from_email, to_emails, subject, snippet, is_read, is_starred, attachments, created_at', { count: 'exact' });

    if (folder === 'trash') {
      query = query.or('folder.eq.trash,is_deleted.eq.true');
    } else {
      query = query.eq('folder', folder).eq('is_deleted', false);
    }

    if (search) {
      // Search in subject, from_email, from_name, snippet
      query = query.or(`subject.ilike.%${search}%,from_email.ilike.%${search}%,from_name.ilike.%${search}%,snippet.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: emails, count, error } = await query;
    if (error) {
      console.error('[Mail API] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const counts = await getMailCounts(supabase);

    return NextResponse.json({
      emails: emails || [],
      total: count || 0,
      counts,
    });
  } catch (err: any) {
    console.error('[Mail API] Server error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getAdminSupabase();
    const body = await req.json();

    const {
      to,
      cc,
      bcc,
      subject,
      bodyHtml,
      bodyText,
      attachments = [],
    } = body;

    const toEmails: string[] = Array.isArray(to)
      ? to.map((t: string) => t.trim()).filter(Boolean)
      : typeof to === 'string'
      ? to.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    if (toEmails.length === 0) {
      return NextResponse.json({ error: 'Au moins un destinataire est requis.' }, { status: 400 });
    }

    const ccEmails: string[] = Array.isArray(cc)
      ? cc.map((t: string) => t.trim()).filter(Boolean)
      : typeof cc === 'string' && cc.trim()
      ? cc.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const bccEmails: string[] = Array.isArray(bcc)
      ? bcc.map((t: string) => t.trim()).filter(Boolean)
      : typeof bcc === 'string' && bcc.trim()
      ? bcc.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const finalSubject = subject?.trim() || '(Sans objet)';
    const finalHtml = bodyHtml || (bodyText ? `<p style="font-family: Arial, sans-serif; white-space: pre-wrap; color: #1e293b;">${bodyText.replace(/\n/g, '<br/>')}</p>` : '<p></p>');
    const finalText = bodyText || bodyHtml?.replace(/<[^>]+>/g, ' ') || '';
    const snippet = finalText.slice(0, 160).trim() || finalSubject;

    // Format attachments for Resend
    const resendAttachments = attachments.map((att: any) => ({
      filename: att.filename || att.name || 'document',
      content: att.content || att.base64 || '',
    })).filter((att: any) => att.content);

    // Dispatch via Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    let resendId: string | null = null;
    let deliveryStatus = 'sent';

    if (resendApiKey && !resendApiKey.startsWith('stub_')) {
      const payload: any = {
        from: 'NutriFitness <info@nutrifitness.ch>',
        to: toEmails,
        subject: finalSubject,
        html: finalHtml,
        text: finalText,
        reply_to: 'info@nutrifitness.ch',
      };

      if (ccEmails.length > 0) payload.cc = ccEmails;
      if (bccEmails.length > 0) payload.bcc = bccEmails;
      if (resendAttachments.length > 0) payload.attachments = resendAttachments;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resendData = await resendRes.json();
      if (!resendRes.ok) {
        console.error('[Resend Error]', resendData);
        return NextResponse.json({ error: resendData.message || 'Erreur lors de l\'envoi via Resend' }, { status: 400 });
      }

      resendId = resendData.id || null;
    }

    // Save into Supabase under 'sent' folder
    const cleanAttachmentsMeta = attachments.map((att: any) => ({
      filename: att.filename || att.name,
      size: att.size || 0,
      contentType: att.contentType || att.type || 'application/octet-stream',
      url: att.url || null,
      path: att.path || null,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('emails')
      .insert({
        resend_id: resendId,
        folder: 'sent',
        from_name: 'NutriFitness',
        from_email: 'info@nutrifitness.ch',
        to_emails: toEmails,
        cc_emails: ccEmails,
        bcc_emails: bccEmails,
        reply_to: 'info@nutrifitness.ch',
        subject: finalSubject,
        snippet: snippet,
        body_text: finalText,
        body_html: finalHtml,
        attachments: cleanAttachmentsMeta,
        is_read: true,
        metadata: { delivery_status: deliveryStatus },
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Supabase Insert Error]', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const counts = await getMailCounts(supabase);

    return NextResponse.json({
      success: true,
      email: inserted,
      resendId,
      counts,
    });
  } catch (err: any) {
    console.error('[Mail Send Error]', err);
    return NextResponse.json({ error: err.message || 'Erreur d\'envoi' }, { status: 500 });
  }
}
