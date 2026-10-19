import { EtiquetteSection } from "@/components/ui/EtiquetteSection";

/**
 * Section — le problème.
 *
 * Transcription du design `Landing — ai-dev-sprint.com@2x.png`.
 * Deux colonnes qui s'opposent : ce qui arrive sans méthode à gauche, ce
 * que fait AIdevsprint à droite. Le contraste porte tout le propos, donc
 * les deux cartes ne reçoivent pas le même traitement — la carte de
 * droite est bordée d'accent et éclairée par en dessous.
 *
 * La lueur verte n'est pas une ombre : c'est une source de lumière
 * derrière la carte, le seul effet de profondeur autorisé par
 * docs/design.md.
 */

const SANS_METHODE = [
  "Un prompt vague, un code fragile",
  "Des failles que personne ne voit",
  "Du copier-coller qu'on ne comprend pas",
  "Un projet qui casse à la première modif",
];

const AVEC_METHODE = [
  "Un contexte projet clair que l'IA respecte",
  "Des checks sécurité systématiques",
  "Tu relis, tu comprends, tu décides",
  "Un projet propre, maintenable, en ligne",
];

export function Probleme() {
  return (
    <section id="probleme" className="relative py-[clamp(4rem,12svh,9rem)]">
      <div className="shell">
        <EtiquetteSection>le problème</EtiquetteSection>

        <h2 className="mt-[clamp(1rem,3svh,2rem)] max-w-[20ch] text-h1 font-bold leading-[1.05] tracking-tighter">
          L&apos;IA écrit vite. Sans méthode, elle écrit n&apos;importe quoi.
        </h2>

        <div className="mt-[clamp(2.5rem,8svh,5rem)] grid gap-[clamp(1rem,2vw,1.5rem)] lg:grid-cols-2">
          {/* Sans méthode — volontairement terne : c'est le repoussoir. */}
          <div
            className="rounded-card border border-fg/10 bg-fg/[0.03]
                       p-[clamp(1.5rem,3.5vw,2.75rem)]"
          >
            <h3 className="text-h3 font-bold tracking-tight text-fg/60">
              Vibe coding à l&apos;aveugle
            </h3>

            <ul className="mt-[clamp(1.5rem,4svh,2.5rem)] flex flex-col gap-[clamp(0.875rem,2svh,1.25rem)]">
              {SANS_METHODE.map((ligne) => (
                <li key={ligne} className="flex gap-[1ch] text-body text-fg/70">
                  <span aria-hidden className="text-fg/40">
                    ✕
                  </span>
                  {ligne}
                </li>
              ))}
            </ul>
          </div>

          {/* La méthode — bordée d'accent, éclairée par en dessous. */}
          <div
            className="relative isolate overflow-hidden rounded-card
                       border border-accent/60 p-[clamp(1.5rem,3.5vw,2.75rem)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                backgroundImage:
                  "radial-gradient(90% 110% at 20% 120%, color-mix(in oklab, var(--color-glow-green) 55%, transparent) 0%, transparent 65%)",
              }}
            />

            <h3 className="text-h3 font-bold tracking-tight text-accent">
              La méthode AIdevsprint
            </h3>

            <ul className="mt-[clamp(1.5rem,4svh,2.5rem)] flex flex-col gap-[clamp(0.875rem,2svh,1.25rem)]">
              {AVEC_METHODE.map((ligne) => (
                <li key={ligne} className="flex gap-[1ch] text-body text-fg">
                  <span aria-hidden className="text-accent">
                    ✓
                  </span>
                  {ligne}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
