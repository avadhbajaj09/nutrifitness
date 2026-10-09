'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Truck,
  Lock,
  Search,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Minus,
  Plus,
  Save,
  Eye,
  EyeOff,
  X,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Check,
  Send,
  Boxes,
  User,
  Phone,
  Mail
} from 'lucide-react';

const OMAR_PASSWORD = 'TeamOmar@23277';

interface ProductVariant {
  id: string;
  sku: string;
  attribute_name?: string;
  attribute_value?: string;
  image_url?: string;
  stock_portugal: number;
  is_active: boolean;
}

interface PortugalProduct {
  id: string;
  sku: string;
  name: { fr?: string; en?: string } | string;
  slug: string;
  images: Array<{ src: string } | string>;
  location_type: 'PORTUGAL_ONLY' | 'COMMON';
  main_location?: string;
  stock_portugal: number;
  is_portugal_active: boolean;
  weight_kg?: number;
  variants: ProductVariant[];
  updated_at?: string;
}

interface OrderItem {
  id?: string;
  productId?: string;
  name: string;
  flavor?: string;
  format?: string;
  quantity: number;
  price?: number;
  image?: string;
  sku?: string;
}

interface PortugalOrder {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    shippingMethod?: string;
    shippingLabel?: string;
    trackingNumber?: string;
    carrier?: string;
    warehouse_notes?: string;
    fulfilled_by?: string;
  };
  items: OrderItem[];
  total_amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'in_processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  fulfilled_by?: string;
  fulfillment_origin?: string;
}

export default function TeamOmarClient() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // App state
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [products, setProducts] = useState<PortugalProduct[]>([]);
  const [orders, setOrders] = useState<PortugalOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'portugal_only' | 'common' | 'low_stock'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'in_processing' | 'packed' | 'shipped' | 'delivered'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick edit modal
  const [editingProduct, setEditingProduct] = useState<PortugalProduct | null>(null);
  const [modalStockValues, setModalStockValues] = useState<Record<string, number>>({});
  const [savingStock, setSavingStock] = useState<boolean>(false);

  // Shipping dispatch modal
  const [dispatchOrder, setDispatchOrder] = useState<PortugalOrder | null>(null);
  const [dispatchCarrier, setDispatchCarrier] = useState<string>('CTT Express');
  const [dispatchTracking, setDispatchTracking] = useState<string>('');
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  const [savingDispatch, setSavingDispatch] = useState<boolean>(false);

  // Live time for Lisbon
  const [lisbonTime, setLisbonTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLisbonTime(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'Europe/Lisbon',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check auth from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nutrifitness_omar_auth');
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    } catch {}
    setAuthChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === OMAR_PASSWORD) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('nutrifitness_omar_auth', 'true');
      } catch {}
      setAuthError(null);
    } else {
      setAuthError('Incorrect password. Please contact warehouse management.');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('nutrifitness_omar_auth');
    } catch {}
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch data
  const fetchData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch('/api/teamomar/products'),
        fetch('/api/teamomar/orders'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }

      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData.orders || []);
      }
    } catch (err) {
      console.error('[Omar Portal] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    showToast('Warehouse data synchronized.');
  };

  // Instant inline stock change for single products
  const handleUpdateStock = async (productId: string, newQty: number) => {
    const safeQty = Math.max(0, newQty);
    // Optimistic update
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock_portugal: safeQty } : p))
    );

    try {
      const res = await fetch('/api/teamomar/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          stock_portugal: safeQty,
        }),
      });

      if (res.ok) {
        showToast(`Stock updated to ${safeQty} units.`);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update stock');
        fetchData();
      }
    } catch {
      alert('Network error updating stock');
      fetchData();
    }
  };

  // Open modal for detailed / variant stock editing
  const openStockModal = (product: PortugalProduct) => {
    setEditingProduct(product);
    const initial: Record<string, number> = {};
    initial['def'] = product.stock_portugal;
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        initial[v.id] = v.stock_portugal;
      });
    }
    setModalStockValues(initial);
  };

  const handleSaveModalStock = async () => {
    if (!editingProduct) return;
    setSavingStock(true);

    const parentQty = modalStockValues['def'] ?? editingProduct.stock_portugal;
    const variantsPayload = (editingProduct.variants || []).map(v => ({
      id: v.id,
      stock_portugal: modalStockValues[v.id] ?? v.stock_portugal,
    }));

    try {
      const res = await fetch('/api/teamomar/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          stock_portugal: parentQty,
          variants: variantsPayload,
        }),
      });

      if (res.ok) {
        showToast('All variant stock levels saved successfully.');
        setEditingProduct(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save stock');
      }
    } catch {
      alert('Error updating stock');
    } finally {
      setSavingStock(false);
    }
  };

  // Fast order status update
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: PortugalOrder['status'],
    tracking?: string,
    carrier?: string,
    notes?: string
  ) => {
    // Optimistic update
    setOrders(prev =>
      prev.map(o =>
        o.order_number === orderId || o.id === orderId
          ? {
              ...o,
              status: newStatus,
              fulfilled_by: 'omar',
              shipping_address: {
                ...o.shipping_address,
                trackingNumber: tracking ?? o.shipping_address.trackingNumber,
                carrier: carrier ?? o.shipping_address.carrier,
                warehouse_notes: notes ?? o.shipping_address.warehouse_notes,
              },
            }
          : o
      )
    );

    try {
      const res = await fetch('/api/teamomar/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
          tracking_number: tracking,
          carrier,
          notes,
        }),
      });

      if (res.ok) {
        showToast(`Order status updated to ${newStatus}.`);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update order status');
        fetchData();
      }
    } catch {
      alert('Error updating order');
      fetchData();
    }
  };

  // Submit shipping modal
  const handleConfirmDispatch = async () => {
    if (!dispatchOrder) return;
    setSavingDispatch(true);

    await handleUpdateOrderStatus(
      dispatchOrder.order_number,
      'shipped',
      dispatchTracking.trim(),
      dispatchCarrier,
      dispatchNotes.trim()
    );

    setSavingDispatch(false);
    setDispatchOrder(null);
    setDispatchTracking('');
    setDispatchNotes('');
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pName = typeof p.name === 'string' ? p.name : p.name?.fr || p.name?.en || '';
      const matchesSearch =
        pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (stockFilter === 'portugal_only') return p.location_type === 'PORTUGAL_ONLY';
      if (stockFilter === 'common') return p.location_type === 'COMMON';
      if (stockFilter === 'low_stock') return p.stock_portugal <= 5;
      return true;
    });
  }, [products, searchQuery, stockFilter]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) {
        return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 1: LOGIN GATE
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 antialiased font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Boxes className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl font-black text-white uppercase tracking-tight">
              Omar Team Portal
            </span>
            <span className="text-lg">🇵🇹</span>
          </div>

          <p className="text-xs text-slate-400 mb-6">
            Portugal Warehouse · Oliveira de Azeméis Logistics
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Warehouse Access Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Omar Team password..."
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-12"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black uppercase text-xs rounded-xl tracking-wider transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Portugal Warehouse</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
            <p>Zona Industrial, 3720-000 Oliveira de Azeméis, Portugal</p>
            <p className="mt-1 font-mono text-[11px] text-slate-600">Access point: /teamomar</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: AUTHENTICATED PORTAL (Shopify Style Left Sidebar + Full Width)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex antialiased font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-800 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
        {/* Top Header / Brand */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-md shrink-0">
              PT
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-white tracking-tight truncate flex items-center gap-1.5">
                <span>Omar Logistics</span>
                <span>🇵🇹</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] text-slate-400 font-medium truncate">
                  Oliveira de Azeméis
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Warehouse Navigation
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'inventory'
                ? 'bg-slate-800 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Package className={`w-4 h-4 shrink-0 ${activeTab === 'inventory' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="truncate">Warehouse Inventory</span>
            </div>
            <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0">
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-slate-800 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Truck className={`w-4 h-4 shrink-0 ${activeTab === 'orders' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="truncate">Fulfillment Orders</span>
            </div>
            {orders.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-900/60 text-blue-200 border border-blue-700/60 shrink-0">
                {orders.length}
              </span>
            )}
          </button>

          <div className="pt-5 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Warehouse Details
          </div>

          <div className="px-3 py-2 text-[11px] text-slate-400 space-y-1.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <p className="font-semibold text-slate-300">Manager: Omar</p>
            <p>Cutoff: 14:00 Lisbon</p>
            <p>Schedule: Mon – Sat (6 days)</p>
            <p className="text-emerald-400 font-medium">Auto-sync with Geneva active</p>
          </div>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between px-2 text-xs">
            <div className="min-w-0">
              <p className="text-white font-bold truncate">Team Omar</p>
              <p className="text-[11px] text-slate-500 truncate">Portugal Fulfillment</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col pb-20">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <div className="w-full px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
                {activeTab === 'inventory' ? 'Portugal Warehouse Inventory' : 'Portugal Fulfillment Orders'}
              </h1>
              <span className="text-slate-300">/</span>
              <span className="text-xs text-slate-500 font-medium truncate flex items-center gap-1.5">
                <span>🇵🇹 Lisbon Time:</span>
                <span className="font-semibold text-slate-800">{lisbonTime}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                title="Refresh from Supabase"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Supabase Live</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="w-full p-6 space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Portugal products by name or SKU..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setStockFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    stockFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter('portugal_only')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    stockFilter === 'portugal_only'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇵🇹 Portugal Unique ({products.filter(p => p.location_type === 'PORTUGAL_ONLY').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter('common')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    stockFilter === 'common'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔄 Common Stock ({products.filter(p => p.location_type === 'COMMON').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter('low_stock')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    stockFilter === 'low_stock'
                      ? 'bg-red-50 text-red-700 shadow-xs font-bold border border-red-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚠️ Low Stock ({products.filter(p => p.stock_portugal <= 5).length})
                </button>
              </div>
            </div>

            {/* Products Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Variants</th>
                      <th className="py-3 px-4">Portugal Stock</th>
                      <th className="py-3 px-4 text-center">Quick Adjust</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No products found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const pName = typeof p.name === 'string' ? p.name : p.name?.fr || p.name?.en || 'Product';
                        const firstImg = p.images[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].src) : '/images/placeholder.webp';
                        const isCrit = p.stock_portugal < 5;
                        const isMed = p.stock_portugal >= 5 && p.stock_portugal <= 10;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            {/* Product Info */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                                  <Image
                                    src={firstImg}
                                    alt={pName}
                                    fill
                                    sizes="40px"
                                    className="object-contain p-1"
                                  />
                                </div>
                                <div className="min-w-0 max-w-xs">
                                  <p className="font-bold text-slate-900 truncate" title={pName}>
                                    {pName}
                                  </p>
                                  <p className="text-[11px] text-slate-400 font-mono truncate">
                                    /{p.slug}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* SKU */}
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-600 truncate max-w-[120px]">
                              {p.sku || '—'}
                            </td>

                            {/* Type */}
                            <td className="py-3 px-4">
                              {p.location_type === 'PORTUGAL_ONLY' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  🇵🇹 Portugal Only
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  🔄 Common
                                </span>
                              )}
                            </td>

                            {/* Variants count */}
                            <td className="py-3 px-4 text-slate-600 font-medium">
                              {p.variants && p.variants.length > 0 ? (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                  {p.variants.length} flavors
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            {/* Current Stock */}
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isCrit
                                  ? 'bg-red-50 text-red-700 border-red-300'
                                  : isMed
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  isCrit ? 'bg-red-500 animate-pulse' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} />
                                <span>{p.stock_portugal} units</span>
                              </span>
                            </td>

                            {/* Quick Inline Stepper */}
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStock(p.id, p.stock_portugal - 5)}
                                  className="px-1.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                                  title="-5 units"
                                >
                                  -5
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStock(p.id, p.stock_portugal - 1)}
                                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                                  title="-1 unit"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={p.stock_portugal}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    handleUpdateStock(p.id, isNaN(val) ? 0 : val);
                                  }}
                                  className="w-14 px-1 py-0.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStock(p.id, p.stock_portugal + 1)}
                                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                                  title="+1 unit"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStock(p.id, p.stock_portugal + 5)}
                                  className="px-1.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                                  title="+5 units"
                                >
                                  +5
                                </button>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => openStockModal(p)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition-colors"
                              >
                                {p.variants && p.variants.length > 0 ? 'Edit Variants' : 'Adjust'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="w-full p-6 space-y-6">
            {/* Top Filter Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orderStatusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orderStatusFilter === 'pending'
                      ? 'bg-purple-50 text-purple-700 shadow-xs font-bold border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⏳ Pending ({orders.filter(o => o.status === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('in_processing')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orderStatusFilter === 'in_processing'
                      ? 'bg-amber-50 text-amber-800 shadow-xs font-bold border border-amber-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🟡 In Processing ({orders.filter(o => o.status === 'in_processing').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('packed')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orderStatusFilter === 'packed'
                      ? 'bg-blue-50 text-blue-800 shadow-xs font-bold border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📦 Packed ({orders.filter(o => o.status === 'packed').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('shipped')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orderStatusFilter === 'shipped'
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs font-bold border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🚚 Shipped ({orders.filter(o => o.status === 'shipped').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('delivered')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orderStatusFilter === 'delivered'
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs font-bold border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✅ Delivered ({orders.filter(o => o.status === 'delivered').length})
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Locked to Omar Team · Marco cannot overwrite status
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                <p className="font-semibold text-slate-700">No orders to display in this queue.</p>
                <p className="text-xs mt-1">Orders requiring Portugal warehouse fulfillment will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm text-slate-900 font-mono">
                            {order.order_number}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(order.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            🔒 Fulfilled by Omar Team
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            order.status === 'shipped'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.status === 'packed'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : order.status === 'in_processing'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {order.status === 'shipped' && '🚚 Shipped via Carrier'}
                            {order.status === 'delivered' && '✅ Delivered'}
                            {order.status === 'packed' && '📦 Packed & Labelled'}
                            {order.status === 'in_processing' && '🟡 In Processing'}
                            {order.status === 'pending' && '⏳ Pending Fulfillment'}
                            {order.status === 'cancelled' && '❌ Cancelled'}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Destination */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Customer
                          </span>
                          <p className="font-bold text-slate-900">{order.customer_name}</p>
                          {order.customer_phone && (
                            <p className="text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{order.customer_phone}</span>
                            </p>
                          )}
                          {order.customer_email && (
                            <p className="text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-blue-600" />
                              <span>{order.customer_email}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Destination Address
                          </span>
                          <p className="font-semibold text-slate-800">
                            {order.shipping_address.address}
                          </p>
                          <p className="text-slate-500">
                            {order.shipping_address.postalCode} {order.shipping_address.city},{' '}
                            <span className="font-bold text-slate-700">{order.shipping_address.country}</span>
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Carrier &amp; Tracking
                          </span>
                          {order.shipping_address.trackingNumber ? (
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-900 flex items-center gap-1">
                                <span>{order.shipping_address.carrier || 'CTT Express'}</span>
                              </p>
                              <p className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                                {order.shipping_address.trackingNumber}
                              </p>
                            </div>
                          ) : (
                            <p className="text-slate-400 italic">No tracking number assigned yet</p>
                          )}
                        </div>
                      </div>

                      {/* Ordered Items */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Items to Pick &amp; Pack ({order.items.length})
                        </span>
                        <div className="divide-y divide-slate-200/60">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-700 shrink-0">
                                  {it.quantity}x
                                </span>
                                <span className="font-semibold text-slate-900 truncate">
                                  {it.name}
                                </span>
                                {it.flavor && (
                                  <span className="text-[11px] text-slate-500">({it.flavor})</span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-2">
                                {it.sku || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs font-bold text-slate-700">
                          Total Value: <span className="text-slate-900 font-black">{order.currency} {order.total_amount.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.order_number, 'in_processing')}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-2xs"
                            >
                              Start Processing
                            </button>
                          )}

                          {order.status === 'in_processing' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.order_number, 'packed')}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-2xs"
                            >
                              Mark as Packed
                            </button>
                          )}

                          {(order.status === 'packed' || order.status === 'in_processing') && (
                            <button
                              type="button"
                              onClick={() => {
                                setDispatchOrder(order);
                                setDispatchCarrier(order.shipping_address.carrier || 'CTT Express');
                                setDispatchTracking(order.shipping_address.trackingNumber || '');
                                setDispatchNotes(order.shipping_address.warehouse_notes || '');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch &amp; Add Tracking</span>
                            </button>
                          )}

                          {order.status === 'shipped' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.order_number, 'delivered')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-2xs"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: VARIANT STOCK ADJUSTMENT */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="pr-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  <span>🇵🇹 Portugal Warehouse Stock</span>
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1 truncate">
                  {typeof editingProduct.name === 'string' ? editingProduct.name : editingProduct.name?.fr || editingProduct.name?.en}
                </h3>
                <p className="text-xs text-slate-400 font-mono">SKU: {editingProduct.sku}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Note: Read-only info */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                ⚠️ As warehouse team, you can adjust stock quantities. Product titles, descriptions and prices are managed by central administration.
              </div>

              {editingProduct.variants && editingProduct.variants.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-600">Variants Stock Levels:</div>
                  {editingProduct.variants.map((v) => {
                    const curVal = modalStockValues[v.id] ?? v.stock_portugal;
                    return (
                      <div key={v.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {v.attribute_value || v.sku}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{v.sku}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setModalStockValues(prev => ({ ...prev, [v.id]: Math.max(0, curVal - 1) }))}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={curVal}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setModalStockValues(prev => ({ ...prev, [v.id]: isNaN(val) ? 0 : Math.max(0, val) }));
                            }}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setModalStockValues(prev => ({ ...prev, [v.id]: curVal + 1 }))}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                  <span className="text-xs font-bold text-slate-700">Portugal Stock Units:</span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalStockValues(prev => ({ ...prev, def: Math.max(0, (prev.def ?? 0) - 10) }))}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs"
                    >
                      -10
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={modalStockValues['def'] ?? editingProduct.stock_portugal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setModalStockValues(prev => ({ ...prev, def: isNaN(val) ? 0 : Math.max(0, val) }));
                      }}
                      className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-black text-2xl text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setModalStockValues(prev => ({ ...prev, def: (prev.def ?? 0) + 10 }))}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs"
                    >
                      +10
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalStock}
                disabled={savingStock}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                {savingStock ? 'Saving...' : 'Save Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DISPATCH & TRACKING */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Portugal Carrier Dispatch
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Order {dispatchOrder.order_number}
                </h3>
                <p className="text-xs text-slate-400">
                  Customer: {dispatchOrder.customer_name} ({dispatchOrder.shipping_address.city})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Carrier
                </label>
                <select
                  value={dispatchCarrier}
                  onChange={(e) => setDispatchCarrier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="CTT Express">CTT Express (Portugal)</option>
                  <option value="DPD Portugal">DPD Portugal</option>
                  <option value="DHL Express">DHL Express Portugal</option>
                  <option value="MRW">MRW Iberia</option>
                  <option value="Correos Express">Correos Express</option>
                  <option value="UPS Portugal">UPS Portugal</option>
                  <option value="Other Carrier">Other Carrier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tracking Number / Parcel Code
                </label>
                <input
                  type="text"
                  value={dispatchTracking}
                  onChange={(e) => setDispatchTracking(e.target.value)}
                  placeholder="e.g. CTT-PT-889201948"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Warehouse Packing Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="e.g. Packed in box #2, dispatched via afternoon CTT pickup"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={savingDispatch}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                {savingDispatch ? 'Dispatching...' : 'Confirm Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
