"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Charge le script officiel Google Identity Services et affiche le vrai
// bouton "Se connecter avec Google" (rendu par Google lui-même, donc
// toujours à jour visuellement). Le jeton renvoyé est vérifié côté
// serveur dans /api/auth/google.
export default function GoogleSignIn() {
  const router = useRouter();
  const conteneurRef = useRef(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    async function repondre(reponse) {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: reponse.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      }
    }

    function initialiser() {
      if (!window.google || !conteneurRef.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: repondre });
      window.google.accounts.id.renderButton(conteneurRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }

    if (window.google) {
      initialiser();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = initialiser;
      document.body.appendChild(script);
    }
  }, [router]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  return <div ref={conteneurRef} className="flex justify-center" />;
}
