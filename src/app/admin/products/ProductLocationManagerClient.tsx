'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Check,
  X,
  RotateCcw,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  History,
  AlertCircle,
  Filter,
  CheckCircle2,
  Lock,
  ArrowRight,
  Layers,
  MapPin,
  RefreshCw,
  Package
} from 'lucide-react';

const ADMIN_PASSWORD = 'Geneva@03564';

interface VariantItem {
  id: string;
  sku: string;
  attribute_name: string;
  attribute_value: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  stock_geneva: number;
  stock_portugal: number;
  is_geneva_active: boolean;
  is_portugal_active: boolean;
}

interface ProductRow {
  id: string;
  woo_id: string | null;
  sku: string;
  name: string;
  slug: string;
  type: string;
  status: 'published' | 'draft';
  main_location: 'GENEVA' | 'PORTUGAL';
  base_price: number;
  images: { src: string; alt?: string }[];
  stock_geneva: number;
  stock_portugal: number;
  is_geneva_active: boolean;
  is_portugal_active: boolean;
  location_type: 'GENEVA_ONLY' | 'PORTUGAL_ONLY' | 'COMMON';
  variants: VariantItem[];
  deleted_at: string | null;
  updated_at: string;
}

interface ToastMessage {
  id: string;
  text: string;
  undoAction?: () => Promise<void>;
  expiresAt: number;
}

export default function ProductLocationManagerClient() {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Data & Filters
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'GENEVA' | 'PORTUGAL' | 'COMMON'>('all');
  const [statusTab, setStatusTab] = useState<'published' | 'draft'>('published');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Selection & UI state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [auditProduct, setAuditProduct] = useState<ProductRow | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nutrifitness_admin_auth');
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    } catch {}
    setAuthChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('nutrifitness_admin_auth', 'true');
      } catch {}
      setAuthError(null);
    } else {
      setAuthError('Mot de passe incorrect.');
    }
  };

  // Toast manager with auto dismiss
  useEffect(() => {
    const timer = setInterval(() => {
      setToasts(prev => prev.filter(t => t.expiresAt > Date.now()));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const showToast = (text: string, undoAction?: () => Promise<void>) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(),
      text,
      undoAction,
      expiresAt: Date.now() + 10000 // 10 seconds undo window
    };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        location: locationFilter,
        status: statusTab,
        page: page.toString(),
        limit: '30'
      });
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error('Fetch products error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated, search, locationFilter, statusTab, page]);

  // Toggle Location
  const handleToggleLocation = async (product: ProductRow, origin: 'GENEVA' | 'PORTUGAL') => {
    const prevProduct = { ...product };
    const isGeneva = origin === 'GENEVA';
    const currentActive = isGeneva ? product.is_geneva_active : product.is_portugal_active;
    const newActive = !currentActive;

    // Optimistic Update
    setProducts(prev => prev.map(p => {
      if (p.id !== product.id) return p;
      const nextGen = isGeneva ? newActive : p.is_geneva_active;
      const nextPt = !isGeneva ? newActive : p.is_portugal_active;
      const nextLoc: 'GENEVA_ONLY' | 'PORTUGAL_ONLY' | 'COMMON' =
        nextGen && nextPt ? 'COMMON' : nextPt ? 'PORTUGAL_ONLY' : 'GENEVA_ONLY';
      return {
        ...p,
        is_geneva_active: nextGen,
        is_portugal_active: nextPt,
        location_type: nextLoc
      };
    }));

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          toggle_location: origin,
          [isGeneva ? 'is_geneva_active' : 'is_portugal_active']: newActive
        })
      });

      if (!res.ok) throw new Error('Erreur de mise à jour');

      showToast(
        `Origine ${origin === 'GENEVA' ? 'Genève' : 'Portugal'} ${newActive ? 'activée' : 'désactivée'} pour ${product.name}`,
        async () => {
          // Undo handler
          await fetch('/api/admin/products', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: product.id,
              [isGeneva ? 'is_geneva_active' : 'is_portugal_active']: !newActive
            })
          });
          fetchProducts();
        }
      );
    } catch (err) {
      // Revert optimistic update
      setProducts(prev => prev.map(p => p.id === product.id ? prevProduct : p));
      showToast('Échec de la mise à jour.');
    }
  };

  // Change Main Location
  const handleChangeMainLocation = async (product: ProductRow, newLoc: 'GENEVA' | 'PORTUGAL') => {
    const oldLoc = product.main_location;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, main_location: newLoc } : p));

    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, main_location: newLoc })
      });
      showToast(`Emplacement principal défini sur ${newLoc === 'GENEVA' ? 'Genève' : 'Portugal'}`);
    } catch {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, main_location: oldLoc } : p));
    }
  };

  // Update Stock Inline
  const handleUpdateStock = async (product: ProductRow, origin: 'GENEVA' | 'PORTUGAL', qty: number) => {
    const validQty = Math.max(0, qty);
    const key = origin === 'GENEVA' ? 'stock_geneva' : 'stock_portugal';
    const oldQty = product[key];

    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, [key]: validQty } : p));

    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          [key]: validQty
        })
      });
      showToast(`Stock ${origin === 'GENEVA' ? 'Genève' : 'Portugal'} mis à jour (${validQty})`);
    } catch {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, [key]: oldQty } : p));
    }
  };

  // Update Variant Stock
  const handleUpdateVariantStock = async (
    product: ProductRow,
    variantId: string,
    origin: 'GENEVA' | 'PORTUGAL',
    qty: number
  ) => {
    const validQty = Math.max(0, qty);
    const isGeneva = origin === 'GENEVA';

    setProducts(prev => prev.map(p => {
      if (p.id !== product.id) return p;
      return {
        ...p,
        variants: p.variants.map(v => {
          if (v.id !== variantId) return v;
          return {
            ...v,
            [isGeneva ? 'stock_geneva' : 'stock_portugal']: validQty
          };
        })
      };
    }));

    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          variants: [{
            id: variantId,
            [isGeneva ? 'stock_geneva' : 'stock_portugal']: validQty
          }]
        })
      });
      showToast(`Stock variante mis à jour (${validQty})`);
    } catch {
      fetchProducts();
    }
  };

  // Move to Draft (Soft Delete)
  const handleDeleteToDraft = async (product: ProductRow) => {
    setProducts(prev => prev.filter(p => p.id !== product.id));

    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_to_draft' })
      });

      showToast(
        `"${product.name}" déplacé dans les brouillons`,
        async () => {
          await fetch(`/api/admin/products/${product.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'restore' })
          });
          fetchProducts();
        }
      );
    } catch {
      fetchProducts();
    }
  };

  // Restore Product
  const handleRestore = async (product: ProductRow) => {
    setProducts(prev => prev.filter(p => p.id !== product.id));
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' })
      });
      showToast(`"${product.name}" restauré dans le catalogue public.`);
    } catch {
      fetchProducts();
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
      showToast('Produit définitivement supprimé.');
    } catch {
      showToast('Erreur lors de la suppression.');
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, product_ids: ids })
      });
      if (res.ok) {
        showToast(`Action groupée effectuée sur ${ids.length} produits.`);
        setSelectedIds(new Set());
        fetchProducts();
      }
    } catch {
      showToast('Erreur lors de l\'action groupée.');
    }
  };

  // Load Audit Log
  const openAuditLog = async (product: ProductRow) => {
    setAuditProduct(product);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.auditLogs || []);
      }
    } catch {}
  };

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Chargement...
      </div>
    );
  }

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-[#F80404] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-heading mb-1">
            Gestionnaire des Stocks & Emplacements
          </h1>
          <p className="text-xs text-slate-400 mb-6">
            Accès sécurisé réservé à l&apos;équipe NutriFitness Genève.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Mot de passe administrateur"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F80404]"
                autoFocus
              />
            </div>
            {authError && <p className="text-xs text-red-400 font-bold">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-[#F80404] hover:bg-red-600 text-black font-black uppercase text-xs rounded-xl tracking-wider transition-all"
            >
              Déverrouiller
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/wp-admin/"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Retour Caisse POS
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase font-heading flex items-center gap-2">
                <span>📍 Gestion des Emplacements & Stocks</span>
              </h1>
              <p className="text-xs text-slate-500">
                Genève (Marco) · Portugal (Omar) · Multi-origine synchronisé
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              {totalCount} Produits
            </span>
          </div>
        </div>

        {/* Sub Tabs: Actif vs Brouillons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex border-t border-slate-100">
          <button
            onClick={() => { setStatusTab('published'); setPage(1); }}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              statusTab === 'published'
                ? 'border-[#F80404] text-[#F80404]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Catalogue Actif</span>
          </button>
          <button
            onClick={() => { setStatusTab('draft'); setPage(1); }}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              statusTab === 'draft'
                ? 'border-[#F80404] text-[#F80404]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Brouillons &amp; Retirés</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, SKU ou code Woo..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#F80404] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Origine :
            </span>
            {(['all', 'GENEVA', 'PORTUGAL', 'COMMON'] as const).map(loc => (
              <button
                key={loc}
                onClick={() => { setLocationFilter(loc); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  locationFilter === loc
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {loc === 'all' && 'Tous'}
                {loc === 'GENEVA' && '🇨🇭 Genève Uniq.'}
                {loc === 'PORTUGAL' && '🇵🇹 Portugal Uniq.'}
                {loc === 'COMMON' && '🌍 Les Deux (COMMON)'}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Bulk Actions Bar (when items selected) */}
        {selectedIds.size > 0 && (
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F80404] text-black font-black text-xs flex items-center justify-center">
                {selectedIds.size}
              </span>
              <span className="text-xs font-bold">Produits sélectionnés</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkAction('set_location_geneva')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                🇨🇭 Définir Genève
              </button>
              <button
                onClick={() => handleBulkAction('set_location_portugal')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                🇵🇹 Définir Portugal
              </button>
              <button
                onClick={() => handleBulkAction('set_location_both')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                🌍 Activer les Deux (COMMON)
              </button>
              {statusTab === 'draft' ? (
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  ✓ Re-publier
                </button>
              ) : (
                <button
                  onClick={() => handleBulkAction('delete_to_draft')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Mettre en brouillon
                </button>
              )}
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-2 py-1 text-slate-400 hover:text-white text-xs font-medium"
              >
                Désélectionner
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedIds.size === products.length}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-[#F80404] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Produit &amp; SKU</th>
                  <th className="p-3 text-center">Origines Actives</th>
                  <th className="p-3 text-center">Type Dérivé</th>
                  <th className="p-3 text-center">Origine Carte</th>
                  <th className="p-3 text-center">🇨🇭 Stock Genève</th>
                  <th className="p-3 text-center">🇵🇹 Stock Portugal</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      Chargement des produits...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                ) : (
                  products.map(product => {
                    const isSelected = selectedIds.has(product.id);
                    const isExpanded = expandedRow === product.id;
                    const mainImg = product.images?.[0]?.src || '/images/placeholder.webp';

                    return (
                      <React.Fragment key={product.id}>
                        <tr className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-red-50/30' : ''}`}>
                          {/* Checkbox */}
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(product.id)}
                              className="rounded border-slate-300 text-[#F80404] focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Product Image + Name */}
                          <td className="p-3">
                            <div className="flex items-center gap-3 min-w-[240px]">
                              <div className="relative w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                                <Image
                                  src={mainImg}
                                  alt={product.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate" title={product.name}>
                                  {product.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                  <span>SKU: {product.sku || 'N/A'}</span>
                                  {product.variants.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedRow(isExpanded ? null : product.id)}
                                      className="inline-flex items-center gap-0.5 text-blue-600 hover:underline font-bold"
                                    >
                                      {product.variants.length} parfums
                                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Location Controls (Toggles) */}
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                              {/* Geneva Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleLocation(product, 'GENEVA')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                  product.is_geneva_active
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-slate-700'
                                }`}
                                title="Activer / Désactiver Genève"
                              >
                                <span>🇨🇭</span>
                                <span>Genève</span>
                              </button>

                              {/* Portugal Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleLocation(product, 'PORTUGAL')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                  product.is_portugal_active
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-slate-700'
                                }`}
                                title="Activer / Désactiver Portugal"
                              >
                                <span>🇵🇹</span>
                                <span>Portugal</span>
                              </button>
                            </div>
                          </td>

                          {/* Location Type Badge */}
                          <td className="p-3 text-center">
                            {product.location_type === 'COMMON' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                                🌍 COMMON
                              </span>
                            )}
                            {product.location_type === 'GENEVA_ONLY' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                🇨🇭 GENÈVE SEUL
                              </span>
                            )}
                            {product.location_type === 'PORTUGAL_ONLY' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                🇵🇹 PORTUGAL SEUL
                              </span>
                            )}
                          </td>

                          {/* Main Location Selector */}
                          <td className="p-3 text-center">
                            <select
                              value={product.main_location}
                              onChange={e => handleChangeMainLocation(product, e.target.value as 'GENEVA' | 'PORTUGAL')}
                              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-slate-400 cursor-pointer"
                            >
                              <option value="GENEVA">🇨🇭 Genève</option>
                              <option value="PORTUGAL">🇵🇹 Portugal</option>
                            </select>
                          </td>

                          {/* Stock Genève (Inline Input) */}
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={0}
                              value={product.stock_geneva}
                              onChange={e => handleUpdateStock(product, 'GENEVA', parseInt(e.target.value, 10))}
                              className={`w-16 text-center font-bold text-xs py-1 px-1 rounded-lg border focus:outline-none ${
                                product.stock_geneva < 5
                                  ? 'border-red-300 bg-red-50 text-red-700'
                                  : product.stock_geneva < 10
                                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                                  : 'border-slate-200 bg-slate-50 text-emerald-700'
                              }`}
                            />
                          </td>

                          {/* Stock Portugal (Inline Input) */}
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={0}
                              value={product.stock_portugal}
                              onChange={e => handleUpdateStock(product, 'PORTUGAL', parseInt(e.target.value, 10))}
                              className={`w-16 text-center font-bold text-xs py-1 px-1 rounded-lg border focus:outline-none ${
                                product.stock_portugal < 5
                                  ? 'border-red-300 bg-red-50 text-red-700'
                                  : product.stock_portugal < 10
                                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                                  : 'border-slate-200 bg-slate-50 text-blue-700'
                              }`}
                            />
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {product.status === 'published' ? (
                                <>
                                  <Link
                                    href={`/produit/${product.slug}`}
                                    target="_blank"
                                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                                    title="Voir sur le site public"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => openAuditLog(product)}
                                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                                    title="Historique des modifications"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteToDraft(product)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Mettre en brouillon (retirer du site)"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleRestore(product)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-colors"
                                  >
                                    Restaurer
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(product.id)}
                                    className="p-1.5 text-red-400 hover:text-red-700 rounded-lg hover:bg-red-50"
                                    title="Supprimer définitivement"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Variants Row */}
                        {isExpanded && product.variants.length > 0 && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={8} className="p-4 pl-14">
                              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  Variantes &amp; Parfums ({product.variants.length}) :
                                </h4>
                                <div className="divide-y divide-slate-100">
                                  {product.variants.map(variant => (
                                    <div key={variant.id} className="py-2 flex items-center justify-between gap-4 text-xs">
                                      <div className="flex items-center gap-3 min-w-[200px]">
                                        {variant.image_url && (
                                          <div className="relative w-8 h-8 rounded-md overflow-hidden bg-slate-100 shrink-0">
                                            <Image
                                              src={variant.image_url}
                                              alt={variant.attribute_value}
                                              fill
                                              className="object-contain p-0.5"
                                            />
                                          </div>
                                        )}
                                        <div>
                                          <p className="font-bold text-slate-900">{variant.attribute_value}</p>
                                          <p className="text-[10px] text-slate-400">SKU: {variant.sku || 'N/A'}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] text-slate-500">🇨🇭 Genève :</span>
                                          <input
                                            type="number"
                                            min={0}
                                            value={variant.stock_geneva}
                                            onChange={e => handleUpdateVariantStock(product, variant.id, 'GENEVA', parseInt(e.target.value, 10))}
                                            className="w-16 text-center font-bold text-xs py-1 px-1 rounded-lg border border-slate-200 bg-slate-50"
                                          />
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] text-slate-500">🇵🇹 Portugal :</span>
                                          <input
                                            type="number"
                                            min={0}
                                            value={variant.stock_portugal}
                                            onChange={e => handleUpdateVariantStock(product, variant.id, 'PORTUGAL', parseInt(e.target.value, 10))}
                                            className="w-16 text-center font-bold text-xs py-1 px-1 rounded-lg border border-slate-200 bg-slate-50"
                                          />
                                        </div>

                                        <span className="text-slate-600 font-bold min-w-[60px] text-right">
                                          CHF {variant.price.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>Page {page} sur {totalPages}</span>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
                >
                  Précédent
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Double Confirmation Permanent Delete Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Suppression Définitive</h3>
            <p className="text-xs text-slate-500">
              Cette action est irréversible. Le produit, ses variantes et ses stocks seront définitivement supprimés.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={() => handlePermanentDelete(deleteConfirmId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Drawer / Modal */}
      {auditProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white h-full max-w-md w-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Journal des Modifications</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[280px]">{auditProduct.name}</p>
                </div>
                <button
                  onClick={() => setAuditProduct(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)]">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Aucun historique enregistré.</p>
                ) : (
                  auditLogs.map((log: any) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(log.created_at).toLocaleString('fr-CH')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Par: {log.user_id}</p>
                      {log.new_values && (
                        <pre className="text-[10px] bg-white p-2 rounded border border-slate-100 overflow-x-auto text-slate-600">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setAuditProduct(null)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Floating Undo Toasts (10-second window) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs font-medium leading-tight">{toast.text}</p>
            </div>
            {toast.undoAction && (
              <button
                onClick={() => {
                  toast.undoAction?.();
                  setToasts(prev => prev.filter(t => t.id !== toast.id));
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Annuler</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
