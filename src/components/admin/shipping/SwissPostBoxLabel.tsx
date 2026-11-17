'use client';

import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  Copy,
  Check,
  Package,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  ExternalLink,
  Edit3,
} from 'lucide-react';

export interface SwissPostBoxLabelProps {
  orderNumber: string;
  recipient: {
    name: string;
    street: string;
    zip: string;
    city: string;
    country?: string;
    phone?: string;
    email?: string;
  };
  sender?: {
    name1: string;
    name2?: string;
    street: string;
    zip: string;
    city: string;
    country?: string;
    phone?: string;
  };
  weightKg?: number;
  service?: 'PRI' | 'ECO';
  trackingNumber?: string;
  pdfUrl?: string;
  onClose?: () => void;
}

export default function SwissPostBoxLabel({
  orderNumber,
  recipient,
  sender = {
    name1: 'NUTRIFITNESS',
    name2: '',
    street: 'Rue des Pâquis 34',
    zip: '1201',
    city: 'Genève',
    country: 'CH',
    phone: '+41 22 518 80 40',
  },
  weightKg = 1.0,
  service = 'PRI',
  trackingNumber,
  pdfUrl,
  onClose,
}: SwissPostBoxLabelProps) {
  const [scale, setScale] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [recipientData, setRecipientData] = useState(recipient);
  const [weightData, setWeightData] = useState<number>(weightKg);
  const [serviceData, setServiceData] = useState<'PRI' | 'ECO'>(service);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setRecipientData(recipient);
  }, [recipient]);

  useEffect(() => {
    setWeightData(weightKg);
  }, [weightKg]);

  useEffect(() => {
    setServiceData(service);
  }, [service]);

  // Derive stable 18-digit IdentCode if none provided
  const cleanOrderNum = orderNumber.replace(/\D/g, '').padEnd(8, '0').slice(-8);
  const rawIdentCode = trackingNumber 
    ? trackingNumber.replace(/\D/g, '') 
    : `9960178154${cleanOrderNum}`;

  // Formatted tracking: 99.60.178154.00000001
  const formattedIdentCode = rawIdentCode.length === 18
    ? `${rawIdentCode.slice(0, 2)}.${rawIdentCode.slice(2, 4)}.${rawIdentCode.slice(4, 10)}.${rawIdentCode.slice(10, 18)}`
    : rawIdentCode;

  // Render Barcode
  useEffect(() => {
    if (barcodeSvgRef.current) {
      try {
        JsBarcode(barcodeSvgRef.current, rawIdentCode, {
          format: 'CODE128',
          lineColor: '#000000',
          width: 2.2,
          height: 60,
          displayValue: false,
          margin: 0,
        });
      } catch (err) {
        console.error('Failed to render barcode:', err);
      }
    }
  }, [rawIdentCode]);

  // Render Swiss Post Sorting QR code
  useEffect(() => {
    // Official Swiss Post 2D Data payload format
    const qrPayload = `CHPOST|${rawIdentCode}|${recipientData.zip || ''}|${orderNumber}|${serviceData}`;
    QRCode.toDataURL(qrPayload, {
      width: 80,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to render QR:', err));
  }, [rawIdentCode, recipientData.zip, orderNumber, serviceData]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(formattedIdentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center bg-slate-100 min-h-screen p-4 sm:p-6 print:p-0 print:bg-white print:min-h-0">
      {/* 1. Control Toolbar (Hidden on Print) */}
      <div className="w-full max-w-[500px] mb-4 bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-black text-xs">
            +P
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Étiquette Colis Suisse (4×6")</div>
            <div className="text-[10px] text-slate-500">PostPac Priority La Poste</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom / Scale Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setScale(85)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                scale === 85 ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Scale 85% for compact thermal printers"
            >
              85%
            </button>
            <button
              type="button"
              onClick={() => setScale(90)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                scale === 90 ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Scale 90%"
            >
              90%
            </button>
            <button
              type="button"
              onClick={() => setScale(100)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                scale === 100 ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Scale 100% standard A6"
            >
              100%
            </button>
          </div>

          {/* Edit Address Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowEditDrawer(!showEditDrawer)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showEditDrawer ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Modifier le destinataire ou le poids avant impression"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{showEditDrawer ? 'Fermer' : 'Modifier'}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-[#FFCC00] hover:bg-[#F5C400] text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Imprimer</span>
          </button>

          {/* Official Swiss Post API PDF Download (if available) */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Ouvrir le PDF Officiel La Poste Suisse"
            >
              <Download className="w-4 h-4" />
            </a>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 1.1 Collapsible Recipient & Package Editor (Hidden on Print) */}
      {showEditDrawer && (
        <div className="w-full max-w-[500px] mb-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 print:hidden space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Modifier Coordonnées Destinataire & Poids
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Mise à jour en direct</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nom complet / Entreprise</label>
              <input
                type="text"
                value={recipientData.name}
                onChange={(e) => setRecipientData({ ...recipientData, name: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Rue et numéro</label>
              <input
                type="text"
                value={recipientData.street}
                onChange={(e) => setRecipientData({ ...recipientData, street: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">NPA (Code postal)</label>
                <input
                  type="text"
                  value={recipientData.zip}
                  onChange={(e) => setRecipientData({ ...recipientData, zip: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Localité (Ville)</label>
                <input
                  type="text"
                  value={recipientData.city}
                  onChange={(e) => setRecipientData({ ...recipientData, city: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Téléphone (Optionnel)</label>
                <input
                  type="text"
                  value={recipientData.phone || ''}
                  onChange={(e) => setRecipientData({ ...recipientData, phone: e.target.value })}
                  placeholder="+41 79 123 45 67"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Poids colis (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="30"
                  value={weightData}
                  onChange={(e) => setWeightData(Number(e.target.value) || 1.0)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Service Poste</label>
                <select
                  value={serviceData}
                  onChange={(e) => setServiceData(e.target.value as 'PRI' | 'ECO')}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-1 focus:ring-amber-400 outline-none bg-white"
                >
                  <option value="PRI">Priority (PRI)</option>
                  <option value="ECO">Economy (ECO)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Privacy & Anti-Theft Badge Notice (Hidden on Print) */}
      <div className="w-full max-w-[500px] mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800 print:hidden">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Confidentialité & Sécurité :</strong> Aucun nom de produit ni complément n'apparaît sur l'étiquette extérieure.
        </span>
      </div>

      {/* 3. Physical 4×6" A6 Thermal Sticker Container */}
      <div
        id="swiss-post-label"
        style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center' }}
        className="w-[100mm] min-h-[145mm] max-h-[150mm] bg-white border-2 border-black p-4 text-black font-sans box-border shadow-md print:shadow-none print:border-none print:m-0 print:p-2 print:transform-none select-none flex flex-col justify-between"
      >
        {/* --- SECTION A: HEADER & EXPÉDITEUR --- */}
        <div className="border-b-2 border-black pb-3">
          <div className="flex items-start justify-between">
            {/* Swiss Post Logo & Cross */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#FFCC00] border border-black flex items-center justify-center font-black text-black text-base leading-none">
                +P
              </div>
              <div className="font-bold text-sm tracking-tight uppercase leading-none">
                La Poste
              </div>
            </div>

            {/* Franking Info */}
            <div className="text-right text-[11px] font-bold leading-tight">
              <div>PP CH-{sender.zip} Genève</div>
              <div className="text-[9px] font-normal text-neutral-600">Post CH AG</div>
            </div>
          </div>

          {/* Expéditeur / Return Address */}
          <div className="mt-2.5 text-[10px] leading-tight text-neutral-800">
            <span className="font-bold uppercase tracking-wider text-[9px] block text-neutral-500">Expéditeur :</span>
            <div className="font-bold">{sender.name1}</div>
            {sender.name2 && <div>{sender.name2}</div>}
            <div>{sender.street}</div>
            <div className="font-semibold">{sender.zip} {sender.city}</div>
          </div>
        </div>

        {/* --- SECTION B: SERVICE & DESTINATAIRE (CLIENT ADDRESS) --- */}
        <div className="py-4 border-b-2 border-black flex-1 flex flex-col justify-center">
          {/* Service Indicator Badge: PRI (PostPac Priority) */}
          <div className="flex items-center justify-between mb-3">
            <div className="border-2 border-black px-4 py-1.5 font-black text-xl tracking-[0.2em] bg-black text-white inline-block">
              {serviceData === 'PRI' ? 'P R I' : 'E C O'}
            </div>

            <div className="flex items-center gap-2">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Swiss Post 2D Sorting Code"
                  className="w-14 h-14 border border-black p-0.5"
                />
              )}
              <div className="text-[9px] font-bold text-neutral-500 uppercase leading-tight text-right">
                PostPac<br />{serviceData === 'PRI' ? 'Priority' : 'Economy'}<br />pro clima
              </div>
            </div>
          </div>

          {/* Client Destination Address (Highlighted & Large font) */}
          <div className="pl-4 border-l-4 border-black space-y-0.5 my-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-0.5">
              Destinataire :
            </div>
            <div className="font-black text-lg tracking-tight leading-tight text-black">
              {recipientData.name}
            </div>
            <div className="font-bold text-sm text-black">
              {recipientData.street}
            </div>
            <div className="font-black text-base tracking-wide text-black pt-0.5">
              {recipientData.zip} {recipientData.city}
            </div>
            <div className="font-bold text-xs uppercase text-neutral-800">
              {recipientData.country === 'CH' || !recipientData.country ? 'Suisse / Switzerland' : recipientData.country}
            </div>
            {recipientData.phone && (
              <div className="text-[10px] text-neutral-600 pt-1 font-mono">
                Tél : {recipientData.phone}
              </div>
            )}
          </div>
        </div>

        {/* --- SECTION C: BARCODE & TRACKING DETAILS --- */}
        <div className="pt-3">
          {/* Order reference & Package weight (NO PRODUCTS LISTED) */}
          <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-700 mb-1.5">
            <div>
              <span className="text-neutral-500">Réf:</span> <strong className="font-mono text-black">{orderNumber}</strong>
            </div>
            <div>
              <span className="text-neutral-500">Poids:</span> <strong>{weightData.toFixed(2)} kg</strong>
            </div>
          </div>

          {/* Vector Barcode (Code 128) */}
          <div className="flex flex-col items-center justify-center bg-white py-1">
            <svg ref={barcodeSvgRef} className="w-full max-h-16" />
            <div className="font-mono text-xs font-black tracking-widest text-black mt-1">
              {formattedIdentCode}
            </div>
          </div>

          {/* Footer certification */}
          <div className="mt-2 text-center text-[8px] text-neutral-500 uppercase tracking-wider border-t border-neutral-300 pt-1">
            Envoi La Poste Suisse • Licence {process.env.SWISSPOST_FRANKING_LICENSE || '60178154'}
          </div>
        </div>
      </div>

      {/* 4. Tracking Number Quick Copy (Hidden on Print) */}
      <div className="w-full max-w-[500px] mt-4 p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between text-xs print:hidden">
        <div>
          <span className="text-slate-500 text-[11px] block">Numéro de suivi (IdentCode)</span>
          <span className="font-mono font-bold text-slate-900">{formattedIdentCode}</span>
        </div>
        <button
          type="button"
          onClick={handleCopyTracking}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copié !' : 'Copier'}</span>
        </button>
      </div>

      {/* 5. Print Styling Rules */}
      <style jsx global>{`
        @media print {
          @page {
            size: 100mm 150mm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
          }
          header, footer, nav, aside {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
