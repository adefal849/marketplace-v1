"use client";

import { useEffect, useState } from "react";
import { distanceKm, formatDistanceKm } from "@/lib/geo";

// Affiche la distance jusqu'à la boutique une fois la position du
// navigateur connue. Ne bloque rien si l'utilisateur refuse la
// géolocalisation ou si la boutique n'a pas encore de position enregistrée
// (dashboard vendeur) : l'élément reste simplement absent, comme avant.
export default function DistanceBoutique({ latitude, longitude }) {
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (latitude == null || longitude == null || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const km = distanceKm(
          position.coords.latitude,
          position.coords.longitude,
          latitude,
          longitude
        );
        setDistance(km);
      },
      () => setDistance(null),
      { timeout: 5000 }
    );
  }, [latitude, longitude]);

  if (distance == null) return null;

  return <span className="text-xs text-muted">{formatDistanceKm(distance)}</span>;
}
