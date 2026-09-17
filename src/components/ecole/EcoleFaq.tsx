import { questionsFrequentes } from "@/data/faq";

/**
 * Questions frequentes de l'ecole.
 *
 * Composant serveur, volontairement. Les autres sections de /ecole sont des
 * composants clients animes ; celle-ci ne l'est pas, pour deux raisons.
 *
 * D'abord le contenu doit etre dans le HTML servi, pas monte apres hydratation :
 * c'est tout l'interet de la section. Ensuite, aucune reponse n'est repliee
 * derriere un clic. Un accordeon aurait ete plus compact, mais l'audit GEO du
 * 17 septembre 2026 a montre que le site n'offrait aucun passage extractible —
 * masquer ces dix reponses aurait reproduit exactement le probleme que la
 * section corrige.
 *
 * Les titres sont des `h3` : ils s'inserent sous le `h1` de la page et sous le
 * `h2` de la section, et ce sont les premiers titres du site a porter une
 * question plutot qu'une etiquette.
 */
export default function EcoleFaq() {
  return (
    <section id="questions" className="bg-white py-24 px-6 md:px-16">
      <div className="max-w-3xl mx-auto">

        <h2
          className="text-gray-900 uppercase tracking-widest text-sm text-center mb-16"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          Questions frequentes
        </h2>

        <dl className="space-y-10">
          {questionsFrequentes.map((q) => (
            <div key={q.question} className="border-b border-gray-100 pb-10 last:border-0">
              <dt>
                <h3
                  className="text-gray-900 text-xl mb-3"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {q.question}
                </h3>
              </dt>
              <dd
                className="text-gray-600 text-base leading-relaxed"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {q.reponse}
              </dd>
            </div>
          ))}
        </dl>

      </div>
    </section>
  );
}
