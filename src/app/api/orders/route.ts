import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Local cache / fallback store for resilience
declare global {
  // eslint-disable-next-line no-var
  var __nutrifitness_orders__: any[] | undefined;
}

const TMP_FILE = path.join('/tmp', 'nutrifitness_orders.json');

function loadLocalOrders(): any[] {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalOrders(orders: any[]) {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(orders), 'utf-8');
  } catch {
    // ignore
  }
}

// Convert Supabase database row to PosSaleRecord format
function supabaseRowToSaleRecord(row: any): any {
  const addr = (row.shipping_address && typeof row.shipping_address === 'object') ? row.shipping_address : {};
  const isPos = (row.order_number || '').startsWith('TKT-') || (row.order_number || '').startsWith('POS-');
  const total = Number(row.total_amount) || 0;
  const vatEst = addr.vatAmount !== undefined ? Number(addr.vatAmount) : (total * 0.026) / 1.026;

  const rawPayment = (row.payment_method || 'twint').toLowerCase();
  const paymentMethod = rawPayment === 'twint' ? 'twint'
    : (rawPayment === 'cash' || rawPayment === 'cash_chf') ? 'cash_chf'
    : rawPayment === 'cash_eur' ? 'cash_eur'
    : rawPayment === 'invoice' ? 'invoice'
    : 'card';

  return {
    id: row.id,
    ticketNumber: row.order_number || `NF-${row.id.slice(0, 8)}`,
    timestamp: row.created_at || new Date().toISOString(),
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: addr.subtotal !== undefined ? Number(addr.subtotal) : total,
    discountPercent: Number(addr.discountPercent) || 0,
    discountAmount: Number(addr.discountAmount) || 0,
    vatAmount: vatEst,
    total: total,
    amountReceived: total,
    paymentMethod,
    paymentDetails: {
      reference: addr.reference || `${row.payment_method?.toUpperCase() || 'PAY'}-${row.order_number}`,
      cardType: addr.cardType,
      cashReceived: addr.cashReceived,
      changeGiven: addr.changeGiven,
      notes: addr.notes || `Commande synchronisée via Supabase (${row.currency || 'CHF'})`
    },
    seller: addr.seller || (isPos ? 'Boutique Genève (Caisse POS)' : 'Site Web Public (nutrifitness.ch)'),
    client: {
      name: row.customer_name || 'Avadh Bajaj',
      phone: row.customer_phone || '+91 88789 33778',
      email: row.customer_email || 'avadhbajaj09@gmail.com',
      address: addr.address || 'Rue des Pâquis 34',
      city: addr.city || 'Genève',
      postalCode: addr.postalCode || '1201'
    },
    shipping: {
      method: addr.shippingMethod || (isPos ? 'store_pickup' : 'post_priority'),
      label: addr.shippingLabel || (isPos ? 'Retrait Boutique Genève' : 'PostPac Priority (La Poste Suisse 24h)'),
      cost: Number(addr.shippingCost) || 0,
      trackingNumber: addr.trackingNumber || undefined
    },
    status: (['pending', 'in_processing', 'packed', 'shipped', 'delivered', 'cancelled'].includes(row.status))
      ? row.status
      : 'in_processing',
    clientName: row.customer_name || 'Avadh Bajaj'
  };
}

// Convert PosSaleRecord or checkout payload to Supabase row format
function saleRecordToSupabaseRow(payload: any): any {
  const clientObj = payload.client || {};
  const clientName = clientObj.name || payload.clientName || 'Avadh Bajaj';
  const clientPhone = clientObj.phone || payload.customerPhone || '+91 88789 33778';
  const clientEmail = clientObj.email || payload.customerEmail || 'avadhbajaj09@gmail.com';

  const shippingObj = payload.shipping || {};
  const paymentDetails = payload.paymentDetails || {};

  return {
    order_number: payload.ticketNumber || `WEB-${Math.floor(100000 + Math.random() * 900000)}`,
    customer_name: clientName,
    customer_email: clientEmail,
    customer_phone: clientPhone,
    shipping_address: {
      address: clientObj.address || 'Rue des Pâquis 34',
      city: clientObj.city || 'Genève',
      postalCode: clientObj.postalCode || '1201',
      country: 'Suisse',
      shippingMethod: shippingObj.method || 'post_priority',
      shippingLabel: shippingObj.label || 'PostPac Priority (La Poste Suisse 24h)',
      shippingCost: Number(shippingObj.cost) || 0,
      notes: paymentDetails.notes || '',
      reference: paymentDetails.reference || '',
      cardType: paymentDetails.cardType || '',
      cashReceived: paymentDetails.cashReceived || 0,
      changeGiven: paymentDetails.changeGiven || 0,
      discountPercent: payload.discountPercent || 0,
      discountAmount: payload.discountAmount || 0,
      vatAmount: payload.vatAmount || 0,
      subtotal: payload.subtotal || 0,
      seller: payload.seller || 'Site Web Public (nutrifitness.ch)'
    },
    items: Array.isArray(payload.items) ? payload.items : [],
    total_amount: Number(payload.total) || 0,
    currency: 'CHF',
    payment_method: (payload.paymentMethod || 'TWINT').toUpperCase(),
    status: payload.status || 'in_processing'
  };
}

export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const mappedOrders = data.map(supabaseRowToSaleRecord);
      // Update local cache
      saveLocalOrders(mappedOrders);
      return NextResponse.json({
        orders: mappedOrders,
        supabaseConnected: true,
        count: mappedOrders.length
      });
    }

    console.warn('[Orders API] Supabase query returned error:', error);
  } catch (err: any) {
    console.error('[Orders API] Error fetching from Supabase:', err);
  }

  // Graceful fallback to local cache
  const localOrders = loadLocalOrders();
  return NextResponse.json({
    orders: localOrders,
    supabaseConnected: false,
    count: localOrders.length
  });
}

export async function POST(req: Request) {
  try {
    const newOrder = await req.json();
    if (!newOrder) {
      return NextResponse.json({ error: 'Commande invalide' }, { status: 400 });
    }

    const rowToInsert = saleRecordToSupabaseRow(newOrder);
    let insertedRecord = null;
    let isSupabaseOk = false;

    try {
      const supabase = getAdminSupabase();
      const { data, error } = await supabase
        .from('orders')
        .insert(rowToInsert)
        .select()
        .single();

      if (!error && data) {
        insertedRecord = supabaseRowToSaleRecord(data);
        isSupabaseOk = true;
      } else {
        console.warn('[Orders API] Supabase insert warning:', error);
      }
    } catch (sbErr) {
      console.error('[Orders API] Supabase insert failed:', sbErr);
    }

    // Save also locally for instant local availability
    const finalRecord = insertedRecord || {
      ...newOrder,
      id: newOrder.id || `order-${Date.now()}`
    };

    const currentOrders = loadLocalOrders();
    const exists = currentOrders.some((o: any) => o.ticketNumber === finalRecord.ticketNumber);
    if (!exists) {
      currentOrders.unshift(finalRecord);
      saveLocalOrders(currentOrders);
    }

    return NextResponse.json({
      success: true,
      order: finalRecord,
      supabaseConnected: isSupabaseOk
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    let isSupabaseOk = false;
    try {
      const supabase = getAdminSupabase();
      // Try updating by order_number first (e.g. WEB-882049, TKT-1001)
      const resByNum = await supabase
        .from('orders')
        .update({ status })
        .eq('order_number', id)
        .select();

      if (resByNum.data && resByNum.data.length > 0) {
        isSupabaseOk = true;
      } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        // If id is UUID
        const resById = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id)
          .select();
        if (resById.data && resById.data.length > 0) {
          isSupabaseOk = true;
        }
      }
    } catch (sbErr) {
      console.error('[Orders API] Supabase update status failed:', sbErr);
    }

    // Also update local cache
    const currentOrders = loadLocalOrders();
    const idx = currentOrders.findIndex((o: any) => o.id === id || o.ticketNumber === id);
    if (idx >= 0) {
      currentOrders[idx].status = status;
      saveLocalOrders(currentOrders);
    }

    return NextResponse.json({ success: true, supabaseConnected: isSupabaseOk });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
