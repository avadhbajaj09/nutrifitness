'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CATEGORIES } from '@/lib/catalog';
import type { ProductItem, ProductVariant, SupportedLocale, TaxRateCategory } from '@/lib/types';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Layers, 
  FileText, 
  Sparkles, 
  Check, 
  AlertCircle, 
  HelpCircle,
  Eye,
  ExternalLink
} from 'lucide-react';

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null; // null means "Create new product"
  onSave: (product: ProductItem) => void;
  onDelete?: (productId: string) => void;
  existingBrands: string[];
}

export default function ProductEditorModal({
  isOpen,
  onClose,
  product,
  onSave,
  onDelete,
  existingBrands
}: ProductEditorModalProps) {
  const isEditing = Boolean(product);

  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'descriptions' | 'variants' | 'nutrition'>('info');

  // Form State
  const [id, setId] = useState<string>('');
  const [nameFr, setNameFr] = useState<string>('');
  const [nameDe, setNameDe] = useState<string>('');
  const [nameIt, setNameIt] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [brand, setBrand] = useState<string>('NutriFitness');
  const [customBrand, setCustomBrand] = useState<string>('');
  const [categorySlug, setCategorySlug] = useState<string>('proteines');
  const [categorySlugs, setCategorySlugs] = useState<string[]>(['proteines']);
  const [priceChf, setPriceChf] = useState<number>(29.90);
  const [compareAtPriceChf, setCompareAtPriceChf] = useState<string>('');
  const [taxCategory, setTaxCategory] = useState<TaxRateCategory>('food_reduced');
  const [shippingOrigin, setShippingOrigin] = useState<'switzerland' | 'portugal'>('switzerland');
  const [isSwissOrigin, setIsSwissOrigin] = useState<boolean>(false);

  // Images state
  const [images, setImages] = useState<{ src: string; altText: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  // Descriptions state
  const [shortDescFr, setShortDescFr] = useState<string>('');
  const [longDescFr, setLongDescFr] = useState<string>('');
  const [directAnswerAeoFr, setDirectAnswerAeoFr] = useState<string>('');

  // Composition state
  const [ingredientsFr, setIngredientsFr] = useState<string>('');
  const [allergensFr, setAllergensFr] = useState<string>('');
  const [usageInstructionsFr, setUsageInstructionsFr] = useState<string>('');

  // Nutrition state
  const [servingSize, setServingSize] = useState<string>('30 g');
  const [servingsPerContainer, setServingsPerContainer] = useState<number>(30);
  const [energyKcal, setEnergyKcal] = useState<number>(115);
  const [energyKj, setEnergyKj] = useState<number>(485);
  const [proteinG, setProteinG] = useState<number>(24);
  const [carbsG, setCarbsG] = useState<number>(2);
  const [sugarsG, setSugarsG] = useState<number>(0.8);
  const [fatG, setFatG] = useState<number>(1);
  const [saturatedFatG, setSaturatedFatG] = useState<number>(0.3);
  const [saltG, setSaltG] = useState<number>(0.15);
  const [bcaaG, setBcaaG] = useState<string>('5.5');

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Feedback state
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      // Edit existing product
      setId(product.id);
      setNameFr(product.name?.fr || '');
      setNameDe(product.name?.de || product.name?.fr || '');
      setNameIt(product.name?.it || product.name?.fr || '');
      setNameEn(product.name?.en || product.name?.fr || '');
      setSlug(product.slug?.fr || '');
      
      if (existingBrands.includes(product.brand)) {
        setBrand(product.brand);
        setCustomBrand('');
      } else {
        setBrand('CUSTOM');
        setCustomBrand(product.brand);
      }

      const initialCat = product.categorySlug || 'proteines';
      setCategorySlug(initialCat);
      const initialCats = Array.isArray(product.categorySlugs) && product.categorySlugs.length > 0
        ? Array.from(new Set([initialCat, ...product.categorySlugs]))
        : [initialCat];
      setCategorySlugs(initialCats);

      setPriceChf(product.priceChf || 29.90);
      setCompareAtPriceChf(product.compareAtPriceChf ? String(product.compareAtPriceChf) : '');
      setTaxCategory(product.taxCategory || 'food_reduced');
      setShippingOrigin(product.shippingOrigin || 'switzerland');
      setIsSwissOrigin(Boolean(product.isSwissOrigin));

      setImages(
        product.images?.map(img => ({
          src: img.src,
          altText: img.alt?.fr || ''
        })) || [{ src: '/images/placeholder.webp', altText: product.name.fr }]
      );

      setShortDescFr(product.shortDescription?.fr || '');
      setLongDescFr(product.longDescription?.fr || '');
      setDirectAnswerAeoFr(product.directAnswerAeo?.fr || '');

      setIngredientsFr(product.ingredients?.fr || '');
      setAllergensFr(product.allergens?.fr || '');
      setUsageInstructionsFr(product.usageInstructions?.fr || '');

      if (product.nutrition) {
        setServingSize(product.nutrition.servingSize || '30 g');
        setServingsPerContainer(product.nutrition.servingsPerContainer || 30);
        setEnergyKcal(product.nutrition.energyKcal || 0);
        setEnergyKj(product.nutrition.energyKj || 0);
        setProteinG(product.nutrition.proteinG || 0);
        setCarbsG(product.nutrition.carbsG || 0);
        setSugarsG(product.nutrition.sugarsG || 0);
        setFatG(product.nutrition.fatG || 0);
        setSaturatedFatG(product.nutrition.saturatedFatG || 0);
        setSaltG(product.nutrition.saltG || 0);
        setBcaaG(product.nutrition.bcaaG !== undefined ? String(product.nutrition.bcaaG) : '');
      }

      setVariants(product.variants?.length ? [...product.variants] : [
        {
          id: `var-${Date.now()}`,
          sku: `SKU-${Date.now().toString().slice(-6)}`,
          flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
          format: '1 unité',
          priceChf: product.priceChf,
          inventoryQuantity: 20,
          inStock: true
        }
      ]);
    } else {
      // New Product Template
      const newId = `prod-custom-${Date.now().toString().slice(-6)}`;
      setId(newId);
      setNameFr('');
      setNameDe('');
      setNameIt('');
      setNameEn('');
      setSlug('');
      setBrand('NutriFitness');
      setCustomBrand('');
      setCategorySlug('proteines');
      setCategorySlugs(['proteines', 'meilleures-ventes']);
      setPriceChf(29.90);
      setCompareAtPriceChf('');
      setTaxCategory('food_reduced');
      setShippingOrigin('switzerland'); // Default to Geneva stock for new items in shop
      setIsSwissOrigin(false);

      setImages([{ src: '/images/placeholder.webp', altText: 'Nouveau produit' }]);
      setShortDescFr('Formule haute performance développée selon les normes de qualité suisses les plus exigeantes.');
      setLongDescFr(`<h2>Pourquoi choisir ce produit ?</h2>\n<p>Élaboré avec des ingrédients de qualité supérieure, ce complément alimentaire apporte une réponse ciblée à vos besoins sportifs et nutritionnels.</p>\n<h2>Conseils d'utilisation</h2>\n<p>Consommer selon les recommandations indiquées sur l'emballage.</p>`);
      setDirectAnswerAeoFr('Produit de nutrition sportive haut de gamme disponible chez NutriFitness Genève avec livraison 24h en Suisse.');

      setIngredientsFr('Ingrédients de haute qualité alimentaire contrôlés selon les normes de sécurité suisses.');
      setAllergensFr('Voir emballage pour la liste détaillée des allergènes.');
      setUsageInstructionsFr('Consommer 1 portion par jour diluée dans de l\'eau fraîche ou selon les conseils de votre coach.');

      setServingSize('30 g');
      setServingsPerContainer(30);
      setEnergyKcal(115);
      setEnergyKj(485);
      setProteinG(24);
      setCarbsG(2);
      setSugarsG(0.8);
      setFatG(1);
      setSaturatedFatG(0.3);
      setSaltG(0.15);
      setBcaaG('5.5');

      setVariants([
        {
          id: `var-${Date.now()}-1`,
          sku: `NF-${Date.now().toString().slice(-6)}-STD`,
          flavorName: { fr: 'Standard', de: 'Standard', it: 'Standard', en: 'Standard' },
          format: '1 unité',
          priceChf: 29.90,
          inventoryQuantity: 30,
          inStock: true
        }
      ]);
    }

    setActiveTab('info');
    setFormError(null);
  }, [isOpen, product, existingBrands]);

  // Toggle multiple categories
  const handleToggleCategory = (catId: string) => {
    setCategorySlugs(prev => {
      if (prev.includes(catId)) {
        if (prev.length <= 1) return prev; // keep at least 1
        const next = prev.filter(c => c !== catId);
        if (categorySlug === catId && next.length > 0) {
          setCategorySlug(next[0]);
        }
        return next;
      } else {
        return [...prev, catId];
      }
    });
  };

  // Auto-generate slug when name changes for new product
  const handleNameChange = (val: string) => {
    setNameFr(val);
    if (!isEditing || !slug) {
      const autoSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(autoSlug);
    }
  };

  // Add gallery image
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages(prev => [...prev, { src: newImageUrl.trim(), altText: nameFr || 'Photo produit' }]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Add variant
  const handleAddVariant = () => {
    const newVarId = `var-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    const randomSku = `SKU-${Date.now().toString().slice(-5)}`;
    setVariants(prev => [
      ...prev,
      {
        id: newVarId,
        sku: randomSku,
        flavorName: { fr: 'Nouvelle saveur', de: 'Neue Sorte', it: 'Nuovo gusto', en: 'New flavor' },
        format: '1 unité',
        priceChf: priceChf,
        inventoryQuantity: 25,
        inStock: true
      }
    ]);
  };

  const handleUpdateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, ...updates } : v));
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('Un produit doit comporter au moins 1 variante.');
      return;
    }
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameFr.trim()) {
      setFormError('Le nom du produit en français est obligatoire.');
      setActiveTab('info');
      return;
    }

    if (!slug.trim()) {
      setFormError('Le slug URL est obligatoire.');
      setActiveTab('info');
      return;
    }

    if (images.length === 0) {
      setFormError('Au moins une image est requise.');
      setActiveTab('images');
      return;
    }

    const finalBrand = brand === 'CUSTOM' ? (customBrand.trim() || 'NutriFitness') : brand;
    const finalCompareAt = compareAtPriceChf.trim() ? parseFloat(compareAtPriceChf) : undefined;
    const finalBcaa = bcaaG.trim() ? parseFloat(bcaaG) : undefined;

    const savedProduct: ProductItem = {
      id: id || `prod-${Date.now()}`,
      slug: {
        fr: slug.trim(),
        de: slug.trim(),
        it: slug.trim(),
        en: slug.trim()
      },
      name: {
        fr: nameFr.trim(),
        de: nameDe.trim() || nameFr.trim(),
        it: nameIt.trim() || nameFr.trim(),
        en: nameEn.trim() || nameFr.trim()
      },
      brand: finalBrand,
      categorySlug: categorySlug || categorySlugs[0] || 'proteines',
      categorySlugs: categorySlugs.length > 0 ? categorySlugs : [categorySlug || 'proteines'],
      taxCategory,
      priceChf: Number(priceChf),
      compareAtPriceChf: finalCompareAt,
      isSwissOrigin,
      shippingOrigin,
      images: images.map(img => ({
        src: img.src,
        alt: {
          fr: img.altText || nameFr.trim(),
          de: img.altText || nameFr.trim(),
          it: img.altText || nameFr.trim(),
          en: img.altText || nameFr.trim()
        },
        width: 800,
        height: 800
      })),
      shortDescription: {
        fr: shortDescFr,
        de: (product && product.shortDescription?.de) || shortDescFr,
        it: (product && product.shortDescription?.it) || shortDescFr,
        en: (product && product.shortDescription?.en) || shortDescFr
      },
      directAnswerAeo: {
        fr: directAnswerAeoFr,
        de: (product && product.directAnswerAeo?.de) || directAnswerAeoFr,
        it: (product && product.directAnswerAeo?.it) || directAnswerAeoFr,
        en: (product && product.directAnswerAeo?.en) || directAnswerAeoFr
      },
      longDescription: {
        fr: longDescFr,
        de: (product && product.longDescription?.de) || longDescFr,
        it: (product && product.longDescription?.it) || longDescFr,
        en: (product && product.longDescription?.en) || longDescFr
      },
      usageInstructions: {
        fr: usageInstructionsFr,
        de: (product && product.usageInstructions?.de) || usageInstructionsFr,
        it: (product && product.usageInstructions?.it) || usageInstructionsFr,
        en: (product && product.usageInstructions?.en) || usageInstructionsFr
      },
      ingredients: {
        fr: ingredientsFr,
        de: (product && product.ingredients?.de) || ingredientsFr,
        it: (product && product.ingredients?.it) || ingredientsFr,
        en: (product && product.ingredients?.en) || ingredientsFr
      },
      allergens: {
        fr: allergensFr,
        de: (product && product.allergens?.de) || allergensFr,
        it: (product && product.allergens?.it) || allergensFr,
        en: (product && product.allergens?.en) || allergensFr
      },
      nutrition: {
        servingSize,
        servingsPerContainer: Number(servingsPerContainer),
        energyKcal: Number(energyKcal),
        energyKj: Number(energyKj),
        proteinG: Number(proteinG),
        carbsG: Number(carbsG),
        sugarsG: Number(sugarsG),
        fatG: Number(fatG),
        saturatedFatG: Number(saturatedFatG),
        saltG: Number(saltG),
        bcaaG: finalBcaa
      },
      variants: variants.map(v => ({
        ...v,
        priceChf: v.priceChf ? Number(v.priceChf) : Number(priceChf),
        inventoryQuantity: Number(v.inventoryQuantity) || 0
      }))
    };

    onSave(savedProduct);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl h-full shadow-2xl border-l border-slate-200 overflow-y-auto flex flex-col text-slate-900 animate-in slide-in-from-right duration-200">
        
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 sticky top-0 z-20 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase text-slate-400 font-heading">
                {isEditing ? 'Éditeur de Fiche Produit' : 'Création de Nouvel Article'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                shippingOrigin === 'switzerland'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {shippingOrigin === 'switzerland' ? '🇨🇭 Stock Genève (POS Actif)' : '🇵🇹 Expédié Portugal'}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 font-heading truncate max-w-xl">
              {isEditing ? (product?.name.fr || 'Modifier le produit') : 'Nouveau Produit au Catalogue'}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${nameFr}" du catalogue ?`)) {
                    onDelete(id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5"
                title="Supprimer définitivement"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Supprimer</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-white sticky top-[85px] z-10 overflow-x-auto gap-2 py-2">
          {[
            { id: 'info', label: '1. Informations & Prix', icon: Layers },
            { id: 'images', label: '2. Photos & Galerie', icon: ImageIcon },
            { id: 'descriptions', label: '3. Descriptions & SEO', icon: FileText },
            { id: 'variants', label: '4. Saveurs & SKUs', icon: Sparkles },
            { id: 'nutrition', label: '5. Nutrition & Ingrédients', icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ERROR NOTICE */}
        {formError && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 flex-1">
          
          {/* TAB 1: GENERAL INFO & PRICING */}
          {activeTab === 'info' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Product Title FR */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nom du Produit (Français) *
                </label>
                <input
                  type="text"
                  value={nameFr}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Pure Isolat CFM 100% Whey 1kg – Protéine Microfiltrée"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  required
                />
              </div>

              {/* Multilingual Titles (Optional / Expandable) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-600 block">
                  Traductions du Titre (Allemand, Italien, Anglais) :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Titre DE (Allemand)</label>
                    <input
                      type="text"
                      value={nameDe}
                      onChange={(e) => setNameDe(e.target.value)}
                      placeholder={nameFr || 'Titre en allemand...'}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Titre IT (Italien)</label>
                    <input
                      type="text"
                      value={nameIt}
                      onChange={(e) => setNameIt(e.target.value)}
                      placeholder={nameFr || 'Titre en italien...'}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Titre EN (Anglais)</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder={nameFr || 'Titre en anglais...'}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Slug & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Slug URL (identifiant web) *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs text-slate-500 font-mono">
                      /produit/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="nom-du-produit"
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-r-xl text-xs font-mono text-slate-900 focus:outline-none focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Catégorie Principale (Navigation & URL) *
                  </label>
                  <select
                    value={categorySlug}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setCategorySlug(newCat);
                      if (!categorySlugs.includes(newCat)) {
                        setCategorySlugs(prev => [...prev, newCat]);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name.fr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multiple Categories & Shared Collections */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
                    Catégories Multiples & Badges ({categorySlugs.length} active{categorySlugs.length > 1 ? 's' : ''})
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Ce produit apparaîtra dans toutes les catégories cochées ci-dessous :
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CATEGORIES.map(cat => {
                    const isSelected = categorySlugs.includes(cat.id);
                    const isPrimary = categorySlug === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? isPrimary
                              ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                              : 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3 h-3 text-slate-400" />}
                        <span>{cat.name.fr}</span>
                        {isPrimary && (
                          <span className="text-[9px] uppercase px-1 py-0.2 bg-emerald-800 rounded text-emerald-100 font-black">
                            Principale
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Marque *
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {existingBrands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="CUSTOM">+ Autre marque (personnalisée)</option>
                  </select>
                </div>

                {brand === 'CUSTOM' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nom de la Nouvelle Marque
                    </label>
                    <input
                      type="text"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      placeholder="Ex: Mutant Nutrition..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Pricing & VAT Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Prix Public (CHF) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">CHF</span>
                    <input
                      type="number"
                      step="0.05"
                      value={priceChf}
                      onChange={(e) => setPriceChf(parseFloat(e.target.value) || 0)}
                      className="w-full pl-11 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Prix Barré / Ancien (CHF)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">CHF</span>
                    <input
                      type="number"
                      step="0.05"
                      value={compareAtPriceChf}
                      onChange={(e) => setCompareAtPriceChf(e.target.value)}
                      placeholder="Optionnel"
                      className="w-full pl-11 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Régime de TVA Suisse
                  </label>
                  <select
                    value={taxCategory}
                    onChange={(e) => setTaxCategory(e.target.value as TaxRateCategory)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="food_reduced">2.6% (Alimentaire / Protéines)</option>
                    <option value="standard">8.1% (Standard / Shakers & Textiles)</option>
                  </select>
                </div>
              </div>

              {/* Origin & POS Availability (Crucial Requirement) */}
              <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
                  Lieu de Stockage & Disponibilité Caisse Magasin (POS) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                    shippingOrigin === 'switzerland'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="shippingOrigin"
                      value="switzerland"
                      checked={shippingOrigin === 'switzerland'}
                      onChange={() => setShippingOrigin('switzerland')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <p className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <span>🇨🇭</span>
                        <span>Stock Magasin Genève (24h)</span>
                      </p>
                      <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                        ✓ DISPONIBLE EN CAISSE POS (Scannable et vendable directement en boutique)
                      </p>
                    </div>
                  </label>

                  <label className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                    shippingOrigin === 'portugal'
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="shippingOrigin"
                      value="portugal"
                      checked={shippingOrigin === 'portugal'}
                      onChange={() => setShippingOrigin('portugal')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <p className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <span>🇵🇹</span>
                        <span>Expédié Usine Portugal (3–5j)</span>
                      </p>
                      <p className="text-[11px] text-blue-800 font-medium mt-0.5">
                        ✕ EXCLU DU POS MAGASIN (Expédié par transporteur depuis l'usine)
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isSwissOrigin}
                      onChange={(e) => setIsSwissOrigin(e.target.checked)}
                      className="rounded text-slate-900"
                    />
                    <span>Afficher le badge de fabrication suisse (CH) sur la vignette</span>
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: IMAGES & GALLERY */}
          {activeTab === 'images' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Add New Image Input */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ajouter une Image (URL ou chemin local)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://... ou /images/products/..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Conseil : La première image de la liste sert de visuel principal (packshot de couverture).
                </p>
              </div>

              {/* Gallery Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Images Actives ({images.length})
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-2xl relative group flex flex-col items-center shadow-xs"
                    >
                      <div className="relative w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-2">
                        <Image
                          src={img.src}
                          alt={img.altText || `Photo ${idx + 1}`}
                          fill
                          className="object-contain p-2"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase">
                            Principal
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        value={img.altText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setImages(prev => prev.map((item, i) => i === idx ? { ...item, altText: val } : item));
                        }}
                        placeholder="Texte alternatif (SEO)..."
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-700 focus:outline-none mb-1.5"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        disabled={images.length <= 1}
                        className="w-full py-1 text-red-600 hover:bg-red-50 disabled:opacity-30 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: DESCRIPTIONS & SEO/AEO */}
          {activeTab === 'descriptions' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description Courte (Accroche sous le titre)
                </label>
                <textarea
                  rows={3}
                  value={shortDescFr}
                  onChange={(e) => setShortDescFr(e.target.value)}
                  placeholder="Résumé percutant des bienfaits du produit..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Direct Answer AEO */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1">
                  <span>⚡</span> Réponse Directe AEO (Résumé cité par Google & les IA)
                </label>
                <textarea
                  rows={3}
                  value={directAnswerAeoFr}
                  onChange={(e) => setDirectAnswerAeoFr(e.target.value)}
                  placeholder="Réponse directe de 40 à 60 mots définissant la formule, le public cible et la disponibilité à Genève..."
                  className="w-full p-3 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-medium focus:outline-none focus:bg-white"
                />
              </div>

              {/* Long Description HTML */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Description Longue & Argumentaire (Code HTML riche)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Prend en charge &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={longDescFr}
                  onChange={(e) => setLongDescFr(e.target.value)}
                  placeholder="<h2>Pourquoi choisir...</h2><p>Détail de la formule...</p>"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

            </div>
          )}

          {/* TAB 4: VARIANTS, FLAVORS & SKUs */}
          {activeTab === 'variants' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
                    Variantes, Saveurs & Codes SKUs ({variants.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Chaque SKU représente un code-barres scannable en caisse POS ou sur la boutique.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une Saveur</span>
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div 
                    key={v.id || idx}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 font-heading">
                        Option #{idx + 1} : {v.flavorName.fr || 'Standard'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        disabled={variants.length <= 1}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-20 font-bold"
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Nom Saveur (FR)</label>
                        <input
                          type="text"
                          value={v.flavorName.fr}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateVariant(idx, {
                              flavorName: { fr: val, de: val, it: val, en: val }
                            });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Format (Poids/Unité)</label>
                        <input
                          type="text"
                          value={v.format}
                          onChange={(e) => handleUpdateVariant(idx, { format: e.target.value })}
                          placeholder="Ex: 1 kg, 300 g..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Code SKU / Barcode</label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleUpdateVariant(idx, { sku: e.target.value })}
                          placeholder="Code scannable..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Quantité Stock</label>
                        <input
                          type="number"
                          value={v.inventoryQuantity}
                          onChange={(e) => handleUpdateVariant(idx, { inventoryQuantity: parseInt(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={v.inStock}
                            onChange={(e) => handleUpdateVariant(idx, { inStock: e.target.checked })}
                            className="rounded text-emerald-600"
                          />
                          <span>En stock pour la vente (Magasin & Web)</span>
                        </label>

                        {/* Quick pick from gallery thumbnails */}
                        {images.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 font-medium">Choisir depuis la galerie :</span>
                            <div className="flex items-center gap-1">
                              {images.map((gImg, gIdx) => (
                                <button
                                  key={gIdx}
                                  type="button"
                                  onClick={() => handleUpdateVariant(idx, { image: gImg.src })}
                                  className={`relative w-7 h-7 rounded-lg border overflow-hidden transition-all bg-white ${
                                    v.image === gImg.src 
                                      ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-xs' 
                                      : 'border-slate-300 opacity-60 hover:opacity-100 hover:border-slate-500'
                                  }`}
                                  title={`Affecter la photo #${gIdx + 1} à cette saveur`}
                                >
                                  <Image src={gImg.src} alt="" fill className="object-contain p-0.5" sizes="28px" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Flavor Image Card with Live Preview */}
                      <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
                        <div className="relative w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          <Image
                            src={v.image || images[0]?.src || '/images/placeholder.webp'}
                            alt={v.flavorName.fr}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                              Photo Dédiée à la Saveur ({v.flavorName.fr})
                            </span>
                            {v.image && (
                              <button
                                type="button"
                                onClick={() => handleUpdateVariant(idx, { image: undefined })}
                                className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition-colors"
                              >
                                Réinitialiser à l'image principale
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={v.image || ''}
                            onChange={(e) => handleUpdateVariant(idx, { image: e.target.value.trim() || undefined })}
                            placeholder="URL personnalisée ou cliquez sur une photo ci-dessus..."
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 5: NUTRITION, INGREDIENTS & USAGE */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Ingredients & Allergens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Ingrédients Complets
                  </label>
                  <textarea
                    rows={4}
                    value={ingredientsFr}
                    onChange={(e) => setIngredientsFr(e.target.value)}
                    placeholder="Liste des ingrédients..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Allergènes
                  </label>
                  <textarea
                    rows={4}
                    value={allergensFr}
                    onChange={(e) => setAllergensFr(e.target.value)}
                    placeholder="Ex: Contient du lait. Fabriqué dans un atelier utilisant du soja, des œufs..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Usage Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Conseils d'Utilisation & Posologie
                </label>
                <textarea
                  rows={3}
                  value={usageInstructionsFr}
                  onChange={(e) => setUsageInstructionsFr(e.target.value)}
                  placeholder="Ex: Mélanger 1 dosette (30g) dans 300ml d'eau fraîche au réveil ou après l'entraînement."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Nutrition Facts Inputs */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading block">
                  Tableau des Valeurs Nutritionnelles
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Taille Portion</label>
                    <input
                      type="text"
                      value={servingSize}
                      onChange={(e) => setServingSize(e.target.value)}
                      placeholder="Ex: 30 g"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Portions / Pot</label>
                    <input
                      type="number"
                      value={servingsPerContainer}
                      onChange={(e) => setServingsPerContainer(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Énergie (kcal)</label>
                    <input
                      type="number"
                      value={energyKcal}
                      onChange={(e) => setEnergyKcal(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Protéines (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={proteinG}
                      onChange={(e) => setProteinG(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-emerald-700 font-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Glucides (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={carbsG}
                      onChange={(e) => setCarbsG(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Dont Sucres (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={sugarsG}
                      onChange={(e) => setSugarsG(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Lipides (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={fatG}
                      onChange={(e) => setFatG(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Sel (g)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={saltG}
                      onChange={(e) => setSaltG(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STICKY BOTTOM ACTIONS */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4 sticky bottom-0 bg-white py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Enregistrer les Modifications' : 'Créer & Publier le Produit'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
