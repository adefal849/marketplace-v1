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
        // Palette "récolte" : réservée au hero, à la vitrine et aux accents
        // interactifs — le reste du site garde le noir/blanc.
        forest: "#1F4B37",
        "forest-deep": "#12301F",
        gold: "#F5A623",
        papaya: "#FF6B45",
        berry: "#C8447A",
        cream: "#FBF1DF",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        hero: ["var(--font-hero)", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        blob: "42% 58% 65% 35% / 45% 40% 60% 55%",
      },
      keyframes: {
        deriver: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "33%": { transform: "translate(10px, -14px) rotate(6deg)" },
          "66%": { transform: "translate(-8px, 10px) rotate(-4deg)" },
        },
        deriverLent: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "50%": { transform: "translate(-14px, 12px) rotate(-8deg)" },
        },
        apparition: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        deriver: "deriver 9s ease-in-out infinite",
        "deriver-lent": "deriverLent 13s ease-in-out infinite",
        apparition: "apparition 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
