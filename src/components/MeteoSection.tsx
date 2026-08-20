"use client";

import { useEffect, useState } from "react";
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

const CURR_DIV_ID = "wgs_widget_4164_1704756029749";
const FORECAST_DIV_ID = "wg_fwdg_1206002_100_1777735567467";

const CURR_OPTS = {
  id_station: 4164,
  wj: "knots",
  tj: "c",
  avg_min: 0,
  tmprh: true,
  date_format: "Y-m-d H:i:s T",
  divid: CURR_DIV_ID,
  type: "curr",
};

const FORECAST_ARGS = [
  "s=1206002","m=100",
  "uid=wg_fwdg_1206002_100_1777735567467",
  "ai=1","wj=knots","tj=c","waj=m","tij=cm",
  "odh=0","doh=24","fhours=240","hrsm=2",
  "vt=forecasts","lng=fr","idbs=1",
  "p=WINDSPD,GUST,SMER,TMPE,APCP1s",
];

/**
 * Vrai si le widget rattache a ce conteneur a bien injecte son iframe.
 *
 * La recherche porte sur le PARENT du conteneur, pas sur ses enfants : le
 * script des previsions fait `insertBefore(iframe, cible.nextSibling)`, donc
 * l'iframe est un frere du conteneur et non un descendant. Tester
 * `cible.hasChildNodes()` ne trouvait jamais rien et rapportait le widget en
 * echec meme quand il s'affichait.
 */
function widgetAffiche(id: string): boolean {
  return document.getElementById(id)?.parentElement?.querySelector("iframe") != null;
}

export default function MeteoSection() {
  const [windPhrase, setWindPhrase] = useState("");
  const [showFallback, setShowFallback] = useState(false);

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
      if (!widgetAffiche(FORECAST_DIV_ID) && !widgetAffiche(CURR_DIV_ID)) {
        setShowFallback(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Previsions.
  //
  // Le script de Windguru est une fonction auto-executee : tout son travail a
  // lieu au moment ou il s'execute, et il n'expose aucune fonction de
  // reinitialisation. Charge par next/script, il etait dedoublonne par son URL
  // et ne se rejouait donc jamais lors d'une navigation cote client : en
  // revenant sur l'accueil, l'emplacement restait vide. On cree un element
  // <script> neuf a chaque montage, ce que le navigateur execute meme lorsque
  // l'URL est deja en cache.
  useEffect(() => {
    const cible = document.getElementById(FORECAST_DIV_ID);
    if (!cible) return;

    const script = document.createElement("script");
    script.src = `https://www.windguru.cz/js/widget.php?${FORECAST_ARGS.join("&")}`;
    script.async = true;
    script.addEventListener("load", () => setShowFallback(false));
    document.body.appendChild(script);

    return () => {
      script.remove();
      // L'iframe est un frere de la cible, pas un enfant : la retirer est
      // indispensable, sinon un second montage en empilerait une de plus.
      cible.parentElement?.querySelectorAll("iframe").forEach((f) => f.remove());
    };
  }, []);

  // Releves en temps reel.
  //
  // `WgsWidget()` est protegee par `window.WgsWidget_started[divid]`, posee a
  // true au premier appel et jamais effacee : la rappeler au remontage ne
  // faisait rien. Comme le conteneur etait vide juste avant l'appel, la section
  // repartait vide au retour sur l'accueil. On leve la garde pour ce conteneur
  // avant chaque appel.
  useEffect(() => {
    const div = document.getElementById(CURR_DIV_ID);
    if (!div) return;

    const script = document.createElement("script");
    script.src = SRC_RELEVES;
    script.async = true;
    script.addEventListener("load", () => {
      const win = window as unknown as {
        WgsWidget?: (opts: unknown) => void;
        WgsWidget_started?: Record<string, boolean>;
      };
      if (typeof win.WgsWidget !== "function") return;
      div.innerHTML = "";
      if (win.WgsWidget_started) delete win.WgsWidget_started[CURR_DIV_ID];
      win.WgsWidget(CURR_OPTS);
      setShowFallback(false);
    });
    document.body.appendChild(script);

    return () => {
      script.remove();
      div.innerHTML = "";
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
              <div id={FORECAST_DIV_ID} />
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
              <div id={CURR_DIV_ID} />
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
