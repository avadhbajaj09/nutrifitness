import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { clearDeliveryCache } from '@/lib/delivery/service';
import {
  DEFAULT_DELIVERY_RULES,
  DEFAULT_COUNTRY_GROUPS,
  DEFAULT_HOLIDAYS,
  DEFAULT_DELIVERY_SETTINGS
} from '@/lib/delivery/defaults';
import { DeliveryRule } from '@/lib/delivery/types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    // 1. Load Rules
    const { data: rulesData, error: rulesErr } = await supabase
      .from('delivery_rules')
      .select('*')
      .order('origin', { ascending: true })
      .order('country_code', { ascending: true });

    // 2. Load Country Groups
    const { data: groupsData } = await supabase
      .from('delivery_country_groups')
      .select('*');

    // 3. Load Holidays
    const { data: holidaysData } = await supabase
      .from('delivery_holidays')
      .select('*')
      .order('date', { ascending: true });

    // 4. Load Settings
    const { data: settingsData } = await supabase
      .from('delivery_settings')
      .select('*')
      .single();

    // 5. Load Shipments for Promised vs Delivered stats
    const { data: shipmentsData } = await supabase
      .from('fulfillment_shipments')
      .select('id, order_id, origin_id, status, carrier, tracking_number, promised_date, delivered_at, fulfilment_location, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    const rules: DeliveryRule[] = (rulesData && rulesData.length > 0)
      ? rulesData
      : DEFAULT_DELIVERY_RULES;

    const countryGroups = (groupsData && groupsData.length > 0)
      ? groupsData
      : DEFAULT_COUNTRY_GROUPS;

    const holidays = (holidaysData && holidaysData.length > 0)
      ? holidaysData
      : DEFAULT_HOLIDAYS;

    const settings = settingsData || DEFAULT_DELIVERY_SETTINGS;

    return NextResponse.json({
      success: true,
      rules,
      countryGroups,
      holidays,
      settings,
      shipments: shipmentsData || []
    });
  } catch (error: any) {
    console.error('[Admin Shipping API GET] Error:', error);
    return NextResponse.json({
      success: true,
      rules: DEFAULT_DELIVERY_RULES,
      countryGroups: DEFAULT_COUNTRY_GROUPS,
      holidays: DEFAULT_HOLIDAYS,
      settings: DEFAULT_DELIVERY_SETTINGS,
      shipments: []
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const supabase = getAdminSupabase();

    if (action === 'update_rule') {
      const { rule } = body;
      if (!rule) {
        return NextResponse.json({ error: 'Missing rule object' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('delivery_rules')
        .upsert({
          ...(rule.id ? { id: rule.id } : {}),
          origin: rule.origin,
          country_code: rule.country_code || null,
          country_group: rule.country_group || null,
          shipping_method: rule.shipping_method || null,
          is_allowed: rule.is_allowed ?? true,
          handling_days: rule.handling_days ?? 0,
          cutoff_time: rule.cutoff_time || '14:00',
          transit_min_days: rule.transit_min_days ?? 1,
          transit_max_days: rule.transit_max_days ?? 3,
          requires_customs: rule.requires_customs ?? false,
          customs_buffer_days: rule.customs_buffer_days ?? 0,
          delivers_saturday: rule.delivers_saturday ?? false,
          is_active: rule.is_active ?? true,
          needs_verification: rule.needs_verification ?? false,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      clearDeliveryCache();
      return NextResponse.json({ success: true, rule: data });
    }

    if (action === 'toggle_rule') {
      const { id, is_active } = body;
      if (!id) {
        return NextResponse.json({ error: 'Missing rule id' }, { status: 400 });
      }

      const { error } = await supabase
        .from('delivery_rules')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      clearDeliveryCache();
      return NextResponse.json({ success: true });
    }

    if (action === 'bulk_update_rules') {
      const { ids, updates } = body;
      if (!Array.isArray(ids) || ids.length === 0 || !updates) {
        return NextResponse.json({ error: 'Missing ids or updates' }, { status: 400 });
      }

      const { error } = await supabase
        .from('delivery_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', ids);

      if (error) throw error;
      clearDeliveryCache();
      return NextResponse.json({ success: true, updatedCount: ids.length });
    }

    if (action === 'add_holiday') {
      const { calendar, date, name } = body;
      if (!calendar || !date || !name) {
        return NextResponse.json({ error: 'Missing holiday fields' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('delivery_holidays')
        .insert({ calendar, date, name })
        .select()
        .single();

      if (error) throw error;
      clearDeliveryCache();
      return NextResponse.json({ success: true, holiday: data });
    }

    if (action === 'delete_holiday') {
      const { id, calendar, date } = body;
      let query = supabase.from('delivery_holidays').delete();

      if (id) {
        query = query.eq('id', id);
      } else if (calendar && date) {
        query = query.eq('calendar', calendar).eq('date', date);
      } else {
        return NextResponse.json({ error: 'Missing id or calendar+date' }, { status: 400 });
      }

      const { error } = await query;
      if (error) throw error;
      clearDeliveryCache();
      return NextResponse.json({ success: true });
    }

    if (action === 'update_settings') {
      const { extra_delay_days, banner_text } = body;
      const { error } = await supabase
        .from('delivery_settings')
        .upsert({
          id: 1,
          extra_delay_days: extra_delay_days ?? 0,
          banner_text: banner_text || '',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      clearDeliveryCache();
      return NextResponse.json({ success: true });
    }

    if (action === 'import_rules_csv') {
      const { rules: csvRules } = body;
      if (!Array.isArray(csvRules) || csvRules.length === 0) {
        return NextResponse.json({ error: 'No rules provided' }, { status: 400 });
      }

      // Upsert rules
      const toUpsert = csvRules.map(r => ({
        origin: r.origin,
        country_code: r.country_code || null,
        country_group: r.country_group || null,
        shipping_method: r.shipping_method || null,
        is_allowed: r.is_allowed ?? true,
        handling_days: parseInt(r.handling_days, 10) || 0,
        cutoff_time: r.cutoff_time || '14:00',
        transit_min_days: parseInt(r.transit_min_days, 10) || 1,
        transit_max_days: parseInt(r.transit_max_days, 10) || 3,
        requires_customs: Boolean(r.requires_customs),
        customs_buffer_days: parseInt(r.customs_buffer_days, 10) || 0,
        delivers_saturday: Boolean(r.delivers_saturday),
        is_active: r.is_active ?? true,
        needs_verification: false,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('delivery_rules')
        .upsert(toUpsert, { onConflict: 'origin,country_code,shipping_method' });

      if (error) throw error;
      clearDeliveryCache();
      return NextResponse.json({ success: true, importedCount: toUpsert.length });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Admin Shipping API POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
