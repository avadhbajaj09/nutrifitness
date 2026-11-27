'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Clock, Calendar, Percent, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { type BlackFridayConfig, calculateBlackFridayDiscount, DEFAULT_BLACK_FRIDAY_CONFIG } from '@/lib/black-friday';

export default function BlackFridayManager() {
  const [config, setConfig] = useState<BlackFridayConfig>(DEFAULT_BLACK_FRIDAY_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Simulation state
  const [simSubtotal, setSimSubtotal] = useState<number>(150);

  // Fetch current config on mount
  const loadConfig = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/black-friday', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Impossible de charger la configuration: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Save changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/black-friday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setFeedback({ type: 'success', message: 'Paramètres Black Friday enregistrés avec succès !' });
      } else {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  // Tier manipulation
  const handleTierChange = (index: number, field: 'threshold' | 'discountPercent', value: number) => {
    setConfig(prev => {
      const newTiers = [...prev.tiers];
      newTiers[index] = {
        ...newTiers[index],
        [field]: Math.max(0, value),
      };
      return { ...prev, tiers: newTiers };
    });
  };

  const handleAddTier = () => {
    setConfig(prev => {
      const last = prev.tiers[prev.tiers.length - 1];
      const newThreshold = last ? last.threshold + 50 : 50;
      const newPercent = last ? Math.min(100, last.discountPercent + 5) : 10;
      return {
        ...prev,
        tiers: [...prev.tiers, { threshold: newThreshold, discountPercent: newPercent }].sort(
          (a, b) => a.threshold - b.threshold
        ),
      };
    });
  };

  const handleRemoveTier = (index: number) => {
    if (config.tiers.length <= 1) {
      alert('Vous devez conserver au moins un palier de réduction.');
      return;
    }
    setConfig(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index),
    }));
  };

  // Format ISO string to datetime-local value (YYYY-MM-DDTHH:mm)
  const toLocalInputValue = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      // Zurich time representation
      const pad = (n: number) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Convert local input to ISO string
  const handleDateChange = (field: 'startDate' | 'endDate', val: string) => {
    if (!val) return;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      setConfig(prev => ({
        ...prev,
        [field]: d.toISOString(),
      }));
    }
  };

  // Calculate live status
  const now = new Date();
  const startDate = config.startDate ? new Date(config.startDate) : null;
  const endDate = config.endDate ? new Date(config.endDate) : null;

  let statusBadge = {
    label: 'Désactivé manuellement',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400',
  };

  if (config.enabled) {
    if (startDate && now < startDate) {
      statusBadge = {
        label: 'Programmé (En attente de démarrage)',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500 animate-pulse',
      };
    } else if (endDate && now > endDate) {
      statusBadge = {
        label: 'Campagne Terminée (Expirée)',
        color: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-500',
      };
    } else {
      statusBadge = {
        label: 'Campagne Active en Direct 🟢',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500 animate-ping',
      };
    }
  }

  // Simulation calculation
  const simResult = calculateBlackFridayDiscount(simSubtotal, config);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#F80404]" />
        <p className="text-sm font-semibold">Chargement des paramètres Black Friday...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-black via-zinc-900 to-black text-white p-6 rounded-3xl border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-600/20 text-[#F80404] rounded-xl border border-red-500/30">
              <Flame className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase font-heading tracking-tight">
              Système de Remises Automatiques Black Friday
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Gestion du barème progressif par palier, activation temporelle (Europe/Zurich) et verrouillage des codes promo.
          </p>
        </div>

        {/* Status Indicator */}
        <div className={`px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shrink-0 ${statusBadge.color}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${statusBadge.dot}`} />
          <span>{statusBadge.label}</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggle & Dates Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase font-heading">
                1. Activation de la Campagne
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active ou désactive immédiatement toutes les remises automatiques et réactive les codes promo classiques quand désactivé.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#F80404]" />
            </label>
          </div>

          {/* Campaign Schedule Dates (Europe/Zurich) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 tracking-wider">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Plage de validité (Fuseau horaire : Europe/Zurich)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Date & Heure de Début :
                </label>
                <input
                  type="datetime-local"
                  value={toLocalInputValue(config.startDate)}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#F80404]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Actuelle : {config.startDate ? new Date(config.startDate).toLocaleString('fr-CH', { timeZone: 'Europe/Zurich' }) : 'Non définie'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Date & Heure de Fin :
                </label>
                <input
                  type="datetime-local"
                  value={toLocalInputValue(config.endDate)}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#F80404]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Actuelle : {config.endDate ? new Date(config.endDate).toLocaleString('fr-CH', { timeZone: 'Europe/Zurich' }) : 'Non définie'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Discount Tiers Editor Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase font-heading">
                2. Paliers de Réduction Automatique
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Le sous-total du panier débloque automatiquement le pourcentage le plus élevé sans code promo.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddTier}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un Palier</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.tiers.map((tier, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex-wrap sm:flex-nowrap"
              >
                <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>

                <div className="flex-1 min-w-[130px]">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                    Dès Sous-Total (CHF) :
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">CHF</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tier.threshold}
                      onChange={(e) => handleTierChange(idx, 'threshold', Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#F80404]"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-[110px]">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                    Remise Accordée :
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-emerald-600">−</span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="100"
                      value={tier.discountPercent}
                      onChange={(e) => handleTierChange(idx, 'discountPercent', Number(e.target.value))}
                      className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-black text-emerald-700 focus:outline-none focus:border-[#F80404]"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveTier(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                  title="Supprimer ce palier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Banner Text Customization */}
          <div className="pt-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Texte du Badge Promotionnel sur les Produits :
            </label>
            <input
              type="text"
              value={config.bannerText || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, bannerText: e.target.value }))}
              placeholder="Ex: BLACK FRIDAY — JUSQU’À −25%"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#F80404]"
            />
          </div>
        </div>

        {/* Live Simulation Sandbox */}
        <div className="bg-gradient-to-br from-slate-900 to-black text-white rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-wider font-heading">
              3. Simulateur de Calcul en Temps Réel
            </h3>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-y-1">
              <label className="block text-[11px] text-zinc-400">Tester un sous-total client (CHF) :</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={simSubtotal}
                onChange={(e) => setSimSubtotal(Number(e.target.value))}
                className="w-36 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm font-black text-white focus:outline-none focus:border-[#F80404]"
              />
            </div>

            <div className="flex gap-2 flex-wrap pt-4">
              {[49.99, 50, 100, 110, 150, 200, 300].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSimSubtotal(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    simSubtotal === val ? 'bg-[#F80404] text-black font-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  CHF {val}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Sous-total produit testé :</span>
              <span className="font-bold">CHF {simSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Remise Black Friday appliquée ({simResult.discountPercent}%) :</span>
              <span>−CHF {simResult.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-zinc-700 font-black text-sm text-white">
              <span>Total après remise :</span>
              <span className="text-[#F80404]">CHF {simResult.finalSubtotal.toFixed(2)}</span>
            </div>
            {simResult.message && (
              <p className="text-[11px] text-amber-300/90 pt-1 italic">
                UX Client : {simResult.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={loadConfig}
            className="px-5 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-[#F80404] hover:bg-[#FF3D00] text-black font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <span>Enregistrer les Paramètres Black Friday</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
