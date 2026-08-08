"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../DashboardHeader";
import UploadMedia from "../../UploadMedia";

export default function Parametres() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [utilisateur, setUtilisateur] = useState(null);
  const [boutique, setBoutique] = useState(null);
  const [nom, setNom] = useState("");
  const [descriptionBoutique, setDescriptionBoutique] = useState("");
  const [message, setMessage] = useState("");
  const [messageBoutique, setMessageBoutique] = useState("");

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

    const [resUser, resBoutique] = await Promise.all([
      fetch("/api/utilisateur/me", { headers }),
      fetch("/api/boutiques/me", { headers }),
    ]);
    const dataUser = await resUser.json();
    const dataBoutique = await resBoutique.json();

    setUtilisateur(dataUser.utilisateur);
    setNom(dataUser.utilisateur?.nom || "");
    setBoutique(dataBoutique.boutique);
    setDescriptionBoutique(dataBoutique.boutique?.description || "");
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
      body: JSON.stringify({ logoUrl: url }),
    });
    if (res.ok) {
      setBoutique({ ...boutique, logoUrl: url });
    }
  }

  async function enregistrerDescriptionBoutique(e) {
    e.preventDefault();
    setMessageBoutique("");
    const token = localStorage.getItem("token");

    const res = await fetch("/api/boutiques/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ description: descriptionBoutique }),
    });

    if (res.ok) {
      setBoutique({ ...boutique, description: descriptionBoutique });
      setMessageBoutique("Description mise à jour.");
    } else {
      setMessageBoutique("Erreur lors de la mise à jour.");
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

        {/* Photo de profil de la boutique */}
        {boutique && (
          <section className="mt-6 border border-line p-4">
            <h2 className="font-display text-lg">Photo et description de la boutique</h2>
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

            <form onSubmit={enregistrerDescriptionBoutique} className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
              <label className="flex flex-col gap-1 text-sm">
                Description de la boutique
                <textarea
                  rows={3}
                  className="border border-line px-3 py-2"
                  value={descriptionBoutique}
                  onChange={(e) => setDescriptionBoutique(e.target.value)}
                />
              </label>
              {messageBoutique && <p className="text-sm">{messageBoutique}</p>}
              <button className="self-start border border-ink bg-ink px-4 py-2 text-sm text-paper hover:bg-paper hover:text-ink transition-colors">
                Enregistrer
              </button>
            </form>
          </section>
        )}

        {/* Produits : suppression */}
        {boutique && (
          <section className="mt-6 border border-line p-4">
            <h2 className="font-display text-lg">Vos produits</h2>
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
