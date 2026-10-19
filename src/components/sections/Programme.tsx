"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Section — le déroulé de la journée.
 *
 * Quatre temps : chiffre énorme à gauche, titre en display, filet qui se
 * trace de gauche à droite au scroll. La journée se construit sous les
 * yeux au lieu de s'énumérer.
 *
 * Les sous-étapes ne s'affichent que là où elles existent réellement —
 * seul le temps 2 en a, et elles viennent du brief. L'arbre précédent
 * affichait six [À COMPLÉTER] en pleine page : un écran de débogage. Ce
 * qui manque est désormais signalé une seule fois, en bas.
 */

const TEMPS: { titre: string; etapes: string[] }[] = [
  { titre: "Le design de ton site", etapes: [] },
  {
    titre: "Le code, en guidant l'IA",
    etapes: [
      "Prompts structurés",
      "Dossier .md de contexte",
      "Skills",
      "Revue et sécurité",
    ],
  },
  { titre: "Ton admin + ton chatbot IA", etapes: [] },
  { titre: "Ton site déployé en ligne", etapes: [] },
];

export function Programme() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-temps]").forEach((ligne) => {
          const declencheur = { trigger: ligne, start: "top 85%" };
          gsap.from(ligne.querySelector("[data-filet]"), {
            scaleX: 0,
            duration: 0.9,
            ease: "power4.out",
            transformOrigin: "left center",
            scrollTrigger: declencheur,
          });
          gsap.from(ligne.querySelectorAll("[data-contenu]"), {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.06,
            ease: "power4.out",
            scrollTrigger: declencheur,
          });
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="programme"
      className="relative py-[clamp(4rem,12svh,9rem)]"
    >
      <div className="shell">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono text-small uppercase tracking-[0.25em] text-accent">
            Le déroulé
          </p>
          <h2 className="mt-4 max-w-[20ch] text-h1 font-bold leading-[1.05] tracking-tighter">
            Une journée, quatre temps.
          </h2>
        </div>

        <ol className="mt-[clamp(2.5rem,8svh,5rem)] flex flex-col">
          {TEMPS.map(({ titre, etapes }, i) => (
            <li key={titre} data-temps className="group relative">
              <span
                aria-hidden
                data-filet
                className="block h-px w-full bg-fg/15 transition-colors
                           duration-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)]
                           hoverable:group-hover:bg-accent/60"
              />

              <div
                className="flex flex-col gap-4 py-[clamp(1.5rem,4svh,3rem)]
                           lg:flex-row lg:items-baseline lg:gap-[clamp(2rem,5vw,5rem)]"
              >
                <span
                  data-contenu
                  className="font-mono text-[length:var(--text-countdown)] font-bold
                             leading-none tracking-tighter text-fg/15
                             transition-colors duration-[250ms]
                             ease-[cubic-bezier(0.23,1,0.32,1)]
                             hoverable:group-hover:text-accent/70"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="flex flex-col gap-4">
                  <h3
                    data-contenu
                    className="max-w-[18ch] text-h2 font-bold leading-[1.05] tracking-tighter"
                  >
                    {titre}
                  </h3>

                  {etapes.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {etapes.map((etape) => (
                        <li
                          key={etape}
                          data-contenu
                          className="rounded-pill border border-accent/35 px-4 py-2
                                     font-mono text-small text-accent"
                        >
                          {etape}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          ))}
          <li aria-hidden className="h-px w-full bg-fg/15" />
        </ol>

        <div className="mt-[clamp(2rem,6svh,3.5rem)] flex flex-col gap-3">
          <p className="max-w-[52ch] text-body text-fg/70">
            Tu repars avec un portfolio en ligne : un site, son espace
            d&apos;administration et un chatbot intégré, déployés.
          </p>
          <p className="font-mono text-small text-accent/70">
            [À COMPLÉTER] — le détail horaire, et les étapes des temps 1, 3 et 4.
          </p>
        </div>
      </div>
    </section>
  );
}
