"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
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

  // Fallback: if widgets don't load after 10s, show link
  useEffect(() => {
    const timer = setTimeout(() => {
      const forecast = document.getElementById(FORECAST_DIV_ID);
      const curr = document.getElementById(CURR_DIV_ID);
      if (
        (!forecast || !forecast.hasChildNodes()) &&
        (!curr || !curr.hasChildNodes())
      ) {
        setShowFallback(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const initCurrWidget = useCallback(() => {
    const win = window as unknown as Record<string, unknown>;
    const div = document.getElementById(CURR_DIV_ID);
    if (div && typeof win["WgsWidget"] === "function") {
      div.innerHTML = "";
      (win["WgsWidget"] as (opts: unknown) => void)(CURR_OPTS);
    }
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

      {/* Windguru widget scripts via next/script */}
      <Script
        src={`https://www.windguru.cz/js/widget.php?${FORECAST_ARGS.join("&")}`}
        strategy="afterInteractive"
        onLoad={() => setShowFallback(false)}
      />
      <Script
        src="https://www.windguru.cz/js/wgs_widget.php"
        strategy="afterInteractive"
        onReady={initCurrWidget}
      />
    </section>
  );
}
