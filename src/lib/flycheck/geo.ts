/** Small geodesy helpers. Distances are great-circle and good to a few
 *  hundredths of a mile, which is far finer than anything this page shows. */

const R_NM = 3440.065;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function distanceNm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_NM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** True bearing from point 1 to point 2, 0 to 359. */
export function bearing(lat1: number, lng1: number, lat2: number, lng2: number) {
  const y = Math.sin(rad(lng2 - lng1)) * Math.cos(rad(lat2));
  const x =
    Math.cos(rad(lat1)) * Math.sin(rad(lat2)) -
    Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(rad(lng2 - lng1));
  return Math.round((deg(Math.atan2(y, x)) + 360) % 360);
}

export function compass(b: number) {
  const pts = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return pts[Math.round(b / 22.5) % 16];
}

/** FAA NASR coordinates arrive as "32-56-19.0000N". */
export function parseDms(s: string | number | null | undefined): number | null {
  if (typeof s === "number") return s;
  if (!s) return null;
  const m = /^(\d+)-(\d+)-([\d.]+)([NSEW])$/.exec(s.trim());
  if (!m) return null;
  const v = Number(m[1]) + Number(m[2]) / 60 + Number(m[3]) / 3600;
  return m[4] === "S" || m[4] === "W" ? -v : v;
}

type Ring = number[][];

function inRing(lng: number, lat: number, ring: Ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function polygons(g: GeoJSON.Geometry): Ring[][] {
  if (g.type === "Polygon") return [g.coordinates as Ring[]];
  if (g.type === "MultiPolygon") return g.coordinates as Ring[][];
  return [];
}

export function pointInGeometry(lat: number, lng: number, g: GeoJSON.Geometry) {
  return polygons(g).some(
    (rings) => inRing(lng, lat, rings[0]) && !rings.slice(1).some((h) => inRing(lng, lat, h)),
  );
}

/** Nearest vertex distance. Coarse, but TFR rings are dense circles, so it is
 *  within a fraction of a mile of the true edge distance. */
export function distanceToGeometryNm(lat: number, lng: number, g: GeoJSON.Geometry) {
  if (pointInGeometry(lat, lng, g)) return 0;
  let best = Infinity;
  for (const rings of polygons(g))
    for (const ring of rings)
      for (const [x, y] of ring) best = Math.min(best, distanceNm(lat, lng, y, x));
  return best;
}
