"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store } from "lucide-react";
import AuthShell from "../AuthShell";
import { PAYS, drapeau } from "../../pays";

const champ =
  "w-full rounded-lg border-2 border-line bg-paper px-3 py-2.5 outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-gold/40 dark:border-line-dark dark:bg-forest-deep";

const bouton =
  "mt-4 flex items-center justify-center gap-2 rounded-lg border-2 border-forest-deep bg-gold px-4 py-3 font-semibold text-forest-deep shadow-[3px_4px_0_0_#12301F] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:hover:translate-y-0";

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
    <AuthShell
      retourVers="/"
      retourTexte="Accueil"
      eyebrow="Devenir vendeur"
      titre="Créer votre compte vendeur"
      sousTitre={
        <>
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-medium text-forest underline dark:text-gold">
            Connectez-vous
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nom
          <input
            required
            className={champ}
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            required
            type="email"
            className={champ}
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
            className={champ}
            value={form.motDePasse}
            onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Pays
          <select
            required
            className={champ}
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

        {erreur && <p className="rounded-lg bg-berry/10 px-3 py-2 text-sm text-berry">{erreur}</p>}

        <button disabled={chargement} className={bouton}>
          <Store size={16} />
          {chargement ? "Création..." : "Créer mon compte"}
        </button>
      </form>
    </AuthShell>
  );
}
