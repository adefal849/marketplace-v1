"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [panier, setPanier] = useState([]);
  const [pret, setPret] = useState(false);

  // Charger le panier sauvegardé au premier rendu (client uniquement)
  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem("panier");
      if (sauvegarde) setPanier(JSON.parse(sauvegarde));
    } catch {
      // panier corrompu : on repart d'un panier vide
    }
    setPret(true);
  }, []);

  // Sauvegarder à chaque changement, une fois le chargement initial fait
  // (évite d'écraser le panier sauvegardé avec le tableau vide du premier rendu)
  useEffect(() => {
    if (pret) localStorage.setItem("panier", JSON.stringify(panier));
  }, [panier, pret]);

  function ajouter(produit, boutique, quantite = 1) {
    setPanier((actuel) => {
      const existant = actuel.find((a) => a.produitId === produit.id);
      if (existant) {
        return actuel.map((a) =>
          a.produitId === produit.id
            ? { ...a, quantite: a.quantite + quantite }
            : a
        );
      }
      return [
        ...actuel,
        {
          produitId: produit.id,
          nom: produit.nom,
          prix: produit.prix,
          imageUrl: produit.imageUrl || null,
          boutiqueId: boutique.id,
          boutiqueNom: boutique.nom,
          boutiqueSlug: boutique.slug,
          quantite,
        },
      ];
    });
  }

  function retirer(produitId) {
    setPanier((actuel) => actuel.filter((a) => a.produitId !== produitId));
  }

  function changerQuantite(produitId, quantite) {
    if (quantite < 1) {
      retirer(produitId);
      return;
    }
    setPanier((actuel) =>
      actuel.map((a) => (a.produitId === produitId ? { ...a, quantite } : a))
    );
  }

  function vider() {
    setPanier([]);
  }

  const nombreArticles = panier.reduce((total, a) => total + a.quantite, 0);
  const total = panier.reduce((total, a) => total + a.prix * a.quantite, 0);

  return (
    <CartContext.Provider
      value={{
        panier,
        ajouter,
        retirer,
        changerQuantite,
        vider,
        nombreArticles,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const contexte = useContext(CartContext);
  if (!contexte) {
    throw new Error("useCart doit être utilisé à l'intérieur d'un CartProvider");
  }
  return contexte;
}
