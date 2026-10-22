/**
 * Resend Email Integration for NutriFitness.ch
 * Sends transactional order notifications to Marco (Admin) and order confirmations to customers.
 */

import { stripe } from '@/lib/stripe';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  from?: string;
}

export async function sendResendEmail({
  to,
  subject,
  html,
  replyTo,
  from,
}: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY || '';
  if (!apiKey || apiKey.startsWith('stub_')) {
    console.warn(`[Resend STUB MODE] Would send email to ${JSON.stringify(to)}: "${subject}"`);
    return { success: true, id: 'stub-mode' };
  }

  const defaultFrom = process.env.RESEND_FROM_EMAIL || 'NutriFitness <info@nutrifitness.ch>';
  const fromAddress = from || defaultFrom;
  const toList = Array.isArray(to) ? to : [to];

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: toList,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[Resend API Error]', data);
      return { success: false, error: data.message || 'Error sending email' };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('[Resend Network Error]', err);
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Helper to format price with CHF / EUR currency
 */
function formatCurrency(amount: number | string | undefined, currency = 'CHF'): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  return `${(isNaN(num) ? 0 : num).toFixed(2)} ${currency}`;
}

/**
 * 1. Admin Order Notification Email Template (sent to Marco)
 */
export async function sendOrderNotificationToAdmin(order: any) {
  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.MARCO_EMAIL ||
    'marco.scarpantoni@hotmail.com';

  const orderNumber = order.ticketNumber || order.order_number || order.id || 'NF-INCONNU';
  const currency = order.currency || 'CHF';
  const totalStr = formatCurrency(order.total || order.total_amount, currency);

  const client = order.client || {};
  const clientName = client.name || order.customer_name || 'Client';
  const clientEmail = client.email || order.customer_email || 'Non renseigné';
  const clientPhone = client.phone || order.customer_phone || 'Non renseigné';
  const cleanPhone = clientPhone.replace(/[^0-9+]/g, '');
  const clientAddress = [
    client.address || client.street || order.shipping_address?.street || order.shipping_address?.address || '',
    `${client.postalCode || order.shipping_address?.postalCode || ''} ${client.city || order.shipping_address?.city || ''}`.trim(),
    client.country || order.shipping_address?.country || 'Suisse (CH)',
  ].filter(Boolean).join(', ');

  const shipping = order.shipping || order.shipping_address || {};
  const shippingMethodLabel =
    shipping.label ||
    (shipping.method === 'store_pickup' || shipping.method === 'clickcollect'
      ? '📍 Click & Collect Genève (Rue des Pâquis 34)'
      : '⚡ PostPac Priority 24h (La Poste Suisse)');

  const paymentLabels: Record<string, string> = {
    twint: 'TWINT Suisse (Instantané)',
    postfinance: 'PostFinance Card / E-Finance',
    card: 'Carte Bancaire (3D Secure)',
    invoice: 'Facture QR Suisse (30 jours)',
    cash_chf: 'Espèces CHF (Boutique)',
    cash_eur: 'Espèces EUR (Boutique)',
  };
  const rawPay = (order.paymentMethod || order.payment_method || 'twint').toLowerCase();
  const paymentMethodLabel = paymentLabels[rawPay] || order.paymentMethod || order.payment_method || 'Paiement Sécurisé';

  // Items table with images and HIGH-VISIBILITY FLAVOUR BADGE for Marco
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const itemsHtml = items.map((it: any) => {
    const name = it.name || it.product_name || 'Article';
    const rawFlavor = it.flavor || it.variant || it.taste || it.variant_title;
    const flavor = typeof rawFlavor === 'object' && rawFlavor !== null 
      ? (rawFlavor.fr || rawFlavor.en || Object.values(rawFlavor)[0] || 'Standard') 
      : (rawFlavor ? String(rawFlavor) : 'Standard');
    const format = typeof it.format === 'object' && it.format !== null 
      ? (it.format.fr || it.format.en || Object.values(it.format)[0] || '') 
      : (it.format || it.size ? String(it.format || it.size) : '');

    let imgUrl = it.image || it.image_url || '';
    if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('//')) {
      imgUrl = `https://nutrifitness.ch${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
    }
    const hasValidImg = imgUrl && imgUrl.startsWith('https://') && !imgUrl.includes('placeholder.webp');

    const qty = it.quantity || it.qty || 1;
    const price = it.price || it.unit_price || 0;
    const lineTotal = it.lineTotal || (price * qty);

    return `
      <tr style="border-bottom: 1px solid #262626;">
        <td style="padding: 12px 10px; width: 56px; vertical-align: top;">
          ${hasValidImg ? `
            <img src="${imgUrl}" alt="${name}" width="50" height="50" style="border-radius: 8px; border: 1px solid #333333; object-fit: contain; background: #000000; display: block;" />
          ` : `
            <div style="width: 50px; height: 50px; background: #222222; border-radius: 8px; text-align: center; line-height: 50px; font-size: 20px;">📦</div>
          `}
        </td>
        <td style="padding: 12px 10px; vertical-align: top;">
          <div style="color: #ffffff; font-weight: bold; font-size: 14px; line-height: 1.3;">${name}</div>
          <div style="margin-top: 6px;">
            <span style="display: inline-block; background-color: #facc15; color: #000000; font-weight: 900; font-size: 11px; padding: 4px 9px; border-radius: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
              👉 GOÛT : ${flavor}
            </span>
            ${format && format !== 'Format standard' ? `<span style="color: #aaaaaa; font-size: 11px; margin-left: 8px;">(${format})</span>` : ''}
          </div>
        </td>
        <td style="padding: 12px 10px; color: #ffffff; font-weight: 900; font-size: 15px; text-align: center; vertical-align: middle;">
          x${qty}
        </td>
        <td style="padding: 12px 10px; color: #f80404; font-weight: 900; font-size: 14px; text-align: right; vertical-align: middle;">
          ${formatCurrency(lineTotal, currency)}
        </td>
      </tr>
    `;
  }).join('');

  const subtotal = order.subtotal !== undefined ? order.subtotal : (order.total || 0);
  const shippingCost = shipping.cost !== undefined ? shipping.cost : 0;
  const vatAmount = order.vatAmount !== undefined ? order.vatAmount : ((order.total || 0) * 0.026) / 1.026;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Nouvelle Commande #${orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #080808; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
      <div style="max-width: 620px; margin: 20px auto; background-color: #121212; border: 1px solid #262626; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
        
        <!-- Header with Official Logo -->
        <div style="background-color: #0c0c0c; border-bottom: 2px solid #F80404; padding: 24px 28px; text-align: center;">
          <a href="https://nutrifitness.ch" target="_blank" style="text-decoration: none; display: inline-block;">
            <img src="https://nutrifitness.ch/images/brand/logo.png" alt="NutriFitness Genève" width="180" style="display: block; margin: 0 auto; max-width: 180px; height: auto; border: 0;" />
          </a>
          <div style="color: #999999; font-size: 11px; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
            🇨🇭 Notification Vente Boutique · Genève
          </div>
        </div>

        <!-- Order Highlight Banner -->
        <div style="padding: 22px 28px; background: linear-gradient(135deg, #1c1c1c 0%, #151515 100%); border-bottom: 1px solid #262626;">
          <table style="width: 100%;">
            <tr>
              <td>
                <span style="background-color: rgba(248, 4, 4, 0.2); border: 1px solid #F80404; color: #F80404; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                  🎉 NOUVELLE VENTE EN LIGNE
                </span>
                <div style="font-size: 22px; font-weight: 900; color: #ffffff; font-family: monospace; margin-top: 8px;">
                  #${orderNumber}
                </div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 11px; color: #888888; text-transform: uppercase; font-weight: bold;">Montant Total</div>
                <div style="font-size: 26px; font-weight: 900; color: #F80404; margin-top: 2px;">${totalStr}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Content -->
        <div style="padding: 24px 28px;">
          
          <!-- Client & Delivery Dossier -->
          <div style="background-color: #181818; border: 1px solid #2c2c2c; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 900; color: #F80404; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
              👤 Coordonnées & Livraison
            </div>
            <table style="width: 100%; font-size: 13px; line-height: 1.7;">
              <tr>
                <td style="color: #888; width: 110px;">Client :</td>
                <td style="color: #fff; font-weight: bold;">${clientName}</td>
              </tr>
              <tr>
                <td style="color: #888;">Téléphone :</td>
                <td style="color: #fff;">
                  <strong style="color: #fff;">${clientPhone}</strong>
                  ${cleanPhone ? `
                    <span style="margin-left: 10px;">
                      <a href="https://wa.me/${cleanPhone.replace('+', '')}" target="_blank" style="background-color: #25D366; color: #000; font-size: 11px; font-weight: bold; text-decoration: none; padding: 2px 7px; border-radius: 4px;">💬 WhatsApp</a>
                    </span>
                  ` : ''}
                </td>
              </tr>
              <tr>
                <td style="color: #888;">Email :</td>
                <td style="color: #fff;"><a href="mailto:${clientEmail}" style="color: #38bdf8; text-decoration: none;">${clientEmail}</a></td>
              </tr>
              <tr>
                <td style="color: #888; vertical-align: top;">Adresse :</td>
                <td style="color: #facc15; font-weight: 600;">${clientAddress || 'Non renseignée'}</td>
              </tr>
              <tr>
                <td style="color: #888; padding-top: 4px;">Mode d'envoi :</td>
                <td style="color: #10b981; font-weight: bold; padding-top: 4px;">${shippingMethodLabel}</td>
              </tr>
              <tr>
                <td style="color: #888;">Paiement :</td>
                <td style="color: #fff; font-weight: 600;">${paymentMethodLabel}</td>
              </tr>
            </table>
          </div>

          <!-- Articles Picking List -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 900; color: #F80404; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; justify-content: space-between;">
              <span>📦 Articles à Préparer (${items.length})</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background-color: #161616; border-radius: 12px; overflow: hidden; border: 1px solid #262626;">
              <thead>
                <tr style="background-color: #1f1f1f; text-align: left;">
                  <th style="padding: 10px; color: #888; font-size: 11px; text-transform: uppercase;" colspan="2">Produit & Saveur</th>
                  <th style="padding: 10px; color: #888; font-size: 11px; text-transform: uppercase; text-align: center;">Qté</th>
                  <th style="padding: 10px; color: #888; font-size: 11px; text-transform: uppercase; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml || '<tr><td colspan="4" style="padding: 16px; color: #888; text-align: center;">Aucun article listé</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- Total Calculation -->
          <div style="background-color: #171717; border: 1px solid #262626; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; font-size: 13px;">
            <table style="width: 100%; line-height: 1.8;">
              <tr>
                <td style="color: #888;">Sous-total articles :</td>
                <td style="text-align: right; color: #fff;">${formatCurrency(subtotal, currency)}</td>
              </tr>
              <tr>
                <td style="color: #888;">Frais de livraison :</td>
                <td style="text-align: right; color: #fff;">${Number(shippingCost) === 0 ? '<span style="color:#10b981; font-weight:bold;">Gratuit</span>' : formatCurrency(shippingCost, currency)}</td>
              </tr>
              <tr>
                <td style="color: #888;">TVA 2.6% (incluse) :</td>
                <td style="text-align: right; color: #888;">${formatCurrency(vatAmount, currency)}</td>
              </tr>
              <tr style="border-top: 1px solid #333333;">
                <td style="color: #fff; font-weight: bold; padding-top: 10px; font-size: 15px;">Total Réglé :</td>
                <td style="text-align: right; color: #F80404; font-weight: 900; padding-top: 10px; font-size: 18px;">${totalStr}</td>
              </tr>
            </table>
          </div>

          <!-- Quick Actions Button -->
          <div style="text-align: center; margin: 28px 0 10px;">
            <a href="https://nutrifitness.ch/wp-admin/" style="display: inline-block; background-color: #F80404; color: #000000; font-weight: 900; font-size: 13px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border-radius: 10px; letter-spacing: 0.5px;">
              Accéder au Panneau d'Administration →
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #0a0a0a; border-top: 1px solid #1f1f1f; padding: 20px 28px; text-align: center; color: #666666; font-size: 11px; line-height: 1.6;">
          NutriFitness Genève · Rue des Pâquis 34, 1201 Genève · Tél. +41 79 250 35 64<br>
          Notification automatique envoyée à <strong>${adminEmail}</strong>.
        </div>

      </div>
    </body>
    </html>
  `;

  return sendResendEmail({
    to: adminEmail,
    subject: `⚡ Vente Web #${orderNumber} (${totalStr}) — ${clientName}`,
    html,
    replyTo: clientEmail.includes('@') ? clientEmail : undefined,
  });
}

/**
 * 2. Customer Order Confirmation Email Template (sent to buyer)
 */
export async function sendOrderConfirmationToCustomer(order: any) {
  const client = order.client || {};
  const clientEmail = client.email || order.customer_email;
  if (!clientEmail || !clientEmail.includes('@') || clientEmail.includes('placeholder')) {
    console.warn('[Resend] No valid customer email provided, skipping customer email confirmation.');
    return { success: false, error: 'No valid customer email' };
  }

  const orderNumber = order.ticketNumber || order.order_number || order.id || 'NF-INCONNU';
  const currency = order.currency || 'CHF';
  const totalStr = formatCurrency(order.total || order.total_amount, currency);
  const clientName = client.name || order.customer_name || 'Client';

  // 1. First name extraction
  const rawFirstName = (clientName || 'Cher Client').trim().split(/\s+/)[0] || 'Client';
  const prenom = rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase();

  // 2. Personalized promo code: FIRSTNAME in uppercase + 10 (ex: MARCO10, SAMUEL10)
  const prenomClean = rawFirstName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'CLIENT';
  const code_promo = `${prenomClean}10`;

  // 3. Expiration: order date + 45 days
  const orderDateObj = order.timestamp || order.created_at ? new Date(order.timestamp || order.created_at) : new Date();
  const date_commande = orderDateObj.toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const expirationDate = new Date(orderDateObj.getTime() + 45 * 24 * 60 * 60 * 1000);
  const date_expiration = expirationDate.toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Ensure promo code is created and valid in Stripe for 45 days
  if (stripe) {
    try {
      const existing = await stripe.coupons.retrieve(code_promo).catch(() => null);
      if (!existing || !existing.valid) {
        await stripe.coupons.create({
          id: code_promo,
          name: `Remise Fidélité 10% ${prenomClean}`,
          percent_off: 10,
          duration: 'once',
          redeem_by: Math.floor(expirationDate.getTime() / 1000),
        }).catch(err => console.warn(`[Stripe Promo Notice] ${err.message}`));
      }
    } catch (promoErr) {
      console.warn('[Stripe Promo Error]', promoErr);
    }
  }

  const shipping = order.shipping || order.shipping_address || {};
  const isClickCollect = shipping.method === 'store_pickup' || shipping.method === 'clickcollect';
  const mode_livraison = isClickCollect
    ? '📍 Click & Collect (Rue des Pâquis 34, Genève)'
    : '⚡ PostPac Priority (La Poste Suisse 24h)';

  const logo_url = 'https://nutrifitness.ch/images/brand/logo.png';
  const banner_url = 'https://res.cloudinary.com/dm4jfxbcs/image/upload/f_auto,q_auto,w_1200/v1792654210/Cinematic_Nutrifit_Industrial_Fitness_Banner_l91b7e.png';
  const lien_boutique = `https://nutrifitness.ch/boutique?promo=${code_promo}`;

  // Items table with high contrast flavor badge
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const itemsRowsHtml = items.map((it: any) => {
    const name = it.name || it.product_name || 'Article';
    const rawFlavor = it.flavor || it.variant || it.taste || it.variant_title;
    const flavor = typeof rawFlavor === 'object' && rawFlavor !== null 
      ? (rawFlavor.fr || rawFlavor.en || Object.values(rawFlavor)[0] || 'Standard') 
      : (rawFlavor ? String(rawFlavor) : 'Standard');
    const format = typeof it.format === 'object' && it.format !== null 
      ? (it.format.fr || it.format.en || Object.values(it.format)[0] || '') 
      : (it.format || it.size ? String(it.format || it.size) : '');

    let imgUrl = it.image || it.image_url || '';
    if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('//')) {
      imgUrl = `https://nutrifitness.ch${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
    }
    const hasValidImg = imgUrl && imgUrl.startsWith('https://') && !imgUrl.includes('placeholder.webp');

    const qty = it.quantity || it.qty || 1;
    const price = it.price || it.unit_price || 0;
    const lineTotal = it.lineTotal || (price * qty);

    return `
      <tr style="border-bottom: 1px solid #2a2a2e;">
        <td style="padding: 10px 0; width: 50px; vertical-align: top;">
          ${hasValidImg ? `
            <img src="${imgUrl}" alt="${name}" width="44" height="44" style="border-radius: 8px; border: 1px solid #2a2a2e; object-fit: contain; background: #0b0b0c; display: block;" />
          ` : `
            <div style="width: 44px; height: 44px; background: #141416; border: 1px solid #2a2a2e; border-radius: 8px; text-align: center; line-height: 44px; font-size: 16px;">⚡</div>
          `}
        </td>
        <td style="padding: 10px 10px; vertical-align: top;">
          <div style="color: #ffffff; font-weight: bold; font-size: 13px; line-height: 1.3;">${name}</div>
          <div style="margin-top: 4px;">
            <span style="display: inline-block; background: #0f1a08; border: 1px solid #8bd02f; color: #8bd02f; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
              ⚡ Saveur : <strong>${flavor}</strong>
            </span>
            ${format && format !== 'Format standard' ? `<span style="color: #a5a5ad; font-size: 11px; margin-left: 6px;">(${format})</span>` : ''}
          </div>
        </td>
        <td align="center" style="padding: 10px 8px; color: #a5a5ad; font-size: 13px; font-weight: 700; vertical-align: middle;">
          x${qty}
        </td>
        <td align="right" style="padding: 10px 0; color: #ffffff; font-weight: 700; font-size: 13px; vertical-align: middle;">
          ${formatCurrency(lineTotal, currency)}
        </td>
      </tr>
    `;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>Merci pour votre commande – NutriFitness</title>
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0;mso-table-rspace:0}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display:block}
  body{margin:0;padding:0;width:100%!important;background:#050505}
  a{text-decoration:none}
  @media only screen and (max-width:620px){
    .container{width:100%!important}
    .px{padding-left:22px!important;padding-right:22px!important}
    .h1{font-size:26px!important;line-height:31px!important}
    .code{font-size:24px!important;letter-spacing:3px!important}
    .btn a{display:block!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#050505;">

<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#050505;font-size:1px;line-height:1px;">
  Un immense merci pour votre commande chez NutriFitness.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#050505" style="background:#050505;">
<tr><td align="center" style="padding:24px 12px;">

  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- LOGO -->
    <tr>
      <td align="center" bgcolor="#0b0b0c" style="background:#0b0b0c;padding:26px 24px 22px;border-radius:20px 20px 0 0;border-bottom:3px solid #e11d1d;">
        <a href="https://nutrifitness.ch" target="_blank">
          <img src="${logo_url}" alt="NutriFitness" width="190" style="width:190px;max-width:100%;height:auto;margin:0 auto;">
        </a>
      </td>
    </tr>

    <!-- BANNIÈRE (1200 × 500 px, affichée à 600 px) -->
    <tr>
      <td bgcolor="#141416" style="background:#141416;">
        <a href="https://nutrifitness.ch" target="_blank">
          <img src="${banner_url}" alt="NutriFitness – Nutrition sportive en Suisse" width="600" style="width:100%;max-width:600px;height:auto;">
        </a>
      </td>
    </tr>

    <!-- MERCI -->
    <tr>
      <td class="px" align="center" bgcolor="#141416" style="background:#141416;padding:44px 44px 8px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:3px;font-weight:700;color:#8bd02f;text-transform:uppercase;">Commande confirmée</div>
        <h1 class="h1" style="margin:16px 0 0;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:34px;line-height:38px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:.5px;">
          Merci infiniment<br><span style="color:#e11d1d;">pour votre commande.</span>
        </h1>
        <p style="margin:22px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:27px;color:#d6d6db;">
          Bonjour ${prenom},<br>
          nous sommes ravis de vous compter parmi nos clients. Votre confiance compte énormément pour nous.
        </p>
        <p style="margin:22px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#ffffff;font-weight:700;">
          À très bientôt,<br><span style="color:#8bd02f;">L’équipe NutriFitness</span>
        </p>
      </td>
    </tr>

    <!-- DÉTAILS DE LA COMMANDE -->
    <tr>
      <td class="px" bgcolor="#141416" style="background:#141416;padding:28px 40px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1b1b1e;border:1px solid #2a2a2e;border-radius:14px;">
          <tr>
            <td style="padding:20px 22px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:#8f8f98;text-transform:uppercase;">Détails de votre commande</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;font-size:15px;color:#ffffff;">
                <tr>
                  <td style="padding:8px 0;color:#a5a5ad;border-bottom:1px solid #2a2a2e;">N° de commande</td>
                  <td align="right" style="padding:8px 0;font-weight:700;border-bottom:1px solid #2a2a2e;">#${orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#a5a5ad;border-bottom:1px solid #2a2a2e;">Date</td>
                  <td align="right" style="padding:8px 0;font-weight:700;border-bottom:1px solid #2a2a2e;">${date_commande}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#a5a5ad;border-bottom:1px solid #2a2a2e;">Livraison</td>
                  <td align="right" style="padding:8px 0;font-weight:700;border-bottom:1px solid #2a2a2e;">${mode_livraison}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;color:#a5a5ad;">Total (TVA suisse incl.)</td>
                  <td align="right" style="padding:12px 0 0;font-size:20px;font-weight:900;color:#8bd02f;">${totalStr}</td>
                </tr>
              </table>

              ${itemsRowsHtml ? `
                <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #2a2a2e;">
                  <div style="font-size: 11px; letter-spacing: 2px; font-weight: 700; color: #8f8f98; text-transform: uppercase; margin-bottom: 10px;">
                    Articles & Saveurs sélectionnés
                  </div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #ffffff;">
                    ${itemsRowsHtml}
                  </table>
                </div>
              ` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CODE PROMO -->
    <tr>
      <td class="px" bgcolor="#141416" style="background:#141416;padding:20px 40px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f1a08;border:2px dashed #8bd02f;border-radius:16px;">
          <tr>
            <td align="center" style="padding:28px 20px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:12px;letter-spacing:3px;font-weight:700;color:#8bd02f;text-transform:uppercase;">Cadeau de bienvenue</div>
              <div style="margin-top:10px;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:28px;line-height:33px;font-weight:900;color:#ffffff;text-transform:uppercase;">–10&nbsp;% sur votre<br>prochaine commande</div>
              <div style="margin:18px auto 0;display:inline-block;background:#ffffff;border-radius:10px;padding:12px 24px;">
                <span class="code" style="font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:900;letter-spacing:5px;color:#0b0b0c;">${code_promo}</span>
              </div>
              <div style="margin-top:14px;font-size:13px;line-height:19px;color:#a9b89a;">Valable 45 jours, jusqu’au ${date_expiration}.<br>À saisir au moment du paiement.</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top:18px;" class="btn">
                <tr>
                  <td align="center" bgcolor="#8bd02f" style="border-radius:50px;">
                    <a href="${lien_boutique}" target="_blank" style="display:inline-block;padding:14px 34px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:900;letter-spacing:1.5px;color:#0b0b0c;text-transform:uppercase;border-radius:50px;">Utiliser mon code</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- PIED DE PAGE -->
    <tr>
      <td class="px" align="center" bgcolor="#0b0b0c" style="background:#0b0b0c;padding:30px 30px 26px;border-top:3px solid #e11d1d;border-radius:0 0 20px 20px;font-family:Arial,Helvetica,sans-serif;">
        <div style="font-size:13px;font-weight:900;letter-spacing:2px;color:#ffffff;text-transform:uppercase;">Boutique physique en Suisse</div>
        <div style="margin-top:10px;font-size:13px;line-height:21px;color:#a5a5ad;">
          Rue des Pâquis 34, 1201 Genève, Suisse<br>
          Service Client&nbsp;: Équipe NutriFitness Suisse<br>
          Tél&nbsp;: <a href="tel:+41792503564" style="color:#ffffff;font-weight:700;">+41 79 250 35 64</a><br>
          E-mail&nbsp;: <a href="mailto:info@nutrifitness.ch" style="color:#8bd02f;font-weight:700;">info@nutrifitness.ch</a>
        </div>
        <div style="margin-top:16px;font-size:12px;color:#8f8f98;">
          <a href="https://nutrifitness.ch" style="color:#ffffff;">nutrifitness.ch</a>
        </div>
        <div style="margin-top:16px;font-size:11px;line-height:17px;color:#6b6b73;">
          IDE / UID&nbsp;: CHE-177.751.159<br>
          © 2026 NutriFitness.ch · Tous droits réservés.
        </div>
      </td>
    </tr>

  </table>

</td></tr>
</table>
</body>
</html>
  `;

  return sendResendEmail({
    to: clientEmail,
    subject: `Merci pour votre commande #${orderNumber} – NutriFitness (–10% cadeau à l'intérieur 🎁)`,
    html,
    replyTo: 'info@nutrifitness.ch',
  });
}

/**
 * Convenience wrapper: notifies both admin and customer
 */
export async function sendOrderConfirmation(email: string, orderData: any) {
  const adminPromise = sendOrderNotificationToAdmin(orderData);
  const customerPromise = sendOrderConfirmationToCustomer(orderData);
  const [adminResult, customerResult] = await Promise.allSettled([adminPromise, customerPromise]);
  return { adminResult, customerResult };
}

/**
 * 3. Shipment Tracking Update Email Template
 */
export async function sendShipmentUpdate(email: string, shipmentData: any) {
  if (!email || !email.includes('@')) return { success: false };

  const trackingNumber = shipmentData.trackingNumber || shipmentData.tracking_number || '';
  const carrier = shipmentData.carrier || 'La Poste Suisse';
  const orderNumber = shipmentData.orderNumber || shipmentData.order_id || '';
  const trackingUrl = shipmentData.trackingUrl || shipmentData.tracking_url || `https://www.post.ch/fr/suivi-des-envois?formattedParcelCodes=${trackingNumber}`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Votre colis est en route</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #141414; border: 1px solid #262626; border-radius: 16px; padding: 28px; text-align: center;">
        <div style="font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #ffffff; text-transform: uppercase; margin-bottom: 20px;">
          NUTRI<span style="color: #F80404;">FITNESS</span>.CH
        </div>
        <div style="font-size: 36px; margin-bottom: 12px;">🚚</div>
        <h1 style="font-size: 20px; color: #ffffff; text-transform: uppercase; margin-bottom: 8px;">
          Votre commande est en route !
        </h1>
        <p style="font-size: 13px; color: #aaaaaa; line-height: 1.6; margin-bottom: 24px;">
          Votre commande <strong>#${orderNumber}</strong> a été expédiée via <strong>${carrier}</strong>.
        </p>
        ${trackingNumber ? `
          <div style="background-color: #1c1c1c; border-radius: 10px; padding: 14px; margin-bottom: 24px; font-family: monospace; font-size: 14px; color: #ffffff;">
            Numéro de suivi : <strong>${trackingNumber}</strong>
          </div>
          <a href="${trackingUrl}" style="display: inline-block; background-color: #F80404; color: #000; font-weight: 900; font-size: 13px; text-transform: uppercase; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
            Suivre mon colis en temps réel →
          </a>
        ` : ''}
      </div>
    </body>
    </html>
  `;

  return sendResendEmail({
    to: email,
    subject: `Votre colis NutriFitness #${orderNumber} a été expédié (${carrier})`,
    html,
  });
}

export async function sendDeliveryConfirmation(email: string, deliveryData: any) {
  return sendShipmentUpdate(email, deliveryData);
}
