# Stack

Versions relevées sur npm le 2026-10-05. Rien n'est encore installé :
ce document est la cible, pas un état des lieux.

## Vue d'ensemble

```
Next.js (front, site public)  ──fetch REST──▶  Laravel (back, API + admin)
         │                                            │
    GSAP + Lenis                                 base de données
    React Bits                                   (à choisir)
```

Deux applications séparées, deux déploiements, deux `package.json`.
Le front ne parle jamais à la base directement : tout passe par l'API Laravel.
Deux langages, donc : TypeScript devant, PHP derrière.

## Frontend

| Quoi | Choix | Version | Pourquoi |
|------|-------|---------|----------|
| Framework | Next.js (App Router) | `16.3.8` | SSR/SSG pour le SEO, server components pour appeler l'API sans exposer le token |
| UI | React | `19.3.0` | imposé par Next |
| Animation | GSAP | `3.15.0` | timelines + ScrollTrigger ; la référence pour du scroll-driven sérieux |
| Intégration React | `@gsap/react` | `2.1.2` | hook `useGSAP`, nettoie les animations au démontage |
| Smooth scroll | Lenis | `1.3.26` | scroll inertiel, se branche sur ScrollTrigger |
| Composants animés | React Bits | — | 200+ composants à copier dans le repo, pas une dépendance |
| Styles | Tailwind CSS | `4.3.3` | config CSS-first, tokens de design directement dans `@theme` |
| Langage | TypeScript | `7.0.2` | types du front ; l'API étant en PHP, ses types sont écrits à la main dans `src/lib/` |

### GSAP + Lenis : la règle

Les deux touchent au scroll, donc ils doivent être synchronisés, sinon
ScrollTrigger se déclenche sur de mauvaises positions. Un seul endroit dans
l'app branche Lenis sur le ticker GSAP et sur `ScrollTrigger.update()`.
Détail d'implémentation à écrire ici une fois le provider en place.

Toujours animer via `useGSAP` (scope + cleanup automatique). Jamais de
`gsap.to()` nu dans un `useEffect` en React 19 — le double rendu du mode strict
empile les animations.

Skills disponibles pour ça : `/gsap-skills:gsap-core`, `gsap-scrolltrigger`,
`gsap-timeline`, `gsap-react`, `gsap-plugins`, `gsap-performance`.

**Répartition GSAP / CSS — décidé le 2026-10-15.** Les skills `emilkowalski` partent du
principe qu'un survol, une pression ou un changement d'état se fait en
transition CSS (interruptible, hors thread principal), et réservent le JS aux
séquences dynamiques. **GSAP pour le scroll et les timelines, CSS pour les micro-interactions**
(survol, pression, changement d'état) : interruptibles et hors thread
principal.
**Framer Motion est écarté (2026-10-15).** Le brief disait « Framer Motion
et/ou GSAP » ; on garde **GSAP + Lenis seuls**. Deux bibliothèques d'animation,
c'est du poids en double pour le même travail. Les exemples de skills qui
importent `framer-motion` sont à transposer en GSAP.

### Tailwind 4 : ce qui change

Pas de `tailwind.config.js`. La configuration est en CSS :

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-bg:     #…;
  --color-accent: #…;
  --font-display: "…", sans-serif;
}
```

Chaque entrée de `@theme` génère les utilitaires correspondants
(`bg-bg`, `text-accent`, `font-display`) **et** une variable CSS utilisable
partout, y compris depuis GSAP.

Conséquence directe : les tokens de [design.md](design.md#tokens) ne sont pas
recopiés à la main dans un fichier de config — `@theme` *est* leur
implémentation. Une seule source de vérité.

Build : plugin PostCSS `@tailwindcss/postcss` (`4.3.3`).

### React Bits

[reactbits.dev](https://reactbits.dev/) — 200+ composants React animés (textes,
backgrounds, micro-interactions). Modèle shadcn : on **copie le code source dans
le projet**. Le composant devient le nôtre, on l'édite librement, et il n'y a pas
de mise à jour automatique à gérer.

Trois façons d'installer, au choix et par composant :

```bash
# shadcn CLI (le plus direct si on a déjà shadcn)
npx shadcn@latest add @react-bits/BlurText-TS-TW   # suffixe TS-TW, toujours

# jsrepo
# commande exacte affichée sur la page de chaque composant

# ou copie manuelle depuis le site
```

Chaque page de composant affiche la commande prête à coller.

**Quatre variantes existent (`JS-CSS`, `JS-TW`, `TS-CSS`, `TS-TW`) — ici c'est
`TS-TW`, sans exception.** Le suffixe se choisit à l'installation ; mélanger les
variantes oblige à reprendre les composants à la main.

- Destination des composants copiés : `src/components/bits/` (à créer).
- Licence : MIT + Commons Clause — usage libre dans un produit ; la clause vise
  la revente de la bibliothèque elle-même. À relire si le projet devient un
  produit vendu.

## Backend — Laravel

**Décidé et installé le 2026-10-19.** Laravel 13.37 + Filament 5.10, MySQL,
dans `backend/`. Remplace Strapi, installé le matin même et supprimé le soir.

> La raison du changement n'est pas écrite ici : Malik ne l'a pas donnée, et
> ce document ne la devine pas. À compléter.

| | |
|---|---|
| Framework | Laravel `13.37` (PHP `^8.3`) |
| Admin | Filament `5.10`, panneau `admin` sur `/admin` |
| Base | MySQL `8.3` — base `aidevsprint` |
| API | REST, sans authentification, sous `/api` |
| Langue | `APP_LOCALE=fr` ; Filament est traduit, Laravel garde `en` en repli |

### Le modèle de données

Les trois entités ne viennent pas de Strapi, elles viennent des types du
front : `src/lib/edition.ts` et `src/lib/formateurs.ts`. Elles ont survécu au
changement de back mot pour mot, en `snake_case`.

| Table | Champs |
|------|--------|
| **editions** | `numero`, `date_debut`, `ville`, `lieu`, `prix_fcfa`, `quota`, `inscrits`, `format`, `publiee_le` |
| **formateurs** | `prenom`, `nom`, `role`, `photo`, `badge`, `transmet`, `github`, `linkedin`, `ordre` |
| **inscriptions** | `edition_id`, `nom`, `telephone`, `email`, `statut`, `montant_fcfa`, `reference_paiement` |

Relations : `Édition 1–N Inscription`, `Édition N–N Formateur` (table pivot
`edition_formateur`).

Trois choix qui ne sautent pas aux yeux :

- **`publiee_le`** — équivalent du « brouillon / publié » de Strapi. Tant
  qu'il est vide, l'API ne renvoie pas l'édition. Une session dont la date
  n'est pas arrêtée ne doit pas apparaître sur le site.
- **`ordre`** sur Formateur — la section alterne gauche / droite / gauche.
  Sans champ de tri, l'ordre dépendrait de l'ordre de création.
- **`reference_paiement`** — `$hidden` sur le modèle. Jamais sérialisée, même
  si un contrôleur renvoyait le modèle entier par inadvertance.

Presque tous les champs sont nullables, volontairement : la date, le quota,
le nombre d'inscrits et les liens des formateurs ne sont pas arrêtés. Une
colonne `NOT NULL` obligerait à inventer une valeur, et une fausse date en
base finit sur le site.

#### Non modélisés, et pourquoi

| Entité | Ce qui bloque |
|------|---------------|
| **Paiement** | ses champs sont ceux que renvoie la passerelle. CinetPay n'est pas arrêté. |
| **Ticket** | dépend de ce qui se passe après paiement — email, WhatsApp, billet ? Question ouverte dans CLAUDE.md. |
| **Portfolio**, **Article** | entités listées comme « à préciser », jamais tranchées. |

#### Questions ouvertes sur ces schémas

- `inscrits` est un **champ saisi**, pas un comptage des inscriptions liées.
  C'est volontaire tant que des places peuvent se vendre par WhatsApp — mais
  si tout passe par le site, ce champ devient une seconde vérité qui va
  diverger. À trancher.
- `statut` vaut `en_attente` / `payee` / `annulee`. Trois valeurs posées par
  défaut, pas validées.
- Un même numéro de téléphone peut s'inscrire deux fois à une édition : index
  mais pas contrainte unique, un parent pouvant inscrire deux personnes. À
  confirmer.

### L'API publique

Déclarée dans `routes/api.php`, cinq routes, aucune authentification : tout
ce qui est lisible ici est déjà public sur le site.

| Route | Rôle |
|---|---|
| `GET /api/editions` | les éditions **publiées**, la plus récente d'abord |
| `GET /api/editions/{numero}` | une édition par son numéro de session, pas son id |
| `GET /api/formateurs` | les intervenants, triés par `ordre` |
| `GET /api/formateurs/{id}` | un intervenant |
| `POST /api/inscriptions` | envoie une demande — 10 par minute et par IP |

**Il n'existe pas de route de lecture des inscriptions.** Ce serait la liste
publique de tous les inscrits avec leurs numéros de téléphone. C'est l'absence
de route qui tient cette sécurité, pas un réglage de permissions. L'admin lit
ces données par Filament, qui ne passe pas par l'API.

Deux détails qui comptent :

- **Les clés sont renommées à la frontière.** La base est en `snake_case`, le
  front en `camelCase` : `EditionResource` et `FormateurResource` font la
  traduction, et nulle part ailleurs. La forme renvoyée correspond une pour
  une aux types de `src/lib/`.
- **`EnregistrerInscription` n'accepte que quatre champs** : `edition_id`,
  `nom`, `telephone`, `email`. Ni `statut`, ni `montant_fcfa`, ni
  `reference_paiement` — ce sont des décisions du serveur. Les laisser passer
  permettrait de s'inscrire en se déclarant déjà payé.

`install:api` n'a pas été utilisé : la commande installe aussi Sanctum, dont
l'API n'a pas besoin. `routes/api.php` est déclaré à la main dans
`bootstrap/app.php`.

### L'admin Filament

`/admin`, trois ressources en français : Éditions, Intervenants, Inscriptions.
La liste des inscriptions est l'écran principal — recherche par nom et
téléphone, filtres par statut et par édition, total encaissé en bas de
colonne, et le nombre de demandes en attente en pastille dans le menu.

**Aucun compte n'existe.** À créer par Malik :

```bash
cd backend && php artisan make:filament-user
```

Manque encore, et c'était dans les exigences : **l'export CSV** (il demande un
`filament:exporter` et une file d'attente) et le **scan des tickets** (qui
dépend de ce qui se passe après paiement, non tranché).

### Ce que MyISAM cassait

WAMP livre MySQL avec `default_storage_engine = MyISAM` : pas de
transactions, pas de clés étrangères, et une limite d'index à 1000 octets qui
fait échouer la migration des sessions. `config/database.php` force
`'engine' => 'InnoDB'` pour que la base soit la même quelle que soit la
machine.

### Le formulaire côté site

Depuis le 2026-10-25, le site a son formulaire de réservation : une
**modale**, ouverte par n'importe quel « Réserver ma place ». Il n'y a plus
d'ancre `#inscription` — voir `src/components/inscription/`.

Trois champs, exactement ceux qu'accepte `EnregistrerInscription` : nom,
téléphone, email. L'email est facultatif côté API mais **obligatoire côté
formulaire**, parce que l'écran de confirmation promet un email.

L'adresse du back vient de `NEXT_PUBLIC_API_URL` (voir `.env.example`). Sans
elle, le formulaire ne tente aucun envoi et affiche le numéro WhatsApp : un
repli silencieux sur `localhost` partirait en production et perdrait les
inscriptions sans bruit.

`EditionResource` expose désormais `id` — c'est ce que le formulaire renvoie
en `edition_id`.

### Tests

`tests/Feature/ApiPubliqueTest.php` — 9 tests sur SQLite en mémoire. Ils
gardent la forme des réponses (une clé renommée casse le front en silence) et
surtout le fait qu'on ne peut ni lister les inscrits, ni se déclarer payé en
s'inscrivant.

### Reste à faire

- [ ] Créer le compte admin, saisir la vraie date et publier l'édition #1
- [ ] Brancher le front sur l'API : il lit encore `EDITION_PROVISOIRE` en dur
- [ ] L'email de confirmation : le formulaire **le promet**, Laravel ne
      l'envoie pas (ni Mailable, ni SMTP). À écrire avant la mise en ligne
- [ ] Le paiement CinetPay : initiation, webhook signé, statut
- [ ] Export CSV des inscrits
- [ ] Hébergement : Laravel ne tourne pas sur Vercel. Forge, VPS, o2switch ?
- [ ] Médias : disque local en dev, S3 ou Cloudinary en production ?

## Paiement

Encaissement de **20 000 FCFA** par inscription, en Côte d'Ivoire.

### Le point clé

**Stripe et PayPal ne sont pas la bonne réponse ici.** Le paiement local passe
massivement par le **mobile money** — Orange Money, Wave, MTN MoMo, Moov —
souvent sans compte bancaire. Il faut un agrégateur qui couvre ces moyens.

### Candidats

| | Couverture | Note |
|---|---|---|
| **CinetPay** | Orange Money, Wave, MTN MoMo, Moov + cartes, 10 pays francophones | la référence locale, citée partout pour la Côte d'Ivoire |
| **PayDunya** | 8 pays d'Afrique de l'Ouest | pertinent si expansion hors CI |
| **Kkiapay**, **FedaPay** | Afrique de l'Ouest francophone | alternatives sérieuses |

Proposition : **CinetPay**, une seule API pour les quatre opérateurs.

### À vérifier avant de s'engager

Les informations ci-dessus viennent d'articles de blog, pas du fournisseur.
Avant toute intégration, confirmer directement auprès de CinetPay :

- [ ] frais par transaction et seuil de versement
- [ ] pièces exigées pour ouvrir un compte marchand (entreprise ? particulier ?)
- [ ] délai de reversement des fonds
- [ ] environnement de test (sandbox) disponible
- [ ] fiabilité et sécurité des webhooks (signature, rejeu)

### Règle d'implémentation

Le statut d'une inscription ne devient jamais « payé » sur la foi d'une
redirection navigateur — **uniquement sur un webhook vérifié** côté serveur.
Une redirection se falsifie, pas une signature.

## Commandes

```bash
npm run dev      # http://localhost:3000
npm run build    # build de production — c'est AUSSI le vrai typecheck
npm start        # sert le build
```

Back (`backend/`) :

```bash
php artisan serve --port=8001   # API + admin ; 8000 est pris par ckb-site
php artisan migrate             # applique les migrations
php artisan db:seed --class=EditionUnSeeder
php artisan make:filament-user  # crée un compte d'admin — aucun n'existe
php artisan test                # SQLite en mémoire, ne touche pas MySQL
```

> MySQL doit tourner (WAMP). La base `aidevsprint` doit exister :
> `CREATE DATABASE aidevsprint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

> `backend/CLAUDE.md` et `backend/AGENTS.md` sont générés par l'installateur
> Laravel. Ils demandent d'installer `laravel/boost`. Rien n'a été installé :
> à garder ou à supprimer, au choix.

> `npx tsc --noEmit` seul échoue sur `LayoutProps` : ce type global est généré
> par Next dans `.next/types`. Le typecheck qui fait foi est celui de
> `npm run build`.

### Versions installées le 2026-10-15

| | |
|---|---|
| next | `16.4.2` |
| react / react-dom | `19.3.0` |
| typescript | `5.9.3` |
| tailwindcss | `4.3.3` |
| gsap | `3.15.0` |
| @gsap/react | `2.1.2` |
| lenis | `1.3.27` |

Échafaudé par `create-next-app` dans un dossier à part puis fusionné, pour
ne pas écraser `README.md`, `CLAUDE.md` ni le `.gitignore` existant.

`AGENTS.md` à la racine est généré et régénéré par `next dev` : il rappelle
que Next 16 a des ruptures d'API et qu'il faut lire
`node_modules/next/dist/docs/` avant de coder. Ne pas le supprimer.

## Conventions de code

- Nommage :
- Structure de `src/` :
- Gestion des erreurs :
- Ce qu'on ne fait pas :

## À décider

- [ ] Monorepo (`apps/web` + `apps/cms`) ou deux dépôts
- [ ] Base de données de production (MySQL en local, voir [Backend](#backend--laravel))
- [ ] Hébergement front et back
- [ ] Stratégie de tests
- [ ] Gestionnaire de paquets (npm / pnpm)

## Décisions

Une ligne par décision structurante, la plus récente en haut.

- **2026-10-19** — **Back : Laravel 13 + Filament 5, MySQL.** Strapi est
  abandonné et supprimé. Décision de Malik ; la raison n'est pas consignée, il
  ne l'a pas donnée. Le modèle de données (Édition, Formateur, Inscription)
  est conservé tel quel : il venait des types du front, pas de Strapi.
  Installé, migré, API vérifiée, 8 tests verts. Aucun compte d'admin, aucune
  édition publiée. Voir [Backend](#backend--laravel).
- **2026-10-19** — ~~Strapi 5.58 installé dans `backend/`, SQLite, trois types de
  contenu, permissions en code, API vérifiée~~ — annulé le jour même, voir
  ci-dessus. Le travail est dans le commit `739beea` si besoin de le relire.
- **2026-10-15** — **Design system figé** depuis l'affiche : couleurs mesurées
  au pixel, Inter + JetBrains Mono, aucune ombre, dégradé signature limité à
  4 emplacements. Voir [design.md](design.md#tokens).
- **2026-10-15** — ~~Back : Strapi (le brief disait Laravel, arbitré ici)~~ —
  annulé le 2026-10-19, retour à Laravel. **Framer Motion écarté**, GSAP + Lenis
  seuls — celle-là tient toujours.
- **2026-10-06** — Site **évolutif** (éditions, portfolios, blog) + **inscription
  et paiement en ligne**. Un back-office devient nécessaire ; paiement par
  mobile money, CinetPay proposé.
- **2026-10-06** — **Back reporté.** Strapi n'est plus acté : candidats
  Strapi / Payload / Laravel, départagés par la portabilité du back-office.
  Le front avance sans attendre.
- **2026-10-06** — **Puissance avant économie de tokens.** Aucun skill n'est
  élagué ; le coût (~3 340 tokens de descriptions par session) est assumé.
  Contrepartie obligatoire : [règle de préséance](design.md#règle-de-préséance).
- **2026-10-06** — Graphify installé puis **retiré le jour même** : confiance
  insuffisante. Skill et paquet désinstallés. À ne pas réintroduire sans
  décision explicite.
- **2026-10-06** — Skills `emilkowalski/skills` installés dans `.claude/skills/`
  (commit `e8a175d`, MIT). Conflits recensés dans [design.md](design.md#arbitrages-avec-les-skills-installés).
- **2026-10-06** — Grand écran : contenu cadré à 120rem, marges en %, plafond
  uniquement sur la longueur de ligne (70–75ch). Voir [design.md](design.md#pas-de-marges-mortes-sur-grand-écran).
- **2026-10-05** — TypeScript + Tailwind CSS 4. Conséquence : variante React Bits `TS-TW`.
- **2026-10-05** — ~~Back : Strapi 5~~ — annulé le 2026-10-06, voir ci-dessus.
- **2026-10-05** — Front : Next.js 16 + GSAP + Lenis + React Bits (copie de composants).
- **2026-10-05** — Structure du projet posée (CLAUDE.md + docs/ + design/ + src/).
