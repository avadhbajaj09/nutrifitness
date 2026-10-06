import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In-memory global store to survive warm lambda invocations
declare global {
  // eslint-disable-next-line no-var
  var __nutrifitness_orders__: any[] | undefined;
}

const TMP_FILE = path.join('/tmp', 'nutrifitness_orders.json');

function loadOrdersFromFile(): any[] {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveOrdersToFile(orders: any[]) {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(orders), 'utf-8');
  } catch {
    // ignore
  }
}

function getStoredOrders(): any[] {
  if (!globalThis.__nutrifitness_orders__) {
    globalThis.__nutrifitness_orders__ = loadOrdersFromFile();
  }
  return globalThis.__nutrifitness_orders__;
}

export async function GET() {
  const orders = getStoredOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    const newOrder = await req.json();
    if (!newOrder || !newOrder.id) {
      return NextResponse.json({ error: 'Commande invalide' }, { status: 400 });
    }

    const currentOrders = getStoredOrders();
    // Prepend new order if not already present
    const exists = currentOrders.some((o: any) => o.id === newOrder.id || o.ticketNumber === newOrder.ticketNumber);
    if (!exists) {
      currentOrders.unshift(newOrder);
      saveOrdersToFile(currentOrders);
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const currentOrders = getStoredOrders();
    const orderIndex = currentOrders.findIndex((o: any) => o.id === id);
    if (orderIndex >= 0) {
      currentOrders[orderIndex].status = status;
      saveOrdersToFile(currentOrders);
      return NextResponse.json({ success: true, order: currentOrders[orderIndex] });
    }

    return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
