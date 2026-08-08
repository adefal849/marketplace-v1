"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import AuthShell from "../AuthShell";

const champ =
  "w-full rounded-lg border-2 border-line bg-paper px-3 py-2.5 outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-gold/40 dark:border-line-dark dark:bg-forest-deep";

const bouton =
  "mt-4 flex items-center justify-center gap-2 rounded-lg border-2 border-forest-deep bg-gold px-4 py-3 font-semibold text-forest-deep shadow-[3px_4px_0_0_#12301F] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:hover:translate-y-0";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setChargement(true);
    await fetch("/api/auth/mot-de-passe-oublie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setChargement(false);
    setEnvoye(true);
  }

  return (
    <AuthShell
      retourVers="/connexion"
      retourTexte="Connexion"
      eyebrow="Récupération"
      titre="Mot de passe oublié"
      sousTitre="Entrez l'email de votre compte vendeur, on vous envoie un lien pour en choisir un nouveau."
    >
      {envoye ? (
        <p className="mt-6 flex items-start gap-2 rounded-lg border-2 border-forest bg-forest/5 p-4 text-sm dark:border-gold dark:bg-transparent">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-forest dark:text-gold" />
          Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.
          Pensez à vérifier vos spams.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              required
              type="email"
              className={champ}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <button disabled={chargement} className={bouton}>
            <Mail size={16} />
            {chargement ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted">
        <Link href="/connexion" className="font-medium text-forest underline dark:text-gold">
          Retour à la connexion
        </Link>
      </p>
    </AuthShell>
  );
}
