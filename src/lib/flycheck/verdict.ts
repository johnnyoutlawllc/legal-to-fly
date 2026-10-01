import { compass } from "./geo";
import type { Airport, AirspaceData, Finding, Level, RestrictionsData } from "./types";

/** Turns the raw airspace and restriction data into plain-English findings.
 *  The wording is a briefing, never a clearance: the remote pilot in command
 *  owns the decision (14 CFR 107.19), and NOTAMs are not checked here. */

const LAANC = { href: "https://www.faa.gov/uas/getting_started/laanc", label: "Request LAANC" };
const DRONEZONE = { href: "https://faadronezone-access.faa.gov/", label: "FAA DroneZone" };

/** The FAA's own page for one NOTAM: "6/6215" lives at detail_6_6215. */
const tfrLink = (id: string) => ({
  href: `https://tfr.faa.gov/tfr3/?page=detail_${id.replace("/", "_")}`,
  label: `Read TFR ${id}`,
});

const RANK: Record<Level, number> = { info: 0, go: 1, caution: 2, stop: 3 };

const clsName = (c: string) =>
  c === "E2" || c === "E3" || c === "E4" ? "Class E surface area" : `Class ${c}`;

export function airspaceVerdict(
  airspace: AirspaceData | null,
  restrictions: RestrictionsData | null,
  airports: Airport[] | null,
): { level: Level; headline: string; findings: Finding[]; incomplete: boolean } {
  const f: Finding[] = [];
  const incomplete = !airspace || !restrictions;
  if (incomplete)
    f.push({
      level: "caution",
      title: !airspace ? "Airspace data didn't load" : "TFR and restriction data didn't load",
      detail:
        "An FAA source did not answer, so this spot is not verified. Do not read the rest of this briefing as clear. Try again in a minute, or check B4UFLY.",
      link: { href: "https://www.faa.gov/uas/getting_started/b4ufly", label: "B4UFLY" },
    });

  // ── Hard stops ──
  for (const t of restrictions?.tfrs ?? []) {
    if (!t.inside) continue;
    const d = t.detail;
    // A TFR whose every window has closed no longer restricts anything.
    if (d?.status === "expired") continue;
    const what = d?.reason ?? d?.kind ?? t.title;
    const when = d?.status === "active" ? "in effect now" : d?.status === "upcoming" ? "scheduled" : "";
    f.push({
      level: d?.status === "upcoming" && d.from && Date.parse(d.from) - Date.now() > 24 * 3600_000 ? "caution" : "stop",
      title: d
        ? `${d.dronesBanned ? "No drones" : "Flight restricted"}: ${d.kind ? `${d.kind} TFR` : what}${when ? `, ${when}` : ""}`
        : `Inside TFR ${t.id}`,
      detail: d
        ? `${d.reason ?? "Temporary flight restriction"}. FAA NOTAM ${t.id}${d.place ? ` for ${d.place}` : ""}.`
        : `${t.title}. The FAA's NOTAM detail did not load; open it before planning anything here.`,
      cite: d?.regulation ? `14 CFR ${d.regulation}` : "14 CFR 91.137-91.145, 99.7",
      learn: "airspace",
      link: tfrLink(t.id),
      tfr: d,
    });
  }
  if (restrictions?.park)
    f.push({
      level: "stop",
      title: `National Park Service land: ${restrictions.park.name}`,
      detail:
        "The Park Service bans launching, landing or operating drones from land and water it administers. This is a park rule, separate from the FAA, and a Part 107 certificate does not override it.",
      cite: "36 CFR 1.5 · NPS Policy Memorandum 14-05",
    });
  for (const s of restrictions?.sua ?? []) {
    if (s.type === "P")
      f.push({
        level: "stop",
        title: `${s.typeLabel}: ${s.name}`,
        detail: `Flight is prohibited here from ${s.lower} to ${s.upper}, for drones and airplanes alike.`,
        cite: "14 CFR 73.83",
        learn: "airspace",
      });
    else if (s.type === "R")
      f.push({
        level: "stop",
        title: `${s.typeLabel}: ${s.name}`,
        detail: `Hazards like live fire or artillery when active${s.times ? ` (${s.times})` : ""}. Do not fly without permission from the controlling agency.`,
        cite: "14 CFR 73.13",
        learn: "airspace",
      });
    else
      f.push({
        level: s.type === "MOA" ? "caution" : "info",
        title: `${s.typeLabel}: ${s.name}`,
        detail:
          s.type === "MOA"
            ? `Military aircraft may be training here at low altitude${s.times ? ` (${s.times})` : ""}. Legal to fly, but keep your head on a swivel.`
            : `${s.lower} to ${s.upper}${s.times ? `, ${s.times}` : ""}.`,
        cite: "AIM 3-4",
        learn: "airspace",
      });
  }

  // ── Controlled airspace ──
  const grid = airspace?.grid;
  const surface = airspace?.surface ?? [];
  if (grid) {
    const near = grid.airports.map((a) => a.id).join(", ");
    const laanc = grid.airports.some((a) => a.laanc);
    if (grid.ceilingFt === 0)
      f.push({
        level: "stop",
        title: "Controlled airspace with a 0 ft LAANC ceiling",
        detail: `This grid square near ${near} is too close to the runway for automatic approval. Flying here takes a DroneZone authorization with further coordination, which can take weeks.`,
        cite: "14 CFR 107.41",
        learn: "airspace",
        link: DRONEZONE,
      });
    else
      f.push({
        level: "caution",
        title: `Controlled airspace: authorization required`,
        detail: laanc
          ? `You need ATC authorization before you fly. LAANC can approve up to ${grid.ceilingFt} ft AGL in this grid square near ${near}, usually in seconds.`
          : `You need ATC authorization before you fly. The facility map allows up to ${grid.ceilingFt} ft AGL near ${near}, but this airport is not on LAANC, so apply through DroneZone.`,
        cite: "14 CFR 107.41",
        learn: "airspace",
        link: laanc ? LAANC : DRONEZONE,
      });
  } else if (surface.length) {
    const v = surface[0];
    f.push({
      level: "caution",
      title: `${clsName(v.cls)}: authorization required`,
      detail: `${v.name} starts at the surface here. There is no facility map grid at this exact point, so request authorization through DroneZone.`,
      cite: "14 CFR 107.41",
      learn: "airspace",
      link: DRONEZONE,
    });
  } else if (airspace) {
    const floor = airspace.overhead.find((v) => v.cls === "E");
    f.push({
      level: "go",
      title: "Class G at the surface: no ATC authorization needed",
      detail: floor
        ? `Uncontrolled airspace up to 400 ft AGL. Class E starts ${floor.lowerFt.toLocaleString("en-US")} ft ${floor.lowerRef === "MSL" ? "MSL" : "above the ground"} overhead, well above your ceiling.`
        : "Uncontrolled airspace. The usual Part 107 limits apply: 400 ft AGL, visual line of sight, daylight or lit for twilight.",
      cite: "14 CFR 107.41, 107.51(b)",
      learn: "airspace",
    });
  }

  for (const v of (airspace?.overhead ?? []).filter((o) => o.cls === "B" || o.cls === "C"))
    f.push({
      level: "info",
      title: `${clsName(v.cls)} shelf overhead`,
      detail: `${v.name} has a floor at ${v.lowerFt.toLocaleString("en-US")} ft ${v.lowerRef}. It sits above you, so it does not need authorization, but it is why big jets pass over this spot.`,
      cite: "AIM 3-2-3",
      learn: "sectional-charts",
    });

  // ── TFRs nearby (not over the point) ──
  for (const t of (restrictions?.tfrs ?? []).filter((x) => !x.inside && x.distanceNm <= 10)) {
    const d = t.detail;
    if (d?.status === "expired") continue;
    f.push({
      level: "caution",
      title: `${d?.kind ? `${d.kind} TFR` : "Temporary flight restriction"} ${t.distanceNm} NM away`,
      detail: `Not over this spot, but close. FAA NOTAM ${t.id}${d?.place ? ` for ${d.place}` : ""}.`,
      cite: d?.regulation ? `14 CFR ${d.regulation}` : "14 CFR 91.137-91.145, 99.7",
      link: tfrLink(t.id),
      tfr: d,
    });
  }

  // ── Landing areas close in ──
  for (const a of (airports ?? []).filter((x) => x.distanceNm <= 1.5).slice(0, 3))
    f.push({
      level: "info",
      title: `${a.typeLabel} ${a.distanceNm} NM ${compass(a.bearing)}: ${a.name}`,
      detail:
        a.type === "HP"
          ? "Helicopters fly low and fast near heliports and may not show on any chart overlay. You must give way to every crewed aircraft."
          : "Expect low traffic on approach and departure. You must give way to every crewed aircraft.",
      cite: "14 CFR 107.37",
      learn: "airport-operations",
    });

  const top = f.reduce<Level>((m, x) => (RANK[x.level] > RANK[m] ? x.level : m), "go");
  const headline =
    incomplete && top !== "stop"
      ? "Couldn't fully verify this spot"
      : top === "stop"
      ? "Not without special permission"
      : top === "caution"
        ? f.some((x) => x.cite === "14 CFR 107.41")
          ? "Flyable with authorization"
          : "Flyable, with care"
        : "Clear to plan a flight";

  f.sort((a, b) => RANK[b.level] - RANK[a.level]);
  return { level: top, headline, findings: f, incomplete };
}
