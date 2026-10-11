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

  const defaultFrom = process.env.RESEND_FROM_EMAIL || 'NutriFitness <orders@nutrifitness.ch>';
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
  const clientAddress = [
    client.address || order.shipping_address?.address || '',
    `${client.postalCode || order.shipping_address?.postalCode || ''} ${client.city || order.shipping_address?.city || ''}`.trim(),
    client.country || order.shipping_address?.country || 'CH',
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
  const paymentMethodLabel = paymentLabels[order.paymentMethod] || order.paymentMethod || 'Paiement Web';

  // Items table
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const itemsHtml = items.map((it: any) => {
    const name = it.name || it.product_name || 'Article';
    const variant = it.variant || it.flavor || it.taste ? ` <span style="color:#888;">(${it.variant || it.flavor || it.taste})</span>` : '';
    const qty = it.quantity || it.qty || 1;
    const price = it.price || it.unit_price || 0;
    const lineTotal = it.lineTotal || (price * qty);
    return `
      <tr style="border-bottom: 1px solid #222;">
        <td style="padding: 10px 8px; color: #fff; font-size: 13px;">${name}${variant}</td>
        <td style="padding: 10px 8px; color: #ccc; font-size: 13px; text-align: center;">${qty}</td>
        <td style="padding: 10px 8px; color: #ccc; font-size: 13px; text-align: right;">${formatCurrency(price, currency)}</td>
        <td style="padding: 10px 8px; color: #fff; font-weight: bold; font-size: 13px; text-align: right;">${formatCurrency(lineTotal, currency)}</td>
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
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #141414; border: 1px solid #262626; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #0f0f0f; border-bottom: 2px solid #F80404; padding: 24px 28px; text-align: left;">
          <table style="width: 100%;">
            <tr>
              <td>
                <div style="font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #ffffff; text-transform: uppercase;">
                  NUTRI<span style="color: #F80404;">FITNESS</span>.CH
                </div>
                <div style="color: #888888; font-size: 11px; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Notification Administrateur · Boutique Genève
                </div>
              </td>
              <td style="text-align: right;">
                <span style="background-color: rgba(248, 4, 4, 0.15); border: 1px solid rgba(248, 4, 4, 0.4); color: #F80404; font-size: 11px; font-weight: bold; padding: 5px 10px; border-radius: 20px; text-transform: uppercase;">
                  ⚡ Nouvelle Commande
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Order Highlight -->
        <div style="padding: 24px 28px; background-color: #181818; border-bottom: 1px solid #222;">
          <table style="width: 100%;">
            <tr>
              <td>
                <div style="font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold;">Commande N°</div>
                <div style="font-size: 20px; font-weight: bold; color: #fff; font-family: monospace; margin-top: 2px;">#${orderNumber}</div>
              </td>
              <td style="text-align: right;">
                <div style="font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold;">Montant Total</div>
                <div style="font-size: 22px; font-weight: 900; color: #F80404; margin-top: 2px;">${totalStr}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Content -->
        <div style="padding: 24px 28px;">
          
          <!-- Client & Delivery Info -->
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: bold; color: #F80404; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
              👤 Coordonnées du Client
            </div>
            <table style="width: 100%; font-size: 13px; line-height: 1.6;">
              <tr>
                <td style="color: #888; width: 110px;">Nom complet :</td>
                <td style="color: #fff; font-weight: bold;">${clientName}</td>
              </tr>
              <tr>
                <td style="color: #888;">Email :</td>
                <td style="color: #fff;"><a href="mailto:${clientEmail}" style="color: #38bdf8; text-decoration: none;">${clientEmail}</a></td>
              </tr>
              <tr>
                <td style="color: #888;">Téléphone :</td>
                <td style="color: #fff;"><a href="tel:${clientPhone}" style="color: #fff; text-decoration: none;">${clientPhone}</a></td>
              </tr>
              <tr>
                <td style="color: #888; vertical-align: top;">Adresse :</td>
                <td style="color: #fff;">${clientAddress || 'Non renseignée'}</td>
              </tr>
              <tr>
                <td style="color: #888; padding-top: 6px;">Mode d'envoi :</td>
                <td style="color: #10b981; font-weight: bold; padding-top: 6px;">${shippingMethodLabel}</td>
              </tr>
              <tr>
                <td style="color: #888;">Paiement :</td>
                <td style="color: #fff;">${paymentMethodLabel}</td>
              </tr>
            </table>
          </div>

          <!-- Articles Table -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: bold; color: #F80404; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
              📦 Détail des Articles (${items.length})
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #333; text-align: left;">
                  <th style="padding: 8px; color: #888; font-size: 11px; text-transform: uppercase;">Produit</th>
                  <th style="padding: 8px; color: #888; font-size: 11px; text-transform: uppercase; text-align: center;">Qté</th>
                  <th style="padding: 8px; color: #888; font-size: 11px; text-transform: uppercase; text-align: right;">Prix unit.</th>
                  <th style="padding: 8px; color: #888; font-size: 11px; text-transform: uppercase; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml || '<tr><td colspan="4" style="padding: 12px; color: #888; text-align: center;">Aucun article listé</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- Summary calculation -->
          <div style="background-color: #161616; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px;">
            <table style="width: 100%; line-height: 1.8;">
              <tr>
                <td style="color: #888;">Sous-total articles :</td>
                <td style="text-align: right; color: #fff;">${formatCurrency(subtotal, currency)}</td>
              </tr>
              <tr>
                <td style="color: #888;">Frais de livraison :</td>
                <td style="text-align: right; color: #fff;">${Number(shippingCost) === 0 ? '<span style="color:#10b981;">Gratuit</span>' : formatCurrency(shippingCost, currency)}</td>
              </tr>
              <tr>
                <td style="color: #888;">TVA 2.6% (incluse) :</td>
                <td style="text-align: right; color: #888;">${formatCurrency(vatAmount, currency)}</td>
              </tr>
              <tr style="border-top: 1px solid #333;">
                <td style="color: #fff; font-weight: bold; padding-top: 8px; font-size: 15px;">Total Réglé :</td>
                <td style="text-align: right; color: #F80404; font-weight: 900; padding-top: 8px; font-size: 17px;">${totalStr}</td>
              </tr>
            </table>
          </div>

          <!-- Button to admin -->
          <div style="text-align: center; margin-top: 28px;">
            <a href="https://nutrifitness.ch/wp-admin/" style="display: inline-block; background-color: #F80404; color: #000000; font-weight: 900; font-size: 13px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border-radius: 10px; letter-spacing: 0.5px;">
              Gérer la commande dans l'Admin →
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #0d0d0d; border-top: 1px solid #1f1f1f; padding: 18px 28px; text-align: center; color: #666; font-size: 11px;">
          NutriFitness Genève · Rue des Pâquis 34, 1201 Genève · Tél. +41 79 250 35 64<br>
          Cet email de notification est envoyé automatiquement à <a href="mailto:${adminEmail}" style="color: #888; text-decoration: none;">${adminEmail}</a>.
        </div>

      </div>
    </body>
    </html>
  `;

  return sendResendEmail({
    to: adminEmail,
    subject: `⚡ Nouvelle Commande #${orderNumber} (${totalStr}) · NutriFitness`,
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

  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const itemsHtml = items.map((it: any) => {
    const name = it.name || it.product_name || 'Article';
    const variant = it.variant || it.flavor || it.taste ? ` <span style="color:#888;">(${it.variant || it.flavor || it.taste})</span>` : '';
    const qty = it.quantity || it.qty || 1;
    const price = it.price || it.unit_price || 0;
    const lineTotal = it.lineTotal || (price * qty);
    return `
      <tr style="border-bottom: 1px solid #222;">
        <td style="padding: 10px 8px; color: #fff; font-size: 13px;">${name}${variant}</td>
        <td style="padding: 10px 8px; color: #ccc; font-size: 13px; text-align: center;">${qty}</td>
        <td style="padding: 10px 8px; color: #fff; font-weight: bold; font-size: 13px; text-align: right;">${formatCurrency(lineTotal, currency)}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Confirmation de commande #${orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #141414; border: 1px solid #262626; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #0f0f0f; border-bottom: 2px solid #F80404; padding: 24px 28px; text-align: center;">
          <div style="font-size: 22px; font-weight: 900; letter-spacing: 1px; color: #ffffff; text-transform: uppercase;">
            NUTRI<span style="color: #F80404;">FITNESS</span>.CH
          </div>
          <div style="color: #888888; font-size: 11px; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
            Nutrition Sportive & Protéines à Genève · Suisse
          </div>
        </div>

        <!-- Success Banner -->
        <div style="padding: 24px 28px; text-align: center; background-color: #181818; border-bottom: 1px solid #222;">
          <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; color: #10b981; font-size: 20px; font-weight: bold; margin-bottom: 12px;">
            ✓
          </div>
          <h1 style="font-size: 20px; margin: 0 0 6px 0; color: #ffffff; text-transform: uppercase;">
            Merci pour votre commande, ${clientName} !
          </h1>
          <p style="font-size: 13px; color: #aaaaaa; margin: 0; line-height: 1.5;">
            Votre commande <strong>#${orderNumber}</strong> est validée et en cours de préparation dans notre stock physique à Genève.
          </p>
        </div>

        <div style="padding: 24px 28px;">
          
          <!-- Delivery instructions -->
          <div style="background-color: #1c1c1c; border-left: 3px solid ${isClickCollect ? '#38bdf8' : '#10b981'}; border-radius: 8px; padding: 14px 16px; margin-bottom: 22px;">
            <div style="font-weight: bold; font-size: 13px; color: #ffffff; margin-bottom: 4px;">
              ${isClickCollect ? '📍 Retrait en boutique Click & Collect' : '⚡ Expédition La Poste Suisse (PostPac Priority)'}
            </div>
            <div style="font-size: 12px; color: #bbbbbb; line-height: 1.5;">
              ${isClickCollect
                ? 'Votre commande sera disponible sous <strong>2 heures ouvrables</strong> au <strong>Rue des Pâquis 34, 1201 Genève</strong>. Munissez-vous simplement de votre numéro de commande.'
                : 'Votre colis sera expédié sous 24h ouvrées depuis notre dépôt de Genève. Vous recevrez un numéro de suivi dès la prise en charge par La Poste Suisse.'
              }
            </div>
          </div>

          <!-- Items -->
          <div style="margin-bottom: 22px;">
            <div style="font-size: 12px; font-weight: bold; color: #F80404; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
              Récapitulatif de vos articles
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #333; text-align: left;">
                  <th style="padding: 8px; color: #888; font-size: 11px; text-transform: uppercase;">Article</th>
                  <th style="padding: 8px; color: #888; font-size: 11px; text-transform: uppercase; text-align: center;">Qté</th>
                  <th style="padding: 8px; color: #888; font-size: 11px; text-transform: uppercase; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Total -->
          <div style="background-color: #161616; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px;">
            <table style="width: 100%; line-height: 1.8;">
              <tr style="border-top: 1px solid #333;">
                <td style="color: #fff; font-weight: bold; font-size: 14px;">Total payé :</td>
                <td style="text-align: right; color: #F80404; font-weight: 900; font-size: 16px;">${totalStr}</td>
              </tr>
            </table>
          </div>

          <!-- Store Contact -->
          <div style="background-color: #161616; border: 1px solid #222; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #aaa; line-height: 1.6;">
            <strong>Une question sur votre commande ?</strong><br>
            Notre équipe vous répond avec plaisir à la boutique de Genève ou par WhatsApp / téléphone au <strong>+41 79 250 35 64</strong> ou par email à <a href="mailto:orders@nutrifitness.ch" style="color: #38bdf8; text-decoration: none;">orders@nutrifitness.ch</a>.
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #0d0d0d; border-top: 1px solid #1f1f1f; padding: 18px 28px; text-align: center; color: #666; font-size: 11px;">
          NutriFitness.ch · Rue des Pâquis 34, 1201 Genève, Suisse · IDE CHE-177.751.159
        </div>

      </div>
    </body>
    </html>
  `;

  return sendResendEmail({
    to: clientEmail,
    subject: `Votre commande NutriFitness #${orderNumber} est confirmée 🚀`,
    html,
    replyTo: 'orders@nutrifitness.ch',
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
