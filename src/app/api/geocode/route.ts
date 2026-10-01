import { NextResponse, type NextRequest } from "next/server";
import type { GeoResult } from "@/lib/flycheck/types";

/** GET /api/geocode?q=address  → best US match
 *  GET /api/geocode?lat=..&lng=.. → a readable name for a point
 *  Street addresses go to the US Census geocoder first (free, no key, very
 *  good on addresses). Place names, landmarks and ZIPs fall through to
 *  OpenStreetMap Nominatim, which asks for a real User-Agent and light use. */

const UA = "LegalToFly/1.0 (+https://legaltofly.com/can-i-fly-here)";

async function get<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "en-US" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(6000),
    });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

const title = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

interface Nom {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  addresstype?: string;
  address?: Record<string, string>;
}

function nomLabel(n: Nom) {
  const a = n.address ?? {};
  const place = a.city || a.town || a.village || a.hamlet || a.county || "";
  const first = n.name || [a.house_number, a.road].filter(Boolean).join(" ");
  return [first, place, a.state].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).join(", ") ||
    n.display_name.split(",").slice(0, 3).join(",");
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();

  if (!q) {
    const lat = Number(sp.get("lat"));
    const lng = Number(sp.get("lng"));
    if (!Number.isFinite(lat) || !Number.isFinite(lng))
      return NextResponse.json({ error: "q or lat/lng required" }, { status: 400 });
    const n = await get<Nom>(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=16&addressdetails=1`,
    );
    const label = n ? nomLabel(n) : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    return NextResponse.json({ lat, lng, label } satisfies GeoResult);
  }

  if (q.length > 200) return NextResponse.json({ error: "Too long" }, { status: 400 });

  // A pasted "lat, lng" pair skips geocoding entirely.
  const pair = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(q);
  if (pair)
    return NextResponse.json({ lat: Number(pair[1]), lng: Number(pair[2]), label: q } satisfies GeoResult);

  if (/\d/.test(q) && /[a-z]/i.test(q)) {
    const c = await get<{
      result?: { addressMatches?: { matchedAddress: string; coordinates: { x: number; y: number } }[] };
    }>(
      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(q)}&benchmark=Public_AR_Current&format=json`,
    );
    const m = c?.result?.addressMatches?.[0];
    if (m)
      return NextResponse.json({
        lat: m.coordinates.y,
        lng: m.coordinates.x,
        label: title(m.matchedAddress).replace(/\b([A-Z][a-z]), (\d{5})$/, (_, s, z) => `${s.toUpperCase()} ${z}`),
      } satisfies GeoResult);
  }

  const n = await get<Nom[]>(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=5&countrycodes=us&addressdetails=1`,
  );
  // "Rockwall, TX" should land on the city, not the county that shares its
  // name, whose centroid can be miles away. Prefer anything that is not a
  // county unless the user asked for one.
  const best =
    n?.find((r) => /county/i.test(q) || r.addresstype !== "county") ?? n?.[0];
  if (best)
    return NextResponse.json({ lat: Number(best.lat), lng: Number(best.lon), label: nomLabel(best) } satisfies GeoResult);

  return NextResponse.json({ error: "We couldn't find that place. Try a street address, city, or ZIP." }, { status: 404 });
}
