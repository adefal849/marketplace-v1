"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../CartContext";

export default function Panier() {
  const { panier, retirer, changerQuantite, vider, total } = useCart();
  const [form, setForm] = useState({
    clientNom: "",
    clientEmail: "",
    clientTel: "",
  });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [alerteStock, setAlerteStock] = useState("");

  // Revérifie le stock réel dès l'ouverture du panier : le stock a pu
  // changer depuis l'ajout. Le serveur reste la source de vérité finale
  // au moment de la commande, ceci n'est qu'un confort d'affichage.
  useEffect(() => {
    if (panier.length === 0) return;

    const slugs = [...new Set(panier.map((a) => a.boutiqueSlug))];

    (async () => {
      const ajustements = [];

      for (const slug of slugs) {
        try {
          const res = await fetch(`/api/produits?slug=${slug}`);
          if (!res.ok) continue;
          const data = await res.json();
          const produitsBoutique = data.boutique?.produits || [];

          for (const article of panier.filter((a) => a.boutiqueSlug === slug)) {
            const produit = produitsBoutique.find((p) => p.id === article.produitId);

            if (!produit) {
              ajustements.push(`"${article.nom}" n'est plus disponible et a été retiré.`);
              retirer(article.produitId);
            } else if (produit.stock < article.quantite) {
              if (produit.stock === 0) {
                ajustements.push(`"${article.nom}" est en rupture de stock et a été retiré.`);
                retirer(article.produitId);
              } else {
                ajustements.push(
                  `Quantité de "${article.nom}" ajustée à ${produit.stock} (stock disponible).`
                );
                changerQuantite(article.produitId, produit.stock);
              }
            }
          }
        } catch {
          // échec réseau : on laisse le panier tel quel, la vérification
          // définitive se fait de toute façon côté serveur
        }
      }

      if (ajustements.length > 0) setAlerteStock(ajustements.join(" "));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Une commande = une boutique : on regroupe l'affichage par boutique,
  // le split réel se fait côté API au moment de la validation.
  const parBoutique = panier.reduce((groupes, article) => {
    const cle = article.boutiqueId;
    if (!groupes[cle]) {
      groupes[cle] = {
        boutiqueNom: article.boutiqueNom,
        boutiqueSlug: article.boutiqueSlug,
        articles: [],
      };
    }
    groupes[cle].articles.push(article);
    return groupes;
  }, {});

  async function passerCommande(e) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    try {
      const res = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          articles: panier.map((a) => ({
            produitId: a.produitId,
            quantite: a.quantite,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Une erreur est survenue.");
        setEnvoi(false);
        return;
      }

      setConfirmation(data.commandes);
      vider();
    } catch {
      setErreur("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  }

  if (confirmation) {
    return (
      <main className="mx-auto min-h-screen max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl">Commande confirmée</h1>
        <p className="mt-3 text-sm text-muted">
          {confirmation.length > 1
            ? "Votre panier concernait plusieurs boutiques : une commande a été créée pour chacune."
            : "Voici le récapitulatif de votre commande."}
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {confirmation.map((c) => (
            <li key={c.id} className="border border-line p-4 text-sm">
              <p className="font-display">{c.boutiqueNom}</p>
              <p className="mt-1 text-muted">
                Commande n° {c.id.slice(-8)} — {c.total} FCFA
              </p>
            </li>
          ))}
        </ul>
        <Link href="/" className="mt-8 inline-block underline">
          Retour à l'accueil
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 py-12">
      <Link href="/" className="text-sm hover:underline">
        ← Continuer mes achats
      </Link>
      <h1 className="mt-4 font-display text-3xl">Votre panier</h1>

      {alerteStock && (
        <p className="mt-4 border border-line bg-line/20 p-3 text-sm">{alerteStock}</p>
      )}

      {panier.length === 0 ? (
        <p className="mt-6 text-muted">Votre panier est vide.</p>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-8">
            {Object.values(parBoutique).map((groupe) => (
              <section key={groupe.boutiqueSlug} className="border border-line p-4">
                <h2 className="font-display text-lg">{groupe.boutiqueNom}</h2>
                <ul className="mt-3 flex flex-col gap-3">
                  {groupe.articles.map((a) => (
                    <li
                      key={a.produitId}
                      className="flex items-center justify-between gap-3 border-b border-line pb-3 text-sm"
                    >
                      <div>
                        <p>{a.nom}</p>
                        <p className="text-muted">{a.prix} FCFA</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={a.quantite}
                          onChange={(e) =>
                            changerQuantite(a.produitId, Number(e.target.value))
                          }
                          className="w-14 border border-line px-2 py-1 text-center"
                        />
                        <button
                          onClick={() => retirer(a.produitId)}
                          className="text-xs underline"
                        >
                          Retirer
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <p className="mt-6 text-right font-display text-xl">
            Total : {total} FCFA
          </p>

          <form
            onSubmit={passerCommande}
            className="mt-8 flex flex-col gap-4 border-t border-line pt-8"
          >
            <h2 className="font-display text-lg">Vos coordonnées</h2>
            <label className="flex flex-col gap-1 text-sm">
              Nom complet
              <input
                required
                className="border border-line px-3 py-2"
                value={form.clientNom}
                onChange={(e) => setForm({ ...form, clientNom: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Email
              <input
                required
                type="email"
                className="border border-line px-3 py-2"
                value={form.clientEmail}
                onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Téléphone
              <input
                className="border border-line px-3 py-2"
                value={form.clientTel}
                onChange={(e) => setForm({ ...form, clientTel: e.target.value })}
              />
            </label>

            {erreur && <p className="text-sm">{erreur}</p>}

            <button
              disabled={envoi}
              className="mt-2 border border-ink bg-ink px-4 py-3 text-paper transition-colors hover:bg-paper hover:text-ink disabled:opacity-50"
            >
              {envoi ? "Envoi..." : "Passer la commande"}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
