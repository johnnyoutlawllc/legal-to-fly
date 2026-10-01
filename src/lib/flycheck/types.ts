/** Shapes shared by /api/fly-check and the Can I Fly Here page. Every section
 *  is independent: one slow or failing source leaves the rest of the report
 *  intact, and the page shows that section as unavailable rather than failing. */

export type Level = "go" | "caution" | "stop" | "info";

export interface Finding {
  level: Level;
  title: string;
  detail: string;
  /** Regulation or source the finding comes from, e.g. "14 CFR 107.41". */
  cite?: string;
  /** Ground school lesson slug that teaches this. */
  learn?: string;
  /** Where to act on it (LAANC, DroneZone, TFR detail). */
  link?: { href: string; label: string };
  /** The real NOTAM behind a TFR finding. */
  tfr?: TfrDetail | null;
}

export interface Section<T> {
  ok: boolean;
  data: T | null;
  error?: string;
}

export interface AirspaceVolume {
  name: string;
  /** "B" | "C" | "D" | "E2" (E surface area) | "E" | "A" | "MODE C" */
  cls: string;
  lowerFt: number;
  /** SFC = starts at the ground; AGL/MSL = a floor above it. */
  lowerRef: "SFC" | "AGL" | "MSL";
  upperFt: number | null;
}

export interface LaancGrid {
  ceilingFt: number;
  airports: { id: string; name: string; laanc: boolean }[];
  airspace: string[];
  effective: string;
}

export interface AirspaceData {
  grid: LaancGrid | null;
  /** Controlled airspace that starts at the surface over this point. */
  surface: AirspaceVolume[];
  /** Shelves above the point (Class B/C floors, Class E at 700/1200). */
  overhead: AirspaceVolume[];
}

export interface TfrArea {
  name: string;
  from: string | null;
  to: string | null;
  radiusNm: number | null;
  floor: string;
  ceiling: string;
}

/** Parsed from the FAA's per-NOTAM XML (tfr.faa.gov/download/detail_*.xml). */
export interface TfrDetail {
  issued: string | null;
  regulation: string | null;
  kind: string | null;
  reason: string | null;
  place: string | null;
  from: string | null;
  to: string | null;
  /** "active" | "upcoming" | "expired", judged at fetch time. */
  status: "active" | "upcoming" | "expired" | "unknown";
  areas: TfrArea[];
  dronesBanned: boolean;
  /** Operating restrictions, abbreviations expanded. */
  rules: string[];
  /** The lines that mention drones (UAS / model aircraft), expanded. */
  droneRules: string[];
}

export interface Tfr {
  id: string;
  title: string;
  type: string;
  inside: boolean;
  distanceNm: number;
  detail?: TfrDetail | null;
}

export interface SpecialUse {
  name: string;
  type: string;
  typeLabel: string;
  times: string | null;
  lower: string;
  upper: string;
}

export interface RestrictionsData {
  tfrs: Tfr[];
  sua: SpecialUse[];
  park: { name: string; type: string } | null;
}

export interface Airport {
  ident: string;
  name: string;
  type: string;
  typeLabel: string;
  city: string;
  privateUse: boolean;
  distanceNm: number;
  bearing: number;
  lat: number;
  lng: number;
}

export interface Station {
  id: string;
  name: string;
  distanceNm: number;
  bearing: number;
  elevFt: number;
}

export interface CloudLayer {
  cover: string;
  baseFt: number | null;
  type?: string | null;
}

export interface Metar {
  station: Station;
  raw: string;
  observed: string;
  windDir: number | null;
  windVariable: boolean;
  windKt: number;
  gustKt: number | null;
  visibilitySm: number;
  visibilityPlus: boolean;
  ceilingFt: number | null;
  clouds: CloudLayer[];
  wx: string | null;
  tempC: number | null;
  dewC: number | null;
  altimInHg: number | null;
  category: string | null;
  densityAltFt: number | null;
}

export interface TafPeriod {
  from: string;
  to: string;
  change: string | null;
  probability: number | null;
  windDir: number | null;
  windKt: number | null;
  gustKt: number | null;
  visibilitySm: number | null;
  visibilityPlus: boolean;
  clouds: CloudLayer[];
  wx: string | null;
}

export interface Taf {
  station: Station;
  raw: string;
  issued: string;
  periods: TafPeriod[];
}

export interface HourlyPoint {
  time: string;
  tempF: number;
  windMph: number;
  windDir: string;
  precipPct: number | null;
  short: string;
  isDaytime: boolean;
}

export interface SpaceWeather {
  kp: number;
  observed: string;
}

/** A reporting station for the map's Live weather layer. */
export interface WxStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string | null;
  windDir: number | null;
  windKt: number | null;
  gustKt: number | null;
  visibility: string | null;
  wx: string | null;
  raw: string;
  observed: string | null;
}

export interface Overlays {
  grid: GeoJSON.FeatureCollection;
  airspace: GeoJSON.FeatureCollection;
  sua: GeoJSON.FeatureCollection;
  tfr: GeoJSON.FeatureCollection;
  stations: WxStation[];
}

export interface FlyReport {
  point: { lat: number; lng: number; elevationFt: number | null };
  generatedAt: string;
  /** incomplete = airspace or restriction data failed to load. The verdict
   *  then never reads as "go": missing data is not clear airspace. */
  airspaceVerdict: { level: Level; headline: string; findings: Finding[]; incomplete: boolean };
  airspace: Section<AirspaceData>;
  restrictions: Section<RestrictionsData>;
  airports: Section<Airport[]>;
  metar: Section<Metar>;
  taf: Section<Taf>;
  hourly: Section<HourlyPoint[]>;
  space: Section<SpaceWeather>;
  overlays: Overlays;
}

export interface GeoResult {
  lat: number;
  lng: number;
  label: string;
}
