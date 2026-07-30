// Filigrane décoratif du hero : une illustration de vitrine en trait fin,
// très large et très discrète (opacité faible), en SVG pur donc aucune
// image à héberger et un poids quasi nul.
export default function HeroFiligrane() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 400"
      className="pointer-events-none absolute -right-16 -top-10 h-[480px] w-[480px] select-none text-line md:-right-10 md:-top-20 md:h-[620px] md:w-[620px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {/* Vitrine principale */}
      <path d="M60 150 80 60h240l20 90" />
      <path d="M60 150v190h280V150" />
      <path d="M160 340v-90h80v90" />
      <path d="M60 150h280" />
      {/* Sac shopping, en second plan */}
      <path d="M250 210h90v110h-90z" opacity="0.6" />
      <path d="M268 210v-24a17 17 0 0 1 34 0v24" opacity="0.6" />
      {/* Étiquette prix */}
      <circle cx="330" cy="90" r="26" opacity="0.5" />
      <path d="M320 90h20M330 80v20" opacity="0.5" />
    </svg>
  );
}
