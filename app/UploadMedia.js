"use client";

import { useState } from "react";

// Upload direct navigateur → Cloudinary (preset non-signé), donc pas de
// limite de taille liée à notre serveur (contrairement à un upload qui
// passerait par une route API Next.js, limité à quelques Mo sur Vercel).
// Marche pour une image comme pour une vidéo, resource_type "auto" laisse
// Cloudinary déterminer le type.
export default function UploadMedia({ onUploaded, label = "Photo ou vidéo du produit" }) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  async function gererFichier(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreur("");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) {
      setErreur("Upload non configuré (voir variables Cloudinary).");
      return;
    }

    setEnCours(true);
    const donnees = new FormData();
    donnees.append("file", fichier);
    donnees.append("upload_preset", preset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: donnees,
      });
      const data = await res.json();

      if (!res.ok) {
        setErreur("Échec de l'envoi, réessayez.");
        return;
      }
      onUploaded(data.secure_url);
    } catch {
      setErreur("Échec de l'envoi, vérifiez votre connexion.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        type="file"
        accept="image/*,video/*"
        onChange={gererFichier}
        disabled={enCours}
        className="border border-line px-3 py-2 text-xs"
      />
      {enCours && <span className="text-xs text-muted">Envoi en cours...</span>}
      {erreur && <span className="text-xs">{erreur}</span>}
    </label>
  );
}
