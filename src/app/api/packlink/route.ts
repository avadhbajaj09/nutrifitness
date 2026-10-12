import { NextResponse } from 'next/server';
import { getPacklinkUser, getPacklinkShipments, getPacklinkServices, createPacklinkDraft } from '@/lib/packlink/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/packlink/
 * Returns connection status, authenticated account details and shipment history
 */
export async function GET() {
  try {
    const [user, shipmentsData] = await Promise.all([
      getPacklinkUser().catch((err) => ({ error: err.message })),
      getPacklinkShipments().catch(() => ({ shipments: [] })),
    ]);

    const isConnected = !user.error && Boolean(user.email || user.id);

    return NextResponse.json({
      success: true,
      connected: isConnected,
      account: {
        email: user.email || 'marco.scarpantoni@hotmail.com',
        registered: user.registered ?? true,
        platform: 'PRO',
      },
      shipments: shipmentsData.shipments || [],
      totalShipments: shipmentsData.pagination?.total_registers ?? (shipmentsData.shipments?.length || 0),
    });
  } catch (error: any) {
    console.error('Packlink API status error:', error);
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error.message || 'Erreur de connexion Packlink PRO',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/packlink/
 * Allows quoting live rates or creating draft shipments
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'rates') {
      const { fromCountry, fromZip, toCountry, toZip, weightKg } = body;
      const services = await getPacklinkServices({
        fromCountry: fromCountry || 'PT',
        fromZip: fromZip || '3720-000',
        toCountry: toCountry || 'FR',
        toZip: toZip || '75001',
        weightKg: weightKg || 1,
      });
      return NextResponse.json({ success: true, services });
    }

    if (action === 'create_draft') {
      const draft = await createPacklinkDraft(body.draft);
      return NextResponse.json({ success: true, draft });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error: any) {
    console.error('Packlink POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur Packlink' },
      { status: 500 }
    );
  }
}
