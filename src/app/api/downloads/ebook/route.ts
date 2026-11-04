import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PDF_FILES: Record<string, { filename: string; displayName: string }> = {
  fr: {
    filename: 'guide-complements-alimentaires-fr.pdf',
    displayName: 'NutriFitness-Guide-Ultime-Complements-FR.pdf'
  },
  en: {
    filename: 'guide-dietary-supplements-en.pdf',
    displayName: 'NutriFitness-Ultimate-Supplements-Guide-EN.pdf'
  },
  de: {
    filename: 'leitfaden-nahrungserganzungsmittel-de.pdf',
    displayName: 'NutriFitness-Supplements-Leitfaden-DE.pdf'
  },
  it: {
    filename: 'guida-integratori-alimentari-it.pdf',
    displayName: 'NutriFitness-Guida-Integratori-IT.pdf'
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const langRaw = (searchParams.get('lang') || 'fr').toLowerCase().trim();
    const lang = ['fr', 'en', 'de', 'it'].includes(langRaw) ? langRaw : 'fr';

    const fileMeta = PDF_FILES[lang] || PDF_FILES.fr;
    const filePath = path.join(process.cwd(), 'public', 'downloads', fileMeta.filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Fichier en cours de préparation.' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileMeta.displayName}"`,
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (err: any) {
    console.error('[Ebook Download Error]', err);
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 });
  }
}
