"use client";

import { useEffect } from "react";
import SectionTitle from "./SectionTitle";

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
  useEffect(() => {
    // --- Relevés actuels : charge le script une fois, refresh toutes les 5 min ---
    if (!document.getElementById("wg-curr-script")) {
      const script = document.createElement("script");
      script.id = "wg-curr-script";
      script.src = "https://www.windguru.cz/js/wgs_widget.php";
      script.onload = initCurrWidget;
      document.body.appendChild(script);
    } else {
      initCurrWidget();
    }
    const currInterval = setInterval(initCurrWidget, 5 * 60 * 1000);

    // --- Prévisions : charge puis refresh toutes les 30 min ---
    loadForecastWidget();
    const forecastInterval = setInterval(loadForecastWidget, 30 * 60 * 1000);

    return () => {
      clearInterval(currInterval);
      clearInterval(forecastInterval);
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

          {/* Relevés balise — placeholder en attendant le uid station */}
          <div>
            <p
              className="uppercase tracking-widest text-lg text-[#FF0080] mb-4"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Releves en temps reel
            </p>
            <div className="overflow-x-auto">
              <div id="wgs_widget_4164_1704756029749" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
