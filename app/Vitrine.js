import { Store, Package, Bell, MessageCircle, Bot, TrendingUp, Film } from "lucide-react";

const COULEURS = ["#F5A623", "#FF6B45", "#C8447A", "#1F4B37"];

const SCENES = [
  { Icone: Store, titre: "Ouvrez votre boutique", texte: "En quelques minutes, sans code." },
  { Icone: Package, titre: "Ajoutez vos produits", texte: "Photos, prix, stock, catégorie." },
  { Icone: Bell, titre: "Recevez des commandes", texte: "Notifiées en temps réel." },
  { Icone: MessageCircle, titre: "Discutez avec vos clients", texte: "Chat direct, sans intermédiaire." },
  { Icone: Bot, titre: "L'assistant IA rassure", texte: "Il répond aux questions produit." },
  { Icone: TrendingUp, titre: "Suivez vos tendances", texte: "Ce qui se vend le mieux, en direct." },
];

// Une "vitrine" qui défile en continu façon extrait vidéo, pour montrer le
// parcours complet de la marketplace sans avoir à héberger un fichier
// vidéo. Le tableau est dupliqué pour boucler sans coupure visible.
export default function Vitrine() {
  const scenes = [...SCENES, ...SCENES];

  return (
    <div className="overflow-hidden border-b border-line py-10">
      <p className="mb-6 flex items-center gap-2 px-6 text-sm text-muted md:px-12">
        <Film size={14} /> En direct de la marketplace
      </p>
      <div className="flex w-max gap-4 vitrine-defilement px-6 md:px-12">
        {scenes.map((s, i) => (
          <div
            key={i}
            className="carte-jeu flex w-56 shrink-0 flex-col gap-2 border-2 border-ink bg-paper p-5 shadow-[3px_4px_0_0_#0a0a0a] dark:border-paper dark:shadow-[3px_4px_0_0_#e5e5e5]"
          >
            <span
              className="flex h-9 w-9 items-center justify-center"
              style={{ background: COULEURS[i % COULEURS.length] }}
            >
              <s.Icone size={18} strokeWidth={1.75} color="#FBF1DF" />
            </span>
            <p className="font-display text-lg">{s.titre}</p>
            <p className="text-sm text-muted">{s.texte}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
