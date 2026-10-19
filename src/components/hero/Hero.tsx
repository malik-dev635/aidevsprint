import Aurora from "@/components/backgrounds/Aurora";
import { CtaButton } from "@/components/ui/CtaButton";
import { CartesFormateurs } from "./CartesFormateurs";
import { CountdownFlip } from "./CountdownFlip";
import { SeatsGauge } from "./SeatsGauge";
import { CHAMPS_PROVISOIRES, type Edition } from "@/lib/edition";
import { FORMATEURS } from "@/lib/formateurs";

/**
 * Hero — direction C : le compte à rebours EST le hero.
 *
 * Pas un panneau d'informations. Trois choses seulement : les chiffres,
 * la phrase, l'action. Le lieu, le prix et le niveau vivent plus bas
 * dans la page, pas ici.
 */
export function Hero({ edition }: { edition: Edition }) {
  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden">
      {/* Aurora — React Bits. La profondeur vient de la lumière,
          jamais d'une ombre. Réglages sobres : le fond ne doit pas
          disputer la vedette aux chiffres. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <Aurora
          // TEST — couleurs d'origine de React Bits, le temps de juger.
          colorStops={["#5227FF", "#7cff67", "#5227FF"]}
          amplitude={1}
          blend={0.5}
          height={0.45}
          speed={1}
          glow={0.6}
          opacity={1}
          intro={false}
        />
      </div>

      <div
        className="shell flex flex-1 flex-col
                   pb-[clamp(1rem,4svh,3rem)]
                   pt-[calc(clamp(5.5rem,14svh,11rem)+env(safe-area-inset-top,0rem))]"
      >

        {/* ── Le bloc qui porte tout le hero ───────────────────────── */}
        <div className="flex flex-1 items-center justify-between gap-[clamp(2rem,4vw,5rem)] py-[clamp(0.5rem,3svh,3rem)]">
          <div
            className="flex flex-1 flex-col justify-center
                       gap-[clamp(1rem,4.5svh,3.5rem)]"
          >
            <CountdownFlip dateDebut={edition.dateDebut} />

            <h1
            className="max-w-[14ch] text-display font-bold
                       leading-[0.95] tracking-tighter"
          >
            Repars avec ton portfolio{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-signature)" }}
            >
              en ligne
            </span>
            .
          </h1>

          {/* ── Action, et l'urgence juste à côté ──────────────────── */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <CtaButton href="#inscription">Réserver ma place</CtaButton>

            {/* Largeur proportionnelle à l'écran, pas un plafond fixe :
                 une barre de 26rem est trop longue sur un 14 pouces. */}
            <div className="w-full max-w-[clamp(12rem,24vw,26rem)]">
              <SeatsGauge inscrits={edition.inscrits} quota={edition.quota} />
            </div>
            </div>
          </div>

          {/* Les trois intervenants, à droite. Visible à partir de xl :
              en dessous, le compte à rebours garde toute la largeur. */}
          <CartesFormateurs formateurs={FORMATEURS} />
        </div>

        {/* Tant que le back n'existe pas, on dit quelles données affichées
            ne sont pas réelles. À supprimer au branchement de l'API. */}
        <p className="font-mono text-[0.6875rem] text-fg/30" data-provisoire>
          Données provisoires : {CHAMPS_PROVISOIRES.join(", ")}
        </p>
      </div>
    </section>
  );
}
