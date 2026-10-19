import Link from "next/link";

/**
 * Section — la dernière relance.
 *
 * Transcription du design `Landing — ai-dev-sprint.com@2x.png`.
 * Une question, un bouton, rien d'autre. C'est le dernier endroit où le
 * visiteur peut décider : tout ce qui n'est pas la décision y est bruit.
 *
 * Le bouton est en vert plein et non en bleu : à cet endroit il n'y a
 * aucune autre action à l'écran, donc rien à départager — c'est le vert
 * de l'affiche qui parle.
 *
 * La lueur verte → bleue du bas reprend celle de l'affiche.
 */
export function CtaFinal() {
  return (
    <section
      id="reserver"
      className="relative isolate overflow-hidden py-[clamp(5rem,16svh,11rem)]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            "radial-gradient(55% 70% at 25% 115%, color-mix(in oklab, var(--color-glow-green) 45%, transparent) 0%, transparent 65%)",
            "radial-gradient(55% 70% at 80% 110%, color-mix(in oklab, var(--color-glow-blue) 70%, transparent) 0%, transparent 65%)",
          ].join(", "),
        }}
      />

      <div className="shell flex flex-col items-center text-center">
        <h2 className="max-w-[22ch] text-h1 font-bold leading-[1.05] tracking-tighter">
          Prêt à coder <em>proprement</em> avec l&apos;IA ?
        </h2>

        <Link
          href="#inscription"
          className="mt-[clamp(2rem,6svh,3.5rem)] inline-flex items-center
                     rounded-pill bg-accent px-[clamp(1.75rem,3vw,2.75rem)]
                     py-[clamp(0.875rem,2.2svh,1.25rem)] text-body font-bold
                     text-on-accent transition-transform duration-[120ms]
                     ease-[var(--ease-out-strong)] active:scale-[0.96]"
        >
          Réserver ma place
        </Link>
      </div>
    </section>
  );
}
