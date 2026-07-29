import * as Icons from "lucide-react";

// Permet de stocker le nom de l'icône comme simple chaîne (dans
// categories.js) et de la résoudre en composant au rendu.
export default function CategoryIcon({ nom, ...props }) {
  const Icone = Icons[nom] || Icons.Package;
  return <Icone {...props} />;
}
