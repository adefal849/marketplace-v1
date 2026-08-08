import TopNav from "../TopNav";
import Footer from "../Footer";

export const metadata = { title: "Mentions légales — Divine Harvest Store" };

// Gabarit à compléter avec les vraies informations légales (forme
// juridique, numéro RCCM/SIRET, adresse du siège) avant publication —
// impossible à deviner à la place du vendeur.
export default function MentionsLegales() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <section className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-3xl">Mentions légales</h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted">
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">Éditeur du site</h2>
            <p className="mt-2 rounded-lg border-2 border-dashed border-line p-3">
              À compléter : nom/raison sociale, forme juridique, numéro
              d'immatriculation (RCCM, SIRET...), adresse du siège, capital
              social le cas échéant.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">Contact</h2>
            <p className="mt-2">
              Téléphone : 01 53 89 69 09
              <br />
              Email : DivineHarvestStore@gmail.com
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">Hébergement</h2>
            <p className="mt-2">
              Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">Fonctionnement de la marketplace</h2>
            <p className="mt-2">
              Divine Harvest Store met en relation des vendeurs indépendants
              et des acheteurs. Chaque boutique est gérée par son propre
              vendeur, qui reste responsable de ses produits, de leurs
              descriptions et de leur expédition.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
