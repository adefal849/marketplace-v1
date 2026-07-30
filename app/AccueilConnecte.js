"use client";

import { useEffect } from "react";

// Un vendeur déjà connecté n'a plus besoin de revoir l'argumentaire
// marketing à chaque fois qu'il appuie sur "Accueil" : on saute
// directement à la liste des boutiques.
export default function AccueilConnecte() {
  useEffect(() => {
    if (localStorage.getItem("token")) {
      document.getElementById("boutiques")?.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  return null;
}
