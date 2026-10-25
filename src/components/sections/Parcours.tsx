import { BoutonReserver } from "@/components/inscription/BoutonReserver";
import { EtiquetteSection } from "@/components/ui/EtiquetteSection";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Section — le parcours.
 *
 * Transcription du design `Landing — ai-dev-sprint.com@2x.png`.
 * Les quatre sessions du parcours. Une seule est ouverte : elle est en
 * vert plein, les trois autres restent en creux. L'écart de traitement
 * fait tout le travail — inutile de barrer ou de griser.
 *
 * Le bouton de la carte ouverte était une pilule noire, reprise du design.
 * Malik a tranché le 2026-10-20 : « Réserver ma place » doit être le même
 * bouton partout, animation comprise. Le design perd donc ici sa pilule
 * noire sur fond vert, au profit de la cohérence du site.
 *
 * Les descriptions des sessions 2 à 4 ne sont pas écrites. Le design
 * portait lui-même des `[DESCRIPTION SESSION #N]` : ce sont des trous
 * assumés, pas un texte à inventer.
 */

const A_COMPLETER = "[À COMPLÉTER]";

type Session = {
  numero: string;
  titre: string;
  texte: string | null;
  ouverte: boolean;
};

const SESSIONS: Session[] = [
  {
    numero: "#1",
    titre: "Portfolio",
    texte: "Ton portfolio avec espace admin et chatbot IA, déployé en ligne.",
    ouverte: true,
  },
  { numero: "#2", titre: "SaaS", texte: null, ouverte: false },
  { numero: "#3", titre: "App mobile", texte: null, ouverte: false },
  { numero: "#4", titre: "API + IA", texte: null, ouverte: false },
];

function CarteSession({ numero, titre, texte, ouverte }: Session) {
  if (ouverte) {
    return (
      <li
        className="flex flex-col rounded-card bg-accent
                   p-[clamp(1.5rem,2.5vw,2rem)] text-on-accent"
      >
        <div className="flex flex-wrap items-center justify-between gap-[1ch]">
          <span className="font-mono text-small font-bold">{numero}</span>
          <span className="rounded-pill bg-on-accent/10 px-[1.25ch] py-[0.5ch] text-small font-bold">
            Inscriptions ouvertes
          </span>
        </div>

        <h3 className="mt-[clamp(1rem,2.5svh,1.75rem)] text-h2 font-bold tracking-tighter">
          {titre}
        </h3>

        <p className="mt-[clamp(0.75rem,1.5svh,1rem)] text-body">{texte}</p>

        {/* Une cale qui pousse le bouton en bas quelle que soit la hauteur
            des cartes voisines, avec un écart minimum garanti : sans elle,
            le bouton flotte au milieu de la plus haute. */}
        <span
          aria-hidden
          className="min-h-[clamp(1.5rem,4svh,3rem)] flex-1"
        />

        {/* Le même bouton que partout ailleurs, taille `sm` : la carte
            est l'une de quatre sur une rangée, elle n'a pas la place du
            format du hero. Le libellé reste court pour la même raison. */}
        <BoutonReserver taille="sm">Réserver</BoutonReserver>
      </li>
    );
  }

  return (
    <li
      className="flex flex-col rounded-card border border-fg/10
                 p-[clamp(1.5rem,2.5vw,2rem)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-[1ch]">
        <span className="font-mono text-small font-bold text-accent">
          {numero}
        </span>
        <span className="rounded-pill border border-fg/20 px-[1.25ch] py-[0.5ch] text-small text-fg/70">
          Bientôt
        </span>
      </div>

      <h3 className="mt-[clamp(1rem,2.5svh,1.75rem)] text-h2 font-bold tracking-tighter">
        {titre}
      </h3>

      <p className="mt-[clamp(0.75rem,1.5svh,1rem)] font-mono text-small text-accent/70">
        {texte ?? `${A_COMPLETER} — description de la session ${numero}.`}
      </p>
    </li>
  );
}

export function Parcours() {
  return (
    <section id="parcours" className="relative py-[clamp(4rem,12svh,9rem)]">
      <Reveal className="shell">
        <EtiquetteSection>le parcours</EtiquetteSection>

        <h2 className="mt-[clamp(1rem,3svh,2rem)] max-w-[20ch] text-h1 font-bold leading-[1.05] tracking-tighter">
          Un sprint, un projet concret.
        </h2>

        <p className="mt-[clamp(1rem,2.5svh,1.75rem)] max-w-[60ch] text-body text-fg/70">
          Chaque session = une journée et un vrai projet en ligne à la fin.
        </p>

        <ul className="mt-[clamp(2.5rem,8svh,5rem)] grid gap-[clamp(1rem,1.5vw,1.25rem)] sm:grid-cols-2 xl:grid-cols-4">
          {SESSIONS.map((session) => (
            <CarteSession key={session.numero} {...session} />
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
