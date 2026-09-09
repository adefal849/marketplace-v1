// Logo "Find Your Shop" : une loupe qui révèle une petite boutique (toit +
// façade), en trait fin pour rester cohérent avec les icônes lucide-react
// utilisées partout ailleurs dans l'interface.
export default function LogoFindYourShop({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M6.5 8.5l3.5-3 3.5 3" />
      <path d="M6.8 8.8v3.4h6.4V8.8" />
      <path d="M9.3 12.2v-2.1h1.4v2.1" />
      <line x1="15" y1="15" x2="21" y2="21" />
    </svg>
  );
}
