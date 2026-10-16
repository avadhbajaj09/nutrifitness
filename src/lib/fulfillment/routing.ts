import {
  CartItemForRouting,
  RoutingResult,
  StockInfo,
  CountryRule,
  ProductType,
  OriginId,
  RoutedShipment,
  BlockedItem,
} from './types';

export function getProductTypeFromStock(stock: StockInfo): ProductType {
  const genevaAvail = stock.genevaQty - stock.genevaReserved;
  const portugalAvail = stock.portugalQty - stock.portugalReserved;

  if (genevaAvail > 0 && portugalAvail > 0) return 'COMMON';
  if (genevaAvail > 0) return 'GENEVA_ONLY';
  if (portugalAvail > 0) return 'PORTUGAL_ONLY';
  return 'OUT_OF_STOCK';
}

export function getOriginRule(
  origin: OriginId,
  countryCode: string,
  rulesByOriginCountry: Map<string, CountryRule>
): CountryRule | undefined {
  return rulesByOriginCountry.get(`${origin}:${countryCode}`);
}

export function resolveShipments(
  items: CartItemForRouting[],
  countryCode: string,
  stockByProduct: Map<string, StockInfo>,
  rulesByOriginCountry: Map<string, CountryRule>
): RoutingResult {
  const isCustoms = ['CH', 'LI', 'UK', 'GB', 'NO', 'IS'].includes(countryCode);

  const shipment: RoutedShipment = {
    origin: 'PORTUGAL',
    items: [...items],
    countryCode,
    requiresCustoms: isCustoms,
    etaMin: 3,
    etaMax: 5,
    freeShippingThreshold: countryCode === 'CH' || countryCode === 'LI' ? 75 : 120,
  };

  return {
    shipments: items.length > 0 ? [shipment] : [],
    blockedItems: [],
  };
}
