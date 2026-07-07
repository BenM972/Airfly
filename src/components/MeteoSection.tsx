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

function initCurrWidget() {
  const win = window as unknown as Record<string, unknown>;
  const div = document.getElementById(CURR_DIV_ID);
  if (!div) return;
  div.innerHTML = "";
  if (typeof win["WgsWidget"] === "function") {
    (win["WgsWidget"] as (opts: unknown) => void)(CURR_OPTS);
  }
}

function loadForecastWidget() {
  const old = document.getElementById("wg-forecast-script");
  if (old) old.remove();
  const div = document.getElementById(FORECAST_DIV_ID);
  if (div) div.innerHTML = "";
  const script = document.createElement("script");
  script.id = "wg-forecast-script";
  script.src = "https://www.windguru.cz/js/widget.php?" + FORECAST_ARGS.join("&");
  document.body.appendChild(script);
}

export default function MeteoSection() {
  const [windPhrase, setWindPhrase] = useState("");

  function extractWindFromWidget(): number | null {
    const container = document.getElementById(CURR_DIV_ID);
    if (!container) return null;
    // Try specific windguru element first
    const el = document.getElementById("wgs-wind_avg");
    if (el?.textContent?.trim()) {
      const v = parseFloat(el.textContent);
      if (!isNaN(v)) return v;
    }
    // Fallback: parse "XX kts" from widget text
    const match = container.textContent?.match(/([\d.]+)\s*kts/i);
    if (match) return parseFloat(match[1]);
    return null;
  }

  useEffect(() => {
    let observer: MutationObserver | null = null;

    function tryReadWind() {
      const kts = extractWindFromWidget();
      if (kts !== null) {
        setWindPhrase(getWindPhrase(kts));
        return true;
      }
      return false;
    }

    function observeWidget() {
      const container = document.getElementById(CURR_DIV_ID);
      if (!container) return;
      observer = new MutationObserver(() => {
        if (tryReadWind() && observer) {
          observer.disconnect();
          observer = null;
        }
      });
      observer.observe(container, { childList: true, subtree: true, characterData: true });
    }

    // --- Relevés actuels : charge le script une fois, refresh toutes les 5 min ---
    if (!document.getElementById("wg-curr-script")) {
      const script = document.createElement("script");
      script.id = "wg-curr-script";
      script.src = "https://www.windguru.cz/js/wgs_widget.php";
      script.onload = () => { initCurrWidget(); observeWidget(); };
      document.body.appendChild(script);
    } else {
      initCurrWidget();
      observeWidget();
    }
    const currInterval = setInterval(() => {
      initCurrWidget();
      setTimeout(tryReadWind, 3000);
    }, 5 * 60 * 1000);

    // --- Prévisions : charge une seule fois (pas de refresh — évite les duplications) ---
    loadForecastWidget();

    return () => {
      clearInterval(currInterval);
      if (observer) observer.disconnect();
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
              <div id="wg_fwdg_1206002_100_1777735567467" />
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
              <div id="wgs_widget_4164_1704756029749" />
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
        </div>

      </div>
    </section>
  );
}
