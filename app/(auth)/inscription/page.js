"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import BackButton from "../../BackButton";
import GoogleSignIn from "../../GoogleSignIn";
import LogoDivineHarvest from "../../LogoDivineHarvest";
import { PAYS, drapeau } from "../../pays";

export default function Inscription() {
  const router = useRouter();
  const [form, setForm] = useState({ nom: "", email: "", motDePasse: "", pays: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);

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
    <main className="relative min-h-screen bg-ink text-paper">
      {/* Voir le même correctif sur /connexion : overflow-hidden déplacé du
          <main> vers ce conteneur décoratif, pour ne plus bloquer le
          défilement de la page. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent opacity-25 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-16">
        <BackButton secours="/" texte="Accueil" />

        <div className="mt-6 flex items-center gap-2 text-accent">
          <LogoDivineHarvest size={20} />
          <span className="text-xs font-medium uppercase tracking-widest">Divine Harvest Store</span>
        </div>
        <h1 className="mt-3 font-hero text-3xl font-extrabold">Ouvrez votre boutique</h1>
        <p className="mt-2 text-sm text-paper/60">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="text-accent underline">
            Connectez-vous
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
            Nom
            <input
              required
              className="border border-paper/20 bg-transparent px-3 py-3 outline-none focus:border-accent"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
          </label>

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
            <div className="flex items-center border border-paper/20 focus-within:border-accent">
              <input
                required
                type={motDePasseVisible ? "text" : "password"}
                minLength={6}
                className="w-full bg-transparent px-3 py-3 outline-none"
                value={form.motDePasse}
                onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setMotDePasseVisible(!motDePasseVisible)}
                aria-label={motDePasseVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="px-3 text-paper/50 hover:text-paper"
              >
                {motDePasseVisible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Pays
            <select
              required
              className="border border-paper/20 bg-ink px-3 py-3 outline-none focus:border-accent"
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

          {erreur && <p className="text-sm text-accent">{erreur}</p>}

          <button
            disabled={chargement}
            className="mt-4 rounded-full bg-accent px-4 py-3.5 font-medium text-ink transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {chargement ? "Création..." : "Créer mon compte"}
          </button>
        </form>
      </div>
    </main>
  );
}
