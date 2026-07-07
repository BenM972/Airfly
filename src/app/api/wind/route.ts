import { NextResponse } from "next/server";

let cachedData: { wind_avg_kts: number | null; ts: number } | null = null;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export async function GET() {
  // Return cached data if fresh
  if (cachedData && Date.now() - cachedData.ts < CACHE_TTL) {
    return NextResponse.json({ wind_avg_kts: cachedData.wind_avg_kts });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      "https://www.windguru.cz/int/iapi.php?q=station_data_current&id_station=4164&avg_minutes=10&gh=0",
      {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          Referer: "https://www.windguru.cz/",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ wind_avg_kts: cachedData?.wind_avg_kts ?? null });
    }

    const data = await res.json();
    const windAvgKts = data?.wind_avg != null ? Math.round(parseFloat(data.wind_avg) * 10) / 10 : null;
    cachedData = { wind_avg_kts: windAvgKts, ts: Date.now() };
    return NextResponse.json({ wind_avg_kts: windAvgKts });
  } catch (e) {
    console.error("Wind API error:", e);
    return NextResponse.json({ wind_avg_kts: cachedData?.wind_avg_kts ?? null });
  }
}
