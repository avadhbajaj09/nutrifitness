'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Truck,
  Calendar,
  Zap,
  BarChart3,
  Settings,
  Search,
  Check,
  X,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { FlagIcon } from '@/components/delivery/FlagIcon';
import { DeliveryRule, CountryGroup, HolidayEntry, DeliverySettings, EstimateDeliveryResult } from '@/lib/delivery/types';
import { estimateDelivery } from '@/lib/delivery/estimate';

const ADMIN_PASSWORD = 'Geneva@03564';

export default function AdminShippingClient() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'rules' | 'holidays' | 'simulator' | 'reporting' | 'settings'>('rules');

  // Data state
  const [rules, setRules] = useState<DeliveryRule[]>([]);
  const [countryGroups, setCountryGroups] = useState<CountryGroup[]>([]);
  const [holidays, setHolidays] = useState<HolidayEntry[]>([]);
  const [settings, setSettings] = useState<DeliverySettings>({ extra_delay_days: 0, banner_text: '' });
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rules Tab Filter & Selection state
  const [originFilter, setOriginFilter] = useState<'all' | 'GENEVA' | 'PORTUGAL'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());

  // Edit Rule Modal state
  const [editingRule, setEditingRule] = useState<DeliveryRule | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Bulk Edit Modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkHandlingDays, setBulkHandlingDays] = useState<number>(0);
  const [bulkTransitMin, setBulkTransitMin] = useState<number>(1);
  const [bulkTransitMax, setBulkTransitMax] = useState<number>(3);
  const [bulkStatus, setBulkStatus] = useState<string>('keep'); // 'keep' | 'active' | 'inactive'

  // Holiday Manager Form state
  const [holidayCalendar, setHolidayCalendar] = useState<string>('GENEVA');
  const [holidayDate, setHolidayDate] = useState<string>('');
  const [holidayName, setHolidayName] = useState<string>('');
  const [holidayFilterCalendar, setHolidayFilterCalendar] = useState<string>('all');

  // Simulator state
  const [simOrigin, setSimOrigin] = useState<'GENEVA' | 'PORTUGAL'>('GENEVA');
  const [simDestination, setSimDestination] = useState<string>('CH');
  const [simDate, setSimDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [simTime, setSimTime] = useState<string>('11:00');
  const [simMethod, setSimMethod] = useState<string>('');
  const [simResult, setSimResult] = useState<EstimateDeliveryResult | null>(null);

  // Settings tab form state
  const [extraDelayInput, setExtraDelayInput] = useState<number>(0);
  const [bannerTextInput, setBannerTextInput] = useState<string>('');

  const csvInputRef = useRef<HTMLInputElement>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth Initialization
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('nf_admin_auth') || localStorage.getItem('nf_admin_auth');
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    } catch {}
    setAuthChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
      try {
        sessionStorage.setItem('nf_admin_auth', 'true');
        localStorage.setItem('nf_admin_auth', 'true');
      } catch {}
    } else {
      setAuthError('Mot de passe incorrect.');
    }
  };

  // Fetch Delivery Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shipping');
      const data = await res.json();
      if (data.success) {
        setRules(data.rules || []);
        setCountryGroups(data.countryGroups || []);
        setHolidays(data.holidays || []);
        setSettings(data.settings || { extra_delay_days: 0, banner_text: '' });
        setExtraDelayInput(data.settings?.extra_delay_days || 0);
        setBannerTextInput(data.settings?.banner_text || '');
        setShipments(data.shipments || []);
      }
    } catch (e) {
      console.error('Failed to load shipping data:', e);
      showToast('Erreur lors du chargement des règles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Run Simulator
  const runSimulator = () => {
    try {
      const parsedNow = new Date(`${simDate}T${simTime}:00`);
      const result = estimateDelivery({
        origin: simOrigin,
        destinationCountry: simDestination.toUpperCase().trim(),
        shippingMethod: simMethod.trim() || null,
        now: parsedNow,
        rules,
        holidays,
        settings,
        countryGroups
      });
      setSimResult(result);
    } catch (err: any) {
      showToast(`Erreur simulation: ${err.message}`);
    }
  };

  // Run initial simulator test
  useEffect(() => {
    if (rules.length > 0) {
      runSimulator();
    }
  }, [rules, holidays, settings, simOrigin, simDestination, simDate, simTime, simMethod]);

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      if (originFilter !== 'all' && r.origin !== originFilter) return false;
      if (statusFilter === 'active' && !r.is_active) return false;
      if (statusFilter === 'inactive' && r.is_active) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const code = (r.country_code || '').toLowerCase();
        const group = (r.country_group || '').toLowerCase();
        if (!code.includes(q) && !group.includes(q)) return false;
      }
      return true;
    });
  }, [rules, originFilter, statusFilter, searchQuery]);

  // Toggle Rule Status
  const handleToggleRule = async (rule: DeliveryRule) => {
    const updatedStatus = !rule.is_active;
    const ruleKey = rule.id || `${rule.origin}:${rule.country_code || rule.country_group}`;

    setRules(prev => prev.map(r => {
      const match = r.id ? r.id === rule.id : (r.origin === rule.origin && r.country_code === rule.country_code);
      return match ? { ...r, is_active: updatedStatus } : r;
    }));

    try {
      if (rule.id) {
        await fetch('/api/admin/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'toggle_rule', id: rule.id, is_active: updatedStatus })
        });
      } else {
        await fetch('/api/admin/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_rule', rule: { ...rule, is_active: updatedStatus } })
        });
      }
      showToast(`Règle ${rule.country_code || rule.country_group} : ${updatedStatus ? 'Activée' : 'Désactivée'}`);
    } catch {
      fetchData();
    }
  };

  // Save Single Rule Edit
  const handleSaveRuleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_rule', rule: editingRule })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Règle enregistrée avec succès');
        setIsEditModalOpen(false);
        fetchData();
      } else {
        showToast(`Erreur: ${data.error}`);
      }
    } catch {
      showToast('Erreur lors de la sauvegarde');
    }
  };

  // Bulk Update Rules
  const handleBulkUpdate = async () => {
    const ids = Array.from(selectedRuleIds);
    if (ids.length === 0) return;

    const updates: any = {
      handling_days: bulkHandlingDays,
      transit_min_days: bulkTransitMin,
      transit_max_days: bulkTransitMax
    };
    if (bulkStatus === 'active') updates.is_active = true;
    if (bulkStatus === 'inactive') updates.is_active = false;

    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk_update_rules', ids, updates })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${ids.length} règles mises à jour`);
        setIsBulkModalOpen(false);
        setSelectedRuleIds(new Set());
        fetchData();
      }
    } catch {
      showToast('Erreur mise à jour groupée');
    }
  };

  // Add Holiday
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayName.trim()) {
      showToast('Date et nom du jour férié requis');
      return;
    }

    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_holiday',
          calendar: holidayCalendar,
          date: holidayDate,
          name: holidayName.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Jour férié ajouté: ${holidayName}`);
        setHolidayName('');
        setHolidayDate('');
        fetchData();
      }
    } catch {
      showToast('Erreur ajout jour férié');
    }
  };

  // Delete Holiday
  const handleDeleteHoliday = async (h: HolidayEntry) => {
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_holiday', calendar: h.calendar, date: h.date })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Jour férié supprimé: ${h.name}`);
        setHolidays(prev => prev.filter(item => !(item.calendar === h.calendar && item.date === h.date)));
      }
    } catch {
      showToast('Erreur suppression');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          extra_delay_days: Number(extraDelayInput),
          banner_text: bannerTextInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Paramètres généraux enregistrés');
        fetchData();
      }
    } catch {
      showToast('Erreur sauvegarde paramètres');
    }
  };

  // Export Rules to CSV
  const handleExportCSV = () => {
    const headers = [
      'origin',
      'country_code',
      'country_group',
      'shipping_method',
      'is_allowed',
      'handling_days',
      'cutoff_time',
      'transit_min_days',
      'transit_max_days',
      'requires_customs',
      'customs_buffer_days',
      'delivers_saturday',
      'is_active'
    ];

    const rows = rules.map(r => [
      r.origin,
      r.country_code || '',
      r.country_group || '',
      r.shipping_method || '',
      r.is_allowed ? 'true' : 'false',
      r.handling_days,
      r.cutoff_time,
      r.transit_min_days,
      r.transit_max_days,
      r.requires_customs ? 'true' : 'false',
      r.customs_buffer_days,
      r.delivers_saturday ? 'true' : 'false',
      r.is_active ? 'true' : 'false'
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `delivery_rules_nutrifitness_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV téléchargé');
  };

  // Import Rules from CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length <= 1) return;

        const headers = lines[0].split(',').map(h => h.trim());
        const parsedRules = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, i) => {
            const rawVal = vals[i];
            if (rawVal === 'true') obj[h] = true;
            else if (rawVal === 'false') obj[h] = false;
            else obj[h] = rawVal;
          });
          return obj;
        });

        const res = await fetch('/api/admin/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'import_rules_csv', rules: parsedRules })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`${data.importedCount} règles importées avec succès`);
          fetchData();
        }
      } catch (err: any) {
        showToast(`Erreur import: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  // Select all visible rules toggle
  const toggleSelectAll = () => {
    if (selectedRuleIds.size === filteredRules.length && filteredRules.length > 0) {
      setSelectedRuleIds(new Set());
    } else {
      const newSet = new Set<string>();
      filteredRules.forEach(r => {
        if (r.id) newSet.add(r.id);
      });
      setSelectedRuleIds(newSet);
    }
  };

  const toggleSelectRule = (id?: string) => {
    if (!id) return;
    setSelectedRuleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calculate reporting stats
  const reportingStats = useMemo(() => {
    const delivered = shipments.filter(s => s.status === 'delivered' && s.promised_date && s.delivered_at);
    if (!delivered.length) {
      return {
        total: shipments.length,
        deliveredCount: 0,
        onTimeRate: 100,
        genevaOnTimeRate: 100,
        portugalOnTimeRate: 100
      };
    }

    let onTimeCount = 0;
    let geTotal = 0;
    let geOnTime = 0;
    let ptTotal = 0;
    let ptOnTime = 0;

    for (const s of delivered) {
      const promised = new Date(s.promised_date).getTime();
      const actual = new Date(s.delivered_at).getTime();
      const isOnTime = actual <= promised + (24 * 3600 * 1000); // within promised day

      if (isOnTime) onTimeCount++;

      if (s.origin_id === 'GENEVA' || s.fulfilment_location === 'GENEVA') {
        geTotal++;
        if (isOnTime) geOnTime++;
      } else {
        ptTotal++;
        if (isOnTime) ptOnTime++;
      }
    }

    return {
      total: shipments.length,
      deliveredCount: delivered.length,
      onTimeRate: Math.round((onTimeCount / delivered.length) * 100),
      genevaOnTimeRate: geTotal > 0 ? Math.round((geOnTime / geTotal) * 100) : 100,
      portugalOnTimeRate: ptTotal > 0 ? Math.round((ptOnTime / ptTotal) * 100) : 100
    };
  }, [shipments]);

  // Upcoming holidays (next 30 days)
  const isUpcomingHoliday = (dateStr: string) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = (target.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 30;
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Chargement...
      </div>
    );
  }

  // Password Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-[#F80404] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-heading mb-1">
            Moteur de Livraison & Délais
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
              className="w-full bg-[#F80404] hover:bg-[#e00303] text-black font-black uppercase text-xs py-3.5 rounded-xl transition-all shadow-lg font-heading"
            >
              Déverrouiller
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              ← Stocks &amp; Emplacements
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase font-heading flex items-center gap-2">
                <span>🚚 Moteur de Livraison Dynamique</span>
              </h1>
              <p className="text-xs text-slate-500">
                Calcul précis des délais · Suisse (Genève) &amp; Europe (Portugal) · Jours ouvrés &amp; Fériés
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
              title="Rafraîchir les données"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F80404]' : ''}`} />
            </button>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              {rules.length} Règles Actives
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'rules'
                ? 'border-[#F80404] text-[#F80404]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Règles de Livraison ({filteredRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('holidays')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'holidays'
                ? 'border-[#F80404] text-[#F80404]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendrier Fériés ({holidays.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'simulator'
                ? 'border-[#F80404] text-[#F80404]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulateur en Temps Réel</span>
          </button>

          <button
            onClick={() => setActiveTab('reporting')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'reporting'
                ? 'border-[#F80404] text-[#F80404]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Promesse vs Réel ({reportingStats.onTimeRate}% ponctualité)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'settings'
                ? 'border-[#F80404] text-[#F80404]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Paramètres &amp; Tampon</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ----------------- TAB 1: RULES TABLE ----------------- */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            {/* Filter & Action Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrer pays (ex: CH, FR, PT)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#F80404]"
                  />
                </div>

                {/* Origin Filter */}
                <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setOriginFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${originFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setOriginFilter('GENEVA')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${originFilter === 'GENEVA' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🇨🇭 Genève
                  </button>
                  <button
                    onClick={() => setOriginFilter('PORTUGAL')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${originFilter === 'PORTUGAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🇵🇹 Portugal
                  </button>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actives uniquement</option>
                  <option value="inactive">Désactivées</option>
                </select>
              </div>

              {/* CSV & Bulk Action buttons */}
              <div className="flex items-center gap-2">
                {selectedRuleIds.size > 0 && (
                  <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Modifier sélection ({selectedRuleIds.size})</span>
                  </button>
                )}

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200"
                  title="Exporter les règles au format CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter CSV</span>
                </button>

                <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importer CSV</span>
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleImportCSV}
                  />
                </label>
              </div>
            </div>

            {/* Rules Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedRuleIds.size === filteredRules.length && filteredRules.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300 text-[#F80404] focus:ring-[#F80404]"
                        />
                      </th>
                      <th className="py-3 px-4">Origine</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Préparation</th>
                      <th className="py-3 px-4">Heure Limite</th>
                      <th className="py-3 px-4">Acheminement</th>
                      <th className="py-3 px-4">Douane</th>
                      <th className="py-3 px-4">Samedi</th>
                      <th className="py-3 px-4">Actif</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRules.map((rule, idx) => {
                      const isSelected = rule.id ? selectedRuleIds.has(rule.id) : false;
                      const destCode = rule.country_code || rule.country_group || 'EU';
                      return (
                        <tr
                          key={rule.id || idx}
                          className={`hover:bg-slate-50/80 transition-colors ${!rule.is_active ? 'opacity-50 bg-slate-50/40' : ''}`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRule(rule.id)}
                              className="rounded border-slate-300 text-[#F80404] focus:ring-[#F80404]"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-[11px] ${rule.origin === 'GENEVA' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                              <span>{rule.origin === 'GENEVA' ? '🇨🇭' : '🇵🇹'}</span>
                              <span>{rule.origin === 'GENEVA' ? 'Genève' : 'Portugal'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              <FlagIcon countryCode={destCode} className="w-4 h-4 shrink-0 shadow-2xs" />
                              <span className="font-mono text-xs">{destCode}</span>
                              {rule.shipping_method && (
                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-normal">
                                  {rule.shipping_method}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {rule.handling_days} j
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {rule.cutoff_time}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {rule.transit_min_days}–{rule.transit_max_days} jours ouvrés
                          </td>
                          <td className="py-3 px-4">
                            {rule.requires_customs ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                Requise ({rule.customs_buffer_days}j)
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {rule.delivers_saturday ? (
                              <span className="text-emerald-600 font-bold">✓</span>
                            ) : (
                              <span className="text-slate-300">✗</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleRule(rule)}
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${rule.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              title={rule.is_active ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${rule.is_active ? 'translate-x-4' : 'translate-x-0'}`}
                              />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setEditingRule(rule);
                                setIsEditModalOpen(true);
                              }}
                              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              Modifier
                            </button>
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

        {/* ----------------- TAB 2: HOLIDAY CALENDAR ----------------- */}
        {activeTab === 'holidays' && (
          <div className="space-y-6">
            {/* Add Holiday Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#F80404]" />
                <span>Ajouter un Jour Férié au Calendrier</span>
              </h2>

              <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Calendrier *</label>
                  <select
                    value={holidayCalendar}
                    onChange={e => setHolidayCalendar(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="GENEVA">🇨🇭 Genève / Suisse</option>
                    <option value="PORTUGAL">🇵🇹 Portugal</option>
                    <option value="FR">🇫🇷 France</option>
                    <option value="DE">🇩🇪 Allemagne</option>
                    <option value="IT">🇮🇹 Italie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date (AAAA-MM-JJ) *</label>
                  <input
                    type="date"
                    required
                    value={holidayDate}
                    onChange={e => setHolidayDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Jour Férié *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jeûne genevois"
                    value={holidayName}
                    onChange={e => setHolidayName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    + Enregistrer le Férié
                  </button>
                </div>
              </form>
            </div>

            {/* Holidays List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
                  Jours Fériés Enregistrés (2026–2027)
                </h3>

                <select
                  value={holidayFilterCalendar}
                  onChange={e => setHolidayFilterCalendar(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">Tous les calendriers</option>
                  <option value="GENEVA">Genève (Suisse)</option>
                  <option value="PORTUGAL">Portugal</option>
                  <option value="FR">France</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {holidays
                  .filter(h => holidayFilterCalendar === 'all' || h.calendar === holidayFilterCalendar)
                  .map((h, i) => {
                    const isUpcoming = isUpcomingHoliday(h.date);
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          isUpcoming
                            ? 'bg-amber-50/60 border-amber-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{h.name}</span>
                            {isUpcoming && (
                              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                Bientôt (30j)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {h.date} · {h.calendar === 'GENEVA' ? '🇨🇭 Genève' : h.calendar === 'PORTUGAL' ? '🇵🇹 Portugal' : h.calendar}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteHoliday(h)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Supprimer ce jour férié"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 3: SIMULATOR (DELIVERY PREVIEW TOOL) ----------------- */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Form (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F80404]" />
                <span>Paramètres de Simulation</span>
              </h2>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Centre d&apos;expédition (Origine)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimOrigin('GENEVA')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${simOrigin === 'GENEVA' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      🇨🇭 Genève (Marco)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimOrigin('PORTUGAL')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${simOrigin === 'PORTUGAL' ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      🇵🇹 Portugal (Omar)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pays de Destination</label>
                  <select
                    value={simDestination}
                    onChange={e => setSimDestination(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="CH">🇨🇭 Suisse (CH)</option>
                    <option value="LI">🇱🇮 Liechtenstein (LI)</option>
                    <option value="FR">🇫🇷 France (FR)</option>
                    <option value="DE">🇩🇪 Allemagne (DE)</option>
                    <option value="IT">🇮🇹 Italie (IT)</option>
                    <option value="ES">🇪🇸 Espagne (ES)</option>
                    <option value="PT">🇵🇹 Portugal (PT)</option>
                    <option value="BE">🇧🇪 Belgique (BE)</option>
                    <option value="LU">🇱🇺 Luxembourg (LU)</option>
                    <option value="NL">🇳🇱 Pays-Bas (NL)</option>
                    <option value="AT">🇦🇹 Autriche (AT)</option>
                    <option value="GB">🇬🇧 Royaume-Uni (GB)</option>
                    <option value="NO">🇳🇴 Norvège (NO)</option>
                    <option value="IS">🇮🇸 Islande (IS)</option>
                    <option value="IN">🇮🇳 Inde (Non supporté)</option>
                    <option value="US">🇺🇸 États-Unis (Non supporté)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date commande</label>
                    <input
                      type="date"
                      value={simDate}
                      onChange={e => setSimDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Heure commande</label>
                    <input
                      type="time"
                      value={simTime}
                      onChange={e => setSimTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transporteur / Méthode (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Laissez vide pour la règle par défaut"
                    value={simMethod}
                    onChange={e => setSimMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={runSimulator}
                  className="w-full bg-[#F80404] hover:bg-[#e00303] text-black font-black uppercase tracking-wider text-xs py-3 rounded-xl transition-all shadow-md font-heading"
                >
                  Recalculer les Délais
                </button>
              </div>
            </div>

            {/* Results Panel (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading flex items-center justify-between">
                <span>Résultat du Calcul Étape par Étape</span>
                {simResult?.isAllowed ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Livrable</span>
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Bloqué</span>
                  </span>
                )}
              </h2>

              {simResult ? (
                <div className="space-y-4">
                  {/* Delivery Promise Hero Card */}
                  <div className={`p-4 rounded-2xl border ${simResult.isAllowed ? 'bg-emerald-50/60 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <FlagIcon countryCode={simDestination} className="w-5 h-5 shadow-xs" />
                      <span className="text-xs font-bold text-slate-600">
                        {simOrigin === 'GENEVA' ? 'Genève' : 'Portugal'} → {simDestination}
                      </span>
                    </div>

                    {simResult.isAllowed ? (
                      <div>
                        <p className="text-2xl font-black text-slate-900 font-heading">
                          Promesse : {simResult.displayDate}
                        </p>
                        <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                          Fenêtre client : {simResult.earliestDate} → {simResult.latestDate}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-red-700">
                        Non livrable ({simResult.blockReason || 'Aucune règle active'})
                      </p>
                    )}
                  </div>

                  {/* Step by step breakdown */}
                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 font-medium">1. Règle appliquée :</span>
                      <span className="font-bold font-mono text-slate-800">
                        {simResult.ruleMatched?.type || 'Défaut'} (ID: {simResult.ruleMatched?.ruleId || 'standard'})
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 font-medium">2. Heure limite (Cutoff) :</span>
                      <span className="font-semibold text-slate-800">
                        {simResult.cutoffPassed ? 'Dépassée ➜ Envoi reporté au jour ouvré suivant' : 'Respectée ➜ Traitement le jour même'}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 font-medium">3. Date d&apos;expédition entrepôt :</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {simResult.dispatchDate}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 font-medium">4. Préparation en entrepôt :</span>
                      <span className="font-medium text-slate-800">
                        +{simResult.handlingDays} jour(s) de handling
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 font-medium">5. Acheminement transporteur :</span>
                      <span className="font-bold text-slate-800">
                        {simResult.transitMinDays} à {simResult.transitMaxDays} jours ouvrés (Lun–Ven)
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 font-medium">6. Dédouanement :</span>
                      <span className="font-semibold text-slate-800">
                        {simResult.requiresCustoms ? 'Oui (CH/LI/UK/NO/IS depuis UE)' : 'Non (Intra-territoire)'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Aucun résultat disponible.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB 4: PROMISED VS DELIVERED REPORTING ----------------- */}
        {activeTab === 'reporting' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Ponctualité Globale</span>
                <p className="text-3xl font-black text-emerald-600 font-heading mt-1">
                  {reportingStats.onTimeRate}%
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Sur les livraisons complétées</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Origine 🇨🇭 Genève</span>
                <p className="text-3xl font-black text-slate-900 font-heading mt-1">
                  {reportingStats.genevaOnTimeRate}%
                </p>
                <p className="text-[11px] text-slate-500 mt-1">PostPac Priority La Poste</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Origine 🇵🇹 Portugal</span>
                <p className="text-3xl font-black text-slate-900 font-heading mt-1">
                  {reportingStats.portugalOnTimeRate}%
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Direct Fabricant BigMan</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Expéditions</span>
                <p className="text-3xl font-black text-slate-900 font-heading mt-1">
                  {reportingStats.total}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Colis enregistrés</p>
              </div>
            </div>

            {/* Shipments Audit Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
                  Derniers Colis Expédiés &amp; Comparatif Promesse vs Réel
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Commande</th>
                      <th className="py-3 px-4">Origine</th>
                      <th className="py-3 px-4">Transporteur</th>
                      <th className="py-3 px-4">Date Promise</th>
                      <th className="py-3 px-4">Date Livrée</th>
                      <th className="py-3 px-4">Statut &amp; Écart</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shipments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Aucune expédition enregistrée pour l&apos;instant.
                        </td>
                      </tr>
                    ) : (
                      shipments.map((s, idx) => {
                        const hasPromise = Boolean(s.promised_date);
                        const hasDelivered = Boolean(s.delivered_at);
                        let badgeColor = 'bg-slate-100 text-slate-700';
                        let badgeText = s.status;

                        if (hasPromise && hasDelivered) {
                          const pTime = new Date(s.promised_date).getTime();
                          const dTime = new Date(s.delivered_at).getTime();
                          const diffDays = Math.round((dTime - pTime) / (1000 * 3600 * 24));
                          if (diffDays <= 0) {
                            badgeColor = 'bg-emerald-100 text-emerald-800';
                            badgeText = diffDays < 0 ? `En avance (${Math.abs(diffDays)}j)` : 'À l\'heure ✓';
                          } else {
                            badgeColor = 'bg-red-100 text-red-800';
                            badgeText = `En retard (+${diffDays}j)`;
                          }
                        }

                        return (
                          <tr key={s.id || idx} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              {s.order_id || `ORD-${idx + 1}`}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800">
                                {s.origin_id === 'GENEVA' ? '🇨🇭 Genève' : '🇵🇹 Portugal'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {s.carrier || 'Sendcloud Express'}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                              {s.promised_date || '—'}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">
                              {s.delivered_at ? new Date(s.delivered_at).toISOString().slice(0, 10) : 'En cours'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                                {badgeText}
                              </span>
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

        {/* ----------------- TAB 5: SETTINGS & BUFFER ----------------- */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#F80404]" />
                <span>Paramètres Généraux de Livraison</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ajustez le délai tampon temporaire en cas de pic d&apos;activité, grèves postales ou météo.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jours de délai supplémentaires (Tampon de retard)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="14"
                    value={extraDelayInput}
                    onChange={e => setExtraDelayInput(parseInt(e.target.value, 10) || 0)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-slate-500">
                    {extraDelayInput === 0
                      ? 'Aucun délai tampon actif (délais nominaux calculés).'
                      : `+${extraDelayInput} jour(s) ajoutés automatiquement à chaque promesse.`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bannière d&apos;information boutique (Optionnel)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: En raison des fêtes de fin d'année, prévoyez 24h supplémentaires pour la préparation."
                  value={bannerTextInput}
                  onChange={e => setBannerTextInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-xs"
              >
                Enregistrer les Paramètres
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Edit Rule Modal */}
      {isEditModalOpen && editingRule && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-900 font-heading flex items-center gap-2">
                <span>Modifier Règle :</span>
                <span className="font-mono text-[#F80404]">
                  {editingRule.origin} → {editingRule.country_code || editingRule.country_group}
                </span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRuleEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Préparation (jours)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editingRule.handling_days}
                    onChange={e => setEditingRule({ ...editingRule, handling_days: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Heure limite cutoff</label>
                  <input
                    type="time"
                    value={editingRule.cutoff_time}
                    onChange={e => setEditingRule({ ...editingRule, cutoff_time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transit min (jours)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editingRule.transit_min_days}
                    onChange={e => setEditingRule({ ...editingRule, transit_min_days: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transit max (jours)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editingRule.transit_max_days}
                    onChange={e => setEditingRule({ ...editingRule, transit_max_days: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRule.requires_customs}
                    onChange={e => setEditingRule({ ...editingRule, requires_customs: e.target.checked })}
                    className="rounded text-[#F80404]"
                  />
                  <span className="font-bold text-slate-800">Douane requise</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRule.delivers_saturday}
                    onChange={e => setEditingRule({ ...editingRule, delivers_saturday: e.target.checked })}
                    className="rounded text-[#F80404]"
                  />
                  <span className="font-bold text-slate-800">Livraison samedi</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-900 font-heading">
              Modification groupée ({selectedRuleIds.size} règles)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jours de préparation (Handling)</label>
                <input
                  type="number"
                  min="0"
                  value={bulkHandlingDays}
                  onChange={e => setBulkHandlingDays(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transit min (jours)</label>
                  <input
                    type="number"
                    min="1"
                    value={bulkTransitMin}
                    onChange={e => setBulkTransitMin(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transit max (jours)</label>
                  <input
                    type="number"
                    min="1"
                    value={bulkTransitMax}
                    onChange={e => setBulkTransitMax(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Statut actif</label>
                <select
                  value={bulkStatus}
                  onChange={e => setBulkStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="keep">Conserver le statut actuel</option>
                  <option value="active">Activer toutes les règles</option>
                  <option value="inactive">Désactiver toutes les règles</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleBulkUpdate}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                >
                  Appliquer la modification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
