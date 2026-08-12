"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../DashboardHeader";
import UploadMedia from "../../UploadMedia";

const CLE_BOUTIQUE_ACTIVE = "boutiqueActiveId";

export default function Parametres() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [utilisateur, setUtilisateur] = useState(null);
  const [boutiques, setBoutiques] = useState([]);
  const [boutiqueId, setBoutiqueId] = useState(null);
  const [boutique, setBoutique] = useState(null);
  const [nom, setNom] = useState("");
  const [message, setMessage] = useState("");
  const [nomBoutique, setNomBoutique] = useState("");
  const [descriptionBoutique, setDescriptionBoutique] = useState("");
  const [aproposBoutique, setAproposBoutique] = useState("");
  const [couleurAccent, setCouleurAccent] = useState("#e07a3f");
  const [messageBoutique, setMessageBoutique] = useState("");
  const [enregistrementBoutique, setEnregistrementBoutique] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    charger(token);
  }, [router]);

  async function charger(token) {
    const headers = { Authorization: `Bearer ${token}` };

    const [resUser, resBoutiques] = await Promise.all([
      fetch("/api/utilisateur/me", { headers }),
      fetch("/api/boutiques/me", { headers }),
    ]);
    const dataUser = await resUser.json();
    const dataBoutiques = await resBoutiques.json();

    setUtilisateur(dataUser.utilisateur);
    setNom(dataUser.utilisateur?.nom || "");

    const liste = dataBoutiques.boutiques || [];
    setBoutiques(liste);

    if (liste.length > 0) {
      const idStocke = localStorage.getItem(CLE_BOUTIQUE_ACTIVE);
      const active = liste.find((b) => b.id === idStocke) || liste[0];
      await chargerBoutique(active.id, token);
    } else {
      setChargement(false);
    }
  }

  async function chargerBoutique(id, tokenParam) {
    const token = tokenParam || localStorage.getItem("token");
    setBoutiqueId(id);
    const res = await fetch(`/api/boutiques/me?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBoutique(data.boutique);
    setNomBoutique(data.boutique?.nom || "");
    setDescriptionBoutique(data.boutique?.description || "");
    setAproposBoutique(data.boutique?.apropos || "");
    setCouleurAccent(data.boutique?.couleurAccent || "#e07a3f");
    setMessageBoutique("");
    setChargement(false);
  }

  async function enregistrerProfil(e) {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");

    const res = await fetch("/api/utilisateur/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nom }),
    });

    if (res.ok) {
      setMessage("Profil mis à jour.");
    } else {
      setMessage("Erreur lors de la mise à jour.");
    }
  }

  async function enregistrerLogo(url) {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/boutiques/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: boutiqueId, logoUrl: url }),
    });
    if (res.ok) {
      setBoutique({ ...boutique, logoUrl: url });
    }
  }

  async function enregistrerBanniere(url) {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/boutiques/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: boutiqueId, bannerUrl: url }),
    });
    if (res.ok) {
      setBoutique({ ...boutique, bannerUrl: url });
    }
  }

  async function enregistrerBoutique(e) {
    e.preventDefault();
    setMessageBoutique("");
    setEnregistrementBoutique(true);
    const token = localStorage.getItem("token");

    const res = await fetch("/api/boutiques/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        id: boutiqueId,
        nom: nomBoutique,
        description: descriptionBoutique,
        apropos: aproposBoutique,
        couleurAccent,
      }),
    });
    const data = await res.json();
    setEnregistrementBoutique(false);

    if (res.ok) {
      setBoutique(data.boutique);
      setBoutiques((liste) => liste.map((b) => (b.id === boutiqueId ? { ...b, nom: data.boutique.nom } : b)));
      setMessageBoutique("Boutique mise à jour.");
    } else {
      setMessageBoutique(data.erreur || "Erreur lors de la mise à jour.");
    }
  }

  async function supprimerProduit(id) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/produits/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setBoutique({
        ...boutique,
        produits: boutique.produits.filter((p) => p.id !== id),
      });
    }
  }

  if (chargement) {
    return <main className="min-h-screen px-6 py-12">Chargement...</main>;
  }

  return (
    <main className="min-h-screen">
      <DashboardHeader actif="parametres" boutiqueSlug={boutique?.slug} />

      <div className="mx-auto max-w-md px-6 py-10">
        <h1 className="font-display text-2xl">Paramètres</h1>

        {/* Profil */}
        <section className="mt-6 border border-line p-4">
          <h2 className="font-display text-lg">Profil</h2>
          <p className="mt-1 text-sm text-muted">{utilisateur?.email}</p>

          <form onSubmit={enregistrerProfil} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Nom
              <input
                required
                className="border border-line px-3 py-2"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </label>

            {message && <p className="text-sm">{message}</p>}

            <button className="border border-ink bg-ink px-4 py-2 text-paper hover:bg-paper hover:text-ink transition-colors">
              Enregistrer
            </button>
          </form>
        </section>

        {/* Sélecteur de boutique, si plusieurs */}
        {boutiques.length > 1 && (
          <section className="mt-6 border border-line p-4">
            <h2 className="font-display text-lg">Boutique à modifier</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {boutiques.map((b) => (
                <button
                  key={b.id}
                  onClick={() => chargerBoutique(b.id)}
                  className={`border px-3 py-1.5 text-xs ${
                    b.id === boutiqueId ? "border-ink bg-ink text-paper" : "border-line"
                  }`}
                >
                  {b.nom}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Apparence de la boutique : nom, description, couleur */}
        {boutique && (
          <section className="mt-6 border border-line p-4">
            <h2 className="font-display text-lg">Apparence de la boutique</h2>
            <p className="mt-1 text-sm text-muted">
              Ce que les clients voient sur votre page publique.
            </p>

            <form onSubmit={enregistrerBoutique} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Nom de la boutique
                <input
                  required
                  className="border border-line px-3 py-2"
                  value={nomBoutique}
                  onChange={(e) => setNomBoutique(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Description courte
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="En quelques mots, présentez votre boutique..."
                  className="border border-line px-3 py-2"
                  value={descriptionBoutique}
                  onChange={(e) => setDescriptionBoutique(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                À propos (texte plus long, affiché sur votre page)
                <textarea
                  rows={6}
                  maxLength={2000}
                  placeholder="Racontez votre boutique, votre histoire, ce qui vous différencie..."
                  className="border border-line px-3 py-2"
                  value={aproposBoutique}
                  onChange={(e) => setAproposBoutique(e.target.value)}
                />
                <span className="text-xs text-muted">{aproposBoutique.length}/2000</span>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Couleur d&apos;accent
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="h-10 w-14 border border-line p-1"
                    value={couleurAccent}
                    onChange={(e) => setCouleurAccent(e.target.value)}
                  />
                  <span className="text-xs text-muted">
                    Utilisée pour les boutons et badges de votre page
                  </span>
                </div>
              </label>

              {messageBoutique && <p className="text-sm">{messageBoutique}</p>}

              <button
                disabled={enregistrementBoutique}
                className="mt-2 border border-ink bg-ink px-4 py-2 text-paper hover:bg-paper hover:text-ink transition-colors disabled:opacity-50"
              >
                {enregistrementBoutique ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          </section>
        )}

        {/* Photo de profil de la boutique */}
        {boutique && (
          <section className="mt-6 border border-line p-4">
            <h2 className="font-display text-lg">Photo de {boutique.nom}</h2>
            <p className="mt-1 text-sm text-muted">
              Visible en haut de votre page boutique, comme une photo de profil.
            </p>
            {boutique.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={boutique.logoUrl}
                alt={boutique.nom}
                className="mt-3 h-20 w-20 rounded-full object-cover"
              />
            )}
            <div className="mt-3">
              <UploadMedia label="Changer la photo" onUploaded={enregistrerLogo} />
            </div>
          </section>
        )}

        {/* Bannière de la boutique */}
        {boutique && (
          <section className="mt-6 border border-line p-4">
            <h2 className="font-display text-lg">Bannière de {boutique.nom}</h2>
            <p className="mt-1 text-sm text-muted">
              Grande image affichée en haut de votre page boutique.
            </p>
            {boutique.bannerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={boutique.bannerUrl}
                alt=""
                className="mt-3 h-24 w-full rounded object-cover"
              />
            )}
            <div className="mt-3">
              <UploadMedia label="Changer la bannière" onUploaded={enregistrerBanniere} />
            </div>
          </section>
        )}

        {/* Produits : suppression */}
        {boutique && (
          <section className="mt-6 border border-line p-4">
            <h2 className="font-display text-lg">Produits de {boutique.nom}</h2>
            {boutique.produits.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Aucun produit pour le moment.</p>
            ) : (
              <ul className="mt-3">
                {boutique.produits.map((p) => (
                  <li key={p.id} className="flex items-center justify-between border-b border-line py-2 text-sm">
                    <span>{p.nom} — {p.prix} FCFA</span>
                    <button
                      onClick={() => supprimerProduit(p.id)}
                      className="text-xs underline"
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
