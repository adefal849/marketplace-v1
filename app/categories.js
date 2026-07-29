// Catégories partagées entre le formulaire produit (dashboard) et le
// filtre par catégorie de l'accueil. `icone` référence un composant de
// lucide-react (voir CategoryIcon.js) plutôt qu'un emoji, pour un rendu
// net et cohérent sur tous les écrans.
export const CATEGORIES = [
  { valeur: "cosmetiques", label: "Cosmétiques", icone: "Sparkles" },
  { valeur: "vetements", label: "Vêtements", icone: "Shirt" },
  { valeur: "chaussures", label: "Chaussures", icone: "Footprints" },
  { valeur: "accessoires", label: "Accessoires", icone: "Gem" },
  { valeur: "electronique", label: "Électronique", icone: "Smartphone" },
  { valeur: "maison", label: "Maison", icone: "Sofa" },
  { valeur: "beaute", label: "Beauté & soins", icone: "Droplet" },
  { valeur: "divertissement", label: "Divertissement", icone: "Gamepad2" },
  { valeur: "alimentation", label: "Alimentation", icone: "UtensilsCrossed" },
  { valeur: "autres", label: "Autres", icone: "Package" },
];

export function labelCategorie(valeur) {
  return CATEGORIES.find((c) => c.valeur === valeur)?.label || null;
}
