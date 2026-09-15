# Site vitrine — photographe portrait (La Réunion)

Next.js (App Router) + TypeScript + Tailwind CSS.

## Démarrer en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Contenu à modifier (sans toucher au code)

Tous les textes et données éditables sont centralisés dans `data/` :

- `data/site.ts` — nom de marque, e-mail, téléphone, liens Instagram/Facebook.
- `data/offers.ts` — les 3 séances (durée, contenu, prix).
- `data/home-content.ts` — textes de la page d'accueil (légendes, manifeste, accroches).
- `data/photo-slots.json` — la liste des emplacements photo du site (id, orientation, catégorie, texte alternatif).

## Photos

En attendant toutes tes vraies photos, le site utilise des visuels générés (dégradés + grain dans la palette de la marque). La liste des emplacements est dans `data/photo-slots.json` (id, orientation, ratio, catégorie).

Pour remplacer un emplacement par une vraie photo :

```bash
node scripts/import-photo.mjs <id-de-l-emplacement> /chemin/vers/ta-photo.jpg
```

Exemple :

```bash
node scripts/import-photo.mjs gallery-03 ~/Desktop/photos/atelier-01.jpg
```

Le script recadre automatiquement ta photo au ratio attendu (centré, sans jamais l'agrandir au-delà de sa résolution d'origine), remplace le fichier dans `public/images/photos/`, et régénère l'aperçu flou. Le site rafraîchit tout seul (un `?v=...` est ajouté à chaque image en fonction de sa date de modification) — pas besoin de vider le cache du navigateur.

Ne lance **pas** `node scripts/generate-placeholders.mjs` une fois que tu as commencé à importer de vraies photos : ce script régénère *tous* les emplacements avec des visuels générés et écraserait tes imports.

## Polices

- **Homemade Apple** (manuscrite) : fournie par toi, licence Apache 2.0, intégrée dans `app/fonts/`.
- **Freight Sans** (titres) : police payante, sans licence web valide disponible au moment de la construction du site → remplacée par **Public Sans** (Google Fonts), visuellement proche. Si tu achètes une licence web Freight Sans, remplace le loader dans `app/fonts/index.ts` — tout le reste du site lit la variable CSS `--font-sans` et n'a pas besoin de changer.

## Réservation & paiement (Stripe + Google Calendar + Supabase)

Le formulaire `/contact#reservation` propose désormais de vrais créneaux (calculés depuis `data/availability.ts`, en excluant ce qui est déjà occupé sur Google Agenda ou déjà réservé sur le site), fait payer l'acompte via Stripe Checkout, et crée automatiquement l'événement dans ton Google Agenda une fois le paiement confirmé.

Il faut créer 3 comptes externes (gratuits pour démarrer) et copier leurs clés dans `.env.local` (à partir de `.env.example`). Rien de tout ça ne s'expose au navigateur — tout reste côté serveur.

### 1. Supabase (stockage des réservations)

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, colle et exécute le contenu de [`supabase/schema.sql`](supabase/schema.sql) (une seule fois).
3. Dans **Project Settings → API**, copie :
   - `Project URL` → `SUPABASE_URL`
   - `service_role` (secret, pas `anon`) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Stripe (acompte)

1. Crée un compte sur [dashboard.stripe.com](https://dashboard.stripe.com) — reste en **mode test** tant que tu n'es pas prête à encaisser pour de vrai.
2. **Developers → API keys** → copie la clé secrète (`sk_test_...` ou `sk_live_...`) → `STRIPE_SECRET_KEY`.
3. **Developers → Webhooks → Add endpoint** :
   - URL : `https://tondomaine.fr/api/stripe/webhook` (une fois déployé — impossible de la créer avec une URL localhost)
   - Événements à écouter : `checkout.session.completed` et `checkout.session.expired`
   - Copie le **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

Pour tester en local avant de déployer, installe le [Stripe CLI](https://stripe.com/docs/stripe-cli) puis lance `stripe listen --forward-to localhost:3000/api/stripe/webhook` — il te donne un `whsec_...` temporaire à mettre dans `.env.local`.

### 3. Google Calendar (disponibilités + création des événements)

Le site utilise un **compte de service** Google (pas de connexion OAuth à renouveler) :

1. Sur [console.cloud.google.com](https://console.cloud.google.com), crée un projet, puis active l'**API Google Calendar** (menu *APIs & Services → Library*).
2. **APIs & Services → Credentials → Create credentials → Service account**. Donne-lui un nom, pas besoin de rôle particulier.
3. Ouvre le compte de service créé → onglet **Keys → Add key → Create new key → JSON**. Un fichier JSON se télécharge.
4. Dans ce fichier JSON :
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (garde les `\n` tels quels, entre guillemets)
5. Ouvre **Google Agenda** (ton agenda personnel, celui où tu notes tes rendez-vous) → **Paramètres** → sélectionne ton agenda → **Partager avec des personnes spécifiques** → ajoute l'adresse `client_email` ci-dessus, avec la permission **"Apporter des modifications aux événements"**.
6. Toujours dans les paramètres de cet agenda, section **Intégrer l'agenda**, copie l'**ID de l'agenda** (souvent ton adresse Gmail) → `GOOGLE_CALENDAR_ID`.

À partir de là, tout événement déjà présent sur cet agenda (ajouté à la main ou automatiquement) bloque les créneaux correspondants sur le site.

### 4. Espace admin (`/admin`)

Choisis toi-même deux valeurs secrètes et mets-les dans `.env.local` :

```
ADMIN_PASSWORD=un-mot-de-passe-que-toi-seule-connais
ADMIN_SESSION_SECRET=une-longue-chaine-aleatoire
```

`/admin` liste tes réservations (calendrier + tableau), avec les coordonnées client, le prix, l'acompte, le reste à payer et le statut. Tu peux y marquer une séance "Terminée" ou l'annuler.

### Comment ça fonctionne

- Le client choisit une date → le site interroge Google Agenda + Supabase en direct pour ne proposer que des créneaux vraiment libres.
- Dès qu'il choisit un créneau et valide, le site le réserve *temporairement* (20 minutes) le temps du paiement, puis l'envoie sur Stripe Checkout.
- La confirmation définitive ne se fait **jamais** sur la simple page de retour — uniquement via le webhook Stripe, qui marque la réservation "acompte payé", crée l'événement Google Agenda, et envoie les e-mails de confirmation (à toi et au client).
- Si le paiement n'aboutit pas (abandon, expiration), le créneau se libère automatiquement.
- Le montant de l'acompte est un pourcentage du prix (`DEPOSIT_RATE` dans `data/offers.ts`, 30% par défaut) — change ce seul nombre pour l'ajuster partout.
- Les horaires proposables se changent dans `data/availability.ts` sans toucher au reste du code.

## Emails (Resend)

```
RESEND_API_KEY=...
CONTACT_FROM_EMAIL="Réservations <reservations@tondomaine.fr>"
CONTACT_TO_EMAIL=toi@tondomaine.fr
NEXT_PUBLIC_SITE_URL=https://tondomaine.fr
```

`CONTACT_FROM_EMAIL` doit utiliser un domaine vérifié dans Resend. `NEXT_PUBLIC_SITE_URL` doit être l'URL réelle du site une fois déployé (utilisée pour les redirections Stripe).

## Déploiement (Netlify)

Le site est configuré pour [Netlify](https://app.netlify.com) — voir [`netlify.toml`](netlify.toml), qui active leur plugin Next.js officiel (routes API, images optimisées, `proxy.ts` en Edge Function : tout fonctionne sans configuration supplémentaire).

1. Sur Netlify : **Add new site → Import an existing project**, connecte ton dépôt Git.
2. Déploie une première fois pour obtenir ton URL définitive (`https://....netlify.app`, ou ton propre domaine si tu en branches un).
3. **Site configuration → Environment variables** : renseigne **toutes** les variables listées ci-dessus, y compris `NEXT_PUBLIC_SITE_URL` avec cette URL réelle.
4. Crée le webhook Stripe (étape 2 plus haut) en pointant vers `https://tondomaine/api/stripe/webhook`, puis ajoute `STRIPE_WEBHOOK_SECRET`.
5. Redéploie (**Deploys → Trigger deploy**).

`/admin` doit rester privé : `robots.ts` l'exclut déjà de l'indexation, mais l'accès reste protégé uniquement par le mot de passe `ADMIN_PASSWORD` — choisis-en un solide.
