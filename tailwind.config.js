/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Palette volontairement limitée : noir et blanc uniquement,
      // + une échelle de gris pour les bordures / états.
      colors: {
        paper: "#ffffff",
        ink: "#0a0a0a",
        line: "#e5e5e5",
        "line-dark": "#262626",
        muted: "#737373",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
      },
    },
  },
  plugins: [],
};
