/**
 * Resend Email Integration for NutriFitness.ch
 * Sends transactional order notifications to Marco (Admin) and order confirmations to customers.
 */

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

  const shipping = order.shipping || order.shipping_address || {};
  const isClickCollect = shipping.method === 'store_pickup' || shipping.method === 'clickcollect';
  const clientAddress = [
    client.address || client.street || order.shipping_address?.street || order.shipping_address?.address || '',
    `${client.postalCode || order.shipping_address?.postalCode || ''} ${client.city || order.shipping_address?.city || ''}`.trim(),
    client.country || order.shipping_address?.country || 'Suisse (CH)',
  ].filter(Boolean).join(', ');

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
      <tr style="border-bottom: 1px solid #222222;">
        <td style="padding: 12px 8px; width: 54px; vertical-align: top;">
          ${hasValidImg ? `
            <img src="${imgUrl}" alt="${name}" width="48" height="48" style="border-radius: 8px; border: 1px solid #333333; object-fit: contain; background: #000000; display: block;" />
          ` : `
            <div style="width: 48px; height: 48px; background: #222222; border-radius: 8px; text-align: center; line-height: 48px; font-size: 18px;">⚡</div>
          `}
        </td>
        <td style="padding: 12px 10px; vertical-align: top;">
          <div style="color: #ffffff; font-weight: bold; font-size: 13px; line-height: 1.4;">${name}</div>
          <div style="margin-top: 5px;">
            <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 5px;">
              ⚡ Saveur : <strong>${flavor}</strong>
            </span>
            ${format && format !== 'Format standard' ? `<span style="color: #888888; font-size: 11px; margin-left: 6px;">(${format})</span>` : ''}
          </div>
        </td>
        <td style="padding: 12px 8px; color: #cccccc; font-size: 13px; text-align: center; vertical-align: middle;">
          ${qty}
        </td>
        <td style="padding: 12px 8px; color: #ffffff; font-weight: bold; font-size: 13px; text-align: right; vertical-align: middle;">
          ${formatCurrency(lineTotal, currency)}
        </td>
      </tr>
    `;
  }).join('');

  const subtotal = order.subtotal !== undefined ? order.subtotal : (order.total || 0);
  const shippingCost = shipping.cost !== undefined ? shipping.cost : 0;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Confirmation de commande #${orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #080808; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
      <div style="max-width: 620px; margin: 20px auto; background-color: #121212; border: 1px solid #262626; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
        
        <!-- Header with Official Logo -->
        <div style="background-color: #0c0c0c; border-bottom: 2px solid #F80404; padding: 26px 28px; text-align: center;">
          <a href="https://nutrifitness.ch" target="_blank" style="text-decoration: none; display: inline-block;">
            <img src="https://nutrifitness.ch/images/brand/logo.png" alt="NutriFitness Genève" width="180" style="display: block; margin: 0 auto; max-width: 180px; height: auto; border: 0;" />
          </a>
          <div style="color: #888888; font-size: 11px; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
            🇨🇭 Nutrition Sportive Officielle · Boutique Genève
          </div>
        </div>

        <!-- Success Banner -->
        <div style="padding: 28px 28px 24px; text-align: center; background-color: #161616; border-bottom: 1px solid #242424;">
          <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; color: #10b981; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
            ✓
          </div>
          <h1 style="font-size: 21px; margin: 0 0 8px 0; color: #ffffff; text-transform: uppercase; font-weight: 900; letter-spacing: 0.5px;">
            Merci pour votre commande, ${clientName} ! 🎉
          </h1>
          <p style="font-size: 13px; color: #bbbbbb; margin: 0 auto; max-width: 480px; line-height: 1.6;">
            Votre commande <strong>#${orderNumber}</strong> est validée avec succès et prise en charge dans notre boutique physique à Genève. Nos préparateurs s'assurent de la conformité de vos saveurs !
          </p>
        </div>

        <div style="padding: 24px 28px;">
          
          <!-- Delivery instructions -->
          <div style="background-color: #1a1a1a; border-left: 4px solid ${isClickCollect ? '#38bdf8' : '#10b981'}; border-radius: 10px; padding: 16px 18px; margin-bottom: 24px;">
            <div style="font-weight: bold; font-size: 13px; color: #ffffff; margin-bottom: 6px;">
              ${isClickCollect ? '📍 Retrait en boutique Click & Collect' : '⚡ Expédition Express La Poste Suisse (PostPac Priority 24h)'}
            </div>
            <div style="font-size: 12px; color: #cccccc; line-height: 1.6;">
              ${isClickCollect
                ? 'Votre colis sera prêt sous <strong>2 heures ouvrables</strong> au <strong>Rue des Pâquis 34, 1201 Genève</strong>. Munissez-vous simplement de votre numéro de commande.'
                : 'Votre colis est en cours de conditionnement dans notre stock de Genève. Vous recevrez un numéro de suivi dès son expédition par La Poste Suisse.'
              }
            </div>
            ${clientAddress ? `
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #2a2a2a; font-size: 12px; color: #aaaaaa;">
                📍 <strong>Adresse de livraison :</strong> ${clientAddress}
              </div>
            ` : ''}
          </div>

          <!-- Items Recap with FLAVOR PROMINENCE -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 900; color: #F80404; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
              📦 Vos Articles & Saveurs Sélectionnées
            </div>
            <table style="width: 100%; border-collapse: collapse; background-color: #161616; border-radius: 12px; overflow: hidden; border: 1px solid #242424;">
              <thead>
                <tr style="background-color: #1f1f1f; text-align: left;">
                  <th style="padding: 10px; color: #888; font-size: 11px; text-transform: uppercase;" colspan="2">Article & Saveur</th>
                  <th style="padding: 10px; color: #888; font-size: 11px; text-transform: uppercase; text-align: center;">Qté</th>
                  <th style="padding: 10px; color: #888; font-size: 11px; text-transform: uppercase; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Total Calculation -->
          <div style="background-color: #171717; border: 1px solid #262626; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; font-size: 13px;">
            <table style="width: 100%; line-height: 1.8;">
              <tr>
                <td style="color: #888;">Sous-total :</td>
                <td style="text-align: right; color: #fff;">${formatCurrency(subtotal, currency)}</td>
              </tr>
              <tr>
                <td style="color: #888;">Livraison :</td>
                <td style="text-align: right; color: #fff;">${Number(shippingCost) === 0 ? '<span style="color:#10b981; font-weight:bold;">Gratuit (Offert)</span>' : formatCurrency(shippingCost, currency)}</td>
              </tr>
              <tr style="border-top: 1px solid #333333;">
                <td style="color: #fff; font-weight: bold; font-size: 15px; padding-top: 10px;">Total Réglé :</td>
                <td style="text-align: right; color: #F80404; font-weight: 900; font-size: 18px; padding-top: 10px;">${totalStr}</td>
              </tr>
            </table>
          </div>

          <!-- Customer Service Contact Card -->
          <div style="background-color: #171717; border: 1px solid #262626; border-radius: 12px; padding: 18px 20px; font-size: 12px; color: #aaaaaa; line-height: 1.6;">
            <table style="width: 100%;">
              <tr>
                <td style="vertical-align: middle;">
                  <strong style="color: #ffffff; font-size: 13px;">Une question sur votre commande ?</strong><br>
                  Notre équipe vous répond avec grand plaisir :<br>
                  📞 Tél / WhatsApp : <strong style="color: #fff;">+41 79 250 35 64</strong><br>
                  ✉️ Email : <a href="mailto:info@nutrifitness.ch" style="color: #38bdf8; text-decoration: none;">info@nutrifitness.ch</a><br>
                  📍 Boutique : Rue des Pâquis 34, 1201 Genève
                </td>
                <td style="text-align: right; vertical-align: middle; width: 140px;">
                  <a href="https://wa.me/41792503564" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; font-weight: 900; font-size: 12px; text-decoration: none; padding: 10px 14px; border-radius: 8px; text-align: center;">
                    WhatsApp Direct →
                  </a>
                </td>
              </tr>
            </table>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #0a0a0a; border-top: 1px solid #1f1f1f; padding: 20px 28px; text-align: center; color: #666666; font-size: 11px; line-height: 1.6;">
          NutriFitness.ch · Rue des Pâquis 34, 1201 Genève, Suisse · IDE CHE-177.751.159<br>
          Merci d'avoir choisi NutriFitness pour vos objectifs sportifs !
        </div>

      </div>
    </body>
    </html>
  `;

  return sendResendEmail({
    to: clientEmail,
    subject: `Merci pour votre commande #${orderNumber} ! 🇨🇭 NutriFitness Genève`,
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
