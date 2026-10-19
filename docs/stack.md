# Stack

Versions relevées sur npm le 2026-10-05. Rien n'est encore installé :
ce document est la cible, pas un état des lieux.

## Vue d'ensemble

```
Next.js (front, site public)  ──fetch REST/GraphQL──▶  Strapi (back, API + admin)
         │                                                   │
    GSAP + Lenis                                        base de données
    React Bits                                          (à choisir)
```

Deux applications séparées, deux déploiements, deux `package.json`.
Le front ne parle jamais à la base directement : tout passe par l'API Strapi.

## Frontend

| Quoi | Choix | Version | Pourquoi |
|------|-------|---------|----------|
| Framework | Next.js (App Router) | `16.3.8` | SSR/SSG pour le SEO, server components pour appeler Strapi sans exposer le token |
| UI | React | `19.3.0` | imposé par Next |
| Animation | GSAP | `3.15.0` | timelines + ScrollTrigger ; la référence pour du scroll-driven sérieux |
| Intégration React | `@gsap/react` | `2.1.2` | hook `useGSAP`, nettoie les animations au démontage |
| Smooth scroll | Lenis | `1.3.26` | scroll inertiel, se branche sur ScrollTrigger |
| Composants animés | React Bits | — | 200+ composants à copier dans le repo, pas une dépendance |
| Styles | Tailwind CSS | `4.3.3` | config CSS-first, tokens de design directement dans `@theme` |
| Langage | TypeScript | `7.0.2` | types de l'API Strapi partagés avec le front |

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

## Backend — Strapi

**Décidé le 2026-10-15.** Strapi, API headless consommée par Next.js.

> Le brief initial mentionnait Laravel + MySQL. Arbitré en faveur de Strapi
> le 2026-10-15 : l'admin est généré, et la stack reste en JavaScript.

### Ce qu'il doit gérer

| Entité | Contenu |
|--------|---------|
| **Édition** | date, heure, lieu, prix, quota, statut |
| **Inscription** | nom, prénom, email, téléphone, niveau, attentes, statut |
| **Paiement** | montant, référence, retours de la passerelle |
| **Ticket** | QR code unique, vérification le jour J |
| **Intervenant** | photo, rôle, ce qu'il transmet, liens |

Au-delà des types de contenu générés, il faudra des **routes custom** :
statistiques publiques (inscrits, places restantes), initiation de paiement,
webhook de confirmation, vérification de ticket.

### Admin

Liste des inscrits, statut des paiements, export CSV, scan des tickets.

### Règles

- **Aucune donnée en dur côté front** : date, lieu, prix, quota viennent tous
  de l'API. Le compte à rebours est alimenté par l'édition.
- Validation stricte, limitation de débit, vérification de signature des
  webhooks, aucune donnée sensible exposée.

### Base de données et médias

Par défaut : SQLite en local, Postgres en production ; disque local en dev,
S3 ou Cloudinary en production. À confirmer au déploiement.

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
- [ ] Base de données Strapi en production
- [ ] Hébergement front et back
- [ ] Stratégie de tests
- [ ] Gestionnaire de paquets (npm / pnpm)

## Décisions

Une ligne par décision structurante, la plus récente en haut.

- **2026-10-15** — **Design system figé** depuis l'affiche : couleurs mesurées
  au pixel, Inter + JetBrains Mono, aucune ombre, dégradé signature limité à
  4 emplacements. Voir [design.md](design.md#tokens).
- **2026-10-15** — **Back : Strapi** (le brief disait Laravel, arbitré ici).
  **Framer Motion écarté**, GSAP + Lenis seuls.
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
