'use client';

import { CartItem } from '@/context/StoreContext';

interface Props {
  cartItems: CartItem[];
  countryCode: string;
}

export function CartShipmentGroups({ cartItems, countryCode }: Props) {
  const portugalItems = cartItems.filter(item => item.isPortugal === true);
  const genevaItems = cartItems.filter(item => item.isPortugal !== true);

  if (cartItems.length === 0) return null;

  const isMixed = portugalItems.length > 0 && genevaItems.length > 0;

  if (!isMixed) {
    const isPt = portugalItems.length > 0;
    return (
      <div className={`p-4 rounded-xl border mb-6 text-sm ${
        isPt ? 'bg-blue-900/10 border-blue-900/30 border-l-4 border-l-blue-500' : 'bg-green-900/10 border-green-900/30 border-l-4 border-l-green-500'
      }`}>
        <h3 className="font-bold text-white flex items-center gap-2">
          <span>{isPt ? '🇵🇹' : '🇨🇭'}</span>
          <span>Expédié depuis {isPt ? 'le Portugal' : 'Genève'}</span>
        </h3>
        <p className="text-gray-400 mt-1">Tous vos articles seront envoyés dans un seul colis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <h3 className="font-bold text-white text-lg">Vos envois ({cartItems.length} articles)</h3>
      <p className="text-sm text-gray-400">Vos articles seront expédiés depuis différents entrepôts.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Geneva Group */}
        <div className="p-4 bg-[#141414] rounded-xl border border-white/10 border-l-4 border-l-green-500 text-sm">
          <h4 className="font-bold text-white flex items-center gap-2 mb-2">
            <span>🇨🇭</span>
            <span>Expédié depuis Genève</span>
          </h4>
          <p className="text-gray-400 mb-2">{genevaItems.length} article(s)</p>
          <div className="bg-black/20 rounded p-2 text-gray-300 space-y-1">
            <p>Livraison estimée: 1–3 jours ouvrables</p>
          </div>
        </div>

        {/* Portugal Group */}
        <div className="p-4 bg-[#141414] rounded-xl border border-white/10 border-l-4 border-l-blue-500 text-sm">
          <h4 className="font-bold text-white flex items-center gap-2 mb-2">
            <span>🇵🇹</span>
            <span>Expédié depuis le Portugal</span>
          </h4>
          <p className="text-gray-400 mb-2">{portugalItems.length} article(s)</p>
          <div className="bg-black/20 rounded p-2 text-gray-300 space-y-1">
            <p>Livraison estimée: 3–7 jours ouvrables</p>
          </div>
        </div>
      </div>
    </div>
  );
}
