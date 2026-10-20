import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { ScrollFluide } from "@/components/motion/ScrollFluide";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Chasse fixe : les chiffres du compte à rebours ne sautillent pas.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIdevsprint #1 — Repars avec ton portfolio en ligne",
  description:
    "Formation d'une journée à Yamoussoukro : guider l'IA avec de vraies " +
    "compétences de dev. Le vibe coding, bien fait.",
  openGraph: {
    title: "AIdevsprint #1 — Repars avec ton portfolio en ligne",
    description: "Le vibe coding, bien fait. Formation d'une journée à Yamoussoukro.",
    locale: "fr_CI",
    type: "website",
  },
};

/**
 * `viewportFit: "cover"` laisse la page passer sous l'encoche — sans lui,
 * les `env(safe-area-inset-*)` valent tous 0.
 * `interactiveWidget` fait rétrécir la zone visible quand le clavier Android
 * s'ouvre, comme le fait iOS.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  // Le site est sombre en permanence : une seule valeur, celle du haut de page.
  themeColor: "#010101",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        {/* Branche Lenis sur GSAP, une seule fois pour tout le site. */}
        <ScrollFluide />
        {children}
      </body>
    </html>
  );
}
