"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "../../BackButton";

export default function Connexion() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    const res = await fetch("/api/auth/login", {
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <BackButton secours="/" texte="Accueil" />
      <h1 className="font-display text-3xl">Connexion</h1>
      <p className="mt-2 text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="underline">
          Créez-en un
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4">
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
            className="border border-line px-3 py-2"
            value={form.motDePasse}
            onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
          />
        </label>

        {erreur && <p className="text-sm">{erreur}</p>}

        <button
          disabled={chargement}
          className="mt-4 border border-ink bg-ink px-4 py-3 text-paper hover:bg-paper hover:text-ink transition-colors disabled:opacity-50"
        >
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
