import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { Probleme } from "@/components/sections/Probleme";
import { Methode } from "@/components/sections/Methode";
import { Parcours } from "@/components/sections/Parcours";
import { Session } from "@/components/sections/Session";
import { Formateurs } from "@/components/sections/Formateurs";
import { Faq } from "@/components/sections/Faq";
import { CtaFinal } from "@/components/sections/CtaFinal";
import { EDITION_PROVISOIRE } from "@/lib/edition";

/**
 * L'ordre des sections suit le design
 * `Landing — ai-dev-sprint.com@2x.png` : le problème, la méthode, le
 * parcours, la session, les formateurs, la FAQ, la relance finale.
 */
export default function Page() {
  // TODO: remplacer par un fetch de l'édition courante sur l'API Laravel.
  const edition = EDITION_PROVISOIRE;

  return (
    <>
      <Navbar inscrits={edition.inscrits} quota={edition.quota} />
      <main id="top" className="flex-1">
        <Hero edition={edition} />
        <Probleme />
        <Methode />
        <Parcours />
        <Session edition={edition} />
        <Formateurs />
        <Faq />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
