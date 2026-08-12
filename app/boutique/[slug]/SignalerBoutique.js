"use client";

import { useState } from "react";
import { Flag, X, Check } from "lucide-react";

const MOTIFS = [
  "Produit trompeur ou différent de la description",
  "Vendeur injoignable",
  "Contenu inapproprié",
  "Suspicion d'arnaque",
  "Autre",
];

export default function SignalerBoutique({ slug }) {
  const [ouvert, setOuvert] = useState(false);
  const [raison, setRaison] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  async function envoyer(e) {
    e.preventDefault();
    if (!raison) return;
    setEnvoi(true);
    try {
      await fetch("/api/signalements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, raison, details, clientEmail: email }),
      });
      setEnvoye(true);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOuvert(true)}
        className="flex items-center gap-1 text-xs text-muted hover:text-accent"
      >
        <Flag size={12} /> Signaler cette boutique
      </button>

      {ouvert && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="w-full max-w-sm border-2 border-ink bg-paper p-5 dark:border-line-dark dark:bg-ink">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Signaler cette boutique</h2>
              <button onClick={() => setOuvert(false)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            {envoye ? (
              <p className="mt-4 flex items-center gap-2 text-sm">
                <Check size={16} className="text-leaf" /> Signalement transmis, merci.
              </p>
            ) : (
              <form onSubmit={envoyer} className="mt-4 flex flex-col gap-3 text-sm">
                <label className="flex flex-col gap-1">
                  Motif
                  <select
                    required
                    value={raison}
                    onChange={(e) => setRaison(e.target.value)}
                    className="rounded-lg border-2 border-line bg-paper px-3 py-2 dark:border-line-dark dark:bg-ink"
                  >
                    <option value="">Sélectionnez un motif</option>
                    {MOTIFS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  Détails (optionnel)
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="rounded-lg border-2 border-line bg-paper px-3 py-2 dark:border-line-dark dark:bg-ink"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Votre email (optionnel, pour être recontacté)
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border-2 border-line bg-paper px-3 py-2 dark:border-line-dark dark:bg-ink"
                  />
                </label>
                <button
                  disabled={envoi}
                  className="mt-1 rounded-lg border-2 border-accent bg-accent px-4 py-2.5 font-semibold text-ink disabled:opacity-50"
                >
                  {envoi ? "Envoi..." : "Envoyer le signalement"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
