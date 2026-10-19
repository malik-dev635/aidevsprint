type Props = {
  href: string;
  children: React.ReactNode;
  /** `sm` pour la navbar, `lg` pour le hero. */
  taille?: "sm" | "lg";
  /** Occupe toute la largeur disponible — utile dans le menu plein écran. */
  pleineLargeur?: boolean;
  className?: string;
};

const Fleche = ({ className }: { className: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    // `transition-[left,right]` et non `transition-all` : on nomme les
    // propriétés animées. Le retour est plus court que l'aller — le
    // système répond vite quand l'utilisateur s'en va.
    className={`absolute w-6 fill-current transition-[left,right]
                duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)]
                group-hover:duration-[220ms] ${className}`}
  >
    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
  </svg>
);

/**
 * Bouton d'action principal. Un seul composant, utilisé partout.
 *
 * Au repos : contour bleu, texte blanc, fond transparent.
 * Au survol : un disque bleu se déploie depuis le centre et remplit le
 * bouton, le texte glisse vers la droite, la flèche sort par la droite
 * pendant qu'une seconde entre par la gauche. La capsule reste pleinement
 * arrondie, au repos comme au survol.
 *
 * Le texte reste blanc au repos comme au survol : du bleu sur l'aurore
 * bleue serait illisible, c'était le défaut de la première version.
 *
 * Le remplissage se fait par `scale` sur un disque, pas par une animation
 * de largeur : seuls `transform` et `opacity` tournent sur le GPU.
 */
export function CtaButton({
  href,
  children,
  taille = "lg",
  pleineLargeur = false,
  className = "",
}: Props) {
  // Les paddings verticaux suivent la hauteur disponible, comme le reste
  // du rythme du hero : sur un écran court le bouton se resserre au lieu
  // de pousser le contenu hors de l'écran.
  const dimensions =
    taille === "sm"
      ? "px-7 py-[clamp(0.5rem,1.6svh,0.875rem)] text-small gap-1"
      : "px-10 py-[clamp(0.75rem,2.4svh,1.375rem)] text-body gap-1";

  return (
    <a
      href={href}
      className={`group relative isolate inline-flex shrink-0 items-center
                  ${pleineLargeur ? "w-full" : "w-fit"}
                  justify-center overflow-hidden rounded-pill
                  border-2 border-cta font-bold text-fg
                  transition-transform duration-[120ms]
                  ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.96]
                  ${dimensions} ${className}`}
    >
      {/* Flèche qui entre par la gauche */}
      <Fleche className="-left-1/4 hoverable:group-hover:left-4" />

      {/* Le disque qui remplit. -z-10 : il passe derrière le texte. */}
      <span
        aria-hidden
        className="absolute -z-10 size-[22rem] scale-0 rounded-full bg-cta
                   transition-transform duration-[160ms]
                   ease-[cubic-bezier(0.23,1,0.32,1)]
                   group-hover:duration-[240ms]
                   hoverable:group-hover:scale-100"
      />

      <span
        className="relative -translate-x-3 transition-transform duration-[160ms]
                   ease-[cubic-bezier(0.23,1,0.32,1)]
                   group-hover:duration-[240ms]
                   hoverable:group-hover:translate-x-3"
      >
        {children}
      </span>

      {/* Flèche qui sort par la droite */}
      <Fleche className="right-4 hoverable:group-hover:-right-1/4" />
    </a>
  );
}
