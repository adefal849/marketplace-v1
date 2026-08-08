# Divine Harvest Store

Plateforme e-commerce multi-vendeurs. Chaque boutique est accessible via
`/boutique/[slug]` (ex: `/boutique/mode-shop`).

Thème : noir et blanc uniquement (voir `tailwind.config.js`).

## Ce qui est fait

**Compte vendeur**
- Inscription / connexion (JWT + bcrypt), mot de passe oublié par email
- Choix du pays à l'inscription (personnalise l'offre)

**Boutique**
- Création de boutique (1 boutique par vendeur, slug généré automatiquement)
- Photo (logo) et description modifiables dans les paramètres
- Checklist de démarrage sur le dashboard (produit, photo, description)

**Produits**
- Ajout / suppression depuis le dashboard, avec catégorie et upload d'image
  (Cloudinary via le composant `UploadMedia`)
- Assistant IA vendeur : rédige une fiche produit complète (nom, description,
  prix, catégorie) à partir d'une description libre, ou suggère des idées de
  produits à partir du catalogue existant — la fiche générée remplit
  directement le formulaire, pas juste un chat à recopier

**Vitrine publique**
- Page boutique avec catalogue, recherche, filtre par catégorie
- Assistant IA client : répond aux questions sur les produits réels de la
  boutique (jamais d'invention de prix, stock ou caractéristiques)
- Chat direct avec le vendeur

**Achat**
- Panier multi-boutiques, persisté en local, pas de compte client requis
- Passage de commande : réparti automatiquement en une commande par
  boutique, avec vérification et décrément atomique du stock
- Suivi des commandes + changement de statut (en attente → confirmée →
  expédiée → livrée / annulée) côté vendeur

**Dashboard vendeur**
- Produits, commandes, messages, paramètres
- Ventes : chiffre d'affaires, nombre de commandes, panier moyen, tendance
  sur 14 jours, top produits, meilleurs clients

## Démarrage local

1. Installer les dépendances :
   ```
   npm install
   ```

2. Créer une base PostgreSQL gratuite sur [neon.tech](https://neon.tech)
   ou [supabase.com](https://supabase.com), copier l'URL de connexion.

3. Copier `.env.example` en `.env` et remplir `DATABASE_URL`, `JWT_SECRET`,
   les identifiants Cloudinary et `GROQ_API_KEY` (console.groq.com, gratuit)
   pour les deux assistants IA.

4. Créer les tables :
   ```
   npx prisma migrate dev --name init
   ```

5. Lancer le projet :
   ```
   npm run dev
   ```

## Déploiement (Vercel + Neon)

Le script `build` (`prisma db push --accept-data-loss && next build`)
pousse automatiquement le schéma vers la base à chaque déploiement : pas de
migration manuelle à lancer sur Neon. Il faut juste que toutes les variables
de `.env.example` soient renseignées dans les paramètres du projet Vercel
(y compris `GROQ_API_KEY`, sinon les deux assistants IA répondent une
erreur "non configuré").

## Prochaines étapes (dans l'ordre)

1. Espace admin (liste vendeurs, suspension via le champ `actif`)
2. Paiement réel (Mobile Money, CinetPay, Stripe...) — les commandes sont
   pour l'instant créées avec le statut "en attente" sans paiement
3. Avis clients, coupons, sous-domaines par boutique
