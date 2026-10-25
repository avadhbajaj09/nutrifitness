import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { getMailCounts } from '@/lib/email/mail-db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminSupabase();
    const id = params.id;

    const { data: email, error } = await supabase
      .from('emails')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !email) {
      return NextResponse.json({ error: 'E-mail introuvable' }, { status: 404 });
    }

    // Auto mark as read if currently unread
    if (!email.is_read) {
      await supabase
        .from('emails')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      email.is_read = true;
    }

    const counts = await getMailCounts(supabase);
    return NextResponse.json({ email, counts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminSupabase();
    const id = params.id;
    const body = await req.json();

    const allowedUpdates: any = {};
    if (typeof body.is_read === 'boolean') allowedUpdates.is_read = body.is_read;
    if (typeof body.is_starred === 'boolean') allowedUpdates.is_starred = body.is_starred;
    if (typeof body.folder === 'string') {
      allowedUpdates.folder = body.folder;
      if (body.folder === 'trash') {
        allowedUpdates.is_deleted = true;
        allowedUpdates.deleted_at = new Date().toISOString();
      } else {
        allowedUpdates.is_deleted = false;
        allowedUpdates.deleted_at = null;
      }
    }
    if (typeof body.is_deleted === 'boolean') {
      allowedUpdates.is_deleted = body.is_deleted;
      allowedUpdates.deleted_at = body.is_deleted ? new Date().toISOString() : null;
      if (body.is_deleted) allowedUpdates.folder = 'trash';
    }

    allowedUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('emails')
      .update(allowedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const counts = await getMailCounts(supabase);
    return NextResponse.json({ success: true, email: data, counts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminSupabase();
    const id = params.id;

    // Check current email state
    const { data: existing } = await supabase
      .from('emails')
      .select('folder, is_deleted')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'E-mail introuvable' }, { status: 404 });
    }

    if (existing.folder === 'trash' || existing.is_deleted) {
      // Hard delete from database
      const { error } = await supabase.from('emails').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const counts = await getMailCounts(supabase);
      return NextResponse.json({ success: true, action: 'permanently_deleted', counts });
    } else {
      // Soft delete: move to trash
      const { error } = await supabase
        .from('emails')
        .update({
          folder: 'trash',
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const counts = await getMailCounts(supabase);
      return NextResponse.json({ success: true, action: 'moved_to_trash', counts });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
