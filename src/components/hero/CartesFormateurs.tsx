"use client";

import Image from "next/image";
import { useRef } from "react";

import type { Formateur } from "@/lib/formateurs";

/**
 * Les trois intervenants, en pile décalée à droite du hero.
 *
 * Pas une rangée de cartes identiques : chacune est décalée et d'une
 * largeur différente, conformément à docs/design.md.
 *
 * L'inclinaison est écrite à la main plutôt que reprise de `TiltedCard` :
 * ses valeurs par défaut sont `scaleOnHover: 1.05`, `shadow: 0.5` et
 * `glare: 0.5`, trois effets interdits par les règles du projet. Cinquante
 * lignes conformes valent mieux que 561 à désactiver.
 *
 * Visible à partir de `xl` seulement : en dessous, le compte à rebours
 * garde toute la largeur.
 */
function Carte({
  formateur,
  decalage,
}: {
  formateur: Formateur;
  decalage: string;
}) {
  const carte = useRef<HTMLDivElement>(null);

  // L'inclinaison suit le curseur. Gated par `hoverable` côté CSS, et ici
  // on ne fait rien si l'utilisateur demande moins de mouvement.
  const incliner = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = carte.current;
    if (!el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(40rem) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };

  const relacher = () => {
    const el = carte.current;
    if (el) el.style.transform = "";
  };

  const nomComplet = formateur.nom
    ? `${formateur.prenom} ${formateur.nom}`
    : formateur.prenom;

  return (
    <div
      ref={carte}
      onPointerMove={incliner}
      onPointerLeave={relacher}
      style={{ transition: "transform 400ms cubic-bezier(0.23, 1, 0.32, 1)" }}
      className={`flex items-center gap-5 rounded-card border border-fg/15
                  bg-bg/60 p-4 backdrop-blur-xl ${decalage}`}
    >
      {/* Portrait : assez grand pour qu'on reconnaisse le visage.
          `object-top` cadre sur la tête, pas sur le buste. */}
      <div
        className="relative h-[clamp(6rem,11svh,8.5rem)] w-[clamp(4.5rem,8vw,6.5rem)]
                   shrink-0 overflow-hidden rounded-card bg-fg/10"
      >
        <Image
          src={formateur.photo}
          alt={nomComplet}
          fill
          sizes="7rem"
          className="scale-110 object-cover object-top"
        />
      </div>

      <div className="min-w-0">
        <p className="text-h3 font-bold leading-tight tracking-tight text-fg">
          {nomComplet}
        </p>
        <p className="mt-1 font-mono text-small text-accent">{formateur.role}</p>
      </div>
    </div>
  );
}

export function CartesFormateurs({ formateurs }: { formateurs: Formateur[] }) {
  // Décalages différents : la pile ne doit pas lire comme une liste alignée.
  const decalages = ["xl:-translate-x-6", "xl:translate-x-6", "xl:translate-x-0"];

  return (
    <div className="hidden w-[clamp(22rem,32vw,30rem)] flex-col gap-[clamp(0.75rem,2svh,1.25rem)] xl:flex">
      {formateurs.map((f, i) => (
        <Carte key={f.prenom} formateur={f} decalage={decalages[i] ?? ""} />
      ))}
    </div>
  );
}
