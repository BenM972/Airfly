import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://www.windguru.cz/int/iapi.php?q=station_data_current&id_station=4164&avg_minutes=10&gh=0",
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Windguru API error" }, { status: res.status });
    }
    const data = await res.json();
    // wind_avg is in m/s, convert to knots
    const windAvgMs = data?.wind_avg != null ? parseFloat(data.wind_avg) : null;
    const windAvgKts = windAvgMs !== null && !isNaN(windAvgMs) ? Math.round(windAvgMs * 1.94384 * 10) / 10 : null;
    return NextResponse.json({ wind_avg_kts: windAvgKts });
  } catch {
    return NextResponse.json({ error: "Failed to fetch wind data" }, { status: 500 });
  }
}
