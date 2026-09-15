import type { Metadata } from "next";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <div className="bg-beige pt-[4.5rem] md:pt-20">
      <section className="mx-auto max-w-2xl px-5 py-16 md:py-24">
        <h1 className="font-sans text-2xl font-black uppercase tracking-tight text-deep">
          Mentions légales
        </h1>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-deep/85">
          <p className="border border-mid/30 bg-beige-soft p-4 text-xs text-mid">
            Modèle à compléter avec tes informations réelles (statut, SIRET, hébergeur) avant mise en
            ligne — voir <code>data/site.ts</code> pour les coordonnées déjà centralisées.
          </p>

          <div>
            <h2 className="font-sans text-base font-semibold text-deep">Éditeur du site</h2>
            <p className="mt-2">
              [Nom / raison sociale] — [Statut juridique, ex. micro-entreprise] — SIRET : [à compléter]
              <br />
              Adresse : [à compléter], {site.locationShort}
              <br />
              E-mail : {site.email} — Téléphone : {site.phoneDisplay}
              <br />
              Directeur de la publication : [Nom]
            </p>
          </div>

          <div>
            <h2 className="font-sans text-base font-semibold text-deep">Hébergement</h2>
            <p className="mt-2">
              Netlify, Inc., 44 Montgomery Street, Suite 300, San Francisco, CA 94104, États-Unis —{" "}
              <a href="https://www.netlify.com" className="underline">
                netlify.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-sans text-base font-semibold text-deep">Propriété intellectuelle</h2>
            <p className="mt-2">
              L&rsquo;ensemble des photographies, textes et éléments graphiques présents sur ce site
              sont la propriété de {site.brandName} {site.brandScript}, sauf mention contraire. Toute
              reproduction sans autorisation préalable est interdite.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-base font-semibold text-deep">Données personnelles</h2>
            <p className="mt-2">
              Les informations transmises via les formulaires de ce site (contact, réservation) sont
              utilisées uniquement pour répondre à ta demande et ne sont ni revendues ni transmises à
              des tiers. Conformément au RGPD, tu peux demander l&rsquo;accès, la rectification ou la
              suppression de tes données en écrivant à {site.email}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
