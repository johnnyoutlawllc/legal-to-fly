import { NextResponse, type NextRequest } from "next/server";
import { buildReport } from "@/lib/flycheck/report";

/** GET /api/fly-check?lat=..&lng=.. — one briefing for one point. */

export const maxDuration = 20;

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });

  const report = await buildReport(lat, lng);

  // Never let the CDN hold on to a briefing that is missing its airspace half.
  return NextResponse.json(report, {
    headers: {
      "Cache-Control": report.airspaceVerdict.incomplete
        ? "no-store"
        : "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
