'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, CATEGORIES } from '@/lib/catalog';
import type { ProductItem, ProductVariant, SupportedLocale } from '@/lib/types';
import { 
  Package, 
  Store, 
  Receipt, 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Printer, 
  LogOut, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ExternalLink, 
  Tag, 
  Percent, 
  Layers, 
  Info, 
  Clock, 
  Calendar, 
  Download, 
  Upload,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Edit3,
  Truck,
  Phone,
  Mail,
  MapPin,
  User,
  RefreshCw,
  Zap,
  Split,
  Sliders,
  FileText,
  CheckCircle2
} from 'lucide-react';
import ProductEditorModal from './ProductEditorModal';

const ADMIN_PASSWORD = 'Geneva@03564';

export type OrderStatus = 'pending' | 'in_processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; icon: string; bg: string; text: string; border: string }> = {
  in_processing: {
    label: 'En traitement',
    icon: '🟡',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300'
  },
  packed: {
    label: 'Emballé',
    icon: '📦',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-300'
  },
  shipped: {
    label: 'Expédié',
    icon: '🚚',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-300'
  },
  delivered: {
    label: 'Livré / Remis',
    icon: '✅',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300'
  },
  pending: {
    label: 'En attente',
    icon: '⏳',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-300'
  },
  cancelled: {
    label: 'Annulé',
    icon: '❌',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-300'
  }
};

export interface PosTicketItem {
  id: string; // unique item key
  productId: string;
  variantId: string;
  name: string;
  brand: string;
  flavor: string;
  format: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  vatRate: number; // e.g. 2.6
}

export interface PosSaleRecord {
  id: string;
  ticketNumber: string;
  timestamp: string;
  items: PosTicketItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  amountReceived: number;
  paymentMethod: 'twint' | 'card' | 'cash_chf' | 'cash_eur' | 'invoice' | 'split';
  paymentDetails: {
    reference?: string;
    cashReceived?: number;
    changeGiven?: number;
    cardType?: string;
    notes?: string;
    splitCash?: number;
    splitOther?: number;
    splitOtherMethod?: string;
  };
  seller: string;
  client?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  shipping?: {
    method: 'store_pickup' | 'post_priority' | 'post_economy' | 'express_geneva';
    label: string;
    cost: number;
    trackingNumber?: string;
  };
  status: OrderStatus;
  clientName?: string;
}

// CSV Parser Helper supporting quotes, multiline content, commas and semicolons
function parseCsvText(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if ((char === ',' || char === ';') && !insideQuote) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell);
      currentCell = '';
      if (currentRow.length > 0 && currentRow.some(c => c.trim().length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    lines.push(currentRow);
  }

  return lines;
}

// Play pleasant POS beep when barcode is scanned or item added
function playScannerBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Audio might be suppressed by browser policy if no user gesture
  }
}


// ─── Fulfillment sub-components ───────────────────────────────────────────────

function FulfillmentStocksTab() {
  const [stocks, setStocks] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<{ geneva: number; portugal: number }>({ geneva: 0, portugal: 0 });

  useEffect(() => {
    void fetch('/api/fulfillment/stock/')
      .then((r) => r.json())
      .then((d) => { setStocks(d.stock ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Group stocks by product_id
  const byProduct = useMemo(() => {
    const map = new Map<string, { productId: string; productSku: string; genevaQty: number; ptQty: number }>();
    for (const row of stocks) {
      const pid = row.product_id as string;
      const sk = row.product_sku as string;
      if (!map.has(pid)) map.set(pid, { productId: pid, productSku: sk, genevaQty: 0, ptQty: 0 });
      const entry = map.get(pid)!;
      if (row.origin_id === 'GENEVA') entry.genevaQty += row.quantity as number;
      else entry.ptQty += row.quantity as number;
    }
    return [...map.values()];
  }, [stocks]);

  async function handleSave(productId: string, productSku: string) {
    for (const [originId, quantity] of [['GENEVA', editVal.geneva], ['PORTUGAL', editVal.portugal]] as const) {
      await fetch('/api/fulfillment/stock/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, productSku, originId, quantity }),
      });
    }
    setEditingRow(null);
    const d = await fetch('/api/fulfillment/stock/').then((r) => r.json());
    setStocks(d.stock ?? []);
  }

  if (loading) return <div className="text-center py-12 text-slate-400">Chargement des stocks...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Inventaire par entrepôt</h3>
        <span className="text-xs text-slate-400">{byProduct.length} produit(s) avec stock configuré</span>
      </div>
      {byProduct.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">Aucun stock configuré dans la base de données.</p>
          <p className="text-xs mt-1">Utilisez les boutons Modifier pour ajouter du stock par entrepôt.</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-3 text-slate-600">Produit ID</th>
              <th className="p-3 text-slate-600">SKU</th>
              <th className="p-3 text-slate-600">🇨🇭 Genève</th>
              <th className="p-3 text-slate-600">🇵🇹 Portugal</th>
              <th className="p-3 text-slate-600">Type</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {byProduct.map((row) => {
              const type = row.genevaQty > 0 && row.ptQty > 0 ? 'COMMON' : row.genevaQty > 0 ? 'GENÈVE' : 'PORTUGAL';
              const typeColor = type === 'COMMON' ? 'bg-blue-100 text-blue-800' : type === 'GENÈVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800';
              const isEditing = editingRow === row.productId;
              return (
                <tr key={row.productId} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-mono text-xs text-slate-600">{row.productId}</td>
                  <td className="p-3 text-slate-500 text-xs">{row.productSku}</td>
                  <td className="p-3">
                    {isEditing
                      ? <input type="number" min={0} value={editVal.geneva} onChange={(e) => setEditVal((v) => ({ ...v, geneva: Number(e.target.value) }))} className="w-20 border rounded px-2 py-1 text-xs" />
                      : <span className={`font-bold ${row.genevaQty < 5 ? 'text-red-600' : row.genevaQty < 10 ? 'text-amber-600' : 'text-emerald-700'}`}>{row.genevaQty}</span>
                    }
                  </td>
                  <td className="p-3">
                    {isEditing
                      ? <input type="number" min={0} value={editVal.portugal} onChange={(e) => setEditVal((v) => ({ ...v, portugal: Number(e.target.value) }))} className="w-20 border rounded px-2 py-1 text-xs" />
                      : <span className={`font-bold ${row.ptQty < 5 ? 'text-red-600' : row.ptQty < 10 ? 'text-amber-600' : 'text-emerald-700'}`}>{row.ptQty}</span>
                    }
                  </td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${typeColor}`}>{type}</span></td>
                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button onClick={() => void handleSave(row.productId, row.productSku)} className="px-2 py-1 text-xs bg-emerald-600 text-white rounded">Sauver</button>
                        <button onClick={() => setEditingRow(null)} className="px-2 py-1 text-xs border rounded text-slate-600">Annuler</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingRow(row.productId); setEditVal({ geneva: row.genevaQty, portugal: row.ptQty }); }} className="px-2 py-1 text-xs border rounded text-slate-600 hover:bg-slate-100">Modifier</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FulfillmentQueueTab({ origin }: { origin: 'GENEVA' | 'PORTUGAL' }) {
  const [shipments, setShipments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    void fetch(`/api/fulfillment/shipments/?origin=${origin}&status=pending`)
      .then((r) => r.json())
      .then((d) => { setShipments(d.shipments ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [origin]);

  async function markShipped(id: string) {
    setUpdating(id);
    await fetch('/api/fulfillment/shipments/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'in_transit' }),
    });
    setUpdating(null);
    load();
  }

  if (loading) return <div className="text-center py-12 text-slate-400">Chargement...</div>;

  const label = origin === 'GENEVA' ? '🇨🇭 Genève' : '🇵🇹 Portugal';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">File d&apos;expédition {label}</h3>
        <button onClick={load} className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Actualiser
        </button>
      </div>
      {shipments.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucune expédition en attente depuis {label}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => {
            const items = s.items as { name?: string; quantity?: number }[];
            return (
              <div key={s.id as string} className="p-4 border rounded-xl flex justify-between items-start bg-slate-50">
                <div>
                  <p className="font-bold text-sm text-slate-800">Commande #{s.order_id as string}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {items.map((it, i) => `${it.quantity ?? 1}× ${it.name ?? 'Article'}`).join(', ')}
                  </p>
                  {s.tracking_number && <p className="text-xs text-blue-600 mt-1">📦 {s.tracking_number as string}</p>}
                  {s.requires_customs && <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">🛃 Documents douane requis</span>}
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  {s.label_url && (
                    <a href={s.label_url as string} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-bold border rounded bg-white text-slate-700 hover:bg-slate-100">
                      🖨️ Étiquette
                    </a>
                  )}
                  <button
                    onClick={() => void markShipped(s.id as string)}
                    disabled={updating === s.id}
                    className="px-3 py-1.5 text-xs font-bold border border-emerald-600 bg-emerald-600 text-white rounded disabled:opacity-50"
                  >
                    {updating === s.id ? '...' : '✓ Expédié'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FulfillmentAlertsTab() {
  const [shipments, setShipments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch('/api/fulfillment/shipments/?needs_attention=true')
      .then((r) => r.json())
      .then((d) => { setShipments(d.shipments ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800">Alertes &amp; Blocages</h3>
      {shipments.length === 0 ? (
        <div className="text-center py-12 text-emerald-600">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Aucune alerte. Tout est en ordre ✓</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => (
            <div key={s.id as string} className="p-4 border border-red-200 rounded-xl bg-red-50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-sm text-red-800">⚠️ Commande #{s.order_id as string}</p>
                  <p className="text-xs text-red-600 mt-0.5">{s.attention_reason as string || 'Problème d\'expédition détecté'}</p>
                  <p className="text-xs text-slate-500 mt-1">Origine: {s.origin_id as string} · Statut: {s.status as string}</p>
                </div>
                <button className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700">
                  Re-router
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardClient() {
  // -------------------------------------------------------------
  // 1. AUTHENTICATION STATE
  // -------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nf_admin_auth');
      if (stored === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
      }
    } catch {
      // localStorage unavailable
    }
    setAuthChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(null);
      try {
        localStorage.setItem('nf_admin_auth', ADMIN_PASSWORD);
      } catch {
        // ignore
      }
    } else {
      setAuthError('Mot de passe administrateur incorrect. Veuillez vérifier la clé.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    try {
      localStorage.removeItem('nf_admin_auth');
    } catch {
      // ignore
    }
  };

  // -------------------------------------------------------------
  // 2. DASHBOARD NAVIGATION & TIME
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'catalog' | 'pos' | 'sales' | 'fulfillment'>('pos');
  const [fulfillmentSubTab, setFulfillmentSubTab] = useState<'stocks' | 'queue_geneva' | 'queue_portugal' | 'alerts'>('stocks');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('fr-CH', {
          timeZone: 'Europe/Zurich',
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // -------------------------------------------------------------
  // 3. CATALOG & PRODUCT STATE WITH LOCALSTORAGE PERSISTENCE
  // -------------------------------------------------------------
  const [allProducts, setAllProducts] = useState<ProductItem[]>(PRODUCTS);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Load custom creations and edits on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nutrifitness_custom_products');
      if (saved) {
        const customItems: ProductItem[] = JSON.parse(saved);
        if (Array.isArray(customItems) && customItems.length > 0) {
          const customMap = new Map(customItems.map(p => [p.id, p]));
          const merged = PRODUCTS.map(p => customMap.get(p.id) || p);
          const baseIds = new Set(PRODUCTS.map(p => p.id));
          for (const item of customItems) {
            if (!baseIds.has(item.id)) {
              merged.unshift(item);
            }
          }
          setAllProducts(merged);
        }
      }
    } catch (err) {
      console.error('Failed to load custom products from localStorage', err);
    }
  }, []);

  const handleSaveProduct = (savedProduct: ProductItem) => {
    setAllProducts(prev => {
      const exists = prev.some(p => p.id === savedProduct.id);
      let nextList: ProductItem[];
      if (exists) {
        nextList = prev.map(p => p.id === savedProduct.id ? savedProduct : p);
      } else {
        nextList = [savedProduct, ...prev];
      }

      try {
        const saved = localStorage.getItem('nutrifitness_custom_products');
        let customItems: ProductItem[] = saved ? JSON.parse(saved) : [];
        const itemIndex = customItems.findIndex(p => p.id === savedProduct.id);
        if (itemIndex >= 0) {
          customItems[itemIndex] = savedProduct;
        } else {
          customItems = [savedProduct, ...customItems];
        }
        localStorage.setItem('nutrifitness_custom_products', JSON.stringify(customItems));
      } catch (e) {
        console.error('Could not save to localStorage', e);
      }

      return nextList;
    });

    if (inspectingProduct && inspectingProduct.id === savedProduct.id) {
      setInspectingProduct(savedProduct);
    }

    setIsEditorOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Êtes-vous certain de vouloir supprimer ce produit du catalogue ?')) {
      return;
    }
    setAllProducts(prev => {
      const nextList = prev.filter(p => p.id !== productId);
      try {
        const saved = localStorage.getItem('nutrifitness_custom_products');
        if (saved) {
          let customItems: ProductItem[] = JSON.parse(saved);
          customItems = customItems.filter(p => p.id !== productId);
          localStorage.setItem('nutrifitness_custom_products', JSON.stringify(customItems));
        }
      } catch (e) {
        console.error('Could not delete from localStorage', e);
      }
      return nextList;
    });

    if (inspectingProduct && inspectingProduct.id === productId) {
      setInspectingProduct(null);
    }
    setIsEditorOpen(false);
    setEditingProduct(null);
  };

  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogOriginFilter, setCatalogOriginFilter] = useState<'all' | 'geneva' | 'portugal'>('all');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('all');
  const [catalogBrandFilter, setCatalogBrandFilter] = useState<string>('all');
  const [catalogSort, setCatalogSort] = useState<'name_asc' | 'price_asc' | 'price_desc' | 'brand'>('brand');

  const [inspectingProduct, setInspectingProduct] = useState<ProductItem | null>(null);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string>('');
  const [inspectorLang, setInspectorLang] = useState<SupportedLocale>('fr');

  useEffect(() => {
    if (inspectingProduct) {
      setSelectedGalleryImg(inspectingProduct.images[0]?.src || '/images/placeholder.webp');
    }
  }, [inspectingProduct]);

  const brandsList = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.brand))).sort();
  }, [allProducts]);

  const filteredCatalog = useMemo(() => {
    return allProducts.filter(p => {
      // Origin filter
      if (catalogOriginFilter === 'geneva' && p.shippingOrigin === 'portugal') return false;
      if (catalogOriginFilter === 'portugal' && p.shippingOrigin !== 'portugal') return false;

      // Category filter (supports multiple categories)
      if (catalogCategoryFilter !== 'all') {
        const matchesCat = p.categorySlug === catalogCategoryFilter || (p.categorySlugs && p.categorySlugs.includes(catalogCategoryFilter));
        if (!matchesCat) return false;
      }

      // Brand filter
      if (catalogBrandFilter !== 'all' && p.brand !== catalogBrandFilter) return false;

      // Search
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        const inName = p.name.fr?.toLowerCase().includes(q) || p.name.en?.toLowerCase().includes(q);
        const inBrand = p.brand.toLowerCase().includes(q);
        const inSku = p.variants?.some(v => v.sku.toLowerCase().includes(q));
        const inSlug = p.slug.fr?.toLowerCase().includes(q);
        if (!inName && !inBrand && !inSku && !inSlug) return false;
      }

      return true;
    }).sort((a, b) => {
      if (catalogSort === 'price_asc') return a.priceChf - b.priceChf;
      if (catalogSort === 'price_desc') return b.priceChf - a.priceChf;
      if (catalogSort === 'name_asc') return a.name.fr.localeCompare(b.name.fr);
      return a.brand.localeCompare(b.brand);
    });
  }, [allProducts, catalogOriginFilter, catalogCategoryFilter, catalogBrandFilter, catalogSearch, catalogSort]);

  // -------------------------------------------------------------
  // 4. POS (POINT OF SALE) STATE — GENEVA STOCK ONLY
  // -------------------------------------------------------------
  // CRITICAL RULE: ONLY products from Geneva store (NOT from Portugal manufacturer)
  const posProducts = useMemo(() => {
    return allProducts.filter(p => p.shippingOrigin !== 'portugal');
  }, [allProducts]);

  const [posSearch, setPosSearch] = useState<string>('');
  const [posCategoryFilter, setPosCategoryFilter] = useState<string>('all');
  const [posBrandFilter, setPosBrandFilter] = useState<string>('all');
  const [adminLang, setAdminLang] = useState<'fr' | 'en'>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nutrifitness_admin_lang');
      if (saved === 'fr' || saved === 'en') {
        setAdminLang(saved);
      }
    } catch {}
  }, []);

  const handleSetAdminLang = (lang: 'fr' | 'en') => {
    setAdminLang(lang);
    try {
      localStorage.setItem('nutrifitness_admin_lang', lang);
    } catch {}
  };

  // Barcode / Quick scan field
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [scanFeedback, setScanFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Variant selector modal for POS
  const [variantPickerProduct, setVariantPickerProduct] = useState<ProductItem | null>(null);
  const [variantFilterQuery, setVariantFilterQuery] = useState<string>('');

  // Quick Stock Editing modal state (Feature 1)
  const [quickStockProduct, setQuickStockProduct] = useState<ProductItem | null>(null);
  const [quickStockValues, setQuickStockValues] = useState<Record<string, number>>({});

  // Quick Barcode / GTIN modal state (Feature 2)
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<ProductItem | null>(null);
  const [barcodeModalValues, setBarcodeModalValues] = useState<Record<string, string>>({});

  // Helper to calculate total stock for a product
  const getProductTotalStock = (p: ProductItem): number => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.reduce(
        (sum, v) => sum + (typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : (v.inStock !== false ? 15 : 0)),
        0
      );
    }
    return 20;
  };

  // Generate valid Swiss EAN-13 code (starts with 764)
  const generateSwissEan13 = (): string => {
    const prefix = '764';
    let body = prefix;
    for (let i = 0; i < 9; i++) {
      body += Math.floor(Math.random() * 10).toString();
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(body[i], 10);
      sum += i % 2 === 0 ? digit * 1 : digit * 3;
    }
    const checksum = (10 - (sum % 10)) % 10;
    return body + checksum.toString();
  };

  // Open Quick Stock modal
  const openQuickStockModal = (product: ProductItem) => {
    setQuickStockProduct(product);
    const initial: Record<string, number> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        const key = v.id || v.sku;
        initial[key] = typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : (v.inStock !== false ? 15 : 0);
      });
    } else {
      initial['def'] = 20;
    }
    setQuickStockValues(initial);
  };

  // Save Quick Stock changes directly on the fly
  const handleSaveQuickStock = () => {
    if (!quickStockProduct) return;
    const prodId = quickStockProduct.id;
    setAllProducts(prev => {
      const next = prev.map(p => {
        if (p.id !== prodId) return p;
        if (!p.variants || p.variants.length === 0) {
          const newQty = Math.max(0, quickStockValues['def'] ?? 20);
          return {
            ...p,
            variants: [{
              id: 'def',
              sku: p.id,
              flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
              format: '1 unité',
              priceChf: p.priceChf,
              inventoryQuantity: newQty,
              inStock: newQty > 0
            }]
          };
        }
        const updatedVars = p.variants.map(v => {
          const key = v.id || v.sku;
          const newQty = Math.max(0, quickStockValues[key] ?? (v.inventoryQuantity || 0));
          return {
            ...v,
            inventoryQuantity: newQty,
            inStock: newQty > 0
          };
        });
        return { ...p, variants: updatedVars };
      });

      try {
        const saved = localStorage.getItem('nutrifitness_custom_products');
        let customItems: ProductItem[] = saved ? JSON.parse(saved) : [];
        const changedProd = next.find(p => p.id === prodId);
        if (changedProd) {
          const idx = customItems.findIndex(p => p.id === prodId);
          if (idx >= 0) customItems[idx] = changedProd;
          else customItems = [changedProd, ...customItems];
          localStorage.setItem('nutrifitness_custom_products', JSON.stringify(customItems));
        }
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setScanFeedback({
      message: `Stock mis à jour pour "${quickStockProduct.name.fr}" !`,
      type: 'success'
    });
    setTimeout(() => setScanFeedback(null), 3000);
    setQuickStockProduct(null);
  };

  // Open Barcode / GTIN modal
  const openBarcodeModal = (product: ProductItem) => {
    setBarcodeModalProduct(product);
    const initial: Record<string, string> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        const key = v.id || v.sku;
        initial[key] = v.gtin13 || v.sku || '';
      });
    } else {
      initial['def'] = product.gtin13 || product.id || '';
    }
    setBarcodeModalValues(initial);
  };

  // Save Barcode changes
  const handleSaveBarcodeModal = () => {
    if (!barcodeModalProduct) return;
    const prodId = barcodeModalProduct.id;
    setAllProducts(prev => {
      const next = prev.map(p => {
        if (p.id !== prodId) return p;
        const mainBarcode = (barcodeModalValues['def'] || barcodeModalValues[p.variants?.[0]?.id || p.variants?.[0]?.sku || ''] || p.gtin13 || '').trim();
        if (!p.variants || p.variants.length === 0) {
          return {
            ...p,
            gtin13: mainBarcode,
            variants: [{
              id: 'def',
              sku: p.id,
              gtin13: mainBarcode,
              flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
              format: '1 unité',
              priceChf: p.priceChf,
              inventoryQuantity: 20,
              inStock: true
            }]
          };
        }
        const updatedVars = p.variants.map(v => {
          const key = v.id || v.sku;
          const barcodeVal = (barcodeModalValues[key] || '').trim();
          return {
            ...v,
            gtin13: barcodeVal || v.gtin13
          };
        });
        return { ...p, gtin13: mainBarcode, variants: updatedVars };
      });

      try {
        const saved = localStorage.getItem('nutrifitness_custom_products');
        let customItems: ProductItem[] = saved ? JSON.parse(saved) : [];
        const changedProd = next.find(p => p.id === prodId);
        if (changedProd) {
          const idx = customItems.findIndex(p => p.id === prodId);
          if (idx >= 0) customItems[idx] = changedProd;
          else customItems = [changedProd, ...customItems];
          localStorage.setItem('nutrifitness_custom_products', JSON.stringify(customItems));
        }
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setScanFeedback({
      message: `Code-barres / GTIN enregistré pour "${barcodeModalProduct.name.fr}" !`,
      type: 'success'
    });
    setTimeout(() => setScanFeedback(null), 3000);
    setBarcodeModalProduct(null);
  };

  // Inline stock adjustment directly inside variant modal
  const handleInlineVariantStockChange = (productId: string, variantKey: string, delta: number) => {
    setAllProducts(prev => {
      const next = prev.map(p => {
        if (p.id !== productId) return p;
        const updatedVars = (p.variants || []).map(v => {
          if ((v.id || v.sku) === variantKey) {
            const currentQty = typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : (v.inStock !== false ? 15 : 0);
            const newQty = Math.max(0, currentQty + delta);
            return {
              ...v,
              inventoryQuantity: newQty,
              inStock: newQty > 0
            };
          }
          return v;
        });
        return { ...p, variants: updatedVars };
      });
      try {
        const saved = localStorage.getItem('nutrifitness_custom_products');
        let customItems: ProductItem[] = saved ? JSON.parse(saved) : [];
        const changedProd = next.find(p => p.id === productId);
        if (changedProd) {
          const idx = customItems.findIndex(p => p.id === productId);
          if (idx >= 0) customItems[idx] = changedProd;
          else customItems = [changedProd, ...customItems];
          localStorage.setItem('nutrifitness_custom_products', JSON.stringify(customItems));
        }
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setVariantPickerProduct(prev => {
      if (!prev || prev.id !== productId) return prev;
      const updatedVars = (prev.variants || []).map(v => {
        if ((v.id || v.sku) === variantKey) {
          const currentQty = typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : (v.inStock !== false ? 15 : 0);
          const newQty = Math.max(0, currentQty + delta);
          return {
            ...v,
            inventoryQuantity: newQty,
            inStock: newQty > 0
          };
        }
        return v;
      });
      return { ...prev, variants: updatedVars };
    });
  };

  // Current POS Ticket
  const [ticketItems, setTicketItems] = useState<PosTicketItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [clientName, setClientName] = useState<string>('');
  const [ticketNumber, setTicketNumber] = useState<string>('');

  // Initialize ticket number
  useEffect(() => {
    generateNewTicketNumber();
  }, []);

  const generateNewTicketNumber = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    setTicketNumber(`NF-${dateStr}-${rand}`);
  };

  const filteredPosProducts = useMemo(() => {
    return posProducts.filter(p => {
      if (posCategoryFilter !== 'all') {
        const matchesCat = p.categorySlug === posCategoryFilter || (p.categorySlugs && p.categorySlugs.includes(posCategoryFilter));
        if (!matchesCat) return false;
      }
      if (posBrandFilter !== 'all' && p.brand !== posBrandFilter) return false;
      if (posSearch.trim()) {
        const q = posSearch.toLowerCase();
        const inName = p.name.fr?.toLowerCase().includes(q);
        const inBrand = p.brand.toLowerCase().includes(q);
        const inSku = p.variants?.some(v => v.sku.toLowerCase().includes(q) || v.gtin13?.toLowerCase().includes(q));
        const inGtin = p.gtin13?.toLowerCase().includes(q);
        if (!inName && !inBrand && !inSku && !inGtin) return false;
      }
      return true;
    });
  }, [posProducts, posCategoryFilter, posBrandFilter, posSearch]);

  // Add an item to POS Ticket
  const addToPosTicket = (product: ProductItem, variant: ProductVariant) => {
    playScannerBeep();
    const itemKey = `${product.id}-${variant.id || variant.sku}`;

    setTicketItems(prev => {
      const existing = prev.find(item => item.id === itemKey);
      if (existing) {
        return prev.map(item => 
          item.id === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          productId: product.id,
          variantId: variant.id || variant.sku,
          name: product.name.fr,
          brand: product.brand,
          flavor: variant.flavorName.fr || 'Standard',
          format: variant.format || 'Standard',
          sku: variant.sku,
          price: variant.priceChf || product.priceChf,
          quantity: 1,
          image: variant.image || product.images[0]?.src || '/images/placeholder.webp',
          vatRate: product.taxCategory === 'standard' ? 8.1 : 2.6
        }
      ];
    });

    setScanFeedback({
      message: `Ajouté : ${product.name.fr} (${variant.flavorName.fr || 'Standard'})`,
      type: 'success'
    });
    setTimeout(() => setScanFeedback(null), 3000);
  };

  // Barcode / SKU scan submit handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim().toLowerCase();
    if (!query) return;

    // Search in Geneva products
    let foundProduct: ProductItem | null = null;
    let foundVariant: ProductVariant | null = null;

    for (const prod of posProducts) {
      const v = prod.variants?.find(
        variant => 
          variant.sku.toLowerCase() === query || 
          variant.gtin13?.toLowerCase() === query ||
          (variant.gtin13 && query.includes(variant.gtin13.toLowerCase())) ||
          variant.sku.toLowerCase().includes(query)
      );
      if (v) {
        foundProduct = prod;
        foundVariant = v;
        break;
      }
      // Check product ID or exact slug or product GTIN
      if (
        prod.id.toLowerCase() === query || 
        prod.slug.fr.toLowerCase() === query ||
        prod.gtin13?.toLowerCase() === query
      ) {
        foundProduct = prod;
        foundVariant = prod.variants?.[0] || {
          id: 'def',
          sku: 'STD',
          flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
          format: '1 unité',
          priceChf: prod.priceChf,
          inventoryQuantity: 20,
          inStock: true
        };
        break;
      }
    }

    if (foundProduct && foundVariant) {
      addToPosTicket(foundProduct, foundVariant);
      setBarcodeInput('');
    } else {
      // Check if product exists in Portugal instead
      const isPortugal = allProducts.some(p => 
        p.shippingOrigin === 'portugal' && 
        (p.variants?.some(v => v.sku.toLowerCase() === query) || p.slug.fr.toLowerCase() === query)
      );

      if (isPortugal) {
        setScanFeedback({
          message: 'Article usine Portugal : non disponible en stock physique Genève pour encaissement direct.',
          type: 'error'
        });
      } else {
        setScanFeedback({
          message: `Code "${query}" non trouvé dans le stock magasin de Genève.`,
          type: 'error'
        });
      }
      setTimeout(() => setScanFeedback(null), 4000);
    }
  };

  const updateTicketQty = (id: string, delta: number) => {
    setTicketItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean) as PosTicketItem[]);
  };

  const removeTicketItem = (id: string) => {
    setTicketItems(prev => prev.filter(item => item.id !== id));
  };

  const clearTicket = () => {
    if (ticketItems.length === 0) return;
    const msg = adminLang === 'fr' 
      ? 'Voulez-vous réinitialiser le ticket de caisse en cours ?' 
      : 'Do you want to reset the current register ticket?';
    if (confirm(msg)) {
      setTicketItems([]);
      setDiscountPercent(0);
      setClientName('');
      generateNewTicketNumber();
    }
  };

  // Robust ticket calculations with NaN and undefined protection
  const rawSubtotal = useMemo(() => {
    if (!ticketItems || ticketItems.length === 0) return 0;
    return ticketItems.reduce((sum, item) => {
      const p = typeof item.price === 'number' && !isNaN(item.price) ? item.price : parseFloat(String(item.price || 0)) || 0;
      const q = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : parseInt(String(item.quantity || 1), 10) || 1;
      return sum + (p * q);
    }, 0);
  }, [ticketItems]);

  const discountAmount = useMemo(() => {
    const pct = Number(discountPercent) || 0;
    return (rawSubtotal * pct) / 100;
  }, [rawSubtotal, discountPercent]);

  const subtotalAfterDiscount = useMemo(() => {
    return Math.max(0, rawSubtotal - discountAmount);
  }, [rawSubtotal, discountAmount]);

  const vatTotal = useMemo(() => {
    // Swiss VAT 2.6% included in price for foods
    return subtotalAfterDiscount * 0.026;
  }, [subtotalAfterDiscount]);

  const totalToPay = subtotalAfterDiscount;

  // -------------------------------------------------------------
  // 5. PAYMENT & RECEIPT MODAL
  // -------------------------------------------------------------
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [tenderCategory, setTenderCategory] = useState<'cash' | 'other' | 'split'>('cash');
  const [paymentMethod, setPaymentMethod] = useState<'twint' | 'card' | 'cash_chf' | 'cash_eur' | 'invoice' | 'split'>('cash_chf');
  const [otherTenderType, setOtherTenderType] = useState<'twint' | 'card' | 'invoice' | 'postfinance'>('twint');
  const [splitCashAmount, setSplitCashAmount] = useState<string>('');
  const [splitOtherAmount, setSplitOtherAmount] = useState<string>('');
  const [splitOtherMethod, setSplitOtherMethod] = useState<'twint' | 'card'>('twint');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [cardTerminalType, setCardTerminalType] = useState<string>('Terminal SumUp / PostFinance');

  // Client Details & Shipping in POS Checkout
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');
  const [clientCity, setClientCity] = useState<string>('Genève');
  const [shippingMethod, setShippingMethod] = useState<'store_pickup' | 'post_priority' | 'post_economy' | 'express_geneva'>('store_pickup');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('delivered');

  // Inspecting sale details modal
  const [inspectingSale, setInspectingSale] = useState<PosSaleRecord | null>(null);

  // CSV Catalog Import/Export state
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Completed sale receipt view
  const [completedSale, setCompletedSale] = useState<PosSaleRecord | null>(null);

  // Sales journal history (saved to localStorage + synced with /api/orders & Supabase)
  const [salesHistory, setSalesHistory] = useState<PosSaleRecord[]>([]);
  const [isRefreshingSales, setIsRefreshingSales] = useState<boolean>(false);
  const [salesFilterOrigin, setSalesFilterOrigin] = useState<'all' | 'pos' | 'web'>('all');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);

  const syncOrders = async () => {
    setIsRefreshingSales(true);
    let local: PosSaleRecord[] = [];
    try {
      const stored = localStorage.getItem('nutrifitness_pos_sales');
      if (stored) {
        local = JSON.parse(stored);
        // Purge any older mock test entries
        local = local.filter((s: PosSaleRecord) => s.client?.name !== 'Laurent Dubois' && s.clientName !== 'Laurent Dubois');
      }
    } catch {
      // ignore
    }

    try {
      const res = await fetch('/api/orders/');
      if (res.ok) {
        const data = await res.json();
        setIsSupabaseConnected(data.supabaseConnected ?? true);
        if (data.orders && Array.isArray(data.orders)) {
          const map = new Map<string, PosSaleRecord>();
          // Priority 1: Supabase real database orders
          data.orders.forEach((s: PosSaleRecord) => {
            if (s.client?.name !== 'Laurent Dubois' && s.clientName !== 'Laurent Dubois') {
              const key = s.id || s.ticketNumber;
              map.set(key, s);
            }
          });
          // Priority 2: Offline POS sales from local buffer
          local.forEach((s: PosSaleRecord) => {
            if (s.client?.name !== 'Laurent Dubois' && s.clientName !== 'Laurent Dubois') {
              const key = s.id || s.ticketNumber;
              if (!map.has(key)) {
                map.set(key, s);
              }
            }
          });
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setSalesHistory(merged);
          try {
            localStorage.setItem('nutrifitness_pos_sales', JSON.stringify(merged));
          } catch {}
          setTimeout(() => setIsRefreshingSales(false), 300);
          return;
        }
      }
    } catch {
      setIsSupabaseConnected(false);
    }

    if (local.length > 0) {
      setSalesHistory(local);
    }
    setTimeout(() => setIsRefreshingSales(false), 300);
  };

  useEffect(() => {
    syncOrders();

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'nutrifitness_pos_sales') {
        syncOrders();
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(syncOrders, 8000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const saveSalesHistory = (updated: PosSaleRecord[]) => {
    setSalesHistory(updated);
    try {
      localStorage.setItem('nutrifitness_pos_sales', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const updateSaleStatus = (saleId: string, newStatus: OrderStatus) => {
    const updated = salesHistory.map(s => s.id === saleId ? { ...s, status: newStatus } : s);
    saveSalesHistory(updated);
    if (inspectingSale && inspectingSale.id === saleId) {
      setInspectingSale({ ...inspectingSale, status: newStatus });
    }
    fetch('/api/orders/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: saleId, status: newStatus })
    }).catch(() => {});
  };

  const handleCreateTestWebOrder = async () => {
    const orderNum = `WEB-${Math.floor(100000 + Math.random() * 900000)}`;
    const testOrder: PosSaleRecord = {
      id: `order-web-${Date.now()}`,
      ticketNumber: orderNum,
      timestamp: new Date().toISOString(),
      items: [
        {
          id: `item-${Date.now()}-1`,
          productId: 'prod-applied-creatine',
          variantId: 'var-1',
          name: 'Applied Nutrition Créatine Monohydrate Pure 250g',
          brand: 'Applied Nutrition',
          flavor: 'Nature',
          format: '250g',
          sku: 'AP-CREAT-250',
          price: 29.90,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
          vatRate: 2.6
        },
        {
          id: `item-${Date.now()}-2`,
          productId: 'ashwagandha-ksm-66-600mg',
          variantId: 'var-2',
          name: 'Ashwagandha KSM-66 600mg Pure Bio-Active',
          brand: 'NutriFitness Lab',
          flavor: 'Gélules Végétales',
          format: '60 gélules',
          sku: 'ASHWA-600-BIO',
          price: 34.90,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
          vatRate: 2.6
        }
      ],
      subtotal: 94.70,
      discountPercent: 0,
      discountAmount: 0,
      vatAmount: 2.40,
      total: 94.70,
      amountReceived: 94.70,
      paymentMethod: 'twint',
      paymentDetails: {
        reference: `TW-WEB-${Date.now().toString().slice(-6)}`,
        notes: 'Commande passée en ligne sur nutrifitness.ch (Paiement instantané TWINT validé)'
      },
      seller: 'Site Web Public (nutrifitness.ch)',
      client: {
        name: 'Avadh Bajaj',
        phone: '+91 88789 33778',
        email: 'avadhbajaj09@gmail.com',
        address: 'Rue des Pâquis 34',
        city: 'Genève',
        postalCode: '1201'
      },
      shipping: {
        method: 'post_priority',
        label: 'PostPac Priority (La Poste Suisse 24h)',
        cost: 0
      },
      status: 'in_processing',
      clientName: 'Avadh Bajaj'
    };

    const updated = [testOrder, ...salesHistory];
    saveSalesHistory(updated);
    try {
      await fetch('/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder)
      });
      syncOrders();
    } catch {}
    alert(`Nouvelle commande Web (${orderNum}) pour Avadh Bajaj (+91 88789 33778) enregistrée et synchronisée avec Supabase !`);
  };

  const shippingCost = shippingMethod === 'post_priority' ? 7.90 : shippingMethod === 'post_economy' ? 5.90 : shippingMethod === 'express_geneva' ? 12.00 : 0;
  const grandTotalToPay = (Number(totalToPay) || 0) + shippingCost;

  const cashNumeric = parseFloat(cashTendered) || 0;
  const cashChangeDue = tenderCategory === 'cash' && cashNumeric >= grandTotalToPay 
    ? Math.max(0, cashNumeric - grandTotalToPay) 
    : 0;

  const handleValidateSale = () => {
    if (ticketItems.length === 0) return;

    const sCash = parseFloat(splitCashAmount) || 0;
    const sOther = parseFloat(splitOtherAmount) || 0;

    if (tenderCategory === 'cash') {
      if (cashNumeric < grandTotalToPay) {
        alert(adminLang === 'fr' 
          ? `Montant en espèces insuffisant. Total à payer : CHF ${grandTotalToPay.toFixed(2)}, reçu : CHF ${cashNumeric.toFixed(2)}`
          : `Insufficient cash amount. Total to pay: CHF ${grandTotalToPay.toFixed(2)}, received: CHF ${cashNumeric.toFixed(2)}`
        );
        return;
      }
    } else if (tenderCategory === 'split') {
      if (sCash + sOther < grandTotalToPay - 0.05) {
        alert(adminLang === 'fr' 
          ? `Le montant partagé (CHF ${(sCash + sOther).toFixed(2)}) ne couvre pas le total de CHF ${grandTotalToPay.toFixed(2)}.`
          : `Split payment (CHF ${(sCash + sOther).toFixed(2)}) does not cover total CHF ${grandTotalToPay.toFixed(2)}.`
        );
        return;
      }
    }

    const finalPaymentMethod = tenderCategory === 'cash' ? 'cash_chf'
      : tenderCategory === 'other' ? (otherTenderType === 'twint' ? 'twint' : otherTenderType === 'invoice' ? 'invoice' : 'card')
      : 'split';

    const finalAmountReceived = tenderCategory === 'cash' ? cashNumeric
      : tenderCategory === 'split' ? (sCash + sOther)
      : grandTotalToPay;

    const finalChangeDue = tenderCategory === 'cash' ? cashChangeDue
      : tenderCategory === 'split' && (sCash + sOther > grandTotalToPay) ? Math.max(0, (sCash + sOther) - grandTotalToPay)
      : 0;

    const newSale: PosSaleRecord = {
      id: `sale-${Date.now()}`,
      ticketNumber,
      timestamp: new Date().toISOString(),
      items: [...ticketItems],
      subtotal: rawSubtotal,
      discountPercent,
      discountAmount,
      vatAmount: vatTotal,
      total: grandTotalToPay,
      amountReceived: finalAmountReceived,
      paymentMethod: finalPaymentMethod,
      paymentDetails: {
        reference: paymentReference || undefined,
        cashReceived: tenderCategory === 'cash' ? cashNumeric : tenderCategory === 'split' ? sCash : undefined,
        changeGiven: finalChangeDue,
        cardType: tenderCategory === 'other' ? (otherTenderType === 'card' ? cardTerminalType : otherTenderType.toUpperCase()) : undefined,
        splitCash: tenderCategory === 'split' ? sCash : undefined,
        splitOther: tenderCategory === 'split' ? sOther : undefined,
        splitOtherMethod: tenderCategory === 'split' ? splitOtherMethod : undefined,
        notes: paymentNotes || undefined
      },
      seller: 'Marco (Rue des Pâquis 34)',
      client: {
        name: clientName.trim() || 'Client Comptoir',
        phone: clientPhone.trim() || undefined,
        email: clientEmail.trim() || undefined,
        address: clientAddress.trim() || undefined,
        city: clientCity.trim() || undefined
      },
      shipping: {
        method: shippingMethod,
        label: shippingMethod === 'store_pickup' 
          ? 'Retrait Immédiat Magasin (Genève)' 
          : shippingMethod === 'post_priority' 
          ? 'Poste Suisse Prioritaire (24h)' 
          : shippingMethod === 'post_economy'
          ? 'Poste Suisse Économique (48h)'
          : 'Coursier Express Genève (Même jour)',
        cost: shippingCost
      },
      status: orderStatus,
      clientName: clientName.trim() || 'Client Comptoir'
    };

    // Live Stock Reduction on sale confirmation
    setAllProducts(prev => {
      const next = prev.map(p => {
        const soldInTicket = ticketItems.filter(it => it.productId === p.id);
        if (soldInTicket.length === 0) return p;
        const updatedVariants = (p.variants || []).map(v => {
          const matching = soldInTicket.find(it => it.variantId === v.id || it.variantId === v.sku || it.sku === v.sku);
          if (matching) {
            const currentStock = typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : 15;
            const newQty = Math.max(0, currentStock - matching.quantity);
            return {
              ...v,
              inventoryQuantity: newQty,
              inStock: newQty > 0
            };
          }
          return v;
        });
        return { ...p, variants: updatedVariants };
      });
      try {
        const saved = localStorage.getItem('nutrifitness_custom_products');
        let customItems: ProductItem[] = saved ? JSON.parse(saved) : [];
        ticketItems.forEach(it => {
          const changed = next.find(p => p.id === it.productId);
          if (changed) {
            const idx = customItems.findIndex(p => p.id === changed.id);
            if (idx >= 0) customItems[idx] = changed;
            else customItems = [changed, ...customItems];
          }
        });
        localStorage.setItem('nutrifitness_custom_products', JSON.stringify(customItems));
      } catch {}
      return next;
    });

    // Save sale locally and sync to Supabase
    const updatedHistory = [newSale, ...salesHistory];
    saveSalesHistory(updatedHistory);
    try {
      fetch('/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSale)
      }).catch(() => {});
    } catch {}

    // Show receipt and invoice immediately
    setCompletedSale(newSale);
    setIsPaymentModalOpen(false);

    // Clear ticket for next customer
    setTicketItems([]);
    setDiscountPercent(0);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientAddress('');
    setShippingMethod('store_pickup');
    setOrderStatus('delivered');
    setCashTendered('');
    setSplitCashAmount('');
    setSplitOtherAmount('');
    setPaymentReference('');
    setPaymentNotes('');
    generateNewTicketNumber();
  };

  // Print receipt function
  const handlePrintReceipt = () => {
    window.print();
  };

  // Export sales journal to CSV
  const handleExportCsv = () => {
    if (salesHistory.length === 0) {
      alert('Aucune vente enregistrée à exporter.');
      return;
    }
    const headers = ['Date_Heure', 'N_Ticket', 'Statut', 'Client_Nom', 'Client_Tel', 'Client_Email', 'Client_Ville', 'Total_CHF', 'Montant_Recu_CHF', 'Mode_Paiement', 'Reference_Paiement', 'Mode_Expedition', 'Frais_Port_CHF', 'Vendeur', 'Articles'];
    const rows = salesHistory.map(s => [
      `"${new Date(s.timestamp).toLocaleString('fr-CH', { timeZone: 'Europe/Zurich' })}"`,
      `"${s.ticketNumber}"`,
      `"${s.status || 'delivered'}"`,
      `"${s.client?.name || s.clientName || 'Client Comptoir'}"`,
      `"${s.client?.phone || ''}"`,
      `"${s.client?.email || ''}"`,
      `"${s.client?.city || ''}"`,
      s.total.toFixed(2),
      (s.amountReceived || s.total).toFixed(2),
      `"${s.paymentMethod}"`,
      `"${s.paymentDetails.reference || ''}"`,
      `"${s.shipping?.label || 'Retrait Magasin'}"`,
      (s.shipping?.cost || 0).toFixed(2),
      `"${s.seller}"`,
      `"${s.items.map(i => `${i.quantity}x ${i.name} (${i.flavor})`).join(' | ')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ventes_nutrifitness_geneve_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export products catalog to CSV
  const handleExportCatalogCsv = () => {
    if (allProducts.length === 0) {
      alert('Aucun produit à exporter.');
      return;
    }

    const headers = [
      'id',
      'name_fr',
      'name_de',
      'name_it',
      'name_en',
      'slug',
      'brand',
      'primary_category',
      'categories',
      'price_chf',
      'compare_at_price_chf',
      'tax_category',
      'shipping_origin',
      'is_swiss_origin',
      'images',
      'short_description_fr',
      'long_description_html',
      'direct_answer_aeo_fr',
      'ingredients_fr',
      'allergens_fr',
      'usage_instructions_fr',
      'serving_size',
      'servings_per_container',
      'energy_kcal',
      'energy_kj',
      'protein_g',
      'carbs_g',
      'sugars_g',
      'fat_g',
      'saturated_fat_g',
      'salt_g',
      'bcaa_g',
      'variants_data'
    ];

    const escapeCsv = (val: string | number | boolean | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = allProducts.map(p => {
      const allCats = p.categorySlugs?.length ? p.categorySlugs.join(';') : p.categorySlug;
      const allImgs = p.images?.map(img => img.src).join(';') || '';
      const variantsSummary = p.variants?.map(v => 
        `${v.flavorName.fr || 'Standard'}|${v.format || ''}|${v.sku || ''}|${v.priceChf || p.priceChf}|${v.inventoryQuantity || 0}|${v.image || ''}`
      ).join(';;') || '';

      return [
        escapeCsv(p.id),
        escapeCsv(p.name.fr),
        escapeCsv(p.name.de),
        escapeCsv(p.name.it),
        escapeCsv(p.name.en),
        escapeCsv(p.slug.fr),
        escapeCsv(p.brand),
        escapeCsv(p.categorySlug),
        escapeCsv(allCats),
        p.priceChf.toFixed(2),
        p.compareAtPriceChf ? p.compareAtPriceChf.toFixed(2) : '""',
        escapeCsv(p.taxCategory),
        escapeCsv(p.shippingOrigin || 'switzerland'),
        escapeCsv(Boolean(p.isSwissOrigin)),
        escapeCsv(allImgs),
        escapeCsv(p.shortDescription?.fr || ''),
        escapeCsv(p.longDescription?.fr || ''),
        escapeCsv(p.directAnswerAeo?.fr || ''),
        escapeCsv(p.ingredients?.fr || ''),
        escapeCsv(p.allergens?.fr || ''),
        escapeCsv(p.usageInstructions?.fr || ''),
        escapeCsv(p.nutrition?.servingSize || ''),
        escapeCsv(p.nutrition?.servingsPerContainer || 0),
        escapeCsv(p.nutrition?.energyKcal || 0),
        escapeCsv(p.nutrition?.energyKj || 0),
        escapeCsv(p.nutrition?.proteinG || 0),
        escapeCsv(p.nutrition?.carbsG || 0),
        escapeCsv(p.nutrition?.sugarsG || 0),
        escapeCsv(p.nutrition?.fatG || 0),
        escapeCsv(p.nutrition?.saturatedFatG || 0),
        escapeCsv(p.nutrition?.saltG || 0),
        escapeCsv(p.nutrition?.bcaaG || 0),
        escapeCsv(variantsSummary)
      ].join(',');
    });

    const csvData = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nutrifitness-catalogue-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import products catalog from CSV
  const handleImportCatalogCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const parsedRows = parseCsvText(text);
        if (parsedRows.length < 2) {
          alert('Le fichier CSV est vide ou ne contient pas de lignes de données.');
          return;
        }

        const headers = parsedRows[0].map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
        
        let importedCount = 0;
        let updatedCount = 0;
        const newProductsMap = new Map<string, ProductItem>();

        allProducts.forEach(p => newProductsMap.set(p.id, p));

        for (let r = 1; r < parsedRows.length; r++) {
          const row = parsedRows[r];
          if (!row || row.length === 0 || row.every(cell => !cell.trim())) continue;

          const getVal = (colNames: string[]): string => {
            for (const col of colNames) {
              const idx = headers.findIndex(h => h === col.toLowerCase() || h.includes(col.toLowerCase()));
              if (idx >= 0 && row[idx] !== undefined) {
                return row[idx].trim();
              }
            }
            return '';
          };

          const nameFr = getVal(['name_fr', 'nom', 'name', 'title', 'post_title']);
          if (!nameFr) continue;

          const rawId = getVal(['id', 'id_produit', 'sku', 'ugs']) || `prod-csv-${Date.now()}-${r}`;
          const existing = newProductsMap.get(rawId) || Array.from(newProductsMap.values()).find(p => p.name.fr.toLowerCase() === nameFr.toLowerCase());

          const priceVal = parseFloat(getVal(['price_chf', 'tarif régulier', 'prix', 'price', 'regular_price'])) || (existing?.priceChf || 29.90);
          const compareVal = parseFloat(getVal(['compare_at_price_chf', 'tarif promo', 'compare_price', 'sale_price'])) || undefined;
          const brandVal = getVal(['brand', 'marque', 'fournisseur']) || existing?.brand || 'NutriFitness';
          
          const primaryCat = getVal(['primary_category', 'category_slug', 'catégorie']) || existing?.categorySlug || 'proteines';
          const rawCats = getVal(['categories', 'catégories', 'category_slugs']);
          const catSlugs = rawCats 
            ? rawCats.split(/[;,|]/).map(c => c.trim().toLowerCase()).filter(Boolean)
            : existing?.categorySlugs || [primaryCat];

          const originVal = getVal(['shipping_origin', 'origine', 'stock_origin']) || existing?.shippingOrigin || 'switzerland';
          const isSwiss = getVal(['is_swiss_origin', 'suisse', 'swiss_made']).toLowerCase() === 'true' || Boolean(existing?.isSwissOrigin);

          const rawImgs = getVal(['images', 'image', 'photos']);
          const imgList = rawImgs 
            ? rawImgs.split(/[;,|]/).map(src => ({
                src: src.trim(),
                alt: { fr: nameFr, de: nameFr, it: nameFr, en: nameFr },
                width: 800,
                height: 800
              })).filter(img => Boolean(img.src))
            : existing?.images || [{ src: '/images/placeholder.webp', alt: { fr: nameFr, de: nameFr, it: nameFr, en: nameFr }, width: 800, height: 800 }];

          const rawVariants = getVal(['variants_data', 'variantes', 'variants']);
          let parsedVariants = existing?.variants;
          if (rawVariants && rawVariants.includes('|')) {
            parsedVariants = rawVariants.split(';;').map((vStr, vIdx) => {
              const parts = vStr.split('|');
              return {
                id: `var-${r}-${vIdx}`,
                flavorName: { fr: parts[0] || 'Standard', de: parts[0] || 'Standard', it: parts[0] || 'Standard', en: parts[0] || 'Standard' },
                format: parts[1] || '1 unité',
                sku: parts[2] || `SKU-${r}-${vIdx}`,
                priceChf: parseFloat(parts[3]) || priceVal,
                inventoryQuantity: parseInt(parts[4]) || 20,
                inStock: true,
                image: parts[5] || undefined
              };
            });
          }

          const productItem: ProductItem = {
            id: existing ? existing.id : rawId,
            slug: {
              fr: getVal(['slug', 'identifiant']) || existing?.slug.fr || nameFr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
              de: existing?.slug.de || nameFr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
              it: existing?.slug.it || nameFr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
              en: existing?.slug.en || nameFr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
            },
            name: {
              fr: nameFr,
              de: getVal(['name_de']) || existing?.name.de || nameFr,
              it: getVal(['name_it']) || existing?.name.it || nameFr,
              en: getVal(['name_en']) || existing?.name.en || nameFr
            },
            brand: brandVal,
            categorySlug: primaryCat,
            categorySlugs: Array.from(new Set([primaryCat, ...catSlugs])),
            taxCategory: getVal(['tax_category', 'tva']) === 'standard' ? 'standard' : (existing?.taxCategory || 'food_reduced'),
            priceChf: priceVal,
            compareAtPriceChf: compareVal || existing?.compareAtPriceChf,
            isSwissOrigin: isSwiss,
            shippingOrigin: originVal.includes('portugal') ? 'portugal' : 'switzerland',
            images: imgList.length > 0 ? imgList : (existing?.images || [{ src: '/images/placeholder.webp', alt: { fr: nameFr, de: nameFr, it: nameFr, en: nameFr }, width: 800, height: 800 }]),
            shortDescription: {
              fr: getVal(['short_description_fr', 'description courte']) || existing?.shortDescription.fr || '',
              de: existing?.shortDescription.de || getVal(['short_description_fr', 'description courte']) || '',
              it: existing?.shortDescription.it || getVal(['short_description_fr', 'description courte']) || '',
              en: existing?.shortDescription.en || getVal(['short_description_fr', 'description courte']) || ''
            },
            directAnswerAeo: {
              fr: getVal(['direct_answer_aeo_fr', 'aeo']) || existing?.directAnswerAeo.fr || '',
              de: existing?.directAnswerAeo.de || getVal(['direct_answer_aeo_fr', 'aeo']) || '',
              it: existing?.directAnswerAeo.it || getVal(['direct_answer_aeo_fr', 'aeo']) || '',
              en: existing?.directAnswerAeo.en || getVal(['direct_answer_aeo_fr', 'aeo']) || ''
            },
            longDescription: {
              fr: getVal(['long_description_html', 'description', 'description longue']) || existing?.longDescription.fr || '',
              de: existing?.longDescription.de || getVal(['long_description_html', 'description']) || '',
              it: existing?.longDescription.it || getVal(['long_description_html', 'description']) || '',
              en: existing?.longDescription.en || getVal(['long_description_html', 'description']) || ''
            },
            usageInstructions: {
              fr: getVal(['usage_instructions_fr', 'conseils d\'utilisation']) || existing?.usageInstructions.fr || '',
              de: existing?.usageInstructions.de || '',
              it: existing?.usageInstructions.it || '',
              en: existing?.usageInstructions.en || ''
            },
            ingredients: {
              fr: getVal(['ingredients_fr', 'ingrédients']) || existing?.ingredients.fr || '',
              de: existing?.ingredients.de || '',
              it: existing?.ingredients.it || '',
              en: existing?.ingredients.en || ''
            },
            allergens: {
              fr: getVal(['allergens_fr', 'allergènes']) || existing?.allergens.fr || '',
              de: existing?.allergens.de || '',
              it: existing?.allergens.it || '',
              en: existing?.allergens.en || ''
            },
            nutrition: {
              servingSize: getVal(['serving_size', 'portion']) || existing?.nutrition.servingSize || '30 g',
              servingsPerContainer: parseInt(getVal(['servings_per_container'])) || existing?.nutrition.servingsPerContainer || 30,
              energyKcal: parseFloat(getVal(['energy_kcal'])) || existing?.nutrition.energyKcal || 0,
              energyKj: parseFloat(getVal(['energy_kj'])) || existing?.nutrition.energyKj || 0,
              proteinG: parseFloat(getVal(['protein_g'])) || existing?.nutrition.proteinG || 0,
              carbsG: parseFloat(getVal(['carbs_g'])) || existing?.nutrition.carbsG || 0,
              sugarsG: parseFloat(getVal(['sugars_g'])) || existing?.nutrition.sugarsG || 0,
              fatG: parseFloat(getVal(['fat_g'])) || existing?.nutrition.fatG || 0,
              saturatedFatG: parseFloat(getVal(['saturated_fat_g'])) || existing?.nutrition.saturatedFatG || 0,
              saltG: parseFloat(getVal(['salt_g'])) || existing?.nutrition.saltG || 0,
              bcaaG: parseFloat(getVal(['bcaa_g'])) || existing?.nutrition.bcaaG || undefined
            },
            variants: parsedVariants && parsedVariants.length > 0 ? parsedVariants : [
              {
                id: `var-${Date.now()}-${r}`,
                sku: `SKU-${r}`,
                flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
                format: '1 unité',
                priceChf: priceVal,
                inventoryQuantity: 25,
                inStock: true
              }
            ]
          };

          if (existing) {
            updatedCount++;
          } else {
            importedCount++;
          }
          newProductsMap.set(productItem.id, productItem);
        }

        const mergedAll = Array.from(newProductsMap.values());
        setAllProducts(mergedAll);
        try {
          localStorage.setItem('nutrifitness_custom_products', JSON.stringify(mergedAll));
        } catch (err) {
          console.error(err);
        }

        setImportStatusMessage(`✓ Importation réussie : ${importedCount} nouveaux produits ajoutés, ${updatedCount} fiches existantes mises à jour !`);
        setTimeout(() => setImportStatusMessage(null), 6000);
      } catch (err) {
        alert('Erreur lors du traitement du fichier CSV : ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  // -------------------------------------------------------------
  // RENDER 1: AUTHENTICATION LOCK SCREEN (Shopify / WP Style)
  // -------------------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-sm">Chargement du panneau NutriFitness OS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white mb-4 shadow-md">
              <span className="text-2xl font-black tracking-tight font-heading">NF</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-3">
              <span>🇨🇭</span>
              <span>Boutique Genève (Rue des Pâquis 34)</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 font-heading">
              NutriFitness OS
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Administration & Caisse Enregistreuse POS
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mot de passe Administrateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Entrez le mot de passe..."
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Ouvrir la Caisse & le Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <p>Accès sécurisé pour le personnel de la boutique NutriFitness.</p>
            <p className="mt-1 font-mono text-[11px] text-slate-400">Route active : /wp-admin/</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: AUTHENTICATED DASHBOARD (Spacious, Clean, Light Theme)
  // -------------------------------------------------------------
  return (
    <div translate="no" className="notranslate min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      
      {/* =========================================================
          TOP NAV BAR (Light, spacious, Shopify/WP Admin Style)
          ========================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Brand & Store Badge */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black font-heading text-lg shrink-0 shadow-xs">
              NF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-slate-900 font-heading">
                  NutriFitness OS
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Boutique Genève
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1.5">
                <span>📍 Rue des Pâquis 34, 1201 Genève</span>
                <span>·</span>
                <span className="font-bold text-slate-700">🇨🇭 {currentTime}</span>
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Large & High Contrast) */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'pos'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span>{adminLang === 'fr' ? 'Caisse POS (Magasin)' : 'POS Register (Store)'}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                {posProducts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 text-blue-600" />
              <span>{adminLang === 'fr' ? 'Catalogue Global' : 'Global Catalog'}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700 text-[10px] font-black">
                {allProducts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'sales'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">{adminLang === 'fr' ? 'Journal des Ventes' : 'Sales Journal'}</span>
              <span className="sm:hidden">{adminLang === 'fr' ? 'Ventes' : 'Sales'}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
                {salesHistory.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fulfillment')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'fulfillment'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-lg leading-none text-purple-600">🚚</span>
              <span className="hidden sm:inline">Expédition</span>
              <span className="sm:hidden">Expédition</span>
            </button>

            <Link
              href="/admin/products"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              <span>📍</span>
              <span className="hidden sm:inline">Emplacements</span>
              <span className="sm:hidden">Stocks</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Supabase Connection Status Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
              isSupabaseConnected 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`} title="Connexion temps-réel base de données Supabase">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isSupabaseConnected ? (adminLang === 'fr' ? 'Supabase Connecté' : 'Supabase Live') : (adminLang === 'fr' ? 'Supabase Hors-ligne' : 'Supabase Offline')}</span>
            </div>

            {/* Bilingual Language Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => handleSetAdminLang('fr')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  adminLang === 'fr'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Passer l'interface en Français"
              >
                🇫🇷 FR
              </button>
              <button
                type="button"
                onClick={() => handleSetAdminLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  adminLang === 'en'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Switch interface to English"
              >
                🇬🇧 EN
              </button>
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Voir la boutique en ligne"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{adminLang === 'fr' ? 'Site Web' : 'Store'}</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
              title={adminLang === 'fr' ? 'Déconnexion' : 'Logout'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{adminLang === 'fr' ? 'Quitter' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN BODY: TAB 1 — IN-STORE POS SYSTEM (GENEVA STOCK ONLY)
          ========================================================= */}
      {activeTab === 'pos' && (
        <div className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
          
          {/* LEFT 65%: PRODUCT BROWSER & SCANNER */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            
            {/* 1. BARCODE / SKU QUICK SCANNER INPUT */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <form onSubmit={handleBarcodeSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                    <Barcode className="w-6 h-6" />
                  </div>
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scanner un code-barres / SKU ou taper le nom... (Appuyez sur Entrée)"
                    className="w-full pl-12 pr-4 py-3 bg-emerald-50/50 border-2 border-emerald-300 rounded-xl text-slate-900 placeholder-slate-500 font-medium text-sm sm:text-base focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Scanner / Ajouter</span>
                </button>
              </form>

              {/* Feedback Alert for Scanning */}
              {scanFeedback && (
                <div className={`mt-3 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
                  scanFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {scanFeedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{scanFeedback.message}</span>
                </div>
              )}

              {/* POS Origin Notice */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-700">Stock Magasin Genève</span>
                  <span>({posProducts.length} articles disponibles en rayon)</span>
                </div>
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  🛡️ Articles de l'usine Portugal exclus de la caisse magasin
                </span>
              </div>
            </div>

            {/* 2. CATEGORY & BRAND CHIPS FILTER */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setPosCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
                    posCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tous ({posProducts.length})
                </button>
                {CATEGORIES.map(cat => {
                  const count = posProducts.filter(p => p.categorySlug === cat.id || (p.categorySlugs && p.categorySlugs.includes(cat.id))).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPosCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        posCategoryFilter === cat.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.name.fr} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search + Brand Filter */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="Filtrer par nom ou marque..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  {posSearch && (
                    <button
                      type="button"
                      onClick={() => setPosSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={posBrandFilter}
                  onChange={(e) => setPosBrandFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">Toutes les marques</option>
                  {brandsList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. PRODUCT GRID FOR POS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 overflow-y-auto max-h-[calc(100vh-360px)] pr-1">
              {filteredPosProducts.map(product => {
                const img = product.images[0]?.src || '/images/placeholder.webp';
                const hasMultipleVariants = (product.variants?.length || 0) > 1;
                const stock = getProductTotalStock(product);
                const isCritical = stock < 5;
                const isMedium = stock <= 10 && !isCritical;
                const isOptimal = stock > 10;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (hasMultipleVariants) {
                        setVariantPickerProduct(product);
                      } else {
                        const defaultVariant = product.variants?.[0] || {
                          id: 'def',
                          sku: product.id,
                          flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
                          format: '1 unité',
                          priceChf: product.priceChf,
                          inventoryQuantity: 20,
                          inStock: true
                        };
                        addToPosTicket(product, defaultVariant);
                      }
                    }}
                    className="bg-white rounded-2xl border border-slate-200 p-3 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-97 select-none"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative aspect-square w-full rounded-xl bg-slate-50 border border-slate-100 p-2 mb-2 flex items-center justify-center overflow-hidden">
                        <Image
                          src={img}
                          alt={product.name.fr}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-contain p-1 group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black">
                          🇨🇭 Rayon
                        </span>
                        {hasMultipleVariants && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black shadow-2xs">
                            {product.variants?.length} Saveurs
                          </span>
                        )}
                      </div>

                      {/* Brand & Name */}
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-heading truncate">
                        {product.brand}
                      </p>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                        {product.name.fr}
                      </h3>

                      {/* Quick Stock & Barcode on-the-fly action chips */}
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {/* Live Stock Badge (Click to quick-edit stock) */}
                        <button
                          type="button"
                          onClick={() => openQuickStockModal(product)}
                          title={adminLang === 'fr' ? 'Modifier le stock en direct (sans quitter la caisse)' : 'Quick edit stock on the fly'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all hover:scale-102 active:scale-95 shadow-2xs ${
                            isCritical
                              ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 ring-1 ring-red-400/20'
                              : isMedium
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 ring-1 ring-amber-400/20'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 ring-1 ring-emerald-400/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isCritical ? 'bg-red-500 animate-pulse' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span className="notranslate">{stock} en stock</span>
                          <Edit3 className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                        </button>

                        {/* Barcode / GTIN popup trigger button */}
                        <button
                          type="button"
                          onClick={() => openBarcodeModal(product)}
                          title={adminLang === 'fr' ? 'Gérer le code-barres / GTIN-13' : 'Manage barcode / GTIN'}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all hover:scale-102 active:scale-95 shadow-2xs"
                        >
                          <Barcode className="w-3 h-3 text-slate-600" />
                          <span className="notranslate text-[9px] font-mono">
                            {product.gtin13 ? 'GTIN' : '+ GTIN'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900 font-heading notranslate">
                        <span>CHF </span><span>{product.priceChf.toFixed(2)}</span>
                      </span>
                      {hasMultipleVariants ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 group-hover:bg-amber-600 text-amber-800 group-hover:text-white text-[10px] font-black transition-colors border border-amber-200 group-hover:border-transparent">
                          <span>{adminLang === 'fr' ? 'Saveurs' : 'Flavors'}</span>
                          <span>→</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white transition-colors">
                          <Plus className="w-4 h-4 font-bold" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredPosProducts.length === 0 && (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
                  <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-sm">Aucun produit trouvé dans le rayon Genève.</p>
                  <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 35%: LIVE TICKET & TOTALS */}
          <div className="w-full lg:w-[480px] xl:w-[500px] flex flex-col gap-4 shrink-0">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 flex flex-col h-full justify-between">
              
              {/* Ticket Header */}
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      {adminLang === 'fr' ? 'Ticket de Caisse' : 'Current Register Ticket'}
                    </span>
                    <h2 className="text-base font-black text-slate-900 font-heading notranslate">
                      {ticketNumber}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={clearTicket}
                      disabled={ticketItems.length === 0}
                      className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-xl hover:bg-red-50 transition-colors"
                      title={adminLang === 'fr' ? 'Vider la caisse' : 'Clear register ticket'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Client Name Input (Optional) */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={adminLang === 'fr' ? 'Nom ou remarque client (optionnel)...' : 'Customer name or note (optional)...'}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                {/* Ticket Items List */}
                <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {ticketItems.map(item => (
                    <div 
                      key={item.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-slate-900 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black">
                            ✨ {item.flavor}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">{item.format}</span>
                          <span className="font-mono text-slate-400 text-[10px] notranslate">({item.sku})</span>
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-700 mt-0.5 notranslate">
                          <span>CHF </span><span>{item.price.toFixed(2)}</span><span> / u.</span>
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateTicketQty(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900 notranslate">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateTicketQty(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total & Delete Icon (No text collision) */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="font-black text-slate-900 text-sm font-heading notranslate">
                          <span>CHF </span><span>{(item.price * item.quantity).toFixed(2)}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTicketItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title={adminLang === 'fr' ? 'Supprimer' : 'Remove item'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {ticketItems.length === 0 && (
                    <div className="py-12 text-center text-slate-400">
                      <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-xs">{adminLang === 'fr' ? 'La caisse est vide' : 'The register is empty'}</p>
                      <p className="text-[11px] mt-0.5">{adminLang === 'fr' ? 'Scannez un code-barres ou sélectionnez un produit.' : 'Scan a barcode or select a product.'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Footer / Summary */}
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
                
                {/* Discount selector */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{adminLang === 'fr' ? 'Remise fidélité / promo :' : 'Loyalty / Promo Discount:'}</span>
                  <div className="flex items-center gap-1">
                    {[0, 5, 10, 15].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercent(pct)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all notranslate ${
                          discountPercent === pct
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {pct === 0 ? '0%' : `-${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtotal lines */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>{adminLang === 'fr' ? 'Sous-total brut' : 'Gross Subtotal'}</span>
                    <span className="font-semibold text-slate-900 notranslate">
                      <span>CHF </span><span>{rawSubtotal.toFixed(2)}</span>
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>{adminLang === 'fr' ? `Remise accordée (${discountPercent}%)` : `Discount granted (${discountPercent}%)`}</span>
                      <span className="notranslate">
                        <span>- CHF </span><span>{discountAmount.toFixed(2)}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{adminLang === 'fr' ? 'TVA suisse 2.6% (incluse)' : 'Swiss VAT 2.6% (included)'}</span>
                    <span className="notranslate">
                      <span>CHF </span><span>{vatTotal.toFixed(2)}</span>
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      {adminLang === 'fr' ? 'Total Net TTC' : 'Total Net (incl. VAT)'}
                    </span>
                    <p className="text-xs text-slate-500 font-medium">
                      {adminLang === 'fr' ? 'Devise : Franc suisse (CHF)' : 'Currency: Swiss Franc (CHF)'}
                    </p>
                  </div>
                  <span className="text-3xl font-black text-emerald-700 font-heading notranslate">
                    <span>CHF </span><span>{totalToPay.toFixed(2)}</span>
                  </span>
                </div>

                {/* Big Checkout Button */}
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={ticketItems.length === 0}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-base uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 notranslate"
                >
                  <CreditCard className="w-5 h-5 shrink-0" />
                  <span>{adminLang === 'fr' ? 'Encaisser' : 'Collect'}</span>
                  <span className="notranslate">(CHF {totalToPay.toFixed(2)})</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN BODY: TAB 2 — GLOBAL PRODUCT CATALOG (SHOPIFY/WP STYLE)
          ========================================================= */}
      {activeTab === 'catalog' && (
        <div className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header with Title and Add Product Action */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Catalogue Général & Gestion des Fiches
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Modifiez les fiches existantes, gérez les stocks (Genève vs Portugal), importez/exportez en CSV ou publiez de nouveaux produits.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Hidden file input for CSV Import */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCatalogCsv}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-slate-300 transition-all active:scale-95"
                title="Importer des produits depuis un fichier CSV (format NutriFitness ou WooCommerce)"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Importer CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportCatalogCsv}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-slate-300 transition-all active:scale-95"
                title="Télécharger l'intégralité du catalogue avec tous les détails en CSV Excel"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Exporter CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsEditorOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Produit</span>
              </button>
            </div>
          </div>

          {/* Import Status Alert Banner */}
          {importStatusMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>{importStatusMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setImportStatusMessage(null)}
                className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Catalogue</span>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">{allProducts.length} articles</p>
              <p className="text-xs text-slate-500 mt-1">100% fiches multilingues complètes</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Stock Rayon Genève</span>
              <p className="text-2xl font-black text-emerald-800 font-heading mt-1">
                {allProducts.filter(p => p.shippingOrigin !== 'portugal').length} articles
              </p>
              <p className="text-xs text-emerald-600 mt-1">Disponibles en caisse POS immédiate</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Expédition Portugal</span>
              <p className="text-2xl font-black text-blue-800 font-heading mt-1">
                {allProducts.filter(p => p.shippingOrigin === 'portugal').length} articles
              </p>
              <p className="text-xs text-blue-600 mt-1">Livraison directe d'usine (3–5 jours)</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marques & Catégories</span>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                {brandsList.length} marques · {CATEGORIES.length} cats
              </p>
              <p className="text-xs text-slate-500 mt-1">Optimisé SEO, AEO & GEO</p>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Rechercher par titre, marque, SKU, description, ingrédient..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              {/* Origin Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setCatalogOriginFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    catalogOriginFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tous ({allProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogOriginFilter('geneva')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    catalogOriginFilter === 'geneva'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <span>🇨🇭 Genève ({allProducts.filter(p => p.shippingOrigin !== 'portugal').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogOriginFilter('portugal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    catalogOriginFilter === 'portugal'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-blue-700'
                  }`}
                >
                  <span>🇵🇹 Portugal ({allProducts.filter(p => p.shippingOrigin === 'portugal').length})</span>
                </button>
              </div>

              {/* Dropdowns */}
              <div className="flex items-center gap-2.5 shrink-0">
                <select
                  value={catalogCategoryFilter}
                  onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">Toutes les catégories</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name.fr}</option>
                  ))}
                </select>

                <select
                  value={catalogBrandFilter}
                  onChange={(e) => setCatalogBrandFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">Toutes les marques</option>
                  {brandsList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <select
                  value={catalogSort}
                  onChange={(e) => setCatalogSort(e.target.value as typeof catalogSort)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="brand">Trier par Marque</option>
                  <option value="name_asc">Trier par Nom A-Z</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                </select>
              </div>

            </div>
          </div>

          {/* Products Table (Shopify/WooCommerce Style) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Photo</th>
                    <th className="py-3.5 px-4">Article & Marque</th>
                    <th className="py-3.5 px-4">Catégorie</th>
                    <th className="py-3.5 px-4">Origine & Expédition</th>
                    <th className="py-3.5 px-4">Stock en Rayon</th>
                    <th className="py-3.5 px-4">Prix Public</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalog.map(product => {
                    const primaryImg = product.images[0]?.src || '/images/placeholder.webp';
                    const isPortugal = product.shippingOrigin === 'portugal';

                    return (
                      <tr 
                        key={product.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setInspectingProduct(product)}
                      >
                        {/* Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <Image
                              src={primaryImg}
                              alt={product.name.fr}
                              fill
                              sizes="56px"
                              className="object-contain p-0.5"
                            />
                            {product.images.length > 1 && (
                              <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-white text-[8px] font-bold">
                                +{product.images.length - 1}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Title & Brand */}
                        <td className="py-3 px-4 max-w-sm">
                          <span className="text-[10px] font-black uppercase text-slate-400 font-heading block">
                            {product.brand}
                          </span>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {product.name.fr}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {product.id}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] inline-block">
                            {CATEGORIES.find(c => c.id === product.categorySlug)?.name.fr || product.categorySlug}
                          </span>
                        </td>

                        {/* Origin Badge */}
                        <td className="py-3 px-4">
                          {isPortugal ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px]">
                              <span>🇵🇹</span>
                              <span>Usine Portugal (3–5j)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                              <span>🇨🇭</span>
                              <span>Stock Genève (POS dispo)</span>
                            </span>
                          )}
                        </td>

                        {/* Stock Column (Replaces Variations & Flavors) */}
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const totalStock = product.variants && product.variants.length > 0
                              ? product.variants.reduce(
                                  (sum, v) => sum + (typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : (v.inStock !== false ? 15 : 0)), 
                                  0
                                )
                              : 20;

                            const isCritical = totalStock < 5;
                            const isMedium = totalStock <= 10 && !isCritical;
                            const isOptimal = totalStock > 10;

                            return (
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border shadow-2xs ${
                                  isCritical
                                    ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-400/20'
                                    : isMedium
                                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/20'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/20'
                                }`}>
                                  <span className={`w-2 h-2 rounded-full ${
                                    isCritical
                                      ? 'bg-red-500 animate-pulse'
                                      : isMedium
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`} />
                                  <span>{totalStock} {totalStock <= 1 ? 'unité' : 'unités'}</span>
                                </span>
                                <span className={`text-[10px] font-bold ${
                                  isCritical
                                    ? 'text-red-600'
                                    : isMedium
                                    ? 'text-amber-700'
                                    : 'text-emerald-700'
                                }`}>
                                  {isCritical
                                    ? '🔴 Critique (< 5)'
                                    : isMedium
                                    ? '🟡 Moyen (≤ 10)'
                                    : '🟢 En stock (> 10)'}
                                </span>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <span className="font-black text-slate-900 text-sm font-heading">
                            CHF {product.priceChf.toFixed(2)}
                          </span>
                          {product.compareAtPriceChf && (
                            <span className="block text-[10px] text-slate-400 line-through">
                              CHF {product.compareAtPriceChf.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(product);
                                setIsEditorOpen(true);
                              }}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                              title="Modifier tous les détails du produit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setInspectingProduct(product)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                              title="Inspecter la fiche complète"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Fiche</span>
                            </button>

                            <Link
                              href={`/produit/${product.slug.fr}/`}
                              target="_blank"
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Voir sur le site web public"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN BODY: TAB 3 — POS SALES JOURNAL & METRICS
          ========================================================= */}
      {activeTab === 'sales' && (
        <div className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recette Totale Enregistrée</span>
              <p className="text-2xl font-black text-emerald-700 font-heading mt-1">
                CHF {salesHistory.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">{salesHistory.length} tickets validés</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paiements TWINT</span>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                CHF {salesHistory.filter(s => s.paymentMethod === 'twint').reduce((sum, s) => sum + s.total, 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Encaissements instantanés QR</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paiements Carte</span>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                CHF {salesHistory.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Terminaux de paiement</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Espèces (Cash)</span>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                CHF {salesHistory.filter(s => s.paymentMethod === 'cash_chf').reduce((sum, s) => sum + s.total, 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Fond de caisse boutique</p>
            </div>
          </div>

          {/* Sales History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900 font-heading">
                    Journal des Ventes & Commandes Web
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    isSupabaseConnected 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {isSupabaseConnected ? 'Supabase Connecté (punhmwlpaghmjndpyusf.supabase.co)' : 'Mode Local'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toutes les ventes en boutique physique (POS) et commandes passées en ligne sur le site web synchronisées en direct.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Refresh Orders */}
                <button
                  type="button"
                  onClick={syncOrders}
                  disabled={isRefreshingSales}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all shadow-2xs flex items-center gap-1.5"
                  title="Synchroniser immédiatement avec le serveur web"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSales ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                  <span>{isRefreshingSales ? 'Synchronisation...' : 'Actualiser'}</span>
                </button>

                {/* Create Test Web Order */}
                <button
                  type="button"
                  onClick={handleCreateTestWebOrder}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all shadow-2xs flex items-center gap-1.5"
                  title="Générer une commande test comme si elle avait été passée sur le site"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tester une Vente Web</span>
                </button>

                {/* Export CSV */}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Canal de vente :</span>
              {[
                { id: 'all', label: `Toutes les ventes (${salesHistory.length})` },
                { id: 'pos', label: `🇨🇭 Caisse Magasin (${salesHistory.filter(s => !s.ticketNumber.startsWith('WEB-') && !s.seller?.includes('Web')).length})` },
                { id: 'web', label: `🌐 Site Web (${salesHistory.filter(s => s.ticketNumber.startsWith('WEB-') || s.seller?.includes('Web')).length})` },
              ].map(pill => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSalesFilterOrigin(pill.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    salesFilterOrigin === pill.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Date / Heure (CH)</th>
                    <th className="py-3 px-4">N° Ticket / Canal</th>
                    <th className="py-3 px-4">Statut Commande</th>
                    <th className="py-3 px-4">Client & Contact</th>
                    <th className="py-3 px-4">Articles & Saveurs</th>
                    <th className="py-3 px-4">Paiement & Reçu</th>
                    <th className="py-3 px-4">Expédition</th>
                    <th className="py-3 px-4">Total TTC</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesHistory
                    .filter(sale => {
                      const isWeb = sale.ticketNumber.startsWith('WEB-') || sale.seller?.includes('Web');
                      if (salesFilterOrigin === 'pos') return !isWeb;
                      if (salesFilterOrigin === 'web') return isWeb;
                      return true;
                    })
                    .map(sale => {
                    const statusConfig = ORDER_STATUS_LABELS[sale.status || 'delivered'] || ORDER_STATUS_LABELS.delivered;

                    return (
                      <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Swiss Date & Time */}
                        <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                          <div className="font-bold text-slate-900">
                            {new Date(sale.timestamp).toLocaleDateString('fr-CH', {
                              timeZone: 'Europe/Zurich',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(sale.timestamp).toLocaleTimeString('fr-CH', {
                              timeZone: 'Europe/Zurich',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </div>
                        </td>

                        {/* Ticket Number & Channel Badge */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs">
                              {sale.ticketNumber}
                            </span>
                            {sale.ticketNumber.startsWith('WEB-') || sale.seller?.includes('Web') ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                                🌐 Web
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                🇨🇭 POS
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Interactive Order Status Dropdown */}
                        <td className="py-3 px-4">
                          <select
                            value={sale.status || 'delivered'}
                            onChange={(e) => updateSaleStatus(sale.id, e.target.value as OrderStatus)}
                            className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer shadow-2xs ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <option value="in_processing">🟡 En traitement</option>
                            <option value="packed">📦 Emballé / Prêt</option>
                            <option value="shipped">🚚 Expédié</option>
                            <option value="delivered">✅ Livré / Remis</option>
                            <option value="pending">⏳ En attente</option>
                            <option value="cancelled">❌ Annulé</option>
                          </select>
                        </td>

                        {/* Client details */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            {sale.client?.name || sale.clientName || 'Client Comptoir'}
                          </div>
                          {sale.client?.phone && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{sale.client.phone}</span>
                            </div>
                          )}
                          {sale.client?.email && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[150px]">
                              <Mail className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                              <span>{sale.client.email}</span>
                            </div>
                          )}
                          {sale.client?.city && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span>{sale.client.city}</span>
                            </div>
                          )}
                        </td>

                        {/* Articles & Flavors */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="space-y-0.5">
                            {sale.items.slice(0, 2).map((i, idx) => (
                              <div key={idx} className="text-[11px] text-slate-700 truncate">
                                <span className="font-bold text-slate-900">{i.quantity}x</span> {i.name}{' '}
                                {i.flavor && i.flavor !== 'Standard' && (
                                  <span className="text-slate-500 text-[10px]">({i.flavor})</span>
                                )}
                              </div>
                            ))}
                            {sale.items.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{sale.items.length - 2} autre{sale.items.length - 2 > 1 ? 's' : ''}...
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Payment Method & Received Amount */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            sale.paymentMethod === 'twint'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sale.paymentMethod === 'card'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sale.paymentMethod === 'twint' ? '⚡ TWINT' : sale.paymentMethod === 'card' ? '💳 Carte' : '💵 Espèces'}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Reçu: <strong className="text-slate-900">CHF {(sale.amountReceived || sale.total).toFixed(2)}</strong>
                          </p>
                          {sale.paymentDetails?.changeGiven ? (
                            <p className="text-[10px] text-emerald-700 font-medium">
                              Rendu: CHF {sale.paymentDetails.changeGiven.toFixed(2)}
                            </p>
                          ) : null}
                        </td>

                        {/* Shipping */}
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-medium text-slate-800 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {sale.shipping?.method === 'store_pickup' 
                                ? 'Retrait Magasin' 
                                : sale.shipping?.method === 'post_priority' 
                                ? 'Poste Prioritaire' 
                                : sale.shipping?.method === 'post_economy'
                                ? 'Poste Éco'
                                : 'Coursier Express'}
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {sale.shipping?.cost ? `+CHF ${sale.shipping.cost.toFixed(2)}` : 'Gratuit'}
                          </span>
                        </td>

                        {/* Total CHF */}
                        <td className="py-3 px-4">
                          <span className="font-black text-slate-900 text-sm font-heading whitespace-nowrap">
                            CHF {sale.total.toFixed(2)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectingSale(sale)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors"
                              title="Voir tous les détails et modifier le statut"
                            >
                              Détails
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompletedSale(sale)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors"
                              title="Réimprimer le ticket de caisse"
                            >
                              Reçu
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {salesHistory.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-xs">Aucune vente enregistrée pour le moment.</p>
                        <p className="text-[11px] mt-0.5">Les encaissements POS apparaîtront automatiquement ici avec tous les détails du client.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          FULFILLMENT TAB
          ========================================================= */}
      {activeTab === 'fulfillment' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:pl-8 lg:p-8 lg:pl-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase font-heading tracking-tight flex items-center gap-2">
                <span className="text-purple-600">🚚</span> 
                {adminLang === 'fr' ? 'Gestion Expéditions & Stocks' : 'Fulfillment Management'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Multi-origine (Genève & Portugal)</p>
            </div>
            
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              {(['stocks', 'queue_geneva', 'queue_portugal', 'alerts'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFulfillmentSubTab(tab)}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                    fulfillmentSubTab === tab 
                      ? 'bg-white shadow-sm text-purple-700' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'stocks' && 'Inventaire'}
                  {tab === 'queue_geneva' && '🇨🇭 File Genève'}
                  {tab === 'queue_portugal' && '🇵🇹 File Portugal'}
                  {tab === 'alerts' && '⚠️ Alertes'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
            {fulfillmentSubTab === 'stocks' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">État des stocks multi-dépôts (Demo)</h3>
                <p className="text-sm text-slate-500">Intégration API /api/fulfillment/stock à connecter.</p>
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="p-3">Produit</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">🇨🇭 Genève</th>
                      <th className="p-3">🇵🇹 Portugal</th>
                      <th className="p-3">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Whey Protein</td>
                      <td className="p-3 text-slate-500">WP-01</td>
                      <td className="p-3">10</td>
                      <td className="p-3">50</td>
                      <td className="p-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">COMMON</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {fulfillmentSubTab === 'queue_geneva' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">Commandes à expédier depuis Genève (Demo)</h3>
                <div className="p-4 border rounded-xl flex justify-between items-center bg-slate-50">
                  <div>
                    <p className="font-bold text-sm">ORD-123 - Jean Dupont</p>
                    <p className="text-xs text-slate-500">1x Whey Protein</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-bold border rounded bg-white text-slate-700">Étiquette</button>
                    <button className="px-3 py-1.5 text-xs font-bold border border-green-600 bg-green-600 text-white rounded">Expédié</button>
                  </div>
                </div>
              </div>
            )}
            {fulfillmentSubTab === 'queue_portugal' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">Commandes à expédier depuis le Portugal (Demo)</h3>
                <p className="text-sm text-slate-500">Aucune commande en attente.</p>
              </div>
            )}
            {fulfillmentSubTab === 'alerts' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">Alertes et blocages (Demo)</h3>
                <p className="text-sm text-slate-500">Aucune alerte.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: QUICK STOCK EDITING (ON-THE-FLY FROM POS GRID)
          ========================================================= */}
      {quickStockProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="pr-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  <span>Modification Rapide du Stock Caisse</span>
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading mt-1">
                  {quickStockProduct.name.fr}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {quickStockProduct.brand} · Rayon physique Genève
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickStockProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
              {quickStockProduct.variants && quickStockProduct.variants.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                    <span>Variante / Parfum</span>
                    <span>Quantité en rayon Genève</span>
                  </div>

                  {quickStockProduct.variants.map((v) => {
                    const key = v.id || v.sku;
                    const curVal = quickStockValues[key] ?? (typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : (v.inStock !== false ? 15 : 0));
                    const isCrit = curVal < 5;
                    const isMed = curVal >= 5 && curVal <= 10;
                    const variantImg = v.image || quickStockProduct.images[0]?.src || '/images/placeholder.webp';

                    return (
                      <div
                        key={key}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-11 h-11 bg-white rounded-xl border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                            <Image
                              src={variantImg}
                              alt={v.flavorName.fr}
                              fill
                              sizes="44px"
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">
                              {v.flavorName.fr}
                            </p>
                            <p className="text-[11px] text-slate-500">{v.format}</p>
                            <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-black border ${
                              isCrit
                                ? 'bg-red-50 text-red-700 border-red-300'
                                : isMed
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isCrit ? 'bg-red-500 animate-pulse' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <span>{curVal} en rayon</span>
                            </span>
                          </div>
                        </div>

                        {/* Stepper buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => setQuickStockValues(prev => ({ ...prev, [key]: Math.max(0, curVal - 5) }))}
                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                            title="-5 unités"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickStockValues(prev => ({ ...prev, [key]: Math.max(0, curVal - 1) }))}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold transition-colors"
                            title="-1 unité"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={curVal}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setQuickStockValues(prev => ({ ...prev, [key]: isNaN(val) ? 0 : Math.max(0, val) }));
                            }}
                            className="w-14 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 notranslate"
                          />
                          <button
                            type="button"
                            onClick={() => setQuickStockValues(prev => ({ ...prev, [key]: curVal + 1 }))}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold transition-colors"
                            title="+1 unité"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickStockValues(prev => ({ ...prev, [key]: curVal + 5 }))}
                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                            title="+5 unités"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const curVal = quickStockValues['def'] ?? 20;
                    const isCrit = curVal < 5;
                    const isMed = curVal >= 5 && curVal <= 10;
                    return (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                          isCrit
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : isMed
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            isCrit ? 'bg-red-500 animate-pulse' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span>Stock actuel : {curVal} unités ({isCrit ? 'Critique < 5' : isMed ? 'Stock limité 5-10' : 'Optimal > 10'})</span>
                        </span>

                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQuickStockValues(prev => ({ ...prev, def: Math.max(0, curVal - 10) }))}
                            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickStockValues(prev => ({ ...prev, def: Math.max(0, curVal - 1) }))}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={curVal}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setQuickStockValues(prev => ({ ...prev, def: isNaN(val) ? 0 : Math.max(0, val) }));
                            }}
                            className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-black text-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 notranslate"
                          />
                          <button
                            type="button"
                            onClick={() => setQuickStockValues(prev => ({ ...prev, def: curVal + 1 }))}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickStockValues(prev => ({ ...prev, def: curVal + 10 }))}
                            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs"
                          >
                            +10
                          </button>
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          {[
                            { label: '0 (Rupture)', val: 0 },
                            { label: '4 (Critique)', val: 4 },
                            { label: '10 (Moyen)', val: 10 },
                            { label: '20 (Normal)', val: 20 },
                            { label: '50 (Plein)', val: 50 },
                          ].map(preset => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setQuickStockValues(prev => ({ ...prev, def: preset.val }))}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setQuickStockProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveQuickStock}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer le Stock en Direct</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: GTIN / BARCODE MANAGEMENT (POPUP TOOL)
          ========================================================= */}
      {barcodeModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="pr-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                  <Barcode className="w-3 h-3 text-slate-600" />
                  <span>Gestion GTIN / Code-barres Lecteur Laser</span>
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading mt-1">
                  {barcodeModalProduct.name.fr}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {barcodeModalProduct.brand} · Compatible lecteurs EAN-13, UPC & QR
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBarcodeModalProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Barcode Graphic Preview */}
            <div className="my-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
              <div className="flex items-center justify-center gap-[3px] h-12 py-1 px-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
                {Array.from({ length: 36 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-full inline-block ${
                      i % 7 === 0 || i % 11 === 0 ? 'w-[3px] bg-slate-900' : i % 3 === 0 ? 'w-[2px] bg-slate-800' : 'w-[1px] bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-xs font-black tracking-widest text-slate-600 notranslate">
                {barcodeModalValues['def'] || Object.values(barcodeModalValues)[0] || barcodeModalProduct.gtin13 || '7640123456789'}
              </span>
              <p className="text-[11px] text-slate-500 text-center max-w-sm">
                Scannez au lecteur laser ou saisissez le code-barres officiel. Le préfixe suisse standard est <strong className="text-slate-800">764</strong>.
              </p>
            </div>

            {/* Body */}
            <div className="py-2 space-y-4 overflow-y-auto flex-1 pr-1">
              {barcodeModalProduct.variants && barcodeModalProduct.variants.length > 0 ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    Codes-barres par variante de saveur :
                  </span>

                  {barcodeModalProduct.variants.map((v) => {
                    const key = v.id || v.sku;
                    const curBarcode = barcodeModalValues[key] || '';
                    const variantImg = v.image || barcodeModalProduct.images[0]?.src || '/images/placeholder.webp';

                    return (
                      <div key={key} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-8 h-8 bg-white rounded-lg border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                              <Image
                                src={variantImg}
                                alt={v.flavorName.fr}
                                fill
                                sizes="32px"
                                className="object-contain p-0.5"
                              />
                            </div>
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {v.flavorName.fr} · {v.format}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBarcodeModalValues(prev => ({ ...prev, [key]: generateSwissEan13() }))}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="Générer un EAN-13 suisse aléatoire valide"
                          >
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>Générer EAN-13</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={curBarcode}
                            onChange={(e) => setBarcodeModalValues(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder={`Code GTIN-13 (ex: 764... ou SKU ${v.sku})`}
                            className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 notranslate"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Code GTIN / EAN-13 du produit :
                    </label>
                    <button
                      type="button"
                      onClick={() => setBarcodeModalValues(prev => ({ ...prev, def: generateSwissEan13() }))}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>⚡ Générer EAN-13 Suisse (764...)</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={barcodeModalValues['def'] || ''}
                    onChange={(e) => setBarcodeModalValues(prev => ({ ...prev, def: e.target.value }))}
                    placeholder="Ex: 7640123456789"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 notranslate"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setBarcodeModalProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveBarcodeModal}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer les Codes-Barres</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: VARIANT SELECTOR FOR MULTI-FLAVOR PRODUCTS
          ========================================================= */}
      {variantPickerProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  ✨ Sélection de Parfum & Stock Temps Réel
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading mt-1 leading-snug">
                  {variantPickerProduct.name.fr}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {variantPickerProduct.brand} · {variantPickerProduct.variants?.length || 0} variations disponibles
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVariantPickerProduct(null);
                  setVariantFilterQuery('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Flavor Search Filter */}
            <div className="my-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={variantFilterQuery}
                  onChange={(e) => setVariantFilterQuery(e.target.value)}
                  placeholder="Rechercher une saveur (ex: Chocolat, Vanille, Fraise, Cookies...)..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {variantFilterQuery && (
                  <button
                    type="button"
                    onClick={() => setVariantFilterQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Flavor Variants List */}
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 py-1">
              {variantPickerProduct.variants
                ?.filter(v => {
                  if (!variantFilterQuery.trim()) return true;
                  const q = variantFilterQuery.toLowerCase();
                  return (
                    v.flavorName.fr?.toLowerCase().includes(q) ||
                    v.format?.toLowerCase().includes(q) ||
                    v.sku?.toLowerCase().includes(q)
                  );
                })
                .map(v => {
                  const key = v.id || v.sku;
                  const variantImg = v.image || variantPickerProduct.images[0]?.src || '/images/placeholder.webp';
                  const currentStock = typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : (v.inStock !== false ? 15 : 0);
                  const isCrit = currentStock < 5;
                  const isMed = currentStock >= 5 && currentStock <= 10;

                  return (
                    <div
                      key={key}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 bg-white rounded-xl border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                          <Image
                            src={variantImg}
                            alt={v.flavorName.fr}
                            fill
                            sizes="48px"
                            className="object-contain p-1 group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 leading-tight">
                            {v.flavorName.fr}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {v.format} · <span className="font-mono text-slate-400 text-[10px] notranslate">{v.sku}</span>
                          </p>

                          {/* Live Stock Badge with exact color rules */}
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${
                              isCrit
                                ? 'bg-red-50 text-red-700 border-red-300'
                                : isMed
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isCrit ? 'bg-red-500 animate-pulse' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <span className="notranslate">
                                {currentStock === 0 ? 'Rupture de stock' : `${currentStock} en stock`}
                              </span>
                            </span>

                            {/* Mini inline stock adjustment steppers */}
                            <div className="inline-flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5" title="Ajustement rapide du stock">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInlineVariantStockChange(variantPickerProduct.id, key, -1);
                                }}
                                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded text-xs"
                                title="-1 stock"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInlineVariantStockChange(variantPickerProduct.id, key, 1);
                                }}
                                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded text-xs"
                                title="+1 stock"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price & Add to Ticket action */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <span className="font-black text-slate-900 text-sm font-heading notranslate block">
                            CHF {(v.priceChf || variantPickerProduct.priceChf).toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            addToPosTicket(variantPickerProduct, v);
                            setVariantPickerProduct(null);
                            setVariantFilterQuery('');
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter au Ticket</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

              {variantPickerProduct.variants?.filter(v => {
                if (!variantFilterQuery.trim()) return true;
                const q = variantFilterQuery.toLowerCase();
                return (
                  v.flavorName.fr?.toLowerCase().includes(q) ||
                  v.format?.toLowerCase().includes(q) ||
                  v.sku?.toLowerCase().includes(q)
                );
              }).length === 0 && (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs font-bold">Aucune saveur ne correspond à &quot;{variantFilterQuery}&quot;.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setVariantPickerProduct(null);
                  setVariantFilterQuery('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: PAYMENT DETAILS MODAL (SEAMLESS FLEXIBLE & SPLIT CHECKOUT)
          ========================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {adminLang === 'fr' ? 'Règlement Caisse Magasin' : 'Store POS Checkout'}
                </span>
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  {adminLang === 'fr' ? 'Encaissement & Règlement' : 'Payment Collection'} · <span className="notranslate">{ticketNumber}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Display Banner */}
            <div className="my-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center shrink-0">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                {adminLang === 'fr'
                  ? `Montant Net à Encaisser ${shippingCost > 0 ? `(dont livraison CHF ${shippingCost.toFixed(2)})` : ''}`
                  : `Total amount to collect ${shippingCost > 0 ? `(incl. shipping CHF ${shippingCost.toFixed(2)})` : ''}`}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-heading mt-0.5 notranslate">
                <span>CHF </span><span>{grandTotalToPay.toFixed(2)}</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              
              {/* Tender Category Navigation Tabs */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Mode de règlement choisi :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTenderCategory('cash');
                      setPaymentMethod('cash_chf');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      tenderCategory === 'cash'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-black shadow-xs ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold">💵 Espèces</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTenderCategory('other');
                      setPaymentMethod(otherTenderType === 'twint' ? 'twint' : otherTenderType === 'invoice' ? 'invoice' : 'card');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      tenderCategory === 'other'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Zap className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold">⚡ Autre Moyen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTenderCategory('split');
                      setPaymentMethod('split');
                      if (!splitCashAmount) {
                        setSplitCashAmount((grandTotalToPay / 2).toFixed(2));
                        setSplitOtherAmount((grandTotalToPay - (grandTotalToPay / 2)).toFixed(2));
                      }
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      tenderCategory === 'split'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-black shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Split className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold">🔄 Partagé</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: PAY BY CASH */}
              {tenderCategory === 'cash' && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1.5">
                      {adminLang === 'fr' ? 'Montant reçu en espèces du client (CHF) :' : 'Cash received from customer (CHF):'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">CHF</span>
                      <input
                        type="number"
                        step="0.05"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        placeholder={grandTotalToPay.toFixed(2)}
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-amber-300 rounded-xl font-black text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Banknote quick selectors */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: `Exact (CHF ${grandTotalToPay.toFixed(2)})`, val: grandTotalToPay },
                      { label: 'CHF 20', val: 20 },
                      { label: 'CHF 50', val: 50 },
                      { label: 'CHF 100', val: 100 },
                      { label: 'CHF 200', val: 200 }
                    ].map(btn => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setCashTendered(btn.val.toFixed(2))}
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 transition-colors"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Real-time change due box */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {adminLang === 'fr' ? 'Monnaie à rendre :' : 'Change due:'}
                    </span>
                    <span className={`text-base font-black font-heading notranslate ${
                      cashNumeric >= grandTotalToPay ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {cashNumeric >= grandTotalToPay 
                        ? `CHF ${cashChangeDue.toFixed(2)}` 
                        : `${adminLang === 'fr' ? 'Manque' : 'Short'} CHF ${(grandTotalToPay - cashNumeric).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: PAY BY OTHER */}
              {tenderCategory === 'other' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtherTenderType('twint');
                        setPaymentMethod('twint');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        otherTenderType === 'twint'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>⚡ TWINT QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtherTenderType('card');
                        setPaymentMethod('card');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        otherTenderType === 'card'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>💳 Carte / Terminal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtherTenderType('invoice');
                        setPaymentMethod('invoice');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        otherTenderType === 'invoice'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>📄 Facture Client</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtherTenderType('postfinance');
                        setPaymentMethod('card');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        otherTenderType === 'postfinance'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🟡 PostFinance Pay</span>
                    </button>
                  </div>

                  {otherTenderType === 'twint' && (
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 text-xs">
                      <p className="text-emerald-900 font-medium">
                        Présentez le QR Code TWINT au client au comptoir de la Rue des Pâquis.
                      </p>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Référence transaction TWINT (optionnel) :
                        </label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder="Ex: TW-89421..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {otherTenderType === 'card' && (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Terminal de paiement :</label>
                        <select
                          value={cardTerminalType}
                          onChange={(e) => setCardTerminalType(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                        >
                          <option value="Terminal SumUp / PostFinance">Terminal SumUp / PostFinance</option>
                          <option value="Visa / Mastercard">Visa / Mastercard</option>
                          <option value="Apple Pay / Google Pay">Apple Pay / Google Pay</option>
                          <option value="Maestro / Débit Suisse">Maestro / Débit Suisse</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Code autorisation / Référence (optionnel) :</label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder="Ex: AUTH-4912..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {otherTenderType === 'invoice' && (
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-900">
                      <p className="font-semibold">Paiement sur facture à 30 jours (B2B ou Client Régulier).</p>
                      <p className="text-[11px] text-purple-800 mt-1">Assurez-vous de renseigner l'adresse complète du client ci-dessous.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SPLIT TENDER */}
              {tenderCategory === 'split' && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Split className="w-4 h-4 text-blue-600" />
                      <span>Répartition du Règlement</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const sC = parseFloat(splitCashAmount) || 0;
                        const remainder = Math.max(0, grandTotalToPay - sC);
                        setSplitOtherAmount(remainder.toFixed(2));
                      }}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline"
                    >
                      Équilibrer le reste
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Portion Cash */}
                    <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        💵 Part Espèces (CHF) :
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={splitCashAmount}
                        onChange={(e) => setSplitCashAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-black text-sm text-slate-900 focus:outline-none notranslate"
                      />
                    </div>

                    {/* Portion Other */}
                    <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">
                          Part Autre (CHF) :
                        </label>
                        <select
                          value={splitOtherMethod}
                          onChange={(e) => setSplitOtherMethod(e.target.value as 'twint' | 'card')}
                          className="text-[10px] font-bold bg-slate-100 rounded px-1.5 py-0.5 border border-slate-200"
                        >
                          <option value="twint">⚡ TWINT</option>
                          <option value="card">💳 Carte</option>
                        </select>
                      </div>
                      <input
                        type="number"
                        step="0.05"
                        value={splitOtherAmount}
                        onChange={(e) => setSplitOtherAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-black text-sm text-slate-900 focus:outline-none notranslate"
                      />
                    </div>
                  </div>

                  {/* Reconciliation summary */}
                  {(() => {
                    const sCash = parseFloat(splitCashAmount) || 0;
                    const sOther = parseFloat(splitOtherAmount) || 0;
                    const sTotal = sCash + sOther;
                    const isCovered = sTotal >= grandTotalToPay - 0.05;

                    return (
                      <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        isCovered
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}>
                        <div>
                          <span>Saisi : <strong>CHF {sTotal.toFixed(2)}</strong> sur <strong>CHF {grandTotalToPay.toFixed(2)}</strong></span>
                        </div>
                        <span className="font-black font-heading notranslate">
                          {isCovered 
                            ? '✅ Total couvert' 
                            : `Reste CHF ${(grandTotalToPay - sTotal).toFixed(2)}`}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Client & Delivery Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  {adminLang === 'fr' ? 'Informations Client & Expédition :' : 'Customer Details & Shipping:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {adminLang === 'fr' ? 'Nom du client :' : 'Customer name:'}
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={adminLang === 'fr' ? 'Ex: Jean Dupont (ou Client Comptoir)' : 'e.g. Avadh Bajaj (or Walk-in)'}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {adminLang === 'fr' ? 'Téléphone mobile :' : 'Mobile phone:'}
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+41 79 123 45 67"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {adminLang === 'fr' ? 'Email :' : 'Email:'}
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@gmail.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {adminLang === 'fr' ? 'Adresse / Ville :' : 'Address / City:'}
                    </label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Rue des Eaux-Vives 12, Genève"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {adminLang === 'fr' ? "Mode d'expédition :" : 'Shipping method:'}
                    </label>
                    <select
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value as typeof shippingMethod)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-medium"
                    >
                      <option value="store_pickup">{adminLang === 'fr' ? '🛍️ Retrait Magasin Genève (Gratuit)' : '🛍️ Geneva Store Pickup (Free)'}</option>
                      <option value="post_priority">{adminLang === 'fr' ? '📦 Poste Suisse Prioritaire 24h (+CHF 7.90)' : '📦 Swiss Post Priority 24h (+CHF 7.90)'}</option>
                      <option value="post_economy">{adminLang === 'fr' ? '📬 Poste Suisse Économique 48h (+CHF 5.90)' : '📬 Swiss Post Economy 48h (+CHF 5.90)'}</option>
                      <option value="express_geneva">{adminLang === 'fr' ? '⚡ Coursier Express Genève (+CHF 12.00)' : '⚡ Geneva Express Courier (+CHF 12.00)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {adminLang === 'fr' ? 'Statut initial :' : 'Initial status:'}
                    </label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-bold"
                    >
                      <option value="delivered">{adminLang === 'fr' ? '🟢 Livré / Remis en main propre' : '🟢 Delivered / Handed over'}</option>
                      <option value="packed">{adminLang === 'fr' ? '🟠 Emballé / Prêt pour retrait' : '🟠 Packed / Ready for pickup'}</option>
                      <option value="in_processing">{adminLang === 'fr' ? '🟡 En préparation (Processing)' : '🟡 In Processing'}</option>
                      <option value="shipped">{adminLang === 'fr' ? '🔵 Expédié par transporteur' : '🔵 Shipped via carrier'}</option>
                      <option value="pending">{adminLang === 'fr' ? '🟣 En attente' : '🟣 Pending'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {adminLang === 'fr' ? 'Note interne / Vendeur :' : 'Internal cashier note:'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder={adminLang === 'fr' ? 'Ex: Servi au comptoir...' : 'e.g. Counter sale note...'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

            </div>

            {/* Complete sale button */}
            <div className="pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={handleValidateSale}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 notranslate"
              >
                <Check className="w-5 h-5" />
                <span>
                  {adminLang === 'fr' 
                    ? `Valider le Paiement & Générer la Facture (CHF ${grandTotalToPay.toFixed(2)})` 
                    : `Confirm Payment & Generate Invoice (CHF ${grandTotalToPay.toFixed(2)})`}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: PRINTABLE RECEIPT / INVOICE (FACTURE & REÇU DE CAISSE)
          ========================================================= */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-black uppercase text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Vente Confirmée & Facture Émise
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompletedSale(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thermal Receipt Paper Layout */}
            <div id="pos-receipt-print" className="my-4 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-300 font-mono text-xs text-slate-800 space-y-3">
              {/* Header */}
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  FACTURE & REÇU DE CAISSE (INVOICE / RECEIPT)
                </span>
                <h4 className="font-black text-sm text-slate-900">NUTRIFITNESS GENÈVE</h4>
                <p className="text-[11px] text-slate-600">Rue des Pâquis 34, 1201 Genève</p>
                <p className="text-[10px] text-slate-500">Tél: +41 22 731 12 34 · nutrifitness.ch</p>
                <p className="text-[10px] text-slate-400">CHE-123.456.789 TVA suisse</p>
              </div>

              {/* Meta */}
              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Facture / Ticket :</span>
                  <span className="font-bold">{completedSale.ticketNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date :</span>
                  <span>{new Date(completedSale.timestamp).toLocaleString('fr-CH', { timeZone: 'Europe/Zurich' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vendeur :</span>
                  <span>{completedSale.seller}</span>
                </div>
                {completedSale.clientName && (
                  <div className="flex justify-between">
                    <span>Client :</span>
                    <span>{completedSale.clientName}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
                {completedSale.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="pr-2">
                      <p className="font-bold">{it.quantity}x {it.name}</p>
                      <p className="text-[10px] text-slate-500">{it.flavor} · {it.format}</p>
                    </div>
                    <span className="font-bold shrink-0">CHF {(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span>Sous-total brut :</span>
                  <span>CHF {completedSale.subtotal.toFixed(2)}</span>
                </div>
                {completedSale.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Remise ({completedSale.discountPercent}%) :</span>
                    <span>- CHF {completedSale.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>Dont TVA suisse (2.6%) :</span>
                  <span>CHF {completedSale.vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
                  <span>TOTAL NET PAYÉ :</span>
                  <span>CHF {completedSale.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="text-[11px] space-y-1">
                {completedSale.paymentMethod === 'split' ? (
                  <>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Mode de règlement :</span>
                      <span className="uppercase">PAIEMENT PARTAGÉ</span>
                    </div>
                    {completedSale.paymentDetails.splitCash !== undefined && (
                      <div className="flex justify-between text-slate-700">
                        <span>💵 Espèces reçues :</span>
                        <span>CHF {completedSale.paymentDetails.splitCash.toFixed(2)}</span>
                      </div>
                    )}
                    {completedSale.paymentDetails.splitOther !== undefined && (
                      <div className="flex justify-between text-slate-700">
                        <span>{completedSale.paymentDetails.splitOtherMethod === 'twint' ? '⚡ TWINT :' : '💳 Carte Bancaire :'}</span>
                        <span>CHF {completedSale.paymentDetails.splitOther.toFixed(2)}</span>
                      </div>
                    )}
                    {completedSale.paymentDetails.changeGiven ? (
                      <div className="flex justify-between font-bold text-emerald-700">
                        <span>Monnaie rendue :</span>
                        <span>CHF {completedSale.paymentDetails.changeGiven.toFixed(2)}</span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between font-bold">
                      <span>Mode de règlement :</span>
                      <span className="uppercase">{completedSale.paymentMethod}</span>
                    </div>
                    {completedSale.paymentDetails.cashReceived && (
                      <>
                        <div className="flex justify-between">
                          <span>Espèces reçues :</span>
                          <span>CHF {completedSale.paymentDetails.cashReceived.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>Monnaie rendue :</span>
                          <span>CHF {(completedSale.paymentDetails.changeGiven || 0).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {completedSale.paymentDetails.reference && (
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Réf :</span>
                        <span>{completedSale.paymentDetails.reference}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer Note */}
              <div className="text-center pt-2 text-[10px] text-slate-400">
                <p>Merci pour votre confiance !</p>
                <p>À bientôt chez NutriFitness Genève.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCompletedSale(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors mt-2"
            >
              Fermer & Prêt pour la Prochaine Vente
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: FULL SALE / ORDER INSPECTOR ("all details of the client,
          mode of payment, how much received, shipping and change status")
          ========================================================= */}
      {inspectingSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                    Commande #{inspectingSale.ticketNumber}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(inspectingSale.timestamp).toLocaleString('fr-CH', {
                      timeZone: 'Europe/Zurich',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  Détails Commande & Client
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setInspectingSale(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Statut de Traitement Actuel
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Modifiez le statut en direct ci-contre :
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={inspectingSale.status || 'delivered'}
                  onChange={(e) => updateSaleStatus(inspectingSale.id, e.target.value as OrderStatus)}
                  className={`text-xs font-black px-3 py-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    ORDER_STATUS_LABELS[inspectingSale.status || 'delivered']?.bg || 'bg-white'
                  } ${
                    ORDER_STATUS_LABELS[inspectingSale.status || 'delivered']?.text || 'text-slate-900'
                  } ${
                    ORDER_STATUS_LABELS[inspectingSale.status || 'delivered']?.border || 'border-slate-300'
                  }`}
                >
                  <option value="in_processing">🟡 En traitement (In Processing)</option>
                  <option value="packed">📦 Emballé / Prêt (Packed)</option>
                  <option value="shipped">🚚 Expédié (Shipped)</option>
                  <option value="delivered">✅ Livré / Remis (Delivered)</option>
                  <option value="pending">⏳ En attente (Pending)</option>
                  <option value="cancelled">❌ Annulé (Cancelled)</option>
                </select>
              </div>
            </div>

            {/* Two Column Grid: Client Info + Payment/Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Client Info Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Coordonnées Client</span>
                </div>
                
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Nom complet :</span>
                    <strong className="text-slate-900 text-sm">
                      {inspectingSale.client?.name || inspectingSale.clientName || 'Client Comptoir'}
                    </strong>
                  </div>

                  {inspectingSale.client?.phone ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Téléphone :</span>
                      <a 
                        href={`tel:${inspectingSale.client.phone}`}
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{inspectingSale.client.phone}</span>
                      </a>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-[11px]">Téléphone : Non renseigné</div>
                  )}

                  {inspectingSale.client?.email ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Email :</span>
                      <a 
                        href={`mailto:${inspectingSale.client.email}`}
                        className="text-blue-700 font-medium hover:underline flex items-center gap-1.5 break-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{inspectingSale.client.email}</span>
                      </a>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-[11px]">Email : Non renseigné</div>
                  )}

                  {inspectingSale.client?.address || inspectingSale.client?.city ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Adresse & Ville :</span>
                      <p className="text-slate-800 font-medium flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {inspectingSale.client?.address ? `${inspectingSale.client.address}, ` : ''}
                          {inspectingSale.client?.city || 'Genève'}
                        </span>
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Payment & Shipping Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Règlement & Expédition</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mode de paiement :</span>
                    <span className="font-bold text-slate-900 uppercase">
                      {inspectingSale.paymentMethod === 'twint' ? '⚡ TWINT' : inspectingSale.paymentMethod === 'card' ? '💳 Carte Bancaire' : '💵 Espèces (Cash)'}
                    </span>
                    {inspectingSale.paymentDetails?.reference && (
                      <span className="text-[11px] text-slate-500 block">Réf : {inspectingSale.paymentDetails.reference}</span>
                    )}
                    {inspectingSale.paymentDetails?.cardType && (
                      <span className="text-[11px] text-slate-500 block">Type : {inspectingSale.paymentDetails.cardType}</span>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Montant Reçu :</span>
                      <strong className="text-slate-900">CHF {(inspectingSale.amountReceived || inspectingSale.total).toFixed(2)}</strong>
                    </div>
                    {inspectingSale.paymentDetails?.changeGiven ? (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Monnaie rendue :</span>
                        <span>CHF {inspectingSale.paymentDetails.changeGiven.toFixed(2)}</span>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Mode d'expédition :</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-500" />
                      <span>{inspectingSale.shipping?.label || 'Retrait Magasin Genève'}</span>
                    </p>
                    <span className="text-[11px] text-slate-500">
                      Frais de port : {inspectingSale.shipping?.cost ? `CHF ${inspectingSale.shipping.cost.toFixed(2)}` : 'Gratuit'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Articles Purchased */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
                Articles Commandés ({inspectingSale.items.length})
              </h4>

              <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50 max-h-[220px] overflow-y-auto">
                {inspectingSale.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                        <Image
                          src={it.image || '/images/placeholder.webp'}
                          alt={it.name}
                          fill
                          className="object-contain p-0.5"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 leading-tight">{it.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {it.flavor} · {it.format}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">SKU: {it.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-slate-900">
                        {it.quantity} x CHF {it.price.toFixed(2)}
                      </span>
                      <p className="font-black text-xs text-slate-900 font-heading">
                        CHF {(it.price * it.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Recap */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total articles :</span>
                <span>CHF {inspectingSale.subtotal.toFixed(2)}</span>
              </div>
              {inspectingSale.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Remise ({inspectingSale.discountPercent}%) :</span>
                  <span>- CHF {inspectingSale.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {inspectingSale.shipping?.cost ? (
                <div className="flex justify-between text-slate-600">
                  <span>Frais de port :</span>
                  <span>+ CHF {inspectingSale.shipping.cost.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Dont TVA suisse (2.6%) :</span>
                <span>CHF {inspectingSale.vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 font-heading pt-2 border-t border-emerald-200">
                <span>TOTAL PAYÉ :</span>
                <span className="text-emerald-800">CHF {inspectingSale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCompletedSale(inspectingSale);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer Reçu</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectingSale(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          SLIDE-OVER / DRAWER: PRODUCT FULL INSPECTOR ("it must show all images,
          titles and long and short description and everything we show on product page")
          ========================================================= */}
      {inspectingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-3xl h-full shadow-2xl border-l border-slate-200 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-900 animate-in slide-in-from-right duration-200">
            
            {/* Top Bar of Drawer */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-heading">
                    {inspectingProduct.brand}
                  </span>
                  {inspectingProduct.shippingOrigin === 'portugal' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px]">
                      <span>🇵🇹</span>
                      <span>Usine Portugal (3–5j)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                      <span>🇨🇭</span>
                      <span>Stock Genève (En rayon POS)</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-slate-900 font-heading leading-snug">
                  {inspectingProduct.name[inspectorLang] || inspectingProduct.name.fr}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {inspectingProduct.id}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(inspectingProduct);
                    setIsEditorOpen(true);
                  }}
                  className="px-3 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title="Modifier cette fiche produit"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Modifier</span>
                </button>
                <Link
                  href={`/produit/${inspectingProduct.slug.fr}/`}
                  target="_blank"
                  className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  title="Voir sur le site public"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setInspectingProduct(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Language Selector for Multilingual View */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">Langue d'affichage des textes :</span>
              <div className="flex items-center gap-1">
                {(['fr', 'de', 'it', 'en'] as SupportedLocale[]).map(lng => (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => setInspectorLang(lng)}
                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                      inspectorLang === lng
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {lng}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: ALL IMAGES GALLERY */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Galerie Photos Complète ({inspectingProduct.images.length} visuels)</span>
                </h3>
              </div>

              {/* Large Featured Image Preview */}
              <div className="relative aspect-video w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-center overflow-hidden">
                <Image
                  src={selectedGalleryImg || inspectingProduct.images[0]?.src || '/images/placeholder.webp'}
                  alt={inspectingProduct.name.fr}
                  fill
                  className="object-contain p-2"
                />
              </div>

              {/* Thumbnails of ALL Images */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {inspectingProduct.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedGalleryImg(img.src)}
                    className={`relative w-16 h-16 rounded-xl bg-slate-50 border overflow-hidden p-1 transition-all ${
                      selectedGalleryImg === img.src
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-contain"
                    />
                  </button>
                ))}

                {/* Also include any flavor-specific images from variants */}
                {inspectingProduct.variants?.filter(v => v.image).map((v, i) => (
                  <button
                    key={`var-${i}`}
                    type="button"
                    onClick={() => setSelectedGalleryImg(v.image!)}
                    className={`relative w-16 h-16 rounded-xl bg-slate-50 border overflow-hidden p-1 transition-all ${
                      selectedGalleryImg === v.image
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                    title={`Visuel saveur : ${v.flavorName.fr}`}
                  >
                    <Image
                      src={v.image!}
                      alt={v.flavorName.fr}
                      fill
                      className="object-contain"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] text-center truncate">
                      {v.flavorName.fr}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 2: PRICING, VAT & INVENTORY */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Prix Vente</span>
                <p className="text-lg font-black text-slate-900 font-heading">
                  CHF {inspectingProduct.priceChf.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Prix Barré</span>
                <p className="text-lg font-bold text-slate-400 line-through">
                  {inspectingProduct.compareAtPriceChf 
                    ? `CHF ${inspectingProduct.compareAtPriceChf.toFixed(2)}` 
                    : 'Aucun'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Catégorie TVA</span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {inspectingProduct.taxCategory === 'standard' ? 'Standard 8.1%' : 'Alimentaire 2.6%'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Origine Logistique</span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {inspectingProduct.shippingOrigin === 'portugal' ? '🇵🇹 Usine Portugal' : '🇨🇭 Genève Stock'}
                </p>
              </div>
            </div>

            {/* SECTION 3: DESCRIPTIONS (SHORT, LONG & AEO) */}
            <div className="space-y-4">
              
              {/* Short Description */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-heading">
                  Description Courte ({inspectorLang.toUpperCase()})
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {inspectingProduct.shortDescription[inspectorLang] || inspectingProduct.shortDescription.fr}
                </p>
              </div>

              {/* Direct Answer AEO */}
              {inspectingProduct.directAnswerAeo && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider font-heading flex items-center gap-1">
                    <span>⚡</span> Direct Answer AEO / GEO (Google & IA)
                  </span>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    {inspectingProduct.directAnswerAeo[inspectorLang] || inspectingProduct.directAnswerAeo.fr}
                  </p>
                </div>
              )}

              {/* Long Description (Rich HTML preview) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-heading">
                  Description Détaillée & Scientifique ({inspectorLang.toUpperCase()})
                </span>
                <div 
                  className="prose prose-sm max-w-none text-xs text-slate-700 prose-headings:font-black prose-headings:text-slate-900 prose-ul:list-disc prose-li:my-0.5"
                  dangerouslySetInnerHTML={{
                    __html: inspectingProduct.longDescription[inspectorLang] || inspectingProduct.longDescription.fr
                  }}
                />
              </div>

            </div>

            {/* SECTION 4: VARIANTS, FLAVORS & SKUs */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
                Options, Saveurs & Codes SKUs ({inspectingProduct.variants?.length || 1} variantes)
              </h3>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Saveur</th>
                      <th className="py-2.5 px-3">Format</th>
                      <th className="py-2.5 px-3">SKU / Code-barres</th>
                      <th className="py-2.5 px-3">Prix CHF</th>
                      <th className="py-2.5 px-3">Stock Dispo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectingProduct.variants?.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {v.flavorName[inspectorLang] || v.flavorName.fr}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{v.format}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{v.sku}</td>
                        <td className="py-2 px-3 font-black text-slate-900 font-heading">
                          CHF {(v.priceChf || inspectingProduct.priceChf).toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {v.inStock ? `${v.inventoryQuantity} en stock` : 'Rupture'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 5: INGREDIENTS, ALLERGENS & NUTRITION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-900">Ingrédients :</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {inspectingProduct.ingredients[inspectorLang] || inspectingProduct.ingredients.fr}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-900">Conseils d'utilisation & Posologie :</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {inspectingProduct.usageInstructions[inspectorLang] || inspectingProduct.usageInstructions.fr}
                </p>
              </div>
            </div>

            {/* Nutrition Facts Table */}
            {inspectingProduct.nutrition && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-900 font-heading">
                    Tableau des Valeurs Nutritionnelles
                  </span>
                  <span className="text-xs text-slate-500">
                    Portion : {inspectingProduct.nutrition.servingSize}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Énergie</span>
                    <span className="font-black text-slate-900">{inspectingProduct.nutrition.energyKcal} kcal</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Protéines</span>
                    <span className="font-black text-emerald-700">{inspectingProduct.nutrition.proteinG} g</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Glucides</span>
                    <span className="font-black text-slate-900">{inspectingProduct.nutrition.carbsG} g</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Dont sucres</span>
                    <span className="font-black text-slate-900">{inspectingProduct.nutrition.sugarsG} g</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Lipides</span>
                    <span className="font-black text-slate-900">{inspectingProduct.nutrition.fatG} g</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Sel</span>
                    <span className="font-black text-slate-900">{inspectingProduct.nutrition.saltG} g</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick POS action button if in Geneva stock */}
            {inspectingProduct.shippingOrigin !== 'portugal' && (
              <button
                type="button"
                onClick={() => {
                  const defaultVar = inspectingProduct.variants?.[0] || {
                    id: 'def',
                    sku: inspectingProduct.id,
                    flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
                    format: '1 unité',
                    priceChf: inspectingProduct.priceChf,
                    inventoryQuantity: 20,
                    inStock: true
                  };
                  addToPosTicket(inspectingProduct, defaultVar);
                  setActiveTab('pos');
                  setInspectingProduct(null);
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>Ajouter cet article à la Caisse POS</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* =========================================================
          MODAL D: PRODUCT EDITOR & CREATOR (SHOPIFY / WORDPRESS STYLE)
          ========================================================= */}
      <ProductEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        existingBrands={brandsList}
      />

    </div>
  );
}
