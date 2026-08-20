import SectionTitle from "@/components/SectionTitle";

/**
 * Gabarit commun aux pages legales : mise en page sobre, en une colonne,
 * pensee pour de la lecture continue plutot que pour la mise en avant.
 */
export default function PageLegale({
  titre,
  maj,
  children,
}: {
  titre: string;
  /** Date de derniere mise a jour, affichee au lecteur. */
  maj: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-[#f5f0e8] min-h-screen pt-32 pb-24 px-6 md:px-16">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title={titre} niveau="h1" className="mb-4" />
        <p
          className="text-center text-gray-500 text-sm mb-14"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Dernière mise à jour : {maj}
        </p>
        {/* [&_...] cible les elements enfants sans imposer une classe a chacun */}
        <div
          className="text-gray-700 text-base leading-relaxed space-y-8
            [&_h2]:text-gray-900 [&_h2]:text-xs [&_h2]:uppercase [&_h2]:tracking-[0.2em] [&_h2]:mb-3 [&_h2]:mt-10
            [&_p]:mb-3 [&_ul]:space-y-2 [&_ul]:mb-3 [&_li]:flex [&_li]:gap-3
            [&_a]:underline [&_a]:decoration-gray-300 [&_a]:underline-offset-4 hover:[&_a]:decoration-[#FF0080]
            [&_dt]:text-gray-500 [&_dt]:text-sm [&_dd]:text-gray-900 [&_dd]:mb-2"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
