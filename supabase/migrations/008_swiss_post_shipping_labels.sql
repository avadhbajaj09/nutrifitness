-- Migration 008: Swiss Post Barcode & Shipping Labels for nutrifitness.ch
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_label_url text,
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS shipping_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS label_created_at timestamptz,
ADD COLUMN IF NOT EXISTS package_weight numeric DEFAULT 1.0;

-- Indexes for lightning-fast tracking lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON orders(shipping_status);
