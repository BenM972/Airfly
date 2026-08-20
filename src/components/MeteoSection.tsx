"use client";

import { useEffect, useRef, useState } from "react";
import SectionTitle from "./SectionTitle";

const WIND_PHRASES: { max: number; text: string }[] = [
  { max: 8,  text: "Brise légère ce matin — idéal pour une première session avec nos profs au spot." },
  { max: 15, text: "Belle brise à Pointe Faula — passez récupérer votre matos avant de descendre au spot." },
  { max: 20, text: "Les conditions sont au rendez-vous — venez équipés, on vous attend au shop." },
  { max: 25, text: "Vent soutenu aujourd'hui — le spot est vivant, notre équipe aussi." },
  { max: Infinity, text: "Ça déchire à Pointe Faula — pour les riders confirmés, le shop est ouvert." },
];

function getWindPhrase(kts: number): string {
  return WIND_PHRASES.find((p) => kts < p.max)?.text ?? "";
}

const SRC_RELEVES = "https://www.windguru.cz/js/wgs_widget.php";

/**
 * Les deux widgets Windguru gardent une trace de ce qu'ils ont deja construit,
 * indexee par l'identifiant du conteneur : le widget des releves refuse de se
 * reconstruire dans un conteneur deja servi, et celui des previsions n'expose
 * aucun moyen de repartir de zero. Tant que l'identifiant est constant, un
 * remontage ne peut donc pas les relancer de facon fiable.
 *
 * On engendre donc un identifiant neuf a chaque montage. Du point de vue de
 * Windguru, chaque affichage est un widget qu'il n'a jamais vu, et aucune de
 * ses gardes internes ne s'applique.
 */
let compteurMontages = 0;

const CURR_OPTS_BASE = {
  id_station: 4164,
  wj: "knots",
  tj: "c",
  avg_min: 0,
  tmprh: true,
  date_format: "Y-m-d H:i:s T",
  type: "curr",
};

const FORECAST_ARGS_BASE = [
  "s=1206002","m=100",
  "ai=1","wj=knots","tj=c","waj=m","tij=cm",
  "odh=0","doh=24","fhours=240","hrsm=2",
  "vt=forecasts","lng=fr","idbs=1",
  "p=WINDSPD,GUST,SMER,TMPE,APCP1s",
];

/**
 * Vrai si le widget loge dans cet hote a bien injecte son iframe.
 *
 * La recherche porte sur l'hote entier et non sur les enfants du conteneur
 * cible : le script des previsions fait `insertBefore(iframe,
 * cible.nextSibling)` et place donc son iframe A COTE du conteneur. Tester
 * `cible.hasChildNodes()` ne trouvait jamais rien et rapportait le widget en
 * echec meme quand il s'affichait.
 */
function widgetAffiche(hote: HTMLElement | null): boolean {
  return hote?.querySelector("iframe") != null;
}

export default function MeteoSection() {
  const [windPhrase, setWindPhrase] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  // Hotes stables, possedes par React. Les conteneurs que Windguru vise sont
  // crees dedans a chaque montage, avec un identifiant neuf.
  const hotePrevisions = useRef<HTMLDivElement>(null);
  const hoteReleves = useRef<HTMLDivElement>(null);

  // Wind phrase from API proxy
  useEffect(() => {
    function fetchWind() {
      fetch("/api/wind")
        .then((r) => r.json())
        .then((data) => {
          if (data?.kts != null && !isNaN(data.kts)) {
            setWindPhrase(getWindPhrase(data.kts));
          }
        })
        .catch(() => {});
    }
    fetchWind();
    const interval = setInterval(fetchWind, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Repli : si aucun des deux widgets n'est apparu au bout de 10 s, on propose
  // le lien vers Windguru plutot que de laisser deux blocs vides.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!widgetAffiche(hotePrevisions.current) && !widgetAffiche(hoteReleves.current)) {
        setShowFallback(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Previsions.
  //
  // Le script est une fonction auto-executee : tout son travail a lieu quand
  // il s'execute, et il n'expose aucune reinitialisation. Charge par
  // next/script il etait dedoublonne par son URL et ne se rejouait jamais lors
  // d'une navigation cote client. On cree un <script> neuf a chaque montage,
  // que le navigateur execute meme si l'URL est en cache, et on lui donne un
  // conteneur au nom encore inutilise.
  useEffect(() => {
    const hote = hotePrevisions.current;
    if (!hote) return;

    const uid = `wg_fwdg_1206002_100_${++compteurMontages}`;
    const cible = document.createElement("div");
    cible.id = uid;
    hote.appendChild(cible);

    const args = [...FORECAST_ARGS_BASE, `uid=${uid}`];
    const script = document.createElement("script");
    script.src = `https://www.windguru.cz/js/widget.php?${args.join("&")}`;
    script.async = true;
    script.addEventListener("load", () => setShowFallback(false));
    document.body.appendChild(script);

    return () => {
      script.remove();
      // Vider l'hote emporte le conteneur et l'iframe que le script a inseree
      // a cote de lui. React ne gere aucun de ces noeuds, a lui de les retirer.
      hote.replaceChildren();
    };
  }, []);

  // Releves en temps reel.
  //
  // WgsWidget() est protegee par window.WgsWidget_started[divid], posee a true
  // au premier appel et jamais effacee : rappeler la fonction sur le meme
  // conteneur ne fait rien. Un conteneur au nom neuf a chaque montage contourne
  // la garde sans dependre du fonctionnement interne du script.
  useEffect(() => {
    const hote = hoteReleves.current;
    if (!hote) return;

    const uid = `wgs_widget_4164_${++compteurMontages}`;
    const cible = document.createElement("div");
    cible.id = uid;
    hote.appendChild(cible);

    const script = document.createElement("script");
    script.src = SRC_RELEVES;
    script.async = true;
    script.addEventListener("load", () => {
      const win = window as unknown as { WgsWidget?: (opts: unknown) => void };
      if (typeof win.WgsWidget !== "function") return;
      win.WgsWidget({ ...CURR_OPTS_BASE, divid: uid });
      setShowFallback(false);
    });
    document.body.appendChild(script);

    return () => {
      script.remove();
      hote.replaceChildren();
    };
  }, []);

  return (
    <section id="meteo" className="bg-[#f5f0e8] py-24 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">

        <SectionTitle title="Meteo du spot" className="mb-4" />

        <p
          className="text-center text-gray-500 text-lg mb-12"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Prévisions en temps réel — Pointe Faula, Vauclin, Martinique
        </p>

        <div className="space-y-12">
          {/* Prévisions */}
          <div>
            <p
              className="uppercase tracking-widest text-lg text-[#FF0080] mb-4"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Previsions
            </p>
            <div className="overflow-x-auto">
              <div ref={hotePrevisions} />
            </div>
          </div>

          {/* Relevés en temps réel */}
          <div>
            <p
              className="uppercase tracking-widest text-lg text-[#FF0080] mb-4"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Releves en temps reel
            </p>
            <div className="flex justify-center overflow-x-auto">
              <div ref={hoteReleves} />
            </div>
            {windPhrase && (
              <p
                className="text-center text-gray-500 text-base mt-6 italic"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {windPhrase}
              </p>
            )}
          </div>

          {/* Fallback if widgets fail to load */}
          {showFallback && (
            <div className="text-center py-6">
              <a
                href="https://www.windguru.cz/1206002"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#FF0080] hover:text-gray-900 transition-colors duration-200 text-sm uppercase tracking-widest"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                Voir les previsions sur Windguru
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
