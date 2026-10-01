import { NextResponse, type NextRequest } from "next/server";
import * as src from "@/lib/flycheck/sources";
import { airspaceVerdict } from "@/lib/flycheck/verdict";
import type { FlyReport, Section } from "@/lib/flycheck/types";

/** GET /api/fly-check?lat=..&lng=.. — one briefing for one point.
 *  Every source runs in parallel and fails on its own; a missing section is
 *  reported as unavailable instead of failing the whole page. */

export const maxDuration = 20;

const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

async function section<T>(p: Promise<T | null>): Promise<Section<T>> {
  try {
    const data = await p;
    return { ok: true, data };
  } catch (e) {
    return { ok: false, data: null, error: e instanceof Error ? e.message : "Unavailable" };
  }
}

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });

  // Round to about 10 m so nearby lookups share a cache entry.
  const la = Math.round(lat * 1e4) / 1e4;
  const lo = Math.round(lng * 1e4) / 1e4;

  const elevation = await src.elevationFt(la, lo);

  // These three feed both the map and the point checks, so each is fetched once.
  const cells = src.gridCells(la, lo);
  const sua = src.suaShapes(la, lo);
  const shapes = src.airspaceShapes(la, lo);
  const orEmpty = (p: Promise<GeoJSON.FeatureCollection>) => p.catch(() => EMPTY);

  const [airspace, restrictionsRaw, airports, metar, taf, hourly, space, grid, airspaceFc, suaFc] = await Promise.all([
    section(src.airspace(la, lo, elevation, cells)),
    section(src.restrictions(la, lo, sua)),
    section(src.airports(la, lo)),
    section(src.metar(la, lo)),
    section(src.taf(la, lo)),
    section(src.hourly(la, lo)),
    section(src.spaceWeather()),
    orEmpty(cells),
    orEmpty(shapes),
    orEmpty(sua),
  ]);

  const restrictions: FlyReport["restrictions"] = {
    ok: restrictionsRaw.ok,
    data: restrictionsRaw.data?.data ?? null,
    error: restrictionsRaw.error,
  };

  const report: FlyReport = {
    point: { lat: la, lng: lo, elevationFt: elevation },
    generatedAt: new Date().toISOString(),
    airspaceVerdict: airspaceVerdict(airspace.data, restrictions.data, airports.data),
    airspace,
    restrictions,
    airports,
    metar,
    taf,
    hourly,
    space,
    overlays: {
      grid,
      airspace: airspaceFc,
      sua: suaFc,
      tfr: restrictionsRaw.data?.tfrShapes ?? { type: "FeatureCollection", features: [] },
    },
  };

  // Never let the CDN hold on to a briefing that is missing its airspace half.
  return NextResponse.json(report, {
    headers: {
      "Cache-Control": report.airspaceVerdict.incomplete
        ? "no-store"
        : "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
