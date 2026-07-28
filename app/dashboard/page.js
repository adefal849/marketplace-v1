"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle";

export default function Dashboard() {
  const router = useRouter();
  const [chargementInitial, setChargementInitial] = useState(true);
  const [boutique, setBoutique] = useState(null);
  const [formBoutique, setFormBoutique] = useState({ nom: "", description: "" });
  const [formProduit, setFormProduit] = useState({ nom: "", prix: "", stock: "" });
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    chargerBoutique(token);
  }, [router]);

  async function chargerBoutique(token) {
    const res = await fetch("/api/boutiques/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBoutique(data.boutique);
    setChargementInitial(false);
  }

  async function creerBoutique(e) {
    e.preventDefault();
    setErreur("");
    const token = localStorage.getItem("token");

    const res = await fetch("/api/boutiques", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formBoutique),
    });
    const data = await res.json();

    if (!res.ok) {
      setErreur(data.erreur);
      return;
    }
    setBoutique({ ...data.boutique, produits: [] });
  }

  async function ajouterProduit(e) {
    e.preventDefault();
    setErreur("");
    const token = localStorage.getItem("token");

    const res = await fetch("/api/produits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nom: formProduit.nom,
        prix: Number(formProduit.prix),
        stock: Number(formProduit.stock) || 0,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setErreur(data.erreur);
      return;
    }

    setBoutique({ ...boutique, produits: [...boutique.produits, data.produit] });
    setFormProduit({ nom: "", prix: "", stock: "" });
  }

  if (chargementInitial) {
    return <main className="min-h-screen px-6 py-12">Chargement...</main>;
  }

  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Tableau de bord</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
            className="border border-current px-3 py-1 text-xs"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {!boutique ? (
        <section className="mt-10 max-w-md">
          <h2 className="font-display text-xl">Créez votre boutique</h2>
          <p className="mt-1 text-sm text-muted">
            Votre boutique sera accessible sur /boutique/votre-nom.
          </p>

          <form onSubmit={creerBoutique} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Nom de la boutique
              <input
                required
                className="border border-line px-3 py-2"
                value={formBoutique.nom}
                onChange={(e) => setFormBoutique({ ...formBoutique, nom: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Description
              <textarea
                className="border border-line px-3 py-2"
                value={formBoutique.description}
                onChange={(e) => setFormBoutique({ ...formBoutique, description: e.target.value })}
              />
            </label>

            {erreur && <p className="text-sm">{erreur}</p>}

            <button className="mt-4 border border-ink bg-ink px-4 py-3 text-paper hover:bg-paper hover:text-ink transition-colors">
              Créer ma boutique
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="mt-6">
            <p>
              Boutique : <strong>{boutique.nom}</strong> —{" "}
              <a href={`/boutique/${boutique.slug}`} className="underline" target="_blank">
                /boutique/{boutique.slug}
              </a>
            </p>
          </section>

          <section className="mt-10 max-w-md">
            <h2 className="font-display text-xl">Ajouter un produit</h2>

            <form onSubmit={ajouterProduit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm">
                Nom du produit
                <input
                  required
                  className="border border-line px-3 py-2"
                  value={formProduit.nom}
                  onChange={(e) => setFormProduit({ ...formProduit, nom: e.target.value })}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Prix (FCFA)
                <input
                  required
                  type="number"
                  className="border border-line px-3 py-2"
                  value={formProduit.prix}
                  onChange={(e) => setFormProduit({ ...formProduit, prix: e.target.value })}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Stock
                <input
                  type="number"
                  className="border border-line px-3 py-2"
                  value={formProduit.stock}
                  onChange={(e) => setFormProduit({ ...formProduit, stock: e.target.value })}
                />
              </label>

              {erreur && <p className="text-sm">{erreur}</p>}

              <button className="mt-4 border border-ink bg-ink px-4 py-3 text-paper hover:bg-paper hover:text-ink transition-colors">
                Ajouter le produit
              </button>
            </form>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl">Vos produits ({boutique.produits.length})</h2>
            <ul className="mt-4">
              {boutique.produits.map((p) => (
                <li key={p.id} className="border-b border-line py-3 text-sm">
                  {p.nom} — {p.prix} FCFA — stock : {p.stock}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
