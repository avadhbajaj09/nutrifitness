import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin');
  
  // Stub
  return NextResponse.json([
    { id: '1', order_id: 'ORD-123', status: 'pending', items: [{name: 'Test Item', quantity: 1}], origin_id: origin }
  ]);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  console.log('Shipment updated:', body);
  return NextResponse.json({ success: true });
}
