"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "./DashboardHeader";
import { CATEGORIES } from "../categories";
import { TrendingUp } from "lucide-react";
import UploadMedia from "../UploadMedia";

export default function Dashboard() {
  const router = useRouter();
  const [chargementInitial, setChargementInitial] = useState(true);
  const [boutique, setBoutique] = useState(null);
  const [formBoutique, setFormBoutique] = useState({ nom: "", description: "" });
  const [formProduit, setFormProduit] = useState({ nom: "", prix: "", stock: "", categorie: "", imageUrl: "" });
  const [erreur, setErreur] = useState("");
  const [formOuvert, setFormOuvert] = useState(false);
  const [lienCopie, setLienCopie] = useState(false);
  const [commandesEnAttente, setCommandesEnAttente] = useState(0);
  const [messagesNonLus, setMessagesNonLus] = useState(0);
  const [tendances, setTendances] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    chargerBoutique(token);
    chargerCommandes(token);
    chargerMessages(token);
  }, [router]);

  async function chargerMessages(token) {
    try {
      const res = await fetch("/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const total = (data.conversations || []).reduce((s, c) => s + c.nonLus, 0);
      setMessagesNonLus(total);
    } catch {
      // silencieux
    }
  }

  // Une seule requête sert à la fois le badge "en attente" et le
  // classement des produits qui se vendent le mieux (tendances).
  async function chargerCommandes(token) {
    try {
      const res = await fetch("/api/commandes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const commandes = data.commandes || [];

      setCommandesEnAttente(commandes.filter((c) => c.statut === "EN_ATTENTE").length);

      const ventesParProduit = new Map();
      for (const commande of commandes) {
        for (const ligne of commande.lignes || []) {
          const nom = ligne.produit?.nom || "Produit supprimé";
          ventesParProduit.set(nom, (ventesParProduit.get(nom) || 0) + ligne.quantite);
        }
      }
      const classement = [...ventesParProduit.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([nom, quantite]) => ({ nom, quantite }));
      setTendances(classement);
    } catch {
      // silencieux : badge et tendances restent vides
    }
  }

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
        categorie: formProduit.categorie || null,
        imageUrl: formProduit.imageUrl || null,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setErreur(data.erreur);
      return;
    }

    setBoutique({ ...boutique, produits: [...boutique.produits, data.produit] });
    setFormProduit({ nom: "", prix: "", stock: "", categorie: "", imageUrl: "" });
    setFormOuvert(false);
  }

  function copierLien() {
    const url = `${window.location.origin}/boutique/${boutique.slug}`;
    navigator.clipboard.writeText(url);
    setLienCopie(true);
    setTimeout(() => setLienCopie(false), 2000);
  }

  if (chargementInitial) {
    return <main className="min-h-screen px-6 py-12">Chargement...</main>;
  }

  return (
    <main className="min-h-screen">
      <DashboardHeader
        actif="dashboard"
        commandesEnAttente={commandesEnAttente}
        messagesNonLus={messagesNonLus}
        boutiqueSlug={boutique?.slug}
      />

      <div className="px-6 py-8 md:px-12">
        {!boutique ? (
          <section className="max-w-md">
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
            {/* Boutique + lien à copier + tendances, sur une même ligne compacte */}
            <div className="flex flex-col gap-4 md:flex-row">
              <section className="flex flex-wrap items-center gap-3 border border-line p-4 md:flex-1">
                <div>
                  <p className="text-sm text-muted">Votre boutique</p>
                  <p className="font-display text-lg">{boutique.nom}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <a href={`/boutique/${boutique.slug}`} target="_blank" className="text-sm underline">
                    /boutique/{boutique.slug}
                  </a>
                  <button onClick={copierLien} className="border border-current px-3 py-1 text-xs">
                    {lienCopie ? "Copié !" : "Copier le lien"}
                  </button>
                </div>
              </section>

              {tendances.length > 0 && (
                <section className="border border-line p-4 md:w-64">
                  <p className="flex items-center gap-1.5 text-sm text-muted">
                    <TrendingUp size={14} /> Tendances
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 text-sm">
                    {tendances.map((t, i) => (
                      <li key={t.nom} className="flex justify-between gap-2">
                        <span className="truncate">{i + 1}. {t.nom}</span>
                        <span className="text-muted">{t.quantite} vendus</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Bouton pour déplier le formulaire d'ajout de produit */}
            <section className="mt-6 max-w-md">
              <button
                onClick={() => setFormOuvert(!formOuvert)}
                className="w-full border border-ink px-4 py-3 text-left font-display text-lg"
              >
                {formOuvert ? "− Fermer" : "+ Ajouter un produit"}
              </button>

              {formOuvert && (
                <form onSubmit={ajouterProduit} className="mt-4 flex flex-col gap-4 border border-line p-4">
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
                    Catégorie
                    <select
                      className="border border-line px-3 py-2"
                      value={formProduit.categorie}
                      onChange={(e) => setFormProduit({ ...formProduit, categorie: e.target.value })}
                    >
                      <option value="">Sans catégorie</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.valeur} value={c.valeur}>
                          {c.label}
                        </option>
                      ))}
                    </select>
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

                  <UploadMedia
                    onUploaded={(url) => setFormProduit({ ...formProduit, imageUrl: url })}
                  />
                  {formProduit.imageUrl && (
                    <p className="text-xs text-muted">Fichier envoyé ✓</p>
                  )}

                  {erreur && <p className="text-sm">{erreur}</p>}

                  <button className="mt-2 border border-ink bg-ink px-4 py-3 text-paper hover:bg-paper hover:text-ink transition-colors">
                    Ajouter le produit
                  </button>
                </form>
              )}
            </section>

            {/* Liste des produits */}
            <section className="mt-8">
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
      </div>
    </main>
  );
}
