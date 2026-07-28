"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [sombre, setSombre] = useState(false);

  useEffect(() => {
    const enregistre = localStorage.getItem("theme");
    if (enregistre === "dark") {
      document.documentElement.classList.add("dark");
      setSombre(true);
    }
  }, []);

  function basculer() {
    const nouveau = !sombre;
    setSombre(nouveau);
    document.documentElement.classList.toggle("dark", nouveau);
    localStorage.setItem("theme", nouveau ? "dark" : "light");
  }

  return (
    <button
      onClick={basculer}
      className="border border-current px-3 py-1 text-xs"
      aria-label="Changer de thème"
    >
      {sombre ? "Mode clair" : "Mode sombre"}
    </button>
  );
}
