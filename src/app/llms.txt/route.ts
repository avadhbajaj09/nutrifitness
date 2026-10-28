import { NextResponse } from 'next/server';
import { COMPANY } from '@/lib/company';
import { CATEGORIES_DATA } from '@/lib/categories';
import { BLOG_POSTS } from '@/lib/blog';
import { PRODUCTS } from '@/lib/catalog';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const brandMap = new Map<string, number>();
  for (const p of PRODUCTS) {
    if (p.brand) {
      brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
    }
  }
  const sortedBrands = Array.from(brandMap.entries()).sort((a, b) => b[1] - a[1]);

  const lines: string[] = [
    `# NutriFitness — Documentation & Informations Clés`,
    ``,
    `> Boutique suisse indépendante de nutrition sportive haut de gamme, basée à Genève et en ligne sur nutrifitness.ch. Spécialisée en protéines pures (whey isolate, concentrée, végétales), créatines labellisées (Creapure®), acides aminés, pré-workouts, vitamines et minéraux conformes aux normes suisses OSAV / DFI.`,
    ``,
    `## Informations Légales & Entreprise`,
    `- Nom commercial : ${COMPANY.tradingName}`,
    `- Raison sociale : ${COMPANY.legalName} (${COMPANY.legalForm})`,
    `- Fondateur & Gérant : ${COMPANY.founder}`,
    `- Numéro IDE / UID : ${COMPANY.uid}`,
    `- Adresse physique : ${COMPANY.address.full}`,
    `- Téléphone : ${COMPANY.contact.phoneFormatted}`,
    `- E-mail : ${COMPANY.contact.email}`,
    `- Horaires boutique : Lundi - Vendredi : 12h30 - 19h00 | Samedi : 12h00 - 17h00 | Dimanche : Fermé`,
    `- Retrait boutique : Click & Collect disponible en 2h à la Rue des Pâquis 34, 1201 Genève`,
    ``,
    `## Ce que vend la boutique`,
    `- Protéines en poudre : Whey Isolate CFM, Whey Concentrée, Protéines Végétales (pois, riz, soja), Protéines Clear`,
    `- Créatine : Créatine Monohydrate 100% pure, Créatine Creapure® labellisée, créatine aromatisée`,
    `- Performance & Énergie : Pré-workouts avec stimulants, formules sans stimulants (stim-free), caféine gélules`,
    `- Acides Aminés : BCAA 2:1:1, EAA complets, L-Glutamine Kyowa®, Bêta-Alanine, L-Citrulline`,
    `- Santé & Micronutriments : Bisglycinate de magnésium, ZMA, Vitamine D3 K2 MK7, Vitamine C, Oméga 3 haute concentration`,
    `- Prise de masse & Nutrition : Gainers complexes, crème de riz, barres et snacks hyperprotéinés`,
    `- Formations & Guides : Guide Ultime des Compléments Alimentaires (66 pages PDF) et coaching nutritionnel personnalisé`,
    ``,
    `## Expédition & Logistique Multi-Origine`,
    `- Articles expédiés depuis la Suisse (Genève) : Expédition prioritaire en 1 à 2 jours ouvrables via La Poste Suisse (PostPac Priority). Livraison gratuite dès 75 CHF d'achat en Suisse et Liechtenstein. Retrait Click & Collect immédiat à Genève.`,
    `- Articles expédiés depuis l'usine (Portugal) : Gammes partenaires expédiées directement depuis le Portugal vers toute l'Europe (3 à 7 jours) et la Suisse (4 à 8 jours) avec suivi transporteur international.`,
    `- Douane : Aucun frais de douane caché pour les résidents suisses sur les commandes boutique.`,
    ``,
    `## Langues & Devises`,
    `- Langue principale : Français (fr-CH)`,
    `- Devises acceptées : CHF (Franc Suisse) pour la Suisse et le Liechtenstein, EUR (Euro) pour les visiteurs européens`,
    `- Moyens de paiement : TWINT (Suisse), PostFinance, Cartes de crédit (Visa, Mastercard), Virement bancaire, Paiement au retrait magasin`,
    ``,
    `## Marques Disponibles (${sortedBrands.length} marques)`,
    ...sortedBrands.map(([brand, count]) => `- ${brand} (${count} produit${count > 1 ? 's' : ''})`),
    ``,
    `## Catégories Principales`,
    ...CATEGORIES_DATA.map(c => `- [${c.name}](https://nutrifitness.ch/categorie/${c.slug}/) : ${c.h1}`),
    `- [Toute la boutique](https://nutrifitness.ch/boutique/) : Catalogue complet avec filtres et recherche instantanée`,
    ``,
    `## Guides Scientifiques & Ebook`,
    `- [Le Guide Ultime des Compléments Alimentaires (66 pages PDF)](https://nutrifitness.ch/guide-des-complements-alimentaires/) : Guide de référence par l'équipe NutriFitness (29.90 CHF)`,
    `- [Coaching Nutritionnel Personnalisé](https://nutrifitness.ch/coaching-nutritionnel-personnalise/) : Bilan et plan nutritionnel sur mesure à Genève`,
    `- [Blog & Guides d'Experts](https://nutrifitness.ch/blog/) : 20 dossiers scientifiques complets`,
    ...BLOG_POSTS.map(b => `  - [${b.title}](https://nutrifitness.ch/blog/${b.slug}/) (${b.category})`),
    ``,
    `## Pages d'Information & Politiques`,
    `- [Magasin physique à Genève](https://nutrifitness.ch/magasin-geneve/) : Accès, plan et services en boutique`,
    `- [À Propos de NutriFitness](https://nutrifitness.ch/a-propos/) : Histoire de la marque depuis 2015 et fondateur`,
    `- [Politique de Livraison](https://nutrifitness.ch/livraison/) : Délais, transporteurs et gratuité dès 75 CHF`,
    `- [Politique de Retours & Rétractation](https://nutrifitness.ch/retours/) : 14 jours de rétractation conforme au droit suisse`,
    `- [Moyens de Paiement](https://nutrifitness.ch/paiement/) : TWINT, PostFinance et cartes sécurisées`,
    `- [Contact & Support](https://nutrifitness.ch/contact/) : Formulaire, téléphone direct et e-mail`,
    `- [Foire Aux Questions (FAQ)](https://nutrifitness.ch/faq/) : Réponses aux questions fréquentes`,
    `- [Conditions Générales de Vente (CGV)](https://nutrifitness.ch/cgv/) : Conditions officielles de vente`,
    `- [Protection des Données (nDSG)](https://nutrifitness.ch/protection-donnees/) : Respect de la loi fédérale suisse sur la protection des données`,
    `- [Gestion des Cookies](https://nutrifitness.ch/cookies/) : Politique et paramétrage des témoins de connexion`,
  ];

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    },
  });
}
