/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Palette Divine Harvest (v2 — alignée sur le sommaire "Dépasser
      // Shopify") : fond gris-bleu clair, cartes blanches, bleu comme
      // couleur de marque. IA reste violette (différenciateur produit).
      colors: {
        canvas: "#f8fafc",
        paper: "#ffffff",
        ink: "#0f172a",
        line: "#e2e8f0",
        "line-dark": "#334155",
        muted: "#64748b",
        accent: "#2563eb",
        "accent-dark": "#1d4ed8",
        "accent-light": "#dbeafe",
        leaf: "#16a34a",
        "leaf-light": "#dcfce7",
        warning: "#f59e0b",
        "warning-light": "#fef3c7",
        danger: "#dc2626",
        "danger-light": "#fee2e2",
        ia: "#7c3aed",
        "ia-light": "#ede9fe",
        "panel-dark": "#1e293b",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        hero: ["var(--font-hero)", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
      },
    },
  },
  plugins: [],
};
