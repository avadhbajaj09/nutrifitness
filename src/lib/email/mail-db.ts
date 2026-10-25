import { SupabaseClient } from '@supabase/supabase-js';

export interface MailCounts {
  inbox: number;
  inboxUnread: number;
  sent: number;
  trash: number;
}

export async function getMailCounts(supabase: SupabaseClient): Promise<MailCounts> {
  const [inboxTotal, inboxUnread, sentTotal, trashTotal] = await Promise.all([
    supabase.from('emails').select('*', { count: 'exact', head: true }).eq('folder', 'inbox').eq('is_deleted', false),
    supabase.from('emails').select('*', { count: 'exact', head: true }).eq('folder', 'inbox').eq('is_deleted', false).eq('is_read', false),
    supabase.from('emails').select('*', { count: 'exact', head: true }).eq('folder', 'sent').eq('is_deleted', false),
    supabase.from('emails').select('*', { count: 'exact', head: true }).or('folder.eq.trash,is_deleted.eq.true'),
  ]);

  return {
    inbox: inboxTotal.count || 0,
    inboxUnread: inboxUnread.count || 0,
    sent: sentTotal.count || 0,
    trash: trashTotal.count || 0,
  };
}
