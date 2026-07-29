"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "../../BackButton";
import { PAYS, drapeau } from "../../pays";

export default function Inscription() {
  const router = useRouter();
  const [form, setForm] = useState({ nom: "", email: "", motDePasse: "", pays: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    setChargement(false);

    if (!res.ok) {
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    localStorage.setItem("token", data.token);
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-16">
      <BackButton secours="/" texte="Accueil" />
      <h1 className="mt-4 font-display text-3xl">Créer votre compte vendeur</h1>
      <p className="mt-2 text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="underline">
          Connectez-vous
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nom
          <input
            required
            className="border border-line px-3 py-2 focus-visible:outline-none"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            required
            type="email"
            className="border border-line px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Mot de passe
          <input
            required
            type="password"
            minLength={6}
            className="border border-line px-3 py-2"
            value={form.motDePasse}
            onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Pays
          <select
            required
            className="border border-line px-3 py-2"
            value={form.pays}
            onChange={(e) => setForm({ ...form, pays: e.target.value })}
          >
            <option value="">Sélectionnez votre pays</option>
            {PAYS.map((p) => (
              <option key={p.iso} value={p.iso}>
                {drapeau(p.iso)} {p.nom} ({p.indicatif})
              </option>
            ))}
          </select>
        </label>

        {erreur && <p className="text-sm">{erreur}</p>}

        <button
          disabled={chargement}
          className="mt-4 border border-ink bg-ink px-4 py-3 text-paper hover:bg-paper hover:text-ink transition-colors disabled:opacity-50"
        >
          {chargement ? "Création..." : "Créer mon compte"}
        </button>
      </form>
    </main>
  );
}
