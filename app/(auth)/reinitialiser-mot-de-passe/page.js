"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BackButton from "../../BackButton";

function FormulaireReinitialisation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    const res = await fetch("/api/auth/reinitialiser-mot-de-passe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, motDePasse }),
    });
    const data = await res.json();
    setChargement(false);

    if (!res.ok) {
      setErreur(data.erreur);
      return;
    }
    setSucces(true);
    setTimeout(() => router.push("/connexion"), 2000);
  }

  if (!token) {
    return <p className="mt-8 text-sm">Lien invalide. Refaites une demande depuis la page de connexion.</p>;
  }

  if (succes) {
    return <p className="mt-8 border border-line p-4 text-sm">Mot de passe mis à jour, redirection...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Nouveau mot de passe
        <input
          required
          minLength={6}
          type="password"
          className="border border-line px-3 py-2"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
        />
      </label>

      {erreur && <p className="text-sm">{erreur}</p>}

      <button
        disabled={chargement}
        className="mt-4 border border-ink bg-ink px-4 py-3 text-paper hover:bg-paper hover:text-ink transition-colors disabled:opacity-50"
      >
        {chargement ? "Enregistrement..." : "Choisir ce mot de passe"}
      </button>
    </form>
  );
}

export default function ReinitialiserMotDePasse() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-16">
      <BackButton secours="/connexion" texte="Connexion" />
      <h1 className="mt-4 font-display text-3xl">Nouveau mot de passe</h1>

      <Suspense fallback={null}>
        <FormulaireReinitialisation />
      </Suspense>
    </main>
  );
}
