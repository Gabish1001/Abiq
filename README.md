# ABIQ — Aventures bibliques

Application web gratuite (installable sur téléphone) qui fait découvrir la Bible aux enfants de 6 à 8 ans.
Chaque « page du Grand Livre » se joue en cinq étapes : **mystère → puzzle → histoire → quiz → récompense**.
Une nouvelle page s'ouvre chaque dimanche.

Quatre espaces :

| Espace | Pour qui | Adresse |
|---|---|---|
| Enfant | l'enfant, depuis le profil créé par un adulte | `/jouer/…` |
| Famille | les parents : profils, temps de jeu, suivi | `/famille` |
| Animateur | école du dimanche : groupes, séances, bilans | `/animateur` |
| Administration | contenus, validation, médias, comptes | `/admin` |

Les enfants d'un groupe rejoignent une séance avec un code à 6 lettres sur `/rejoindre`, sans compte.

---

## Essayer tout de suite (mode démo)

Sans configuration, l'application tourne en **mode démonstration** : tout est stocké dans le navigateur,
avec une famille et un groupe d'exemple. Sur le site déployé, le bouton « Essayer sans compte » de l'accueil
ouvre aussi la démo (ou ajouter `?demo=1` à l'adresse ; `?demo=0` pour en sortir).

```bash
npm install
npm run dev        # http://localhost:5173
```

---

## Mise en ligne pour le test grandeur nature

Compter environ 20 minutes. Il faut un compte GitHub (le dépôt), un compte [Supabase](https://supabase.com)
(base de données et connexions) et un compte [Vercel](https://vercel.com) (hébergement). Les offres gratuites suffisent pour le test.

### 1. Créer la base Supabase

1. Sur Supabase, **New project**. Choisir la région la plus proche (Europe de l'Ouest pour l'Afrique de l'Ouest), noter le mot de passe.
2. Ouvrir **SQL Editor**, coller tout le contenu de [`supabase/schema.sql`](supabase/schema.sql), cliquer **Run**.
3. Toujours dans SQL Editor, coller [`supabase/seed.sql`](supabase/seed.sql) et cliquer **Run**.
   Ça installe les 8 pages : Noé est ouverte tout de suite, puis une page s'ouvre chaque dimanche à 6 h.
   Pour ouvrir plus de pages dès le départ, générer le fichier avec `SEED_OPEN=3 npm run seed` avant de le lancer,
   ou simplement changer les dates ensuite dans **Administration > Contenus**.

### 2. Régler la connexion (Supabase > Authentication)

- **Sign In / Providers** : laisser **Email** activé, et **activer « Allow anonymous sign-ins »**.
  C'est ce qui permet aux appareils des enfants de rejoindre une séance sans compte.
- **URL Configuration** : *Site URL* = l'adresse Vercel (ex. `https://abiq.vercel.app`).
  Dans *Redirect URLs*, ajouter `https://abiq.vercel.app/**` (et `http://localhost:5173/**` pour le développement).
- **Email Templates** : traduire les deux modèles utilisés (voir plus bas).
- **Rate Limits** : par défaut, 30 connexions anonymes par heure et par adresse IP. Si plus de 30 enfants
  rejoignent une séance depuis le même Wi-Fi dans l'heure, augmenter cette limite.
- Pour un vrai lancement, configurer un **SMTP** (Project Settings > Authentication) : l'envoi d'e-mails
  intégré à Supabase est très limité et réservé aux tests.

### 3. Déployer sur Vercel

1. **Add New > Project**, importer le dépôt GitHub `Abiq`. Vercel détecte Vite tout seul.
2. Dans **Environment Variables**, ajouter (valeurs dans Supabase > Project Settings > API) :
   - `VITE_SUPABASE_URL` : l'URL du projet
   - `VITE_SUPABASE_ANON_KEY` : la clé publique (*anon* / *publishable*), **jamais** la clé *service_role*
   - `VITE_CONTACT_EMAIL` : l'adresse de contact affichée dans les pages légales
3. **Deploy**. Chaque nouveau commit sur `main` redéploie automatiquement.

### 4. Devenir administrateur

1. Créer votre compte sur le site déployé (`/inscription`) et confirmer l'e-mail.
2. Dans Supabase > SQL Editor :
   ```sql
   update public.profiles set is_admin = true, is_animateur = true where email = 'votre@email.com';
   ```
3. Se reconnecter : le menu **Administration** apparaît. Ensuite, les rôles se donnent depuis **Administration > Utilisateurs**.

### Modèles d'e-mails en français

*Confirm signup* — sujet : `Confirmez votre compte ABIQ`
```html
<h2>Bienvenue sur ABIQ</h2>
<p>Pour activer votre compte, touchez le bouton ci-dessous.</p>
<p><a href="{{ .ConfirmationURL }}">Activer mon compte</a></p>
<p>Si vous n'avez pas créé de compte, ignorez ce message.</p>
```

*Reset password* — sujet : `Nouveau mot de passe ABIQ`
```html
<h2>Choisir un nouveau mot de passe</h2>
<p>Touchez le bouton ci-dessous pour choisir un nouveau mot de passe.</p>
<p><a href="{{ .ConfirmationURL }}">Choisir mon mot de passe</a></p>
<p>Si vous n'avez rien demandé, ignorez ce message : votre mot de passe ne change pas.</p>
```

---

## Déroulé conseillé du test

1. **Avant** : relire les 8 pages dans Administration (idéalement avec un pasteur ou un moniteur),
   les essayer avec « Essayer comme un enfant », corriger directement dans l'éditeur.
2. **Familles** : chaque parent crée son compte, un profil par enfant, et règle le temps de jeu.
3. **Église** : l'animateur crée un groupe (prénoms seulement), prépare une séance,
   - *un seul écran* : il projette et touche les réponses choisies par le groupe ;
   - *chacun son appareil* : il affiche le code, chaque enfant tape le code et choisit son prénom.
4. **Après** : bilans dans la page de la séance, statistiques globales dans Administration.

---

## Application Android (APK)

L'appli Android ouvre le site en plein écran grâce à Chrome (Trusted Web Activity) : même contenu,
mises à jour instantanées, et la lecture à voix haute fonctionne.

- **Télécharger la dernière version** : https://github.com/Gabish1001/Abiq/releases/latest/download/abiq.apk
  (sur le téléphone, autoriser l'installation depuis le navigateur quand Android le demande). Android 7 minimum.
- **Construction** : automatique sur GitHub (workflow « Application Android ») dès qu'un fichier de `android/` change,
  ou manuellement depuis l'onglet *Actions* > *Application Android* > *Run workflow*.
- **Signature** : `android/abiq.keystore`, protégé par le secret GitHub `ANDROID_KEYSTORE_PASSWORD`.
  Ne jamais perdre ce mot de passe : sans lui, impossible de publier une mise à jour installable par-dessus.
- **Plein écran** : `public/.well-known/assetlinks.json` lie l'appli (`com.abiq.aventures`) au site.
  Si le domaine change, mettre à jour `android/twa-manifest.json` (host, URLs) et republier ce fichier sur le nouveau domaine.

---

## Pour les développeurs

- **Stack** : Vite + React 19 + TypeScript, React Router, PWA (vite-plugin-pwa), Supabase (Postgres, Auth, Storage).
- **Sécurité** : toutes les règles d'accès sont dans la base (Row Level Security). Un parent ne voit que ses enfants,
  un animateur que ses groupes, un appareil de séance que l'enfant choisi et seulement pendant la séance.
  Tests : `supabase/tests/rls_test.sql` (avec `supabase/tests/stubs.sql` sur un Postgres local).
- **Contenus** : `src/content/` (8 pages de départ). Après une modification, `npm run seed` régénère `supabase/seed.sql`.
  Une fois en ligne, les contenus se modifient dans l'administration (historique des versions inclus).
- **Illustrations** : dessinées par le code (`src/art/`), donc légères et disponibles hors réseau.
  Galerie de contrôle : `npm run dev` puis `/art.html`. Chaque image peut être remplacée par une image importée dans l'éditeur.
- **Icônes** : `npm run icons` (nécessite Playwright).
- **Progression** : enregistrée d'abord sur l'appareil puis envoyée ; en cas de coupure, l'envoi reprend au retour du réseau.

```
src/
  art/        illustrations dessinées
  content/    textes des 8 pages
  game/       moteur de jeu (étapes, Lumi, sons, voix, sauvegarde)
  lib/        accès aux données (Supabase et démo), authentification
  pages/      écrans : public, family, kid, anim, admin
  styles/     feuilles de style
supabase/     schema.sql, seed.sql, tests
```
