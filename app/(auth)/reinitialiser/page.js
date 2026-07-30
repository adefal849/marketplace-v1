"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function FormulaireReinitialisation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    const res = await fetch("/api/auth/reinitialiser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, nouveauMotDePasse: motDePasse }),
    });
    const data = await res.json();

    setChargement(false);

    if (!res.ok) {
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    setSucces(true);
    setTimeout(() => router.push("/connexion"), 2000);
  }

  if (!token) {
    return (
      <p className="mt-6 text-sm">
        Lien invalide. Refaites une demande depuis{" "}
        <Link href="/mot-de-passe-oublie" className="underline">
          cette page
        </Link>
        .
      </p>
    );
  }

  if (succes) {
    return (
      <p className="mt-6 text-sm">
        Mot de passe mis à jour. Redirection vers la connexion...
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Nouveau mot de passe
        <input
          required
          type="password"
          minLength={6}
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
        {chargement ? "Enregistrement..." : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}

export default function Reinitialiser() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-16">
      <h1 className="font-display text-3xl">Nouveau mot de passe</h1>
      <Suspense fallback={<p className="mt-6 text-sm">Chargement...</p>}>
        <FormulaireReinitialisation />
      </Suspense>
    </main>
  );
}
