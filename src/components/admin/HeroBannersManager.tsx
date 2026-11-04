'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  Image as ImageIcon,
  Check,
  X,
  Search
} from 'lucide-react';
import { DEFAULT_HERO_BANNERS, type HeroBanner } from '@/lib/banners';
import type { ProductItem } from '@/lib/types';

interface HeroBannersManagerProps {
  allProducts: ProductItem[];
  onBannerCountChange?: (count: number) => void;
}

export default function HeroBannersManager({ allProducts, onBannerCountChange }: HeroBannersManagerProps) {
  const [banners, setBanners] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Form state
  const [formId, setFormId] = useState<string>('');
  const [formProductName, setFormProductName] = useState<string>('');
  const [formBrand, setFormBrand] = useState<string>('Marvelous Nutrition');
  const [formTag, setFormTag] = useState<string>('');
  const [formBadge, setFormBadge] = useState<string>('100% Stock Suisse');
  const [formWideImage, setFormWideImage] = useState<string>('');
  const [formMobileImage, setFormMobileImage] = useState<string>('');
  const [formLink, setFormLink] = useState<string>('');
  const [formCtaText, setFormCtaText] = useState<string>('Commander');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Upload & action state
  const [isUploadingWide, setIsUploadingWide] = useState<boolean>(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Product quick-picker search state
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [isProductPickerOpen, setIsProductPickerOpen] = useState<boolean>(false);

  const wideFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/banners?all=true', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.banners)) {
          setBanners(data.banners);
          if (onBannerCountChange) {
            onBannerCountChange(data.banners.length);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch banners:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Filter products for quick-picker
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return allProducts.slice(0, 15);
    const q = productSearchQuery.toLowerCase().trim();
    return allProducts.filter(p => 
      p.name?.fr?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.slug?.fr?.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [allProducts, productSearchQuery]);

  // Handle open modal for new banner
  const handleOpenNewModal = () => {
    setEditingBanner(null);
    setFormId('');
    setFormProductName('');
    setFormBrand('Marvelous Nutrition');
    setFormTag('');
    setFormBadge('100% Stock Suisse');
    setFormWideImage('/images/banners/wide/nutriftiness-banner1.jpg');
    setFormMobileImage('');
    setFormLink('/produit/');
    setFormCtaText('Découvrir');
    setFormIsActive(true);
    setFeedback(null);
    setIsProductPickerOpen(false);
    setIsModalOpen(true);
  };

  // Handle open modal for editing existing banner
  const handleOpenEditModal = (b: HeroBanner) => {
    setEditingBanner(b);
    setFormId(b.id);
    setFormProductName(b.productName);
    setFormBrand(b.brand || 'Marvelous Nutrition');
    setFormTag(b.tag || '');
    setFormBadge(b.badge || '100% Stock Suisse');
    setFormWideImage(b.wideImage);
    setFormMobileImage(b.mobileImage || '');
    setFormLink(b.link);
    setFormCtaText(b.ctaText || 'Commander');
    setFormIsActive(b.isActive !== false);
    setFeedback(null);
    setIsProductPickerOpen(false);
    setIsModalOpen(true);
  };

  // Select a product from quick picker
  const handleSelectProduct = (p: ProductItem) => {
    setFormProductName(p.name?.fr || '');
    setFormBrand(p.brand || 'Marvelous Nutrition');
    const slug = p.slug?.fr || p.id;
    setFormLink(`/produit/${slug}/`);
    setFormCtaText(`Voir ${p.brand || 'le Produit'}`);
    if (p.images && p.images[0]?.src && (!formWideImage || formWideImage.includes('nutriftiness-banner'))) {
      // Suggest product primary image if no custom banner provided
      setFormWideImage(p.images[0].src);
    }
    setIsProductPickerOpen(false);
  };

  // Upload an image to Supabase product-images bucket
  const handleFileUpload = async (file: File, type: 'wide' | 'mobile') => {
    const isWide = type === 'wide';
    if (isWide) setIsUploadingWide(true);
    else setIsUploadingMobile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur lors du téléchargement');
      }

      const data = await res.json();
      if (data.url) {
        if (isWide) {
          setFormWideImage(data.url);
        } else {
          setFormMobileImage(data.url);
        }
        setFeedback({ type: 'success', message: 'Image téléchargée avec succès dans Supabase !' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Échec du téléchargement.' });
    } finally {
      if (isWide) setIsUploadingWide(false);
      else setIsUploadingMobile(false);
    }
  };

  // Save banner (Create or Update)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductName.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez renseigner le nom du produit.' });
      return;
    }
    if (!formWideImage.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez renseigner ou uploader une image pour la bannière.' });
      return;
    }
    if (!formLink.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez renseigner le lien du produit cible.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const payload = {
        id: formId || undefined,
        productName: formProductName.trim(),
        brand: formBrand.trim(),
        tag: formTag.trim(),
        badge: formBadge.trim(),
        wideImage: formWideImage.trim(),
        mobileImage: formMobileImage.trim() || formWideImage.trim(),
        link: formLink.trim(),
        ctaText: formCtaText.trim() || 'Commander',
        isActive: formIsActive
      };

      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l’enregistrement de la bannière.');
      }

      await fetchBanners();
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Bannière enregistrée avec succès ! La page d’accueil a été actualisée.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Une erreur est survenue.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active state
  const handleToggleActive = async (b: HeroBanner) => {
    const newActive = !b.isActive;
    const updated = banners.map(item => item.id === b.id ? { ...item, isActive: newActive } : item);
    setBanners(updated);

    try {
      await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: b.id, sortOrder: b.sortOrder, isActive: newActive }]
        })
      });
    } catch {
      await fetchBanners();
    }
  };

  // Reorder banner up or down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (isReordering) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    setIsReordering(true);
    const newBanners = [...banners];
    const [moved] = newBanners.splice(index, 1);
    newBanners.splice(targetIndex, 0, moved);

    // Re-assign sort orders
    const itemsToUpdate = newBanners.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1
    }));

    setBanners(itemsToUpdate);

    try {
      await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToUpdate.map(b => ({ id: b.id, sortOrder: b.sortOrder, isActive: b.isActive }))
        })
      });
    } catch {
      await fetchBanners();
    } finally {
      setIsReordering(false);
    }
  };

  // Delete banner
  const handleDeleteBanner = async (b: HeroBanner) => {
    const confirm = window.confirm(`Êtes-vous sûr de vouloir supprimer la bannière pour "${b.productName}" ?`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/banners?id=${encodeURIComponent(b.id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression.');
      }
      await fetchBanners();
      setFeedback({ type: 'success', message: 'Bannière supprimée.' });
    } catch (err: any) {
      alert(err.message || 'Impossible de supprimer.');
    }
  };

  const activeCount = banners.filter(b => b.isActive).length;

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      {/* Top Banner Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
            <h2 className="text-lg font-black text-slate-900 font-heading tracking-tight">
              Gestionnaire du Slider d'Accueil
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
              {banners.length} bannières
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Modifiez en direct les images d'affiches, les liens produits, titres et boutons du carrousel de la page d'accueil.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>Voir le site</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            type="button"
            onClick={handleOpenNewModal}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Bannière</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-bold ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="p-1 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bannières</span>
          <p className="text-2xl font-black text-slate-900 font-heading mt-1">{banners.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Enregistrées dans Supabase</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Actives en Ligne</span>
          <p className="text-2xl font-black text-emerald-600 font-heading mt-1">{activeCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Visibles sur le carrousel</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Défilement Automatique</span>
          <p className="text-2xl font-black text-slate-900 font-heading mt-1">5.5s</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Pause automatique au survol</p>
        </div>
      </div>

      {/* Banners List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Ordre d'Affichage des Diapositives (Hero Slider)
          </h3>
          <span className="text-xs text-slate-400">
            Utilisez les flèches pour réordonner le carrousel
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            <span className="text-xs font-bold">Chargement des bannières...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <ImageIcon className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Aucune bannière configurée</p>
            <button
              type="button"
              onClick={handleOpenNewModal}
              className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700"
            >
              Créer la première bannière
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {banners.map((b, idx) => (
              <div 
                key={b.id} 
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  b.isActive ? 'hover:bg-slate-50/70' : 'bg-slate-50/50 opacity-60'
                }`}
              >
                {/* Reorder and Number */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={idx === 0 || isReordering}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-700"
                      title="Monter cette bannière"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === banners.length - 1 || isReordering}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-700"
                      title="Descendre cette bannière"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center font-heading">
                    #{idx + 1}
                  </span>
                </div>

                {/* Banner Thumbnail */}
                <div className="relative w-36 sm:w-48 aspect-[16/7] rounded-xl overflow-hidden bg-black shrink-0 border border-slate-200">
                  <Image
                    src={b.wideImage}
                    alt={b.productName}
                    fill
                    sizes="(max-width: 768px) 150px, 200px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 left-2 text-[9px] font-bold text-white uppercase truncate max-w-[90%]">
                    {b.brand}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                      {b.brand}
                    </span>
                    {b.badge && (
                      <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                        {b.badge}
                      </span>
                    )}
                    {b.isActive ? (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Actif
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">
                        Masqué
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm truncate font-heading">
                    {b.productName}
                  </h4>

                  {b.tag && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {b.tag}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                      <span>Lien :</span>
                      <Link href={b.link} target="_blank" className="hover:text-blue-600 flex items-center gap-1 truncate">
                        <span className="truncate">{b.link}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </Link>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-black text-[10px] uppercase shrink-0">
                      Bouton : {b.ctaText}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(b)}
                    className={`p-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 ${
                      b.isActive 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                        : 'border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title={b.isActive ? 'Désactiver la bannière' : 'Activer la bannière'}
                  >
                    {b.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="hidden sm:inline">{b.isActive ? 'Actif' : 'Masqué'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(b)}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Modifier la bannière"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b)}
                    className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all"
                    title="Supprimer la bannière"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          CREATE / EDIT BANNER MODAL
         ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-heading">
                    {editingBanner ? 'Modifier la Bannière' : 'Ajouter une Nouvelle Bannière'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Définissez le poster visuel, le titre et le lien de redirection du slider
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBanner} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* Quick Product Selector Drawer */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">
                      Remplissage Rapide depuis le Catalogue
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProductPickerOpen(!isProductPickerOpen)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    {isProductPickerOpen ? 'Masquer la liste' : 'Sélectionner un produit existant'}
                  </button>
                </div>

                {isProductPickerOpen && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Chercher un produit par nom, marque ou slug..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
                      {filteredProducts.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p)}
                          className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="min-w-0 pr-3">
                            <span className="font-bold text-slate-900 block truncate">{p.name.fr}</span>
                            <span className="text-[10px] text-slate-500">{p.brand} · CHF {p.priceChf}</span>
                          </div>
                          <span className="px-2 py-1 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-bold text-slate-700 transition-colors shrink-0">
                            Choisir
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom du Produit (Titre Principal) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formProductName}
                    onChange={(e) => setFormProductName(e.target.value)}
                    placeholder="ex: Marvelous Line Créatine Monohydrate Pure 300g"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Marque *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="ex: Marvelous Nutrition"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Badge */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Badge Vert (Label)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="ex: 100% Stock Suisse, Isolat CFM Pureté"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Target Link */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lien Produit / URL Cible *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="ex: /produit/marvelous-line-creatine-monohydrate-pure/"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Chemin relatif (ex: /produit/nom-du-produit/) ou URL complète.
                  </p>
                </div>

                {/* CTA Button Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Texte du Bouton CTA *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    placeholder="ex: VOIR LE MAGNÉSIUM, Commander la Whey"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Subtitle Tagline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Slogan / Sous-titre (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="ex: 💪 Force · Puissance Explosive · Récupération"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Poster Image (Wide Desktop) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Image Poster Desktop (Format Grand Angle 1600x660) *
                  </label>
                  <button
                    type="button"
                    disabled={isUploadingWide}
                    onClick={() => wideFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isUploadingWide ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingWide ? 'Envoi...' : 'Uploader une Image'}</span>
                  </button>
                  <input
                    ref={wideFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'wide');
                    }}
                  />
                </div>

                <input
                  type="text"
                  required
                  value={formWideImage}
                  onChange={(e) => setFormWideImage(e.target.value)}
                  placeholder="https://... ou /images/banners/wide/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />

                {formWideImage && (
                  <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden bg-black border border-slate-200 mt-2">
                    <Image
                      src={formWideImage}
                      alt="Aperçu Desktop"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Poster Image (Mobile - Optional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Image Mobile (Optionnel)
                  </label>
                  <button
                    type="button"
                    disabled={isUploadingMobile}
                    onClick={() => mobileFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isUploadingMobile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingMobile ? 'Envoi...' : 'Uploader Image Mobile'}</span>
                  </button>
                  <input
                    ref={mobileFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'mobile');
                    }}
                  />
                </div>

                <input
                  type="text"
                  value={formMobileImage}
                  onChange={(e) => setFormMobileImage(e.target.value)}
                  placeholder="Laisser vide pour utiliser automatiquement l'affiche grand format"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-sm text-slate-900 block">Afficher cette bannière sur le site</span>
                  <span className="text-xs text-slate-500">Active immédiatement la diapositive dans le carrousel d'accueil</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    formIsActive ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Live Mockup Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Aperçu du Rendu sur la Page d'Accueil
                </span>
                <div className="relative rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10 shadow-lg p-0">
                  <div className="relative w-full aspect-[16/7] bg-black">
                    {formWideImage ? (
                      <Image
                        src={formWideImage}
                        alt="Aperçu direct"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                        Aucune image sélectionnée
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
                  </div>
                  <div className="bg-[#141414] px-4 py-3 flex items-center justify-between gap-3 border-t border-white/10">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-[#F80404]">
                          {formBrand || 'MARVELOUS NUTRITION'}
                        </span>
                        {formBadge && (
                          <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            {formBadge}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white truncate font-heading mt-0.5">
                        {formProductName || 'Titre du produit...'}
                      </h4>
                    </div>
                    <div className="px-3.5 py-1.5 bg-[#F80404] text-black font-black uppercase text-[10px] rounded-xl flex items-center gap-1 shrink-0">
                      <span>{formCtaText || 'Commander'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la Bannière'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
