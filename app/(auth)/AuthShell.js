import BackButton from "../BackButton";
import LogoDivineHarvest from "../LogoDivineHarvest";

const FORMES = [
  { top: "-6%", left: "-8%", size: 140, color: "#F5A623" },
  { top: "70%", left: "80%", size: 110, color: "#C8447A" },
  { top: "40%", left: "-10%", size: 80, color: "#FF6B45" },
];

// Habillage partagé par connexion / inscription / mots de passe : fond crème,
// formes flottantes discrètes, carte "à jouer" centrée. Garde la logique de
// chaque page intacte, ne touche qu'au décor autour du formulaire.
export default function AuthShell({ retourVers, retourTexte, eyebrow, titre, sousTitre, children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cream dark:bg-forest-deep">
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
          <LogoDivineHarvest size={20} />
        </div>

        <div className="carte-jeu mt-6 border-2 border-ink bg-paper p-6 shadow-[5px_6px_0_0_#12301F] dark:border-cream dark:bg-forest">
          {eyebrow && (
            <p className="font-body text-xs uppercase tracking-[0.2em] text-berry dark:text-gold">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 font-hero text-3xl font-extrabold leading-tight">{titre}</h1>
          {sousTitre && <div className="mt-2 text-sm text-muted dark:text-cream/70">{sousTitre}</div>}

          {children}
        </div>
      </div>
    </main>
  );
}
