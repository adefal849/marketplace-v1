/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Palette de base : noir et blanc pour les pages produit/dashboard
      // (lisibilité, sérieux). Un accent chaleureux "récolte" réservé aux
      // pages marketing (accueil, connexion, inscription).
      colors: {
        paper: "#ffffff",
        ink: "#0a0a0a",
        line: "#e5e5e5",
        "line-dark": "#262626",
        muted: "#737373",
        accent: "#d97706",
        "accent-dark": "#92400e",
        "accent-light": "#fef3c7",
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
