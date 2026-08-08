// Logo "Divine Harvest Store" : un épi de blé stylisé, en trait fin pour
// rester cohérent avec le reste de l'interface (même style que les icônes
// lucide-react utilisées partout ailleurs).
export default function LogoDivineHarvest({ size = 18 }) {
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
      <path d="M12 21c0-6 0-10 0-15" />
      <path d="M12 6c-2-2-2-4 0-4s2 2 0 4" />
      <path d="M12 9c-2.5-1-4-3-3-5 2 0 3.5 2 3 5z" />
      <path d="M12 9c2.5-1 4-3 3-5-2 0-3.5 2-3 5z" />
      <path d="M12 13c-2.5-1-4-3-3-5 2 0 3.5 2 3 5z" />
      <path d="M12 13c2.5-1 4-3 3-5-2 0-3.5 2-3 5z" />
      <path d="M7 21h10" />
    </svg>
  );
}
