import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  FileText, 
  Truck, 
  CreditCard, 
  RotateCcw, 
  ShieldCheck, 
  Scale, 
  Lock, 
  Building, 
  MapPin, 
  ArrowLeft 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente (CGV) | NutriFitness.ch Genève',
  description: 'Conditions générales de vente de NutriFitness (NutriFit Genève). Règles de commande, livraison 24h en Suisse, paiement TWINT, droit de rétractation 14 jours.',
  alternates: {
    canonical: 'https://nutrifitness.ch/cgv/',
  }
};

export default function CGVPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-[#F80404] font-bold">Conditions Générales de Vente</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F80404]/15 border border-[#F80404]/30 text-[#F80404] text-xs font-black uppercase tracking-wider mb-3 font-heading">
          <Scale className="w-3.5 h-3.5" />
          Droit Suisse Applicable (Code des Obligations)
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-heading tracking-tight leading-tight">
          Conditions Générales de <span className="text-[#F80404]">Vente (CGV)</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-2">
          Applicables à l&apos;ensemble des commandes passées sur nutrifitness.ch pour la Suisse et le Liechtenstein. Dernière mise à jour : 2026.
        </p>
      </header>

      {/* Main Articles */}
      <div className="space-y-8 text-xs sm:text-sm text-white/80 leading-relaxed">
        
        {/* Article 1: Champ d'application & Identification */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Building className="w-5 h-5 text-[#F80404]" />
            <h2>Article 1 — Champ d&apos;Application & Identification de l&apos;Entreprise</h2>
          </div>
          <p>
            Les présentes Conditions Générales de Vente (ci-après « <strong>CGV</strong> ») régissent l&apos;ensemble des relations contractuelles entre la boutique en ligne <strong>nutrifitness.ch</strong>, exploitée par l&apos;entreprise individuelle <strong>NutriFit</strong> (ci-après « <strong>NutriFitness</strong> »), et toute personne physique ou morale (ci-après « <strong>le Client</strong> ») passant commande sur le site.
          </p>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1 text-xs">
            <p className="text-white font-bold">NutriFit (NutriFitness)</p>
            <p>Fondateur & Gérant : Marco Scarpantoni</p>
            <p className="flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#F80404] shrink-0" />
              <span>Rue des Pâquis 34, 1201 Genève, Suisse</span>
            </p>
            <p>Téléphone : +41 79 250 35 64 | E-mail : info@nutrifitness.ch</p>
          </div>
          <p className="text-xs text-white/60">
            Toute validation de commande implique l&apos;acceptation sans réserve des présentes CGV par le Client.
          </p>
        </section>

        {/* Article 2: Produits & Conformité Sanitaire */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <ShieldCheck className="w-5 h-5 text-[#95d600]" />
            <h2>Article 2 — Produits & Conformité Légale Suisse</h2>
          </div>
          <p>
            Les produits proposés à la vente (protéines en poudre, créatines, acides aminés, vitamines, minéraux, compléments de santé sportive, ebooks numériques et accessoires) sont décrits avec la plus grande exactitude possible.
          </p>
          <p>
            NutriFitness certifie que tous les compléments alimentaires distribués sur son site sont strictement conformes à la législation helvétique en vigueur :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-white/70">
            <li>Loi fédérale sur les denrées alimentaires et les objets usuels (LDAp).</li>
            <li>Ordonnance du DFI sur les compléments alimentaires (OCAl).</li>
            <li>Directives de l&apos;Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV).</li>
          </ul>
          <p className="text-xs text-white/60">
            Les compléments alimentaires ne doivent pas être utilisés comme substituts d&apos;une alimentation variée et équilibrée et d&apos;un mode de vie sain. Tenir hors de portée des enfants.
          </p>
        </section>

        {/* Article 3: Prix & TVA Suisse */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <FileText className="w-5 h-5 text-[#F80404]" />
            <h2>Article 3 — Prix en Francs Suisses & TVA</h2>
          </div>
          <p>
            Tous les prix affichés sur nutrifitness.ch sont exprimés en <strong>Francs Suisses (CHF)</strong>, toutes taxes comprises (TTC).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-white/70">
            <li><strong>Taux réduit de TVA suisse à 2.6 %</strong> applicable aux compléments alimentaires et denrées alimentaires.</li>
            <li><strong>Taux normal de TVA suisse à 8.1 %</strong> applicable aux accessoires, shakers et équipements.</li>
          </ul>
          <p className="text-xs text-white/70">
            Aucun frais de douane ou taxe d&apos;importation imprévue n&apos;est facturé au Client résident en Suisse ou au Liechtenstein, nos stocks étant physiquement situés à Genève.
          </p>
        </section>

        {/* Article 4: Commande & Conclusion du Contrat */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Lock className="w-5 h-5 text-[#F80404]" />
            <h2>Article 4 — Commande & Validation</h2>
          </div>
          <p>
            Le processus de commande comprend les étapes suivantes :
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-xs text-white/70">
            <li>Sélection des articles et ajout au panier en ligne.</li>
            <li>Vérification du panier et choix du mode de livraison (PostPac Priority ou Click & Collect Genève).</li>
            <li>Saisie des coordonnées de facturation et de livraison en Suisse.</li>
            <li>Choix du moyen de paiement sécurisé.</li>
            <li>Confirmation définitive et paiement de la commande.</li>
          </ol>
          <p className="text-xs text-white/60">
            Le contrat de vente est valablement conclu dès réception du paiement et envoi de l&apos;e-mail de confirmation de commande automatique au Client.
          </p>
        </section>

        {/* Article 5: Moyens de Paiement Suisses */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <CreditCard className="w-5 h-5 text-[#95d600]" />
            <h2>Article 5 — Modalités de Paiement Sécurisé</h2>
          </div>
          <p>
            NutriFitness propose des solutions de paiement adaptées au marché suisse, intégralement sécurisées par cryptage SSL/TLS :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="font-bold text-white block">TWINT 🇨🇭</span>
              <span className="text-white/60">Paiement instantané par application mobile suisse.</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="font-bold text-white block">PostFinance E-Finance & Card</span>
              <span className="text-white/60">Paiement direct sécurisé pour les titulaires de compte jaune.</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="font-bold text-white block">Cartes Bancaires</span>
              <span className="text-white/60">Visa, Mastercard, American Express via processeur sécurisé 3D-Secure.</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="font-bold text-white block">Apple Pay & Google Pay</span>
              <span className="text-white/60">Règlement ultra-rapide sur smartphone et navigateur compatible.</span>
            </div>
          </div>
        </section>

        {/* Article 6: Expédition & Livraison 24h */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <Truck className="w-5 h-5 text-[#F80404]" />
            <h2>Article 6 — Livraison & Délais d&apos;Expédition</h2>
          </div>
          <p>
            Les colis sont préparés et expédiés depuis notre entrepôt et magasin de Genève :
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-white/70">
            <li>
              <strong>PostPac Priority (La Poste Suisse) :</strong> Livraison en <strong>24 heures ouvrées</strong> pour toute commande validée avant 14h00 du lundi au vendredi.
            </li>
            <li>
              <strong>Frais de port offerts :</strong> La livraison est <strong>GRATUITE en Suisse et Liechtenstein dès CHF 75.– d&apos;achats</strong>. Pour les commandes inférieures, une participation forfaitaire de CHF 7.90 est appliquée.
            </li>
            <li>
              <strong>Click & Collect 2h :</strong> Retrait gratuit à la boutique NutriFitness (34 Rue des Pâquis, 1201 Genève) sous 2 heures pendant les horaires d&apos;ouverture.
            </li>
          </ul>
        </section>

        {/* Article 7: Droit de Rétractation & Retours */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <RotateCcw className="w-5 h-5 text-[#F80404]" />
            <h2>Article 7 — Droit de Rétractation & Retours (14 Jours)</h2>
          </div>
          <p>
            Conformément à la politique commerciale de NutriFitness et aux standards du commerce électronique suisse :
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-white/70">
            <li>
              Le Client dispose d&apos;un délai de <strong>14 jours calendaires</strong> à compter de la date de réception du colis pour notifier sa volonté de retourner un article.
            </li>
            <li>
              <strong>Conditions strictes de conformité :</strong> Pour des raisons évidentes de protection de la santé et d&apos;hygiène, les compléments alimentaires doivent impérativement être retournés <strong>intacts, non ouverts, non utilisés</strong>, dans leur emballage d&apos;origine scellé et avec leur opercule de sécurité intact.
            </li>
            <li>
              Tout produit ouvert, consommé partiellement ou endommagé ne pourra faire l&apos;objet d&apos;aucun remboursement.
            </li>
            <li>
              Les frais de retour postal sont à la charge exclusive du Client, sauf erreur imputable à NutriFitness ou produit avéré défectueux.
            </li>
          </ul>
          <p className="text-xs text-white/60">
            Consultez notre <Link href="/retours/" className="text-[#F80404] underline hover:text-[#FF3D00]">Politique de Retour & Remboursement</Link> complète pour connaître la procédure étape par étape.
          </p>
        </section>

        {/* Article 8: Produits Numériques (Ebooks) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-white font-heading font-black text-lg uppercase">
            <FileText className="w-5 h-5 text-[#95d600]" />
            <h2>Article 8 — Produits Numériques Téléchargeables (Ebooks PDF)</h2>
          </div>
          <p>
            Les guides et ebooks téléchargeables (notamment le <em>Guide des Compléments Alimentaires</em>) sont des produits numériques immatériels.
          </p>
          <p className="text-xs text-white/70">
            Le droit de rétractation ne peut être exercé une fois que le lien de téléchargement ou d&apos;accès au document a été mis à disposition du Client, conformément aux usages applicables aux contenus numériques personnalisés. Tout achat d&apos;ebook est donc définitif et non remboursable dès sa livraison numérique.
          </p>
        </section>

        {/* Article 9: Réclamations & Colis Endommagés */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <h2 className="text-white font-heading font-black text-lg uppercase">Article 9 — Réclamations & Avaries de Transport</h2>
          <p>
            Le Client est tenu de vérifier l&apos;état du colis dès sa livraison par La Poste Suisse. En cas de colis visiblement détérioré ou de produit endommagé pendant le transport, le Client doit impérativement :
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-xs text-white/70">
            <li>Prendre des photos nettes du colis externe et des produits endommagés.</li>
            <li>Notifier le service client sous <strong>14 jours</strong> à l&apos;adresse <strong>support@nutrifitness.ch</strong> en joignant le numéro de commande et les photographies.</li>
          </ol>
          <p className="text-xs text-white/60">
            Après vérification, NutriFitness procédera soit à la réexpédition gratuite d&apos;un produit de remplacement neuf, soit à son remboursement complet.
          </p>
        </section>

        {/* Article 10: Protection des Données (nDSG) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <h2 className="text-white font-heading font-black text-lg uppercase">Article 10 — Protection des Données Personnelles</h2>
          <p>
            NutriFitness traite l&apos;ensemble des données personnelles du Client dans le strict respect de la <strong>Loi fédérale sur la protection des données (nDSG suisse)</strong> révisée.
          </p>
          <p className="text-xs text-white/60">
            Les données ne sont ni vendues ni louées à des tiers. Pour en savoir plus, consultez notre <Link href="/protection-donnees/" className="text-[#F80404] underline hover:text-[#FF3D00]">Politique de Protection des Données</Link>.
          </p>
        </section>

        {/* Article 11: Droit Applicable & For Juridique */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-3">
          <h2 className="text-white font-heading font-black text-lg uppercase">Article 11 — Droit Applicable & For Juridique</h2>
          <p>
            Toutes les relations contractuelles entre NutriFitness et le Client sont exclusivement régies par le <strong>droit matériel suisse</strong>, à l&apos;exclusion de la Convention des Nations Unies sur les contrats de vente internationale de marchandises (CVIM / Convention de Vienne).
          </p>
          <p className="text-xs text-white/60">
            En cas de litige qui ne pourrait être résolu à l&apos;amiable, le for juridique exclusif est situé au siège de l&apos;entreprise, auprès des <strong>tribunaux compétents du Canton de Genève, Suisse</strong>.
          </p>
        </section>

      </div>

      {/* Navigation Footer */}
      <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-bold">
          <Link href="/mentions-legales/" className="text-white/60 hover:text-white transition-colors">
            Mentions Légales
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/protection-donnees/" className="text-[#F80404] hover:underline">
            Protection des Données (nDSG) →
          </Link>
        </div>
      </div>

    </div>
  );
}
