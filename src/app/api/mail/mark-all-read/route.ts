import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { getMailCounts } from '@/lib/email/mail-db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = getAdminSupabase();

    const { error } = await supabase
      .from('emails')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('folder', 'inbox')
      .eq('is_deleted', false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const counts = await getMailCounts(supabase);

    return NextResponse.json({
      success: true,
      counts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
