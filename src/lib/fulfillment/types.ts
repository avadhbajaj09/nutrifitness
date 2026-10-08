import { z } from 'zod';

export type OriginId = 'GENEVA' | 'PORTUGAL';
export type ProductType = 'COMMON' | 'GENEVA_ONLY' | 'PORTUGAL_ONLY' | 'OUT_OF_STOCK';
export type BlockReason = 'COUNTRY_NOT_SUPPORTED' | 'OUT_OF_STOCK' | 'ORIGIN_NOT_ALLOWED';

export type ShipmentStatus =
  | 'pending'
  | 'label_created'
  | 'label_printed'
  | 'in_transit'
  | 'delivered'
  | 'exception'
  | 'needs_attention'
  | 'cancelled';

export interface StockInfo {
  genevaQty: number;
  genevaReserved: number;
  portugalQty: number;
  portugalReserved: number;
}

export interface CountryRule {
  originId: OriginId;
  countryCode: string;
  isAllowed: boolean;
  preferredForCommon: boolean;
  etaMin: number;
  etaMax: number;
  freeShippingThreshold?: number;
  requiresCustoms: boolean;
}

export interface CartItemForRouting {
  productId: string;
  variantSku: string;
  quantity: number;
  priceChf: number;
  weightGrams?: number;
  hsCode?: string;
  countryOfManufacture?: string;
  name: string;
  shippingOriginHint?: 'switzerland' | 'portugal' | 'common'; // from catalog
}

export interface RoutedShipment {
  origin: OriginId;
  items: CartItemForRouting[];
  countryCode: string;
  requiresCustoms: boolean;
  etaMin: number;
  etaMax: number;
  estimatedShippingCost?: number;
  freeShippingThreshold?: number;
}

export interface BlockedItem {
  item: CartItemForRouting;
  reason: BlockReason;
  message: string;
}

export interface RoutingResult {
  shipments: RoutedShipment[];
  blockedItems: BlockedItem[];
}

export interface AvailabilityResult {
  available: boolean;
  origin?: OriginId;
  etaMin?: number;
  etaMax?: number;
  dutiesNote?: string;
  label: string;
  labelFr: string;
  labelEn: string;
  isCommon?: boolean;
  commonNote?: string;
}

// Zod validators
export const CartItemForRoutingSchema = z.object({
  productId: z.string(),
  variantSku: z.string(),
  quantity: z.number().int().min(1),
  priceChf: z.number().min(0),
  weightGrams: z.number().optional(),
  hsCode: z.string().optional(),
  countryOfManufacture: z.string().optional(),
  name: z.string(),
  shippingOriginHint: z.enum(['switzerland', 'portugal', 'common']).optional(),
});

export const RatesRequestSchema = z.object({
  cartItems: z.array(CartItemForRoutingSchema),
  countryCode: z.string().length(2),
  shippingAddress: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    postal_code: z.string(),
    country: z.string().length(2),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
});
