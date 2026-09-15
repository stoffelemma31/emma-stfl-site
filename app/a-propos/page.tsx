import type { Metadata } from "next";
import Link from "next/link";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { getPhoto } from "@/lib/images";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Photographe portrait à La Réunion, ancienne photographe produit revenue à l'essentiel : les gens, les regards, les silences.",
};

const paragraphs = [
  "J'ai passé plus de six ans derrière un appareil avant de prendre un autre chemin : la photo produit, au sein de ma propre agence de communication. J'ai appris à mettre en valeur des objets, des marques, des lumières.",
  "Mais il manquait quelque chose.",
  "En 2026, j'ai eu envie de revenir à ce qui m'a fait aimer la photo dès le premier jour : les gens. Les corps, les regards, les silences entre deux éclats de rire. Ce moment précis où quelqu'un arrête de poser et commence, enfin, à exister devant l'objectif.",
  "Parce que se faire photographier, ce n'est pas se figer. C'est se voir autrement. C'est découvrir, sur un écran, une version de soi qu'on n'avait jamais regardée en face — et se dire : c'est moi, ça.",
  "C'est aussi prendre du temps pour soi. Une heure, deux heures, à ne rien faire d'autre qu'être là. Une expérience qu'on n'a pas souvent l'occasion de vivre.",
  "Mon rendu est proche des photos à l'argentique, avec du grain, des couleurs chaudes, du mouvement assumé. Je ne cherche pas la photo parfaite. Je cherche celle qui vous ressemble.",
];

export default function AProposPage() {
  return (
    <div className="bg-beige pt-[4.5rem] md:pt-20">
      <section className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <MicroLabel>À propos</MicroLabel>
          <MixedTitle
            lines={[[{ text: "Se voir", variant: "script" }], [{ text: "autrement", variant: "sans" }]]}
            size="hero"
          />
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-12 w-2/3 max-w-sm md:w-1/2">
          <Photo
            photo={getPhoto("about-portrait")}
            sizes="(min-width: 768px) 40vw, 66vw"
            className="w-full"
            alt="Portrait de la photographe"
          />
        </Reveal>

        <div className="mx-auto mt-14 max-w-[60ch] space-y-6">
          {paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.03}>
              <p className="text-base leading-relaxed text-deep/90 md:text-lg">{p}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 flex justify-center">
          <Link
            href="/contact"
            className="micro-label border-b border-mid pb-1 transition-opacity hover:opacity-70"
          >
            Réserver une séance
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
