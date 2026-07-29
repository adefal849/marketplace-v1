"use client";

import { useEffect, useRef, useState } from "react";
import { X, User } from "lucide-react";

// Bulle "Discuter avec le vendeur" (humain, distincte de l'assistant IA).
// Nom/email demandés une seule fois, gardés en localStorage pour retrouver
// le même fil de discussion lors des prochaines visites de cette boutique.
export default function ContactVendeurChat({ slug, boutiqueNom }) {
  const cleId = `conversation:${slug}`;
  const cleProfil = "profilAcheteur";

  const [ouvert, setOuvert] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [profil, setProfil] = useState({ nom: "", email: "" });
  const [messages, setMessages] = useState([]);
  const [saisie, setSaisie] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    setConversationId(localStorage.getItem(cleId));
    const profilStocke = localStorage.getItem(cleProfil);
    if (profilStocke) setProfil(JSON.parse(profilStocke));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualisation automatique du fil toutes les 4 secondes tant que le
  // panneau est ouvert — pas de websocket nécessaire pour ce volume.
  useEffect(() => {
    if (!ouvert || !conversationId) return;

    async function charger() {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
      } catch {
        // silencieux, on réessaiera au prochain intervalle
      }
    }

    charger();
    const intervalle = setInterval(charger, 4000);
    return () => clearInterval(intervalle);
  }, [ouvert, conversationId]);

  useEffect(() => {
    if (ouvert) finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ouvert]);

  async function envoyer(e) {
    e.preventDefault();
    const texte = saisie.trim();
    if (!texte || envoi) return;
    setEnvoi(true);

    try {
      if (!conversationId) {
        // Première fois : on doit avoir nom + email
        if (!profil.nom || !profil.email) {
          setEnvoi(false);
          return;
        }
        localStorage.setItem(cleProfil, JSON.stringify(profil));

        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            clientNom: profil.nom,
            clientEmail: profil.email,
            message: texte,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem(cleId, data.conversationId);
          setConversationId(data.conversationId);
          setMessages([{ id: "tmp", auteur: "CLIENT", contenu: texte, createdAt: new Date() }]);
        }
      } else {
        setMessages((m) => [...m, { id: `tmp-${Date.now()}`, auteur: "CLIENT", contenu: texte, createdAt: new Date() }]);
        await fetch(`/api/conversations/${conversationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contenu: texte }),
        });
      }
      setSaisie("");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-20">
      {ouvert && (
        <div className="mb-3 flex h-96 w-72 flex-col border border-line bg-paper shadow-lg sm:w-80">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-medium">Discuter avec {boutiqueNom}</p>
            <button onClick={() => setOuvert(false)} aria-label="Fermer">
              <X size={16} />
            </button>
          </div>

          {!conversationId ? (
            <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
              <p className="text-muted">
                Laissez votre nom et email pour démarrer la discussion avec le vendeur.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <input
                  placeholder="Votre nom"
                  value={profil.nom}
                  onChange={(e) => setProfil({ ...profil, nom: e.target.value })}
                  className="border border-line px-3 py-2"
                />
                <input
                  placeholder="Votre email"
                  type="email"
                  value={profil.email}
                  onChange={(e) => setProfil({ ...profil, email: e.target.value })}
                  className="border border-line px-3 py-2"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
              {messages.map((m) => (
                <div key={m.id} className={`mb-3 flex ${m.auteur === "CLIENT" ? "justify-end" : "justify-start"}`}>
                  <p
                    className={
                      m.auteur === "CLIENT"
                        ? "max-w-[85%] border border-ink bg-ink px-3 py-2 text-paper"
                        : "max-w-[85%] border border-line px-3 py-2"
                    }
                  >
                    {m.contenu}
                  </p>
                </div>
              ))}
              <div ref={finRef} />
            </div>
          )}

          <form onSubmit={envoyer} className="flex border-t border-line">
            <input
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder={conversationId ? "Votre message..." : "Votre question..."}
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button disabled={envoi} className="border-l border-line px-4 text-sm disabled:opacity-40">
              Envoyer
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOuvert(!ouvert)}
        className="flex items-center gap-2 border border-current px-4 py-3 text-sm shadow-lg transition-colors hover:bg-ink hover:text-paper"
      >
        {ouvert ? <X size={16} /> : <User size={16} />}
        {ouvert ? "Fermer" : "Discuter avec le vendeur"}
      </button>
    </div>
  );
}
