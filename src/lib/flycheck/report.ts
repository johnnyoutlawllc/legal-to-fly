import * as src from "./sources";
import { airspaceVerdict } from "./verdict";
import type { FlyReport, Section } from "./types";

/** One briefing for one point. Shared by /api/fly-check and the
 *  server-rendered place pages. Every source runs in parallel and fails on
 *  its own; a missing section is reported as unavailable, never as clear. */

const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

async function section<T>(p: Promise<T | null>): Promise<Section<T>> {
  try {
    return { ok: true, data: await p };
  } catch (e) {
    return { ok: false, data: null, error: e instanceof Error ? e.message : "Unavailable" };
  }
}

export async function buildReport(lat: number, lng: number): Promise<FlyReport> {
  // Round to about 10 m so nearby lookups share a cache entry.
  const la = Math.round(lat * 1e4) / 1e4;
  const lo = Math.round(lng * 1e4) / 1e4;

  const elevation = await src.elevationFt(la, lo);

  // These three feed both the map and the point checks, so each is fetched once.
  const cells = src.gridCells(la, lo);
  const sua = src.suaShapes(la, lo);
  const shapes = src.airspaceShapes(la, lo);
  const orEmpty = (p: Promise<GeoJSON.FeatureCollection>) => p.catch(() => EMPTY);

  const [airspace, restrictionsRaw, airports, metar, taf, hourly, space, grid, airspaceFc, suaFc, stations] = await Promise.all([
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
    src.weatherStations(la, lo).catch(() => []),
  ]);

  const restrictions: FlyReport["restrictions"] = {
    ok: restrictionsRaw.ok,
    data: restrictionsRaw.data?.data ?? null,
    error: restrictionsRaw.error,
  };

  return {
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
      tfr: restrictionsRaw.data?.tfrShapes ?? EMPTY,
      stations,
    },
  };
}
