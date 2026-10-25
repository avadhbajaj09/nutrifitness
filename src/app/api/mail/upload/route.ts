import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = getAdminSupabase();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Limit attachment size to 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Le fichier dépasse la taille maximale de 15 Mo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `attachments/${Date.now()}_${cleanFilename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('mail-attachments')
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    let publicUrl = '';
    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('mail-attachments')
        .getPublicUrl(path);
      publicUrl = urlData?.publicUrl || '';
    }

    return NextResponse.json({
      success: true,
      attachment: {
        filename: file.name,
        size: file.size,
        contentType: file.type || 'application/octet-stream',
        url: publicUrl,
        path: uploadData?.path || path,
        base64,
      },
    });
  } catch (err: any) {
    console.error('[Upload Attachment Error]', err);
    return NextResponse.json({ error: err.message || 'Erreur lors du téléchargement' }, { status: 500 });
  }
}
