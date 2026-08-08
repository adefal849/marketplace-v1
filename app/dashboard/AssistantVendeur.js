"use client";

import { useState } from "react";
import { Wand2, Lightbulb, Loader2 } from "lucide-react";
import { labelCategorie } from "../categories";

// Copilote IA du vendeur : rédige une fiche produit à partir d'une
// description libre, ou suggère des idées de produits — puis remplit
// directement le formulaire d'ajout via onAppliquerFiche (contrairement
// à un simple chat, ça évite au vendeur de tout recopier à la main).
export default function AssistantVendeur({ onAppliquerFiche }) {
  const [ouvert, setOuvert] = useState(false);
  const [mode, setMode] = useState(null); // "fiche" | "idees"
  const [description, setDescription] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [fiche, setFiche] = useState(null);
  const [idees, setIdees] = useState([]);

  function fermer() {
    setOuvert(false);
    setMode(null);
    setFiche(null);
    setIdees([]);
    setDescription("");
    setErreur("");
  }

  async function appelerAssistant(action, desc) {
    setErreur("");
    setChargement(true);
    setFiche(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/assistant-vendeur", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, description: desc }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Une erreur est survenue.");
        return;
      }

      if (action === "fiche_produit") {
        setFiche(data.fiche);
      } else {
        setIdees(data.idees || []);
      }
    } catch {
      setErreur("Impossible de contacter l'assistant.");
    } finally {
      setChargement(false);
    }
  }

  function choisirIdee(idee) {
    setMode("fiche");
    setDescription(idee);
    appelerAssistant("fiche_produit", idee);
  }

  function utiliserFiche() {
    onAppliquerFiche(fiche);
    fermer();
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="flex items-center gap-2 border border-ink px-4 py-3 text-sm"
      >
        <Wand2 size={16} /> Assistant IA — rédiger une fiche produit
      </button>
    );
  }

  return (
    <section className="border border-line p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg">
          <Wand2 size={18} /> Assistant IA
        </h3>
        <button onClick={fermer} className="text-xs underline">
          Fermer
        </button>
      </div>

      {!mode && (
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={() => setMode("fiche")}
            className="border border-line px-3 py-2 text-left text-sm hover:border-ink"
          >
            Rédiger une fiche produit à partir d'une description
          </button>
          <button
            onClick={() => {
              setMode("idees");
              appelerAssistant("idee_produit");
            }}
            className="flex items-center gap-2 border border-line px-3 py-2 text-left text-sm hover:border-ink"
          >
            <Lightbulb size={14} /> Me suggérer des idées de produits
          </button>
        </div>
      )}

      {mode === "fiche" && !fiche && (
        <div className="mt-4 flex flex-col gap-3">
          <textarea
            autoFocus
            placeholder="Ex : sac à main en cuir marron, fait main, format A4..."
            className="border border-line px-3 py-2 text-sm"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            disabled={chargement || !description.trim()}
            onClick={() => appelerAssistant("fiche_produit", description)}
            className="flex items-center justify-center gap-2 border border-ink bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
          >
            {chargement && <Loader2 size={14} className="animate-spin" />}
            {chargement ? "Génération..." : "Générer la fiche"}
          </button>
        </div>
      )}

      {mode === "idees" && (
        <div className="mt-4 flex flex-col gap-2">
          {chargement && <p className="text-sm text-muted">Recherche d'idées...</p>}
          {idees.map((idee, i) => (
            <button
              key={i}
              onClick={() => choisirIdee(idee)}
              className="border border-line px-3 py-2 text-left text-sm hover:border-ink"
            >
              {idee}
            </button>
          ))}
        </div>
      )}

      {fiche && (
        <div className="mt-4 border border-line p-3 text-sm">
          <p className="font-display">{fiche.nom}</p>
          <p className="mt-1 text-muted">{fiche.description}</p>
          <p className="mt-2">
            {fiche.prix ? `${fiche.prix} FCFA` : "Prix non déterminé"}
            {fiche.categorie ? ` — ${labelCategorie(fiche.categorie)}` : ""}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={utiliserFiche}
              className="border border-ink bg-ink px-3 py-2 text-xs text-paper"
            >
              Utiliser cette fiche
            </button>
            <button onClick={() => setFiche(null)} className="border border-line px-3 py-2 text-xs">
              Réessayer
            </button>
          </div>
        </div>
      )}

      {erreur && <p className="mt-3 text-sm">{erreur}</p>}
    </section>
  );
}
