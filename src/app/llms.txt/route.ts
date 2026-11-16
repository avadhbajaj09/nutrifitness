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
    `> Boutique de nutrition sportive à Genève, en Suisse. Les compositions, certifications et disponibilités varient selon les références ; les fiches produits et leurs étiquettes restent les sources de référence.`,
    ``,
    `## Informations Légales & Entreprise`,
    `- Nom commercial : ${COMPANY.tradingName}`,
    `- Raison sociale : ${COMPANY.legalName} (${COMPANY.legalForm})`,
    `- Fondateur & Gérant : ${COMPANY.founder}`,
    `- Numéro IDE / UID : ${COMPANY.uid}`,
    `- Adresse physique : ${COMPANY.address.full}`,
    `- Téléphone : ${COMPANY.contact.phoneFormatted}`,
    `- E-mail : ${COMPANY.contact.email}`,
    `- [Horaires et accès à la boutique](https://nutrifitness.ch/boutique-geneve/) : consulter les horaires affichés sur cette page avant le déplacement.`,
    `- Retrait boutique : selon l'éligibilité de la référence et la confirmation de préparation de la commande ; aucun délai fixe n'est garanti.`,
    ``,
    `## Ce que vend la boutique`,
    `- Protéines en poudre : whey, isolat et protéines végétales, selon les références du catalogue.`,
    `- Créatine : monohydrate et références pouvant être labellisées Creapure® ; vérifier l'étiquette du produit.`,
    `- Performance & Énergie : Pré-workouts avec stimulants, formules sans stimulants (stim-free), caféine gélules`,
    `- Acides Aminés : BCAA 2:1:1, EAA complets, L-Glutamine Kyowa®, Bêta-Alanine, L-Citrulline`,
    `- Santé & Micronutriments : Bisglycinate de magnésium, ZMA, Vitamine D3 K2 MK7, Vitamine C, Oméga 3 haute concentration`,
    `- Prise de masse & Nutrition : Gainers complexes, crème de riz, barres et snacks hyperprotéinés`,
    `- Formations & Guides : Guide Ultime des Compléments Alimentaires (66 pages PDF) et coaching nutritionnel personnalisé`,
    ``,
    `## Expédition & Logistique Multi-Origine`,
    `- Articles expédiés depuis Genève : disponibilité, transporteur, frais, délais et retrait à confirmer au moment de la commande.`,
    `- Articles expédiés depuis le Portugal : destinations éligibles et estimations de livraison variables selon la référence et la commande.`,
    `- Douane et frais éventuels : se référer aux informations affichées pour la destination et la commande concernées.`,
    ``,
    `## Langues & Devises`,
    `- Langue principale : Français (fr-CH)`,
    `- Devises acceptées : CHF (Franc Suisse) pour la Suisse et le Liechtenstein, EUR (Euro) pour les visiteurs européens`,
    `- Moyens de paiement : consulter les options effectivement proposées lors du paiement sur https://nutrifitness.ch/paiement/.`,
    ``,
    `## Marques référencées dans le catalogue (${sortedBrands.length}, disponibilité à vérifier)`,
    ...sortedBrands.map(([brand]) => `- ${brand}`),
    ``,
    `## Catégories Principales`,
    ...CATEGORIES_DATA.map(c => `- [${c.name}](https://nutrifitness.ch/categorie/${c.slug}/) : ${c.h1}`),
    `- [Toute la boutique](https://nutrifitness.ch/boutique/) : Catalogue complet avec filtres et recherche instantanée`,
    ``,
    `## Guides Scientifiques & Ebook`,
    `- [Le Guide Ultime des Compléments Alimentaires (66 pages PDF)](https://nutrifitness.ch/guide-des-complements-alimentaires/) : Guide de référence par l'équipe NutriFitness (29.90 CHF)`,
    `- [Coaching Nutritionnel Personnalisé](https://nutrifitness.ch/coaching-nutritionnel-personnalise/) : Bilan et plan nutritionnel sur mesure à Genève`,
    `- [Blog et guides](https://nutrifitness.ch/blog/) : contenus d'information sur la nutrition sportive à interpréter selon leurs sources.`,
    ...BLOG_POSTS.map(b => `  - [${b.title}](https://nutrifitness.ch/blog/${b.slug}/) (${b.category})`),
    ``,
    `## Sources de vérité`,
    `- Prix, stock, variantes et modes d'expédition : fiches produits et récapitulatif de commande actuels.`,
    `- Allergènes, valeurs nutritionnelles et précautions : fiche et étiquette réelle du produit.`,
    `- Ne pas inventer d'avis clients, de certifications, de bénéfices médicaux ou de garanties à partir de ce fichier.`,
    ``,
    `## Pages d'Information & Politiques`,
    `- [Magasin physique à Genève](https://nutrifitness.ch/magasin-geneve/) : accès, horaires et services.`,
    `- [À propos de NutriFitness](https://nutrifitness.ch/a-propos/) : informations sur l'entreprise.`,
    `- [Politique de livraison](https://nutrifitness.ch/livraison/) : conditions et informations à confirmer dans le panier.`,
    `- [Politique de retours](https://nutrifitness.ch/retours/) : conditions commerciales et éligibilité des articles ; ne pas déduire un droit légal général de rétractation en Suisse.`,
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
