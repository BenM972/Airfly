import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://www.windguru.cz/int/iapi.php?q=station_data_current&id_station=4164&avg_minutes=10&gh=0",
      {
        cache: "no-store",
        headers: {
          Referer: "https://www.windguru.cz/",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Windguru API error" }, { status: res.status });
    }
    const data = await res.json();
    // wind_avg is already in knots
    const windAvgKts = data?.wind_avg != null ? Math.round(parseFloat(data.wind_avg) * 10) / 10 : null;
    return NextResponse.json({ wind_avg_kts: windAvgKts });
  } catch (e) {
    console.error("Wind API error:", e);
    return NextResponse.json({ error: "Failed to fetch wind data" }, { status: 500 });
  }
}
