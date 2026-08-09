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
