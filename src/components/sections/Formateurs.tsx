"use client";

import Image from "next/image";

import { BadgeSuspendu } from "@/components/formateurs/BadgeSuspendu";
import TextType from "@/components/TextType";
import { FORMATEURS, type Formateur } from "@/lib/formateurs";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Section — les trois intervenants, un par un.
 *
 * Une bande par personne, le badge alternant gauche / droite / gauche,
 * l'explication en face. Pas de rangée de trois cartes identiques, et
 * chaque badge dispose de la moitié de la largeur : de la place pour le
 * tirer sans qu'il sorte de son canvas.
 *
 * Sous `lg`, le badge devient une simple image : même visuel, aucun
 * contexte WebGL sur un téléphone.
 *
 * Et au-dessus de `lg`, les trois badges ne se montent plus ensemble : voir
 * `BadgeSuspendu`, qui attend que la rangée approche. Trois scènes Three.js
 * démarrant au chargement de la page, c'était le vrai coût de cette section.
 *
 * Ce que transmettent Youssouf et Malik vient du brief, mot pour mot.
 * Celui de Victorien et les liens ne sont pas fournis : [À COMPLÉTER].
 */

const A_COMPLETER = "[À COMPLÉTER]";

/** Longueur de cordon et balancement propres à chaque badge. */
/* `size` est une fraction du conteneur : au-delà de ~0,7 le badge
   dépasse son canvas et se fait couper, puisque rien ne peut être
   dessiné en dehors. On agrandit le canvas, pas la fraction. */
const SUSPENSIONS = [
  { strapLength: 0.26, size: 0.62, breeze: 0.35 },
  { strapLength: 0.4, size: 0.68, breeze: 0.6 },
  { strapLength: 0.32, size: 0.65, breeze: 0.45 },
];

function Profil({
  formateur,
  index,
}: {
  formateur: Formateur;
  index: number;
}) {
  const nomComplet = formateur.nom
    ? `${formateur.prenom} ${formateur.nom}`
    : formateur.prenom;
  const badgeADroite = index % 2 === 1;
  const s = SUSPENSIONS[index];

  return (
    // Grille à deux colonnes plutôt qu'une rangée flex : avec `shrink-0`,
    // le badge débordait du conteneur et se faisait couper par le bord.
    <article
      className="flex flex-col items-start gap-[clamp(1.5rem,4svh,3rem)]
                 lg:grid lg:grid-cols-2 lg:items-center
                 lg:gap-[clamp(2rem,5vw,5rem)]"
    >
      {/* Desktop : le badge suspendu, saisissable. Il grandit avec l'écran. */}
      <div
        aria-label={`Badge de ${nomComplet}`}
        className={`hidden h-[clamp(24rem,62svh,38rem)] w-full lg:block ${
          badgeADroite ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <BadgeSuspendu
          frontImage={formateur.badge}
          imageFit="cover"
          cardColor="#010F06"
          strapColor="#0A0A0A"
          size={s.size}
          strapLength={s.strapLength}
          breeze={s.breeze}
        />
      </div>

      {/* Mobile : la même carte, en image. Aucun WebGL. */}
      <div
        className="relative aspect-[3/4] w-[clamp(12rem,60vw,18rem)] shrink-0
                   overflow-hidden rounded-card border border-fg/15 lg:hidden"
      >
        <Image
          src={formateur.badge}
          alt={`Badge de ${nomComplet}`}
          fill
          sizes="60vw"
          className="object-cover"
        />
      </div>

      <div
        // Le bloc se colle du côté du badge : sinon, sur la rangée
        // inversée, le texte part à l'opposé et l'écart devient béant.
        className={`flex max-w-[46ch] flex-col gap-4 ${
          badgeADroite
            ? "lg:order-1 lg:justify-self-end"
            : "lg:order-2 lg:justify-self-start"
        }`}
      >
        <p className="font-mono text-small uppercase tracking-[0.25em] text-accent">
          {formateur.role}
        </p>

        <h3 className="text-h2 font-bold leading-[1.05] tracking-tighter">
          {nomComplet}
        </h3>

        <p
          className={`text-body ${
            formateur.transmet ? "text-fg/70" : "font-mono text-accent/70"
          }`}
        >
          {formateur.transmet ?? `${A_COMPLETER} — ce qu'il transmet ce jour-là.`}
        </p>

        <p className="font-mono text-small text-accent/70">
          {A_COMPLETER} — GitHub, LinkedIn, portfolio
        </p>
      </div>
    </article>
  );
}

export function Formateurs() {
  return (
    <section id="formateurs" className="relative py-[clamp(4rem,12svh,9rem)]">
      <Reveal className="shell">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono text-small uppercase tracking-[0.25em] text-accent">
            Les formateurs
          </p>

          {/* Machine à écrire : le curseur s'arrête une fois la phrase posée,
              elle ne tourne pas en boucle — une boucle attire l'œil en
              permanence et vole la vedette au reste de la section. */}
          <TextType
            as="h2"
            text="Un trio complet prêt à vous transmettre notre savoir."
            loop={false}
            typingSpeed={38}
            initialDelay={120}
            startOnVisible
            cursorCharacter="_"
            cursorClassName="text-accent"
            className="mt-4 max-w-[22ch] text-h1 font-bold leading-[1.05] tracking-tighter text-fg"
          />
        </div>

        <div className="mt-[clamp(2rem,6svh,4rem)] flex flex-col gap-[clamp(2rem,6svh,4rem)]">
          {FORMATEURS.map((f, i) => (
            <Profil key={f.prenom} formateur={f} index={i} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
