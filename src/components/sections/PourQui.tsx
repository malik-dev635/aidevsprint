/**
 * Section — pour qui.
 *
 * Quatre profils en capsules, puis deux cartes de tailles différentes :
 * la motivation commune et les prérequis. Les cartes ne sont pas des
 * clones — ni la même largeur, ni le même traitement.
 *
 * Tout le texte vient de Malik, mot pour mot. Ce qui manque — à qui la
 * formation ne s'adresse pas — est marqué [À COMPLÉTER].
 */

const PROFILS = ["Étudiant", "Dev junior", "Dev senior", "Autodidacte"];

export function PourQui() {
  return (
    <section id="pour-qui" className="relative py-[clamp(4rem,12svh,9rem)]">
      <div className="shell">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono text-small uppercase tracking-[0.25em] text-accent">
            Pour qui
          </p>
          <h2 className="mt-4 max-w-[20ch] text-h1 font-bold leading-[1.05] tracking-tighter">
            Des formations conçues pour les développeurs.
          </h2>
        </div>

        {/* Les quatre profils, en capsules — le langage de l'affiche. */}
        <ul className="mt-[clamp(2.5rem,7svh,4rem)] flex flex-wrap justify-center gap-[clamp(0.5rem,1.5vw,1rem)]">
          {PROFILS.map((profil) => (
            <li
              key={profil}
              className="rounded-pill border border-fg/20 px-[clamp(1.25rem,2.5vw,2rem)]
                         py-[clamp(0.625rem,1.8svh,1rem)] text-h3 font-bold
                         tracking-tight transition-colors duration-[200ms]
                         ease-[cubic-bezier(0.23,1,0.32,1)]
                         hoverable:hover:border-accent hoverable:hover:text-accent"
            >
              {profil}
            </li>
          ))}
        </ul>

        {/* Deux cartes, deux largeurs : la raison de venir, puis le ticket
            d'entrée. L'asymétrie 7/5 évite la paire de clones. */}
        <div className="mt-[clamp(2rem,6svh,3.5rem)] grid gap-[clamp(1rem,2vw,1.5rem)] lg:grid-cols-12">
          <div
            className="rounded-card border border-fg/15 bg-surface
                       p-[clamp(1.5rem,4vw,3rem)] lg:col-span-7"
          >
            <p className="font-mono text-small uppercase tracking-[0.25em] text-accent">
              Pourquoi venir
            </p>
            <p className="mt-4 max-w-[22ch] text-h2 font-bold leading-[1.1] tracking-tight">
              Produire un projet vite, et gagner en fonctionnalités.
            </p>
          </div>

          <div
            className="flex flex-col justify-between rounded-card border
                       border-accent/40 p-[clamp(1.5rem,4vw,3rem)] lg:col-span-5"
          >
            <div>
              <p className="font-mono text-small uppercase tracking-[0.25em] text-accent">
                Prérequis
              </p>
              <p className="mt-4 text-h3 font-bold leading-tight tracking-tight">
                Une base en développement.
              </p>
            </div>

            <p className="mt-6 font-mono text-small text-accent/70">
              [À COMPLÉTER] — à qui la formation ne s&apos;adresse pas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
