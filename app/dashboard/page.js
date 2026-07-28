"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [boutique, setBoutique] = useState(null);
  const [form, setForm] = useState({ nom: "", description: "" });
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
    }
  }, [router]);

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
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setErreur(data.erreur);
      return;
    }
    setBoutique(data.boutique);
  }

  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <h1 className="font-display text-3xl">Tableau de bord</h1>

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
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Description
              <textarea
                className="border border-line px-3 py-2"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>

            {erreur && <p className="text-sm">{erreur}</p>}

            <button className="mt-4 border border-ink bg-ink px-4 py-3 text-paper hover:bg-paper hover:text-ink transition-colors">
              Créer ma boutique
            </button>
          </form>
        </section>
      ) : (
        <section className="mt-10">
          <p>
            Boutique créée : <strong>{boutique.nom}</strong> —{" "}
            <a
              href={`/boutique/${boutique.slug}`}
              className="underline"
              target="_blank"
            >
              /boutique/{boutique.slug}
            </a>
          </p>
          {/* Prochaine étape : formulaire d'ajout de produits ici */}
        </section>
      )}
    </main>
  );
}
