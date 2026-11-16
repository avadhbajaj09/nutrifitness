import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Parse once: a request stream cannot be consumed twice.
    const body = await request.json().catch(() => ({}));
    const configuredSecret = process.env.ADMIN_REVALIDATE_SECRET?.trim();
    const suppliedSecret = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
      || searchParams.get('secret')
      || body.secret;

    // Never accept a hard-coded password or an undefined environment secret.
    if (!configuredSecret || suppliedSecret !== configuredSecret) {
      return NextResponse.json({ error: 'Invalid revalidation secret' }, { status: 401 });
    }
    const { path, tag } = body;

    if (path) {
      revalidatePath(path);
    }
    if (tag) {
      revalidateTag(tag);
    }

    // Default global paths
    revalidatePath('/');
    revalidatePath('/boutique');
    revalidatePath('/categorie');
    revalidatePath('/sitemap.xml');
    revalidateTag('products');

    return NextResponse.json({
      revalidated: true,
      path: path || 'all_main',
      tag: tag || 'products',
      now: Date.now()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
