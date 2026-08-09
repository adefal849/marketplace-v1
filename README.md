# Marketplace — V1

Plateforme multi-vendeurs. V1 sans nom de domaine : chaque boutique est
accessible via `/boutique/[slug]` (ex: `/boutique/mode-shop`).

Thème : noir et blanc uniquement (voir `tailwind.config.js`).

## Ce qui est fait

- Inscription / connexion vendeur (JWT + bcrypt)
- Création de boutique (1 boutique par vendeur, slug généré automatiquement)
- Ajout / suppression de produits depuis le dashboard vendeur
- Page publique boutique avec liste des produits
- Panier client multi-boutiques (persisté en local, pas de compte client requis)
- Passage de commande : un panier est réparti automatiquement en une
  commande par boutique, avec vérification et décrément du stock
- Liste des commandes + changement de statut (en attente → confirmée →
  expédiée → livrée / annulée) dans le dashboard vendeur
- Dashboard vendeur (produits, commandes, paramètres)

## Démarrage local

1. Installer les dépendances :
   ```
   npm install
   ```

2. Créer une base PostgreSQL gratuite sur [neon.tech](https://neon.tech)
   ou [supabase.com](https://supabase.com), copier l'URL de connexion.

3. Copier `.env.example` en `.env` et remplir `DATABASE_URL` et `JWT_SECRET`.

4. Créer les tables :
   ```
   npx prisma migrate dev --name init
   ```

5. Lancer le projet :
   ```
   npm run dev
   ```

## Prochaines étapes (dans l'ordre)

1. Espace admin (liste vendeurs, suspension via le champ `actif`)
2. Paiement réel (Mobile Money, CinetPay, Stripe...) — les commandes sont
   pour l'instant créées avec le statut "en attente" sans paiement
3. Avis clients, coupons, sous-domaines par boutique
