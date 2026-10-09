import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const OMAR_PASSWORD = process.env.OMAR_ADMIN_PASSWORD || 'TeamOmar@23277';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body || {};

    if (!password || password !== OMAR_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Invalid password for Omar Portugal Team.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authenticated as Omar Portugal Logistics Team.',
      warehouse: 'Portugal (Oliveira de Azeméis)',
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
