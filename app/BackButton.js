"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Bouton retour large et facile à toucher au pouce, utilisé en haut des
// pages "profondes" (panier, connexion, boutique...) pour naviguer sans
// avoir à utiliser le bouton retour du téléphone.
// - `secours` : lien utilisé si l'historique du navigateur est vide
//   (ex: arrivée directe sur la page via un lien partagé).
export default function BackButton({ secours = "/", texte = "Retour" }) {
  const router = useRouter();

  function revenir() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(secours);
    }
  }

  return (
    <button
      onClick={revenir}
      className="mb-4 flex items-center gap-2 border border-line px-3 py-2 text-sm active:bg-line/20"
    >
      <ArrowLeft size={16} /> {texte}
    </button>
  );
}
