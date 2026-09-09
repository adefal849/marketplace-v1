// Catalogue des plans Find Your Shop. C'est la seule source de vérité pour
// les prix/limites : /api/abonnement s'en sert pour créer/mettre à jour la
// ligne Plan correspondante en base au moment du premier achat.
export const PLANS = [
  {
    code: "GRATUIT",
    nom: "Gratuit",
    prix: 0,
    maxBoutiques: 1,
    maxProduits: 20, // par boutique
    assistantIA: false,
    statsAvancees: false,
    badgePremium: false,
  },
  {
    code: "PRO",
    nom: "Pro",
    prix: 5000, // FCFA / mois
    maxBoutiques: 4,
    maxProduits: null, // illimité
    assistantIA: true,
    statsAvancees: true,
    badgePremium: true,
  },
  {
    code: "BUSINESS",
    nom: "Business",
    prix: 15000, // FCFA / mois
    maxBoutiques: null, // illimité
    maxProduits: null,
    assistantIA: true,
    statsAvancees: true,
    badgePremium: true,
  },
];

export function trouverPlan(code) {
  return PLANS.find((p) => p.code === code) || null;
}
