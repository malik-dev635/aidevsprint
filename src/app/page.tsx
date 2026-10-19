import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/hero/Hero";
import { EDITION_PROVISOIRE } from "@/lib/edition";

export default function Page() {
  // TODO: remplacer par un fetch de l'édition courante sur l'API Strapi.
  const edition = EDITION_PROVISOIRE;

  return (
    <>
      <Navbar inscrits={edition.inscrits} quota={edition.quota} />
      <main id="top" className="flex-1">
        <Hero edition={edition} />
      </main>
    </>
  );
}
