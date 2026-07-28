"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "../../ThemeToggle";

export default function Parametres() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [utilisateur, setUtilisateur] = useState(null);
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

    const [resUser, resBoutique] = await Promise.all([
      fetch("/api/utilisateur/me", { headers }),
      fetch("/api/boutiques/me", { headers }),
    ]);
    const dataUser = await resUser.json();
    const dataBoutique = await resBoutique.json();

    setUtilisateur(dataUser.utilisateur);
    setNom(dataUser.utilisateur?.nom || "");
    setBoutique(dataBoutique.boutique);
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

  function deconnexion() {
    localStorage.removeItem("token");
    router.push("/");
  }

  if (chargement) {
    return <main className="min-h-screen px-6 py-12">Chargement...</main>;
  }

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <span className="font-display text-lg">Marketplace</span>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="hover:underline">Accueil</Link>
          <Link href="/dashboard" className="hover:underline">Tableau de bord</Link>
          <Link href="/dashboard/commandes" className="hover:underline">Commandes</Link>
          <span className="font-medium underline">Paramètres</span>
        </nav>
      </header>

      <div className="mx-auto max-w-md px-6 py-10">
        <h1 className="font-display text-2xl">Paramètres</h1>

        {/* Apparence */}
        <section className="mt-8 border border-line p-4">
          <h2 className="font-display text-lg">Apparence</h2>
          <p className="mt-1 text-sm text-muted">Thème blanc ou noir.</p>
          <div className="mt-3">
            <ThemeToggle />
          </div>
        </section>

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

        {/* Compte */}
        <section className="mt-6 border border-line p-4">
          <h2 className="font-display text-lg">Compte</h2>
          <button
            onClick={deconnexion}
            className="mt-3 border border-current px-4 py-2 text-sm"
          >
            Déconnexion
          </button>
        </section>
      </div>
    </main>
  );
}
