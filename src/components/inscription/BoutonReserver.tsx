"use client";

import { useOuvrirInscription } from "@/components/inscription/ModaleInscription";
import { CtaButton } from "@/components/ui/CtaButton";

/**
 * « Réserver ma place », partout sur le site.
 *
 * Le même `CtaButton` qu'avant, avec le même survol : seul le geste change.
 * Il ouvre la modale d'inscription au lieu de faire défiler la page vers
 * une ancre — demandé par Malik le 2026-10-25.
 *
 * Un composant à part plutôt qu'un `onClick` sur chaque appel : le jour où
 * la réservation change de forme, elle change ici une seule fois. Et
 * `CtaButton` reste un composant sans état, utilisable depuis le serveur.
 *
 * `onAvantOuverture` sert au menu plein écran, qui doit se refermer avant
 * de laisser la place au panneau.
 */
export function BoutonReserver({
  children = "Réserver ma place",
  taille,
  pleineLargeur,
  className,
  onAvantOuverture,
}: {
  children?: React.ReactNode;
  taille?: "sm" | "lg";
  pleineLargeur?: boolean;
  className?: string;
  onAvantOuverture?: () => void;
}) {
  const ouvre = useOuvrirInscription();

  return (
    <CtaButton
      type="button"
      taille={taille}
      pleineLargeur={pleineLargeur}
      className={className}
      onClick={() => {
        onAvantOuverture?.();
        ouvre?.();
      }}
    >
      {children}
    </CtaButton>
  );
}
