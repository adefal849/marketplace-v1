"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";

const SUGGESTIONS = [
  "Créer une fiche produit",
  "Idée de produit à vendre",
  "Aide pour démarrer ma boutique",
  "Rédiger une description qui vend",
  "Astuce pour vendre plus",
];

// Panneau d'assistant façon Shopify : des suggestions à toucher, une
// conversation qui reste visible, un champ libre. La suggestion "Créer
// une fiche produit" déclenche le générateur structuré (remplit le
// formulaire) ; les autres sont conversationnelles.
export default function AssistantVendeur({ onFicheDemandee }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Comment puis-je vous aider aujourd'hui ?" },
  ]);
  const [saisie, setSaisie] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function envoyerTexte(texte) {
    texte = texte.trim();
    if (!texte || envoi) return;

    if (texte === "Créer une fiche produit") {
      onFicheDemandee();
      return;
    }

    const nouveaux = [...messages, { role: "user", content: texte }];
    setMessages(nouveaux);
    setEnvoi(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/assistant-vendeur", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: nouveaux }),
      });
      const data = await res.json();

      setMessages((actuel) => [
        ...actuel,
        { role: "assistant", content: res.ok ? data.reponse : data.erreur || "Erreur." },
      ]);
    } catch {
      setMessages((actuel) => [
        ...actuel,
        { role: "assistant", content: "Impossible de répondre pour le moment." },
      ]);
    } finally {
      setEnvoi(false);
    }
  }

  function envoyer(e) {
    e.preventDefault();
    const texte = saisie;
    setSaisie("");
    envoyerTexte(texte);
  }

  return (
    <div className="border border-ia/30 bg-ia-light/40 p-4">
      <p className="flex items-center gap-1.5 text-sm font-medium text-ia">
        <Sparkles size={14} /> Assistant vendeur
      </p>

      <div className="mt-3 flex max-h-56 flex-col gap-2 overflow-y-auto">
        {messages.map((m, i) => (
          <p
            key={i}
            className={
              m.role === "user"
                ? "self-end max-w-[85%] rounded-2xl bg-ia px-3 py-2 text-sm text-paper"
                : "self-start max-w-[85%] rounded-2xl bg-paper px-3 py-2 text-sm"
            }
          >
            {m.content}
          </p>
        ))}
        {envoi && <p className="text-xs text-muted">L'assistant réfléchit...</p>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => envoyerTexte(s)}
            className="rounded-full border border-ia/40 bg-paper px-3 py-1.5 text-xs text-ia hover:bg-ia hover:text-paper"
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={envoyer} className="mt-3 flex gap-2">
        <input
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-1 border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ia"
        />
        <button
          disabled={envoi || !saisie.trim()}
          className="flex items-center justify-center rounded-full bg-ia px-3 text-paper disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
