import { NextResponse } from "next/server";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      "https://www.windguru.cz/int/iapi.php?q=station_data_current&id_station=4164&avg_minutes=10&gh=0",
      {
        cache: "no-store",
        signal: controller.signal,
        headers: { Referer: "https://www.windguru.cz/", "User-Agent": "Mozilla/5.0" },
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return NextResponse.json({ kts: null });
    const data = await res.json();
    const kts = data?.wind_avg != null ? Math.round(parseFloat(data.wind_avg) * 10) / 10 : null;
    return NextResponse.json({ kts });
  } catch (_e) {
    return NextResponse.json({ kts: null });
  }
}
