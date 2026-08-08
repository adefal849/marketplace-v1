"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, CheckCircle2 } from "lucide-react";
import AuthShell from "../AuthShell";

const champ =
  "w-full rounded-lg border-2 border-line bg-paper px-3 py-2.5 outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-gold/40 dark:border-line-dark dark:bg-forest-deep";

const bouton =
  "mt-4 flex items-center justify-center gap-2 rounded-lg border-2 border-forest-deep bg-gold px-4 py-3 font-semibold text-forest-deep shadow-[3px_4px_0_0_#12301F] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:hover:translate-y-0";

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
    return (
      <p className="mt-6 rounded-lg border-2 border-berry bg-berry/10 p-4 text-sm text-berry">
        Lien invalide. Refaites une demande depuis la page de connexion.
      </p>
    );
  }

  if (succes) {
    return (
      <p className="mt-6 flex items-center gap-2 rounded-lg border-2 border-forest bg-forest/5 p-4 text-sm dark:border-gold dark:bg-transparent">
        <CheckCircle2 size={18} className="shrink-0 text-forest dark:text-gold" />
        Mot de passe mis à jour, redirection...
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Nouveau mot de passe
        <input
          required
          minLength={6}
          type="password"
          className={champ}
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
        />
      </label>

      {erreur && <p className="rounded-lg bg-berry/10 px-3 py-2 text-sm text-berry">{erreur}</p>}

      <button disabled={chargement} className={bouton}>
        <KeyRound size={16} />
        {chargement ? "Enregistrement..." : "Choisir ce mot de passe"}
      </button>
    </form>
  );
}

export default function ReinitialiserMotDePasse() {
  return (
    <AuthShell retourVers="/connexion" retourTexte="Connexion" eyebrow="Récupération" titre="Nouveau mot de passe">
      <Suspense fallback={null}>
        <FormulaireReinitialisation />
      </Suspense>
    </AuthShell>
  );
}
