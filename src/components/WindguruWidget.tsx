"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function WindguruWidget() {
  useEffect(() => {
    // Si le script est déjà chargé, force le re-render du widget
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>)["wg_init"]) {
      (window as unknown as Record<string, () => void>)["wg_init"]();
    }
  }, []);

  return (
    <div className="w-full overflow-auto">
      {/* Remplace le div id ci-dessous par celui fourni par Windguru Settings > Widget */}
      <div
        id="wg_fwdg_1206002_3_x1706000000_0_"
        style={{ width: "100%", overflow: "auto" }}
      />
      <Script
        src="https://www.windguru.cz/js/widget.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
