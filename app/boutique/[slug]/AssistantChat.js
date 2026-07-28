"use client";

import { useEffect, useRef, useState } from "react";

// Bulle de chat flottante : l'acheteur pose une question sur un produit,
// l'assistant (Groq) répond en s'appuyant sur le vrai catalogue de la
// boutique, pour rassurer sur la qualité sans jamais inventer.
export default function AssistantChat({ slug, boutiqueNom }) {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Bonjour 👋 Une question sur un produit de "${boutiqueNom}" ? Je suis là pour vous aider.`,
    },
  ]);
  const [saisie, setSaisie] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    if (ouvert) finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ouvert]);

  async function envoyer(e) {
    e.preventDefault();
    const texte = saisie.trim();
    if (!texte || envoi) return;

    const nouveaux = [...messages, { role: "user", content: texte }];
    setMessages(nouveaux);
    setSaisie("");
    setEnvoi(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, messages: nouveaux }),
      });
      const data = await res.json();

      setMessages((actuel) => [
        ...actuel,
        {
          role: "assistant",
          content: res.ok ? data.reponse : data.erreur || "Une erreur est survenue.",
        },
      ]);
    } catch {
      setMessages((actuel) => [
        ...actuel,
        { role: "assistant", content: "Impossible de vous répondre pour le moment." },
      ]);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-20">
      {ouvert && (
        <div className="mb-3 flex h-96 w-72 flex-col border border-line bg-paper shadow-lg sm:w-80">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-medium">Assistant boutique</p>
            <button onClick={() => setOuvert(false)} aria-label="Fermer" className="text-sm">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={
                    m.role === "user"
                      ? "max-w-[85%] border border-ink bg-ink px-3 py-2 text-paper"
                      : "max-w-[85%] border border-line px-3 py-2"
                  }
                >
                  {m.content}
                </p>
              </div>
            ))}
            {envoi && <p className="text-xs text-muted">L'assistant écrit...</p>}
            <div ref={finRef} />
          </div>

          <form onSubmit={envoyer} className="flex border-t border-line">
            <input
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button
              disabled={envoi}
              className="border-l border-line px-4 text-sm disabled:opacity-40"
            >
              Envoyer
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOuvert(!ouvert)}
        className="border border-ink bg-ink px-4 py-3 text-sm text-paper shadow-lg transition-colors hover:bg-paper hover:text-ink"
      >
        {ouvert ? "Fermer" : "💬 Une question ?"}
      </button>
    </div>
  );
}
