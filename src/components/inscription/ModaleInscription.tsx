"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { FormulaireInscription } from "@/components/inscription/FormulaireInscription";
import {
  arreteDefilement,
  repartDefilement,
} from "@/components/motion/defilement";
import type { Edition } from "@/lib/edition";

/**
 * La modale d'inscription, et le contexte qui permet de l'ouvrir.
 *
 * Arrêté avec Malik le 2026-10-25 : le formulaire est une modale, pas une
 * section en bas de page. Les « Réserver ma place » n'emmènent donc plus
 * nulle part — ils ouvrent le formulaire là où le visiteur se trouve,
 * sans lui faire perdre l'endroit où il était en train de lire.
 *
 * ── Pourquoi `<dialog>` et pas un `<div>` ────────────────────────────
 * L'élément natif fait gratuitement et correctement ce qu'une modale
 * maison rate presque toujours : le focus entre dedans et n'en sort pas,
 * Échap ferme, le reste de la page devient inerte pour les lecteurs
 * d'écran, et le panneau se place dans la couche supérieure — aucun
 * `z-index` à surenchérir contre la navbar ou l'aurore du hero.
 *
 * Restent trois choses que le navigateur ne fait pas :
 *
 * 1. Lenis continue de faire glisser la page derrière le panneau. On le
 *    met en pause (voir `defilement.ts`) et on le relance à la fermeture.
 * 2. Un clic sur le fond ne ferme rien. L'événement vient alors du
 *    `<dialog>` lui-même et non d'un de ses enfants : c'est ce qui permet
 *    de distinguer le fond du panneau sans écouteur sur l'arrière-plan.
 * 3. `data-lenis-prevent` : sans lui, Lenis capterait la molette au-dessus
 *    du panneau et le contenu long de la modale ne défilerait pas.
 *
 * ── Sans JavaScript ──────────────────────────────────────────────────
 * Aucun formulaire. C'est assumé : le site dépend déjà du JS pour le
 * compte à rebours, les révélations et les badges. La voie de secours est
 * le numéro WhatsApp, qui reste un lien ordinaire dans la section Session.
 */

const ContexteInscription = createContext<(() => void) | null>(null);

/** Ouvre la modale d'inscription. `null` hors du fournisseur. */
export function useOuvrirInscription() {
  return useContext(ContexteInscription);
}

export function ModaleInscription({
  edition,
  children,
}: {
  edition: Edition;
  children: ReactNode;
}) {
  const dialogue = useRef<HTMLDialogElement>(null);
  // Le formulaire est démonté à la fermeture : la fois d'après, il
  // repart vide au lieu de rouvrir sur la confirmation précédente.
  const [ouverte, setOuverte] = useState(false);

  const ouvre = useCallback(() => setOuverte(true), []);

  useEffect(() => {
    const element = dialogue.current;
    if (!element || !ouverte) return;

    element.showModal();
    arreteDefilement();

    return () => {
      // `open` est faux quand c'est Échap qui a fermé : rappeler `close()`
      // lèverait une seconde fois l'événement et on repasserait ici.
      if (element.open) element.close();
      repartDefilement();
    };
  }, [ouverte]);

  const prix =
    edition.prixFCFA !== null
      ? `${edition.prixFCFA.toLocaleString("fr-FR")} FCFA`
      : null;

  return (
    <ContexteInscription.Provider value={ouvre}>
      {children}

      {ouverte && (
        <dialog
          ref={dialogue}
          aria-labelledby="titre-inscription"
          data-lenis-prevent
          // Échap et le bouton de fermeture passent tous les deux par là.
          onClose={() => setOuverte(false)}
          // Le fond, c'est le `<dialog>` lui-même : tout ce qui est dans
          // le panneau a celui-ci pour cible, pas l'élément de dialogue.
          //
          // D'où l'enveloppe intérieure qui porte le rembourrage : posé
          // sur le `<dialog>`, un clic dans la marge du panneau aurait eu
          // le dialogue pour cible et refermé la modale alors qu'on a
          // cliqué dedans.
          onClick={(e) => {
            if (e.target === dialogue.current) dialogue.current?.close();
          }}
          className="modale-inscription m-auto w-[min(100%-2rem,34rem)]
                     max-h-[min(90svh,48rem)] overflow-y-auto
                     rounded-card border border-fg/15 bg-bg text-fg"
        >
          <div className="p-[clamp(1.25rem,4vw,2.25rem)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-small text-accent">
                  <span aria-hidden className="select-none">
                    {"// "}
                  </span>
                  inscription
                </p>
                <h2
                  id="titre-inscription"
                  className="mt-2 text-h2 font-bold leading-[1.05] tracking-tighter"
                >
                  Garde ta place.
                </h2>
              </div>

              {/* Premier élément focusable du panneau : `showModal()` lui
                donne le focus, ce qui annonce la modale sans ouvrir le
                clavier d'un téléphone comme le ferait un champ. */}
              <button
                type="button"
                onClick={() => dialogue.current?.close()}
                aria-label="Fermer"
                className="-mr-2 -mt-2 grid size-11 shrink-0 place-items-center
                         rounded-pill text-fg/60 transition-colors
                         duration-[160ms] hoverable:hover:text-fg
                         active:scale-[0.92]"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="size-5 stroke-current"
                  fill="none"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Les faits déjà confirmés, rappelés au moment de décider. Ni la
              date ni le quota : ils ne sont pas arrêtés, et un rappel n'est
              pas un endroit pour un [À DÉTERMINER]. */}
            <p className="mt-3 text-small text-fg/60">
              {[prix, edition.format, edition.ville]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <div className="mt-[clamp(1.25rem,3svh,2rem)]">
              <FormulaireInscription edition={edition} />
            </div>
          </div>
        </dialog>
      )}
    </ContexteInscription.Provider>
  );
}
