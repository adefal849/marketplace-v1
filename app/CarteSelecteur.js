"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { CENTRE_PAR_DEFAUT } from "@/lib/geo";

// Sélecteur de position sur carte OpenStreetMap (via Leaflet), sans clé API
// ni facturation. Utilisé pour : 1) le vendeur qui positionne sa boutique
// dans le dashboard, 2) le client qui pointe son lieu de livraison au
// moment de la commande.
//
// Chargé uniquement côté client (voir les imports dynamiques dans les
// pages qui l'utilisent) car Leaflet a besoin de `window`.
export default function CarteSelecteur({ latitude, longitude, onChange, hauteur = 220 }) {
  const conteneurRef = useRef(null);
  const carteRef = useRef(null);
  const marqueurRef = useRef(null);
  const [pret, setPret] = useState(false);
  const [localisation, setLocalisation] = useState(false);

  useEffect(() => {
    let L;

    (async () => {
      // Import dynamique : Leaflet référence `window` dès son chargement,
      // donc même dans ce composant "use client" on l'importe seulement
      // au montage (jamais pendant le rendu serveur initial).
      L = (await import("leaflet")).default;

      // Les icônes par défaut de Leaflet référencent des chemins relatifs
      // qui n'existent plus une fois passés par le bundler Next.js — on les
      // repointe explicitement vers le CDN officiel de la version installée.
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!conteneurRef.current || carteRef.current) return;

      const depart = {
        lat: latitude ?? CENTRE_PAR_DEFAUT.lat,
        lng: longitude ?? CENTRE_PAR_DEFAUT.lng,
      };

      const carte = L.map(conteneurRef.current, {
        center: [depart.lat, depart.lng],
        zoom: latitude ? 15 : 12,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(carte);

      const marqueur = L.marker([depart.lat, depart.lng], { draggable: true }).addTo(carte);
      marqueur.on("dragend", () => {
        const { lat, lng } = marqueur.getLatLng();
        onChange(lat, lng);
      });

      carte.on("click", (e) => {
        marqueur.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      carteRef.current = carte;
      marqueurRef.current = marqueur;
      setPret(true);
    })();

    return () => {
      if (carteRef.current) {
        carteRef.current.remove();
        carteRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function utiliserMaPosition() {
    if (!navigator.geolocation) return;
    setLocalisation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        if (marqueurRef.current && carteRef.current) {
          marqueurRef.current.setLatLng([lat, lng]);
          carteRef.current.setView([lat, lng], 16);
        }
        onChange(lat, lng);
        setLocalisation(false);
      },
      () => setLocalisation(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={conteneurRef}
        style={{ height: hauteur }}
        className="w-full border border-line"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {pret ? "Cliquez sur la carte ou déplacez le repère pour ajuster la position." : "Chargement de la carte..."}
        </p>
        <button
          type="button"
          onClick={utiliserMaPosition}
          disabled={localisation}
          className="shrink-0 border border-line px-3 py-1.5 text-xs disabled:opacity-50"
        >
          {localisation ? "Localisation..." : "Utiliser ma position"}
        </button>
      </div>
    </div>
  );
}
