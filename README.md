# Marketplace — V1

Plateforme multi-vendeurs. V1 sans nom de domaine : chaque boutique est
accessible via `/boutique/[slug]` (ex: `/boutique/mode-shop`).

Thème : noir et blanc uniquement (voir `tailwind.config.js`).

## Ce qui est fait

- Inscription / connexion vendeur (JWT + bcrypt)
- Création de boutique (1 boutique par vendeur, slug généré automatiquement)
- Ajout de produits (API prête, formulaire dashboard à brancher ensuite)
- Page publique boutique avec liste des produits
- Dashboard vendeur minimal

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

1. Formulaire d'ajout de produit dans le dashboard (brancher `/api/produits`)
2. Liste des produits + stock dans le dashboard
3. Panier côté client (state React, pas besoin de DB)
4. Commande simple (statut "en attente", pas encore de paiement réel)
5. Liste des commandes dans le dashboard vendeur
6. Espace admin (liste vendeurs, suspension via le champ `actif`)

Le paiement réel (Stripe, CinetPay, Mobile Money...), les avis, coupons et
sous-domaines viendront après cette V1 fonctionnelle.
