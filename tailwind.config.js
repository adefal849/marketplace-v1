/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Palette élargie : noir/blanc pour la structure, mais couleur
      // partout où ça donne de la vie — CTA, badges, IA, succès.
      colors: {
        paper: "#ffffff",
        ink: "#0a0a0a",
        line: "#e5e5e5",
        "line-dark": "#262626",
        muted: "#737373",
        accent: "#d97706",
        "accent-dark": "#92400e",
        "accent-light": "#fef3c7",
        leaf: "#15803d",
        "leaf-light": "#dcfce7",
        ia: "#7c3aed",
        "ia-light": "#ede9fe",
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
