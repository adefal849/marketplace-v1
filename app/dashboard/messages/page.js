"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../DashboardHeader";

export default function Messages() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [conversationActive, setConversationActive] = useState(null);
  const [fil, setFil] = useState([]);
  const [reponse, setReponse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    chargerConversations(token);
    const intervalle = setInterval(() => chargerConversations(token), 5000);
    return () => clearInterval(intervalle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function chargerConversations(token) {
    try {
      const res = await fetch("/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data.conversations || []);
    } finally {
      setChargement(false);
    }
  }

  // Actualise le fil ouvert toutes les 4s (et marque les messages lus
  // côté serveur au passage).
  useEffect(() => {
    if (!conversationActive) return;
    const token = localStorage.getItem("token");

    async function charger() {
      const res = await fetch(`/api/conversations/${conversationActive}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setFil((await res.json()).messages);
    }

    charger();
    const intervalle = setInterval(charger, 4000);
    return () => clearInterval(intervalle);
  }, [conversationActive]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [fil]);

  async function envoyerReponse(e) {
    e.preventDefault();
    const texte = reponse.trim();
    if (!texte || envoi) return;
    setEnvoi(true);
    const token = localStorage.getItem("token");

    setFil((f) => [...f, { id: `tmp-${Date.now()}`, auteur: "VENDEUR", contenu: texte, createdAt: new Date() }]);
    setReponse("");

    await fetch(`/api/conversations/${conversationActive}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ contenu: texte }),
    });
    setEnvoi(false);
  }

  const conversationInfo = conversations.find((c) => c.id === conversationActive);

  if (chargement) {
    return <main className="min-h-screen px-6 py-12">Chargement...</main>;
  }

  return (
    <main className="min-h-screen">
      <DashboardHeader actif="messages" />

      <div className="flex flex-col md:h-[calc(100vh-65px)] md:flex-row">
        {/* Liste des conversations */}
        <aside className="border-b border-line md:w-72 md:overflow-y-auto md:border-b-0 md:border-r">
          {conversations.length === 0 ? (
            <p className="p-6 text-sm text-muted">Aucune discussion pour le moment.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setConversationActive(c.id)}
                className={`flex w-full flex-col items-start gap-1 border-b border-line px-4 py-3 text-left text-sm ${
                  conversationActive === c.id ? "bg-line/20" : ""
                }`}
              >
                <span className="flex w-full items-center justify-between">
                  <span className="font-medium">{c.clientNom}</span>
                  {c.nonLus > 0 && (
                    <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] text-paper">{c.nonLus}</span>
                  )}
                </span>
                {c.boutiqueNom && <span className="text-xs text-muted">{c.boutiqueNom}</span>}
                <span className="truncate text-xs text-muted">{c.dernierMessage}</span>
              </button>
            ))
          )}
        </aside>

        {/* Fil de discussion */}
        <section className="flex flex-1 flex-col">
          {!conversationActive ? (
            <p className="p-6 text-sm text-muted">Sélectionnez une discussion.</p>
          ) : (
            <>
              <div className="border-b border-line px-4 py-3 text-sm font-medium">
                {conversationInfo?.clientNom} — {conversationInfo?.clientEmail}
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {fil.map((m) => (
                  <div key={m.id} className={`mb-3 flex ${m.auteur === "VENDEUR" ? "justify-end" : "justify-start"}`}>
                    <p
                      className={
                        m.auteur === "VENDEUR"
                          ? "max-w-[75%] border border-ink bg-ink px-3 py-2 text-sm text-paper"
                          : "max-w-[75%] border border-line px-3 py-2 text-sm"
                      }
                    >
                      {m.contenu}
                    </p>
                  </div>
                ))}
                <div ref={finRef} />
              </div>
              <form onSubmit={envoyerReponse} className="flex border-t border-line">
                <input
                  value={reponse}
                  onChange={(e) => setReponse(e.target.value)}
                  placeholder="Votre réponse..."
                  className="flex-1 px-4 py-3 text-sm outline-none"
                />
                <button disabled={envoi} className="border-l border-line px-5 text-sm disabled:opacity-40">
                  Envoyer
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
