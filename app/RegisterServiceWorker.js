"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Échec silencieux : la PWA reste utilisable normalement en ligne,
        // seul le mode hors-ligne ne sera pas disponible.
      });
    }
  }, []);

  return null;
}
