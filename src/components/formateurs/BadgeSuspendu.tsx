"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { LanyardProps } from "@/components/Lanyard";

/**
 * Le badge suspendu, chargé seulement quand on s'en approche.
 *
 * `Lanyard` ouvre un contexte WebGL Three.js. La section en affiche trois :
 * montés d'emblée, c'est trois scènes 3D qui tournent dès l'ouverture de la
 * page, alors que la section est à plusieurs écrans plus bas. Sur un
 * téléphone de milieu de gamme, ça se paie comptant.
 *
 * Deux verrous ici :
 *
 * 1. `dynamic(..., { ssr: false })` — Three.js sort du bundle initial et
 *    n'est téléchargé qu'au premier badge qui en a besoin.
 * 2. L'`IntersectionObserver` ne monte le canvas qu'à 300 px du viewport,
 *    puis se débranche. Un badge jamais atteint n'est jamais construit.
 *
 * Le cadre garde sa taille dans les deux états : rien ne se décale quand le
 * canvas arrive.
 */
const Lanyard = dynamic(() => import("@/components/Lanyard"), { ssr: false });

export function BadgeSuspendu(props: LanyardProps) {
  const cadre = useRef<HTMLDivElement>(null);
  const [approche, setApproche] = useState(false);

  useEffect(() => {
    const element = cadre.current;
    if (!element) return;

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return;
        setApproche(true);
        // Une fois monté, plus rien à observer.
        observateur.disconnect();
      },
      { rootMargin: "300px 0px" },
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  return (
    <div ref={cadre} className="size-full">
      {approche && <Lanyard {...props} />}
    </div>
  );
}
