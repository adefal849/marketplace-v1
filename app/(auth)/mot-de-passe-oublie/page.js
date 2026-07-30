"use client";

import { useState } from "react";
import Link from "next/link";
import BackButton from "../../BackButton";

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-16">
      <BackButton secours="/connexion" texte="Connexion" />
      <h1 className="mt-4 font-display text-3xl">Mot de passe oublié</h1>

      {envoye ? (
        <p className="mt-6 text-sm">
          Si un compte existe avec cet email, un lien de réinitialisation vient
          d'être envoyé. Vérifiez aussi vos spams.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">
            Entrez l'email de votre compte vendeur, vous recevrez un lien pour
            choisir un nouveau mot de passe.
          </p>

          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Email
              <input
                required
                type="email"
                className="border border-line px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <button
              disabled={chargement}
              className="mt-4 border border-ink bg-ink px-4 py-3 text-paper hover:bg-paper hover:text-ink transition-colors disabled:opacity-50"
            >
              {chargement ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        </>
      )}

      <p className="mt-8 text-sm">
        <Link href="/connexion" className="underline">
          Retour à la connexion
        </Link>
      </p>
    </main>
  );
}
