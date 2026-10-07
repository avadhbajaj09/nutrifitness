import { NextResponse } from 'next/server';
import { getAvailability } from '@/lib/fulfillment/availability';
import { products } from '@/lib/catalog';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const country = searchParams.get('country') || 'CH';

  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const result = await getAvailability(productId, product.shippingOrigin, country);
  
  return NextResponse.json(result);
}
