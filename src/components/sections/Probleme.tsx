const CONTRE = [
  "Copier-coller sans comprendre",
  "Code fragile",
  "Failles de sécurité",
];

const POUR = [
  "Prompts structurés",
  "Dossier .md de contexte",
  "Skills et revue de code",
  "Bases solides du développement",
];

/**
 * Section 2 — le problème et la promesse.
 *
 * Composition volontairement déséquilibrée : la colonne « sans méthode »
 * est plus étroite, éteinte, barrée ; celle de la méthode est plus large et
 * porte l'accent.
 *
 * Le libellé ne juge pas le lecteur. « Le vibe coding bête » figurait dans
 * le brief comme description interne du contraste, pas comme texte à
 * afficher : sur le site, ça insulte ceux qu'on veut inscrire. Le contraste est dans la mise en page, pas dans un libellé
 * « avant / après ».
 *
 * Les formulations viennent du brief de Malik, mot pour mot. Rien d'inventé :
 * ce qui manque est marqué [À COMPLÉTER] et visible à l'écran.
 */
export function Probleme() {
  return (
    <section id="probleme" className="relative bg-surface py-[clamp(4rem,12svh,9rem)]">
      <div className="shell">
        <h2 className="max-w-[18ch] text-h1 font-bold leading-[1.05] tracking-tighter">
          L&apos;IA amplifie un développeur{" "}
          <span className="text-accent">qui sait ce qu&apos;il fait</span>.
        </h2>

        <div className="mt-[clamp(2.5rem,7svh,5rem)] grid gap-10 lg:grid-cols-[4fr_6fr] lg:gap-16">
          {/* ── Ce qu'on refuse ─────────────────────────────── */}
          <div className="flex flex-col gap-5 border-l-2 border-fg/15 pl-6">
            <p className="font-mono text-small uppercase tracking-[0.25em] text-fg/40">
              Sans méthode
            </p>
            <ul className="flex flex-col gap-3">
              {CONTRE.map((item) => (
                <li
                  key={item}
                  className="text-h3 font-semibold leading-tight text-fg/35 line-through
                             decoration-fg/25 decoration-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Ce qu'on enseigne ───────────────────────────── */}
          <div className="flex flex-col gap-5 border-l-2 border-accent pl-6">
            <p className="font-mono text-small uppercase tracking-[0.25em] text-accent">
              La méthode AIdevsprint
            </p>
            <ul className="flex flex-col gap-3">
              {POUR.map((item) => (
                <li
                  key={item}
                  className="text-h2 font-bold leading-tight tracking-tight text-fg"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-2 max-w-[48ch] text-body text-fg/70">
              Guide l&apos;IA avec tes compétences de dev : livre des projets
              plus vite, avec plus de fonctionnalités.
            </p>
          </div>
        </div>

        <p className="mt-[clamp(2rem,5svh,3.5rem)] font-mono text-small text-accent/70">
          [À COMPLÉTER] — exemples concrets : extrait de prompt, fichier de
          contexte, avant/après sur un vrai bout de code.
        </p>
      </div>
    </section>
  );
}
