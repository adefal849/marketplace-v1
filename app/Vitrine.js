const SCENES = [
  { emoji: "🛍️", titre: "Ouvrez votre boutique", texte: "En quelques minutes, sans code." },
  { emoji: "📦", titre: "Ajoutez vos produits", texte: "Photos, prix, stock, catégorie." },
  { emoji: "🔔", titre: "Recevez des commandes", texte: "Notifiées en temps réel." },
  { emoji: "💬", titre: "Discutez avec vos clients", texte: "Chat direct, sans intermédiaire." },
  { emoji: "🤖", titre: "L'assistant IA rassure", texte: "Il répond aux questions produit." },
  { emoji: "📈", titre: "Suivez vos tendances", texte: "Ce qui se vend le mieux, en direct." },
];

// Une "vitrine" qui défile en continu façon extrait vidéo, pour montrer le
// parcours complet de la marketplace sans avoir à héberger un fichier
// vidéo. Le tableau est dupliqué pour boucler sans coupure visible.
export default function Vitrine() {
  const scenes = [...SCENES, ...SCENES];

  return (
    <div className="overflow-hidden border-b border-line py-10">
      <p className="mb-6 px-6 text-sm text-muted md:px-12">🎬 En direct de la marketplace</p>
      <div className="flex w-max gap-4 vitrine-defilement px-6 md:px-12">
        {scenes.map((s, i) => (
          <div
            key={i}
            className="flex w-56 shrink-0 flex-col gap-2 border border-line p-5"
          >
            <span className="text-3xl">{s.emoji}</span>
            <p className="font-display text-lg">{s.titre}</p>
            <p className="text-sm text-muted">{s.texte}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
