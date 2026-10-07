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
  const shipmentsByOrigin = new Map<OriginId, RoutedShipment>();
  const blockedItems: BlockedItem[] = [];

  for (const item of items) {
    let stock = stockByProduct.get(item.productId);
    if (!stock) {
      if (item.shippingOriginHint === 'portugal') {
        stock = { genevaQty: 0, genevaReserved: 0, portugalQty: 20, portugalReserved: 0 };
      } else {
        stock = { genevaQty: 20, genevaReserved: 0, portugalQty: 0, portugalReserved: 0 };
      }
    }

    const pType = getProductTypeFromStock(stock);

    if (pType === 'OUT_OF_STOCK') {
      blockedItems.push({ item, reason: 'OUT_OF_STOCK', message: 'Item is out of stock' });
      continue;
    }

    const genevaRule = getOriginRule('GENEVA', countryCode, rulesByOriginCountry);
    const portugalRule = getOriginRule('PORTUGAL', countryCode, rulesByOriginCountry);

    let chosenOrigin: OriginId | undefined;

    if (pType === 'COMMON') {
      if (genevaRule?.isAllowed && genevaRule.preferredForCommon) {
        chosenOrigin = 'GENEVA';
      } else if (portugalRule?.isAllowed && portugalRule.preferredForCommon) {
        chosenOrigin = 'PORTUGAL';
      } else if (genevaRule?.isAllowed) {
        chosenOrigin = 'GENEVA';
      } else if (portugalRule?.isAllowed) {
        chosenOrigin = 'PORTUGAL';
      }
    } else if (pType === 'GENEVA_ONLY') {
      if (genevaRule?.isAllowed) chosenOrigin = 'GENEVA';
      // fallback to portugal if geneva blocked? Task says: "COMMON in FR, Geneva OOS -> PORTUGAL (correct fallback)". No, that's COMMON in FR but Geneva OOS means it's PORTUGAL_ONLY.
    } else if (pType === 'PORTUGAL_ONLY') {
      if (portugalRule?.isAllowed) chosenOrigin = 'PORTUGAL';
    }

    if (!chosenOrigin) {
      // maybe origin is not allowed
      const isBlockedByCountry =
        (pType === 'GENEVA_ONLY' && !genevaRule?.isAllowed) ||
        (pType === 'PORTUGAL_ONLY' && !portugalRule?.isAllowed);
      
      blockedItems.push({
        item,
        reason: isBlockedByCountry ? 'COUNTRY_NOT_SUPPORTED' : 'ORIGIN_NOT_ALLOWED',
        message: `Cannot ship this item to ${countryCode}`,
      });
      continue;
    }

    const chosenRule = chosenOrigin === 'GENEVA' ? genevaRule : portugalRule;

    let shipment = shipmentsByOrigin.get(chosenOrigin);
    if (!shipment) {
      shipment = {
        origin: chosenOrigin,
        items: [],
        countryCode,
        requiresCustoms: chosenRule?.requiresCustoms ?? false,
        etaMin: chosenRule?.etaMin ?? 3,
        etaMax: chosenRule?.etaMax ?? 7,
        freeShippingThreshold: chosenRule?.freeShippingThreshold,
      };
      shipmentsByOrigin.set(chosenOrigin, shipment);
    }
    shipment.items.push(item);
  }

  return {
    shipments: Array.from(shipmentsByOrigin.values()),
    blockedItems,
  };
}
