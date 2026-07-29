// Catégories partagées entre le formulaire produit (dashboard) et le
// filtre par catégorie de l'accueil. Simple liste statique : pas besoin
// d'une table dédiée pour l'instant, un champ texte suffit sur Produit.
export const CATEGORIES = [
  { valeur: "cosmetiques", label: "Cosmétiques", emoji: "💄" },
  { valeur: "vetements", label: "Vêtements", emoji: "👗" },
  { valeur: "chaussures", label: "Chaussures", emoji: "👠" },
  { valeur: "accessoires", label: "Accessoires", emoji: "👜" },
  { valeur: "electronique", label: "Électronique", emoji: "📱" },
  { valeur: "maison", label: "Maison", emoji: "🛋️" },
  { valeur: "beaute", label: "Beauté & soins", emoji: "🧴" },
  { valeur: "divertissement", label: "Divertissement", emoji: "🎮" },
  { valeur: "alimentation", label: "Alimentation", emoji: "🍲" },
  { valeur: "autres", label: "Autres", emoji: "📦" },
];

export function labelCategorie(valeur) {
  return CATEGORIES.find((c) => c.valeur === valeur)?.label || null;
}
