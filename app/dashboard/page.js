"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "./DashboardHeader";
import { CATEGORIES } from "../categories";
import { TrendingUp, Sparkles, X, Store, Bell, Palette, Plus } from "lucide-react";
import UploadMedia from "../UploadMedia";
import AssistantVendeur from "./AssistantVendeur";

const CLE_BOUTIQUE_ACTIVE = "boutiqueActiveId";

export default function Dashboard() {
  const router = useRouter();
  const [chargementInitial, setChargementInitial] = useState(true);
  const [boutiques, setBoutiques] = useState([]);
  const [boutiqueActiveId, setBoutiqueActiveId] = useState(null);
  const [boutique, setBoutique] = useState(null); // boutique active, avec ses produits
  const [nouvelleBoutiqueOuverte, setNouvelleBoutiqueOuverte] = useState(false);
  const [formBoutique, setFormBoutique] = useState({ nom: "", description: "" });
  const [formProduit, setFormProduit] = useState({ nom: "", prix: "", stock: "", categorie: "", imageUrl: "" });
  const [erreur, setErreur] = useState("");
  const [formOuvert, setFormOuvert] = useState(false);
  const [lienCopie, setLienCopie] = useState(false);
  const [commandesEnAttente, setCommandesEnAttente] = useState(0);
  const [messagesNonLus, setMessagesNonLus] = useState(0);
  const [tendances, setTendances] = useState([]);
  const [ficheIaOuverte, setFicheIaOuverte] = useState(false);
  const [ficheGenerateurOuvert, setFicheGenerateurOuvert] = useState(false);
  const [descriptionIa, setDescriptionIa] = useState("");
  const [genereEnCours, setGenereEnCours] = useState(false);
  const [erreurIa, setErreurIa] = useState("");
  const [cardsFermees, setCardsFermees] = useState([]);
  const [descriptionGeneree, setDescriptionGeneree] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    chargerBoutiques(token);
    chargerCommandes(token);
    chargerMessages(token);
    setCardsFermees(JSON.parse(localStorage.getItem("checklistFermee") || "[]"));
  }, [router]);

  function fermerCard(id) {
    const suite = [...cardsFermees, id];
    setCardsFermees(suite);
    localStorage.setItem("checklistFermee", JSON.stringify(suite));
  }

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
  // classement des produits qui se vendent le mieux (toutes boutiques
  // confondues, tendances).
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

  async function chargerBoutiques(token) {
    const res = await fetch("/api/boutiques/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const liste = data.boutiques || [];
    setBoutiques(liste);

    if (liste.length > 0) {
      const idStocke = localStorage.getItem(CLE_BOUTIQUE_ACTIVE);
      const active = liste.find((b) => b.id === idStocke) || liste[0];
      await selectionnerBoutique(active.id, token);
    } else {
      setChargementInitial(false);
    }
  }

  async function selectionnerBoutique(id, tokenParam) {
    const token = tokenParam || localStorage.getItem("token");
    localStorage.setItem(CLE_BOUTIQUE_ACTIVE, id);
    setBoutiqueActiveId(id);

    const res = await fetch(`/api/boutiques/me?id=${id}`, {
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

    setBoutiques([...boutiques, data.boutique]);
    setFormBoutique({ nom: "", description: "" });
    setNouvelleBoutiqueOuverte(false);
    await selectionnerBoutique(data.boutique.id, token);
  }

  async function genererFiche() {
    if (!descriptionIa.trim()) return;
    setErreurIa("");
    setGenereEnCours(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/generer-fiche", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ description: descriptionIa }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErreurIa(data.erreur || "Échec de la génération.");
        return;
      }

      setFormProduit({
        ...formProduit,
        nom: data.nom,
        categorie: data.categorie || formProduit.categorie,
      });
      setDescriptionGeneree(data.description);
      setFicheIaOuverte(false);
      setFicheGenerateurOuvert(false);
      setFormOuvert(true);
      setDescriptionIa("");
    } catch {
      setErreurIa("Échec de la génération, réessayez.");
    } finally {
      setGenereEnCours(false);
    }
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
        description: descriptionGeneree || null,
        boutiqueId: boutique.id,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setErreur(data.erreur);
      return;
    }

    setBoutique({ ...boutique, produits: [...boutique.produits, data.produit] });
    setFormProduit({ nom: "", prix: "", stock: "", categorie: "", imageUrl: "" });
    setDescriptionGeneree("");
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
        {/* Sélecteur de boutiques : un compte peut en avoir jusqu'à 4 */}
        {boutiques.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {boutiques.map((b) => (
              <button
                key={b.id}
                onClick={() => selectionnerBoutique(b.id)}
                className={`shrink-0 border px-4 py-2 text-sm ${
                  b.id === boutiqueActiveId ? "border-accent bg-accent text-paper" : "border-line"
                }`}
              >
                {b.nom}
              </button>
            ))}
            {boutiques.length < 4 && (
              <button
                onClick={() => setNouvelleBoutiqueOuverte(!nouvelleBoutiqueOuverte)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-accent px-4 py-2 text-sm text-accent-dark"
              >
                <Plus size={14} /> Nouvelle boutique
              </button>
            )}
          </div>
        )}

        {nouvelleBoutiqueOuverte && (
          <section className="mb-8 max-w-md border border-line p-4">
            <h2 className="font-display text-lg">Nouvelle boutique</h2>
            <form onSubmit={creerBoutique} className="mt-4 flex flex-col gap-4">
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
              <button className="mt-2 rounded-full bg-accent px-4 py-3 text-paper transition-transform hover:scale-[1.02] active:scale-95">
                Créer cette boutique
              </button>
            </form>
          </section>
        )}

        {!boutique ? (
          <section className="max-w-md">
            <h2 className="font-display text-xl">Créez votre boutique</h2>
            <p className="mt-1 text-sm text-muted">
              Votre boutique sera accessible sur /boutique/votre-nom. Vous pourrez en ajouter jusqu'à 4 par compte.
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

              <button className="mt-4 rounded-full bg-accent px-4 py-3 text-paper transition-transform hover:scale-[1.02] active:scale-95">
                Créer ma boutique
              </button>
            </form>
          </section>
        ) : (
          <>
            {/* Checklist de démarrage, façon Shopify : chaque carte se ferme
                d'un clic et reste fermée (mémorisée localement). */}
            {(() => {
              const cartes = [
                {
                  id: "produit",
                  visible: boutique.produits.length === 0,
                  Icone: Store,
                  couleur: "bg-accent-light text-accent-dark",
                  titre: "Ajoutez votre premier produit",
                  texte: "Commencez par un nom, un prix et une photo.",
                  action: () => setFormOuvert(true),
                  bouton: "Ajouter un produit",
                },
                {
                  id: `logo-${boutique.id}`,
                  visible: !boutique.logoUrl,
                  Icone: Palette,
                  couleur: "bg-ia-light text-ia",
                  titre: "Ajoutez une photo à votre boutique",
                  texte: "Elle s'affiche comme une photo de profil sur votre page.",
                  lien: "/dashboard/parametres",
                  bouton: "Ajouter une photo",
                },
                {
                  id: "notifs",
                  visible: true,
                  Icone: Bell,
                  couleur: "bg-leaf-light text-leaf",
                  titre: "Restez informé",
                  texte: "Commandes et messages arrivent ici, en haut à droite.",
                  bouton: null,
                },
              ].filter((c) => c.visible && !cardsFermees.includes(c.id));

              if (cartes.length === 0) return null;

              return (
                <div className="mb-8 flex flex-col gap-3">
                  {cartes.map((c) => (
                    <div key={c.id} className="flex items-start gap-3 border border-line p-4">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${c.couleur}`}>
                        <c.Icone size={18} strokeWidth={1.5} />
                      </span>
                      <div className="flex-1">
                        <p className="font-display text-base">{c.titre}</p>
                        <p className="mt-1 text-sm text-muted">{c.texte}</p>
                        {c.bouton &&
                          (c.lien ? (
                            <a href={c.lien} className="mt-2 inline-block text-xs underline">
                              {c.bouton}
                            </a>
                          ) : (
                            <button onClick={c.action} className="mt-2 text-xs underline">
                              {c.bouton}
                            </button>
                          ))}
                      </div>
                      <button onClick={() => fermerCard(c.id)} aria-label="Fermer">
                        <X size={16} className="text-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex flex-col gap-4 md:flex-row">
              <section className="flex flex-wrap items-center gap-3 border border-line p-4 md:flex-1">
                <div>
                  <p className="text-sm text-muted">Boutique active</p>
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
                    <TrendingUp size={14} /> Tendances (toutes boutiques)
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
              <div className="flex gap-2">
                <button
                  onClick={() => setFormOuvert(!formOuvert)}
                  className="flex-1 border border-ink px-4 py-3 text-left font-display text-lg"
                >
                  {formOuvert ? "− Fermer" : "+ Ajouter un produit"}
                </button>
                <button
                  onClick={() => setFicheIaOuverte(!ficheIaOuverte)}
                  className="flex items-center gap-1.5 rounded-full bg-ia px-3 text-xs text-paper"
                  title="Assistant IA"
                >
                  <Sparkles size={14} /> Assistant IA
                </button>
              </div>

              {ficheIaOuverte && (
                <div className="mt-4 flex flex-col gap-4">
                  <AssistantVendeur onFicheDemandee={() => setFicheGenerateurOuvert(true)} />

                  {ficheGenerateurOuvert && (
                    <div className="flex flex-col gap-3 border border-line p-4">
                      <p className="text-sm text-muted">
                        Décrivez le produit en une phrase, l'IA rédige le nom et la description.
                      </p>
                      <textarea
                        value={descriptionIa}
                        onChange={(e) => setDescriptionIa(e.target.value)}
                        placeholder="Ex: sac à main en cuir marron, fait main, pour femme"
                        className="border border-line px-3 py-2 text-sm"
                        rows={3}
                      />
                      {erreurIa && <p className="text-sm">{erreurIa}</p>}
                      <button
                        onClick={genererFiche}
                        disabled={genereEnCours || !descriptionIa.trim()}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-ia px-4 py-2.5 text-sm text-paper disabled:opacity-40"
                      >
                        <Sparkles size={14} /> {genereEnCours ? "Génération..." : "Générer la fiche"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {formOuvert && (
                <form onSubmit={ajouterProduit} className="mt-4 flex flex-col gap-4 border border-line p-4">
                  {descriptionGeneree && (
                    <p className="border border-line bg-line/10 p-3 text-xs text-muted">
                      Description IA : {descriptionGeneree}
                    </p>
                  )}
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

                  <button className="mt-2 rounded-full bg-accent px-4 py-3 text-paper transition-transform hover:scale-[1.02] active:scale-95">
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
