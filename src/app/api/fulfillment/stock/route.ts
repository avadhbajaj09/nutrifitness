import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Stub for now, returning mock data
  const data = [
    { productId: 'p1', name: 'Whey Protein', sku: 'WP-01', genevaQty: 10, portugalQty: 50, type: 'COMMON' }
  ];
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  console.log('Stock updated:', body);
  return NextResponse.json({ success: true });
}
