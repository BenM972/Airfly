"use client";

import { useEffect } from "react";
import SectionTitle from "./SectionTitle";

export default function MeteoSection() {
  useEffect(() => {
    if (document.getElementById("wg-forecast-script")) return;

    const forecastArg = [
      "s=1206002","m=100",
      "uid=wg_fwdg_1206002_100_1777735567467",
      "ai=1","wj=knots","tj=c","waj=m","tij=cm",
      "odh=0","doh=24","fhours=240","hrsm=2",
      "vt=forecasts","lng=fr","idbs=1",
      "p=WINDSPD,GUST,SMER,TMPE,APCP1s",
    ];
    const forecastScript = document.createElement("script");
    forecastScript.id = "wg-forecast-script";
    forecastScript.src = "https://www.windguru.cz/js/widget.php?" + forecastArg.join("&");
    document.body.appendChild(forecastScript);
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
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-200"
                style={{ fontFamily: "var(--font-cormorant)" }}>
                Code embed balise à intégrer
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
