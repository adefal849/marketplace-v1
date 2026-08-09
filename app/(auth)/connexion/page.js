"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "../../BackButton";
import GoogleSignIn from "../../GoogleSignIn";
import LogoDivineHarvest from "../../LogoDivineHarvest";

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
    <main className="relative min-h-screen overflow-hidden bg-ink text-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent opacity-25 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-16">
        <BackButton secours="/" texte="Accueil" />

        <div className="mt-6 flex items-center gap-2 text-accent">
          <LogoDivineHarvest size={20} />
          <span className="text-xs font-medium uppercase tracking-widest">Divine Harvest Store</span>
        </div>
        <h1 className="mt-3 font-hero text-3xl font-extrabold">Bon retour parmi nous</h1>
        <p className="mt-2 text-sm text-paper/60">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-accent underline">
            Créez-en un
          </Link>
        </p>

        <div className="mt-8">
          <GoogleSignIn />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-paper/40">
          <div className="h-px flex-1 bg-paper/15" />
          ou avec votre email
          <div className="h-px flex-1 bg-paper/15" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              required
              type="email"
              className="border border-paper/20 bg-transparent px-3 py-3 outline-none focus:border-accent"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Mot de passe
            <input
              required
              type="password"
              className="border border-paper/20 bg-transparent px-3 py-3 outline-none focus:border-accent"
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
            />
          </label>

          <Link href="/mot-de-passe-oublie" className="-mt-2 self-start text-xs text-paper/50 underline">
            Mot de passe oublié ?
          </Link>

          {erreur && <p className="text-sm text-accent">{erreur}</p>}

          <button
            disabled={chargement}
            className="mt-4 rounded-full bg-accent px-4 py-3.5 font-medium text-ink transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
