import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = getAdminSupabase();
    const body = await req.json();

    const {
      name,
      email,
      phone,
      orderNumber,
      subject,
      message,
    } = body;

    if (!email || !message) {
      return NextResponse.json({ error: 'Email et message requis' }, { status: 400 });
    }

    const cleanSubject = subject ? `[Contact Web] ${subject}${orderNumber ? ` · Cmd #${orderNumber}` : ''}` : `Message client de ${name || email}`;
    const cleanSnippet = (message || '').slice(0, 160).trim();

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px;">
        <h3 style="color: #e11d1d; margin-top: 0;">Nouveau message reçu depuis le site NutriFitness.ch</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Client :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${name || 'Non renseigné'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Email :</td>
            <td style="padding: 6px 0; color: #0f172a;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          ${phone ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Téléphone :</td>
              <td style="padding: 6px 0; color: #0f172a;">${phone}</td>
            </tr>
          ` : ''}
          ${orderNumber ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b;">N° Commande :</td>
              <td style="padding: 6px 0; font-weight: bold; color: #e11d1d;">#${orderNumber}</td>
            </tr>
          ` : ''}
        </table>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Message du client :</div>
          <div style="white-space: pre-wrap; font-size: 14px; color: #1e293b;">${message}</div>
        </div>

        <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          Reçu via le formulaire de contact NutriFitness Genève. Cliquez sur "Répondre" pour écrire directement au client.
        </div>
      </div>
    `;

    const { data: inserted, error } = await supabase
      .from('emails')
      .insert({
        folder: 'inbox',
        from_name: name || email,
        from_email: email,
        to_emails: ['info@nutrifitness.ch'],
        reply_to: email,
        subject: cleanSubject,
        snippet: cleanSnippet,
        body_text: message,
        body_html: htmlBody,
        is_read: false,
        metadata: {
          source: 'contact_form',
          phone,
          orderNumber,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('[Inbound Contact Insert Error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: inserted?.id });
  } catch (err: any) {
    console.error('[Inbound Contact Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
