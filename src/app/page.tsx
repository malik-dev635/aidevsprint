import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/hero/Hero";
import { Formateurs } from "@/components/sections/Formateurs";
import { Probleme } from "@/components/sections/Probleme";
import { PourQui } from "@/components/sections/PourQui";
import { Programme } from "@/components/sections/Programme";
import { EDITION_PROVISOIRE } from "@/lib/edition";

export default function Page() {
  // TODO: remplacer par un fetch de l'édition courante sur l'API Strapi.
  const edition = EDITION_PROVISOIRE;

  return (
    <>
      <Navbar inscrits={edition.inscrits} quota={edition.quota} />
      <main id="top" className="flex-1">
        <Hero edition={edition} />
        <Formateurs />
        <Probleme />
        <Programme />
        <PourQui />
      </main>
    </>
  );
}
