import { bearing, distanceNm, distanceToGeometryNm, parseDms, pointInGeometry } from "./geo";
import type {
  Airport,
  AirspaceData,
  AirspaceVolume,
  CloudLayer,
  HourlyPoint,
  LaancGrid,
  Metar,
  RestrictionsData,
  SpaceWeather,
  SpecialUse,
  Station,
  Taf,
  TafPeriod,
  Tfr,
} from "./types";

/** Every source here is free, public and keyless. Each fetch carries its own
 *  cache window and its own timeout, so one slow agency never stalls the page.
 *
 *  Caching is in-process and success-only on purpose. The FAA's ArcGIS host
 *  rate limits with a 200 response carrying an error body, and the framework
 *  fetch cache would happily store that error for the whole window. */

const UA = "LegalToFly/1.0 (+https://legaltofly.com/can-i-fly-here)";
const FAA = "https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/arcgis/rest/services";
const NPS =
  "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2";

const memo = new Map<string, { exp: number; val: unknown }>();
const MEMO_MAX = 500;

async function getJson<T>(
  url: string,
  ttlSeconds: number,
  timeoutMs = 8000,
  validate?: (d: T) => void,
): Promise<T> {
  const hit = memo.get(url);
  if (hit && hit.exp > Date.now()) return hit.val as T;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json, application/geo+json" },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`${new URL(url).host} answered ${res.status}`);
  const d = (await res.json()) as T;
  validate?.(d);
  if (memo.size >= MEMO_MAX) memo.delete(memo.keys().next().value!);
  memo.set(url, { exp: Date.now() + ttlSeconds * 1000, val: d });
  return d;
}

type Attrs = Record<string, string | number | null>;
interface EsriResult {
  features?: { attributes: Attrs }[];
  error?: { message: string };
}

function arcUrl(layer: string, params: Record<string, string | number>) {
  const q = new URLSearchParams({
    inSR: "4326",
    outSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });
  return `${layer}/query?${q}`;
}

const pointQuery = (lat: number, lng: number, outFields: string, where = "1=1") => ({
  geometry: `${lng},${lat}`,
  geometryType: "esriGeometryPoint",
  outFields,
  where,
  returnGeometry: "false",
  f: "json",
});

const envelope = (lat: number, lng: number, dLat: number, dLng: number) =>
  `${lng - dLng},${lat - dLat},${lng + dLng},${lat + dLat}`;

/** The FAA's ArcGIS org shares one quota (6,000 request units a minute)
 *  across every app that reads these layers, so it intermittently answers
 *  429 for reasons that have nothing to do with us. A short backoff usually
 *  lands inside the next window; past that the caller reports "unverified". */
async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run();
    } catch (e) {
      const busy = e instanceof Error && /too many requests|quota/i.test(e.message);
      if (!busy || attempt >= 2) throw e;
      await new Promise((r) => setTimeout(r, 900 * (attempt + 1)));
    }
  }
}

async function arcAttrs(layer: string, params: Record<string, string | number>, ttl: number) {
  const d = await withRetry(() =>
    getJson<EsriResult>(arcUrl(layer, params), ttl, 8000, (x) => {
      if (x.error) throw new Error(x.error.message);
    }),
  );
  return (d.features ?? []).map((f) => f.attributes);
}

async function arcGeoJson(
  layer: string,
  params: Record<string, string | number>,
  ttl: number,
): Promise<GeoJSON.FeatureCollection> {
  return withRetry(() =>
    getJson<GeoJSON.FeatureCollection & { error?: { message: string } }>(
      arcUrl(layer, { ...params, f: "geojson", geometryPrecision: 5 }),
      ttl,
      8000,
      (x) => {
        if (x.error) throw new Error(x.error.message);
        if (x.type !== "FeatureCollection") throw new Error("Unexpected response from the FAA");
      },
    ),
  );
}

const box = (lat: number, lng: number, dLat: number, dLng: number) => ({
  geometry: envelope(lat, lng, dLat, dLng),
  geometryType: "esriGeometryEnvelope",
  where: "1=1",
  resultRecordCount: 2000,
});

const APT_FIELDS = [1, 2, 3, 4, 5].flatMap((i) => [`APT${i}_FAAID`, `APT${i}_NAME`, `APT${i}_LAANC`, `AIRSPACE_${i}`]);

/** LAANC grid squares around the point. Used for the map and, by
 *  point-in-polygon, for the square the point sits in: one request, not two. */
export function gridCells(lat: number, lng: number) {
  return arcGeoJson(
    `${FAA}/FAA_UAS_FacilityMap_Data/FeatureServer/0`,
    { ...box(lat, lng, 0.07, 0.085), outFields: ["CEILING", "MAP_EFF", ...APT_FIELDS].join(",") },
    3600,
  );
}

/** Special use airspace around the point, same double duty as gridCells. */
export function suaShapes(lat: number, lng: number) {
  return arcGeoJson(
    `${FAA}/Special_Use_Airspace/FeatureServer/0`,
    {
      ...box(lat, lng, 0.35, 0.42),
      outFields: "NAME,TYPE_CODE,TIMESOFUSE,UPPER_VAL,UPPER_UOM,UPPER_CODE,LOWER_VAL,LOWER_UOM,LOWER_CODE",
      maxAllowableOffset: 0.0005,
    },
    3600,
  );
}

/** Class B, C, D and E surface areas for the map. */
export function airspaceShapes(lat: number, lng: number) {
  return arcGeoJson(
    `${FAA}/Class_Airspace/FeatureServer/0`,
    {
      ...box(lat, lng, 0.35, 0.42),
      where: "LOCAL_TYPE IN ('CLASS_B','CLASS_C','CLASS_D','CLASS_E2','CLASS_E3','CLASS_E4')",
      outFields: "NAME,LOCAL_TYPE,LOWER_VAL,UPPER_VAL",
      maxAllowableOffset: 0.0008,
    },
    3600,
  );
}

/* ── Ground elevation (USGS 3DEP) ─────────────────────────────────────────── */

export async function elevationFt(lat: number, lng: number): Promise<number | null> {
  try {
    const d = await getJson<{ value: number | string }>(
      `https://epqs.nationalmap.gov/v1/json?x=${lng}&y=${lat}&units=Feet&wkid=4326`,
      86400,
      5000,
    );
    const v = Number(d.value);
    return Number.isFinite(v) && v > -1000 ? Math.round(v) : null;
  } catch {
    return null;
  }
}

/* ── Airspace: UAS Facility Map grid + class airspace ─────────────────────── */

const SURFACE_TYPES: Record<string, string> = {
  CLASS_B: "B",
  CLASS_C: "C",
  CLASS_D: "D",
  CLASS_E2: "E2",
  CLASS_E3: "E3",
  CLASS_E4: "E4",
};

function volume(a: Attrs): AirspaceVolume | null {
  const t = String(a.LOCAL_TYPE ?? "");
  const cls = SURFACE_TYPES[t] ?? (t === "CLASS_E5" || t === "CLASS_E6" ? "E" : null);
  if (!cls) return null;
  const lowerFt = Number(a.LOWER_VAL ?? 0);
  const upper = Number(a.UPPER_VAL);
  const code = String(a.LOWER_CODE ?? "SFC");
  return {
    name: String(a.NAME ?? ""),
    cls,
    lowerFt,
    lowerRef: code === "MSL" ? "MSL" : lowerFt === 0 ? "SFC" : "AGL",
    upperFt: Number.isFinite(upper) && upper > 0 ? upper : null,
  };
}

export async function airspace(
  lat: number,
  lng: number,
  groundFt: number | null,
  cells: Promise<GeoJSON.FeatureCollection>,
): Promise<AirspaceData> {
  const [fc, classRows] = await Promise.all([
    cells,
    arcAttrs(
      `${FAA}/Class_Airspace/FeatureServer/0`,
      pointQuery(lat, lng, "NAME,LOCAL_TYPE,LOWER_VAL,LOWER_CODE,UPPER_VAL"),
      3600,
    ),
  ]);
  const gridRows = fc.features
    .filter((f) => f.geometry && pointInGeometry(lat, lng, f.geometry))
    .map((f) => (f.properties ?? {}) as Attrs);

  let grid: LaancGrid | null = null;
  if (gridRows.length) {
    // Overlapping cells can exist at airport boundaries; the lowest ceiling governs.
    const g = [...gridRows].sort((a, b) => Number(a.CEILING) - Number(b.CEILING))[0];
    const airports = [1, 2, 3, 4, 5]
      .map((i) => ({
        id: String(g[`APT${i}_FAAID`] ?? ""),
        name: String(g[`APT${i}_NAME`] ?? ""),
        laanc: Number(g[`APT${i}_LAANC`]) === 1,
      }))
      .filter((a) => a.id);
    grid = {
      ceilingFt: Number(g.CEILING ?? 0),
      airports,
      airspace: [1, 2, 3, 4, 5].map((i) => String(g[`AIRSPACE_${i}`] ?? "")).filter(Boolean),
      effective: String(g.MAP_EFF ?? ""),
    };
  }

  const vols = classRows.map(volume).filter((v): v is AirspaceVolume => !!v);
  const affectsOps = (v: AirspaceVolume) =>
    v.cls !== "E" &&
    (v.lowerRef === "SFC" ||
      (v.lowerRef === "AGL" && v.lowerFt <= 400) ||
      (v.lowerRef === "MSL" && groundFt !== null && v.lowerFt <= groundFt + 400));

  return {
    grid,
    surface: vols.filter(affectsOps),
    overhead: vols.filter((v) => !affectsOps(v)).sort((a, b) => a.lowerFt - b.lowerFt),
  };
}

/* ── Restrictions: TFRs, special use airspace, National Park land ─────────── */

interface TfrFeature extends GeoJSON.Feature {
  properties: { NOTAM_KEY?: string; TITLE?: string; LEGAL?: string } | null;
}

async function tfrCollection() {
  return getJson<GeoJSON.FeatureCollection>(
    "https://tfr.faa.gov/geoserver/TFR/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=TFR:V_TFR_LOC&outputFormat=application/json",
    300,
    10000,
    (x) => {
      if (x.type !== "FeatureCollection") throw new Error("Unexpected TFR feed response");
    },
  );
}

const SUA_LABEL: Record<string, string> = {
  P: "Prohibited area",
  R: "Restricted area",
  W: "Warning area",
  A: "Alert area",
  MOA: "Military operations area",
  D: "Danger area",
};

const level = (val: unknown, uom: unknown, code: unknown) => {
  const v = String(val ?? "");
  if (!v || v === "0") return "Surface";
  if (String(uom) === "FL") return `FL${v}`;
  return `${Number(v).toLocaleString("en-US")} ft ${String(code ?? "") || "MSL"}`;
};

export async function restrictions(
  lat: number,
  lng: number,
  suaFc: Promise<GeoJSON.FeatureCollection>,
): Promise<{ data: RestrictionsData; tfrShapes: GeoJSON.FeatureCollection }> {
  const [tfrFc, suaAll, parkRows] = await Promise.all([
    tfrCollection().catch(() => null),
    suaFc,
    arcAttrs(NPS, pointQuery(lat, lng, "UNIT_NAME,UNIT_TYPE"), 86400).catch(() => [] as Attrs[]),
  ]);
  const suaRows = suaAll.features
    .filter((f) => f.geometry && pointInGeometry(lat, lng, f.geometry))
    .map((f) => (f.properties ?? {}) as Attrs);

  if (!tfrFc) throw new Error("The FAA TFR feed did not answer");

  // One NOTAM often ships several shapes (a VIP TFR's inner core and outer
  // ring, or one ring per time window). Merge them so each NOTAM is listed
  // once, at its nearest edge, and counts as "inside" if any shape covers us.
  const byId = new Map<string, Tfr>();
  const near: GeoJSON.Feature[] = [];
  for (const f of tfrFc.features as TfrFeature[]) {
    if (!f.geometry) continue;
    const d = distanceToGeometryNm(lat, lng, f.geometry);
    if (d > 30) continue;
    near.push(f);
    const id = String(f.properties?.NOTAM_KEY ?? "").split("-")[0];
    const inside = d === 0 && pointInGeometry(lat, lng, f.geometry);
    const prev = byId.get(id);
    byId.set(id, {
      id,
      title: String(f.properties?.TITLE ?? "Temporary flight restriction"),
      type: String(f.properties?.LEGAL ?? ""),
      inside: inside || !!prev?.inside,
      distanceNm: Math.min(Math.round(d * 10) / 10, prev?.distanceNm ?? Infinity),
    });
  }
  const tfrs = [...byId.values()].sort((a, b) => a.distanceNm - b.distanceNm);

  const sua: SpecialUse[] = suaRows.map((a) => {
    const type = String(a.TYPE_CODE ?? "");
    return {
      name: String(a.NAME ?? ""),
      type,
      typeLabel: SUA_LABEL[type] ?? type,
      times: a.TIMESOFUSE ? String(a.TIMESOFUSE) : null,
      lower: level(a.LOWER_VAL, a.LOWER_UOM, a.LOWER_CODE),
      upper: level(a.UPPER_VAL, a.UPPER_UOM, a.UPPER_CODE),
    };
  });

  const park = parkRows[0]
    ? { name: String(parkRows[0].UNIT_NAME ?? ""), type: String(parkRows[0].UNIT_TYPE ?? "") }
    : null;

  return { data: { tfrs, sua, park }, tfrShapes: { type: "FeatureCollection", features: near } };
}

/* ── Airports, heliports and other landing areas within 5 NM ─────────────── */

const AIRPORT_TYPE: Record<string, string> = {
  AD: "Airport",
  HP: "Heliport",
  SP: "Seaplane base",
  UL: "Ultralight field",
  GL: "Gliderport",
  BP: "Balloonport",
};

export async function airports(lat: number, lng: number): Promise<Airport[]> {
  const rows = await arcAttrs(
    `${FAA}/US_Airport/FeatureServer/0`,
    {
      geometry: envelope(lat, lng, 0.09, 0.11),
      geometryType: "esriGeometryEnvelope",
      outFields: "IDENT,NAME,LATITUDE,LONGITUDE,TYPE_CODE,SERVCITY,PRIVATEUSE,OPERSTATUS",
      where: "1=1",
      returnGeometry: "false",
      resultRecordCount: 200,
      f: "json",
    },
    86400,
  );
  return rows
    .filter((a) => String(a.OPERSTATUS ?? "OPERATIONAL") === "OPERATIONAL")
    .map((a) => {
      const aLat = parseDms(a.LATITUDE);
      const aLng = parseDms(a.LONGITUDE);
      if (aLat === null || aLng === null) return null;
      const type = String(a.TYPE_CODE ?? "AD");
      return {
        ident: String(a.IDENT ?? ""),
        name: String(a.NAME ?? ""),
        type,
        typeLabel: AIRPORT_TYPE[type] ?? "Landing area",
        city: String(a.SERVCITY ?? ""),
        privateUse: Number(a.PRIVATEUSE) === 1,
        distanceNm: Math.round(distanceNm(lat, lng, aLat, aLng) * 10) / 10,
        bearing: bearing(lat, lng, aLat, aLng),
        lat: aLat,
        lng: aLng,
      } satisfies Airport;
    })
    .filter((a): a is Airport => !!a && a.distanceNm <= 5)
    .sort((a, b) => a.distanceNm - b.distanceNm)
    .slice(0, 12);
}

/* ── Weather: METAR, TAF, NWS hourly ──────────────────────────────────────── */

interface AwcCloud {
  cover: string;
  base: number | null;
  type?: string | null;
}
interface AwcMetar {
  icaoId: string;
  name: string;
  lat: number;
  lon: number;
  elev: number;
  rawOb: string;
  reportTime: string;
  obsTime?: number;
  wdir: number | string | null;
  wspd: number | null;
  wgst?: number | null;
  visib: number | string | null;
  wxString?: string | null;
  temp: number | null;
  dewp: number | null;
  altim: number | null;
  clouds?: AwcCloud[];
  fltCat?: string | null;
}
interface AwcTaf {
  icaoId: string;
  name: string;
  lat: number;
  lon: number;
  elev: number;
  rawTAF: string;
  issueTime: string;
  fcsts: {
    timeFrom: number;
    timeTo: number;
    fcstChange: string | null;
    probability: number | null;
    wdir: number | string | null;
    wspd: number | null;
    wgst: number | null;
    visib: number | string | null;
    wxString: string | null;
    clouds?: AwcCloud[];
  }[];
}

const awcBox = (lat: number, lng: number, d: number) =>
  `${(lat - d).toFixed(2)},${(lng - d).toFixed(2)},${(lat + d).toFixed(2)},${(lng + d).toFixed(2)}`;

function station(lat: number, lng: number, s: { icaoId: string; name: string; lat: number; lon: number; elev: number }): Station {
  return {
    id: s.icaoId,
    name: s.name.replace(/, US$/, ""),
    distanceNm: Math.round(distanceNm(lat, lng, s.lat, s.lon) * 10) / 10,
    bearing: bearing(lat, lng, s.lat, s.lon),
    elevFt: Math.round(s.elev * 3.28084),
  };
}

const vis = (v: number | string | null) => {
  if (v === null || v === undefined || v === "") return { sm: null as number | null, plus: false };
  const s = String(v);
  return { sm: parseFloat(s), plus: s.endsWith("+") };
};

const layers = (c?: AwcCloud[]): CloudLayer[] =>
  (c ?? []).map((l) => ({ cover: l.cover, baseFt: l.base ?? null, type: l.type ?? null }));

const ceilingOf = (c: CloudLayer[]) => {
  const l = c.find((x) => ["BKN", "OVC", "OVX", "VV"].includes(x.cover) && x.baseFt !== null);
  return l ? l.baseFt : null;
};

async function nearest<T extends { lat: number; lon: number }>(
  kind: "metar" | "taf",
  lat: number,
  lng: number,
): Promise<T | null> {
  for (const d of [0.6, 1.5]) {
    const rows = await getJson<T[]>(
      `https://aviationweather.gov/api/data/${kind}?bbox=${awcBox(lat, lng, d)}&format=json`,
      300,
    );
    if (Array.isArray(rows) && rows.length) {
      return rows.sort((a, b) => distanceNm(lat, lng, a.lat, a.lon) - distanceNm(lat, lng, b.lat, b.lon))[0];
    }
  }
  return null;
}

export async function metar(lat: number, lng: number): Promise<Metar | null> {
  const m = await nearest<AwcMetar>("metar", lat, lng);
  if (!m) return null;
  const st = station(lat, lng, m);
  const clouds = layers(m.clouds);
  const v = vis(m.visib);
  const altimInHg = m.altim ? Math.round(m.altim * 0.02953 * 100) / 100 : null;

  // Density altitude from the station's own numbers: pressure altitude, then
  // 120 ft per degree C away from standard temperature at that altitude.
  let densityAltFt: number | null = null;
  if (altimInHg && m.temp !== null) {
    const pa = st.elevFt + (29.92 - altimInHg) * 1000;
    const isa = 15 - 2 * (pa / 1000);
    densityAltFt = Math.round((pa + 120 * (m.temp - isa)) / 10) * 10;
  }

  return {
    station: st,
    raw: m.rawOb,
    observed: m.obsTime ? new Date(m.obsTime * 1000).toISOString() : m.reportTime,
    windDir: typeof m.wdir === "number" ? m.wdir : null,
    windVariable: m.wdir === "VRB",
    windKt: m.wspd ?? 0,
    gustKt: m.wgst ?? null,
    visibilitySm: v.sm ?? 10,
    visibilityPlus: v.plus,
    ceilingFt: ceilingOf(clouds),
    clouds,
    wx: m.wxString || null,
    tempC: m.temp,
    dewC: m.dewp,
    altimInHg,
    category: m.fltCat ?? null,
    densityAltFt,
  };
}

export async function taf(lat: number, lng: number): Promise<Taf | null> {
  const t = await nearest<AwcTaf>("taf", lat, lng);
  if (!t) return null;
  const periods: TafPeriod[] = t.fcsts.map((f) => {
    const v = vis(f.visib);
    return {
      from: new Date(f.timeFrom * 1000).toISOString(),
      to: new Date(f.timeTo * 1000).toISOString(),
      change: f.fcstChange,
      probability: f.probability,
      windDir: typeof f.wdir === "number" ? f.wdir : null,
      windKt: f.wspd,
      gustKt: f.wgst,
      visibilitySm: v.sm,
      visibilityPlus: v.plus,
      clouds: layers(f.clouds),
      wx: f.wxString,
    };
  });
  return { station: station(lat, lng, t), raw: t.rawTAF, issued: t.issueTime, periods };
}

export async function hourly(lat: number, lng: number): Promise<HourlyPoint[]> {
  const pt = await getJson<{ properties: { forecastHourly: string } }>(
    `https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`,
    86400,
  );
  const fc = await getJson<{
    properties: {
      periods: {
        startTime: string;
        temperature: number;
        windSpeed: string;
        windDirection: string;
        shortForecast: string;
        isDaytime: boolean;
        probabilityOfPrecipitation?: { value: number | null };
      }[];
    };
  }>(pt.properties.forecastHourly, 900);
  // The forecast can lag the clock by an hour; drop periods already over.
  const cutoff = Date.now() - 3600_000;
  return fc.properties.periods
    .filter((p) => new Date(p.startTime).getTime() > cutoff)
    .slice(0, 12)
    .map((p) => ({
    time: p.startTime,
    tempF: p.temperature,
    // "10 to 15 mph" plans against the top of the range.
    windMph: Math.max(...(p.windSpeed.match(/\d+/g) ?? ["0"]).map(Number)),
    windDir: p.windDirection,
    precipPct: p.probabilityOfPrecipitation?.value ?? null,
    short: p.shortForecast,
    isDaytime: p.isDaytime,
  }));
}

/* ── Space weather (NOAA SWPC planetary K index) ──────────────────────────── */

export async function spaceWeather(): Promise<SpaceWeather> {
  const rows = await getJson<unknown[]>(
    "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
    900,
  );
  const last = rows[rows.length - 1] as Record<string, unknown> | unknown[];
  // The feed has shipped both an array-of-arrays and an array-of-objects shape.
  if (Array.isArray(last)) return { kp: Number(last[1]), observed: String(last[0]) };
  return { kp: Number(last.Kp ?? last.kp), observed: String(last.time_tag) };
}
