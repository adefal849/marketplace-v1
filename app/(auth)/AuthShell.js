import BackButton from "../BackButton";
import LogoFindYourShop from "../LogoFindYourShop";

const FORMES = [
  { top: "-6%", left: "-8%", size: 140, color: "#2563EB" },
  { top: "70%", left: "80%", size: 110, color: "#7C3AED" },
  { top: "40%", left: "-10%", size: 80, color: "#16A34A" },
];

// Habillage partagé par connexion / inscription / mots de passe : fond
// canvas, formes flottantes discrètes, carte "à jouer" centrée. Garde la
// logique de chaque page intacte, ne touche qu'au décor autour du formulaire.
export default function AuthShell({ retourVers, retourTexte, eyebrow, titre, sousTitre, children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas dark:bg-ink">
      {FORMES.map((f, i) => (
        <div
          key={i}
          className="forme-flottante animate-deriver-lent opacity-30"
          style={{ top: f.top, left: f.left, width: f.size, height: f.size, background: f.color }}
        />
      ))}

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <div className="flex items-center justify-between">
          <BackButton secours={retourVers} texte={retourTexte} />
          <LogoFindYourShop size={20} />
        </div>

        <div className="carte-jeu mt-6 border-2 border-ink bg-paper p-6 shadow-[5px_6px_0_0_#0F172A] dark:border-line-dark dark:bg-panel-dark">
          {eyebrow && (
            <p className="font-body text-xs uppercase tracking-[0.2em] text-accent-dark dark:text-accent-light">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 font-hero text-3xl font-extrabold leading-tight">{titre}</h1>
          {sousTitre && <div className="mt-2 text-sm text-muted dark:text-paper/70">{sousTitre}</div>}

          {children}
        </div>
      </div>
    </main>
  );
}
