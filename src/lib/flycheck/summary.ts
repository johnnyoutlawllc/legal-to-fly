import { compass } from "./geo";
import type { FlyReport } from "./types";

/** A short, quotable answer built only from the report's own data. It is
 *  written for search snippets and AI answer engines: lead with the answer,
 *  then the two or three facts that explain it. Never invents anything. */

export interface PlaceSummary {
  answer: "yes" | "with-authorization" | "no" | "not-now" | "unverified";
  headline: string;
  short: string;
  facts: { label: string; value: string }[];
}

export function summarize(r: FlyReport, where: string): PlaceSummary {
  const a = r.airspace.data;
  const rs = r.restrictions.data;
  const v = r.airspaceVerdict;
  const grid = a?.grid;
  const surface = a?.surface ?? [];
  const nearest = r.airports.data?.[0];
  const activeTfr = rs?.tfrs.find((t) => t.inside && t.detail?.status === "active");

  const facts: PlaceSummary["facts"] = [];
  const cls = grid
    ? grid.airspace.map((c) => `Class ${c}`).join(", ")
    : surface.length
      ? surface.map((s) => `Class ${s.cls.startsWith("E") ? "E surface area" : s.cls}`).join(", ")
      : a
        ? "Class G (uncontrolled)"
        : "Not verified";
  facts.push({ label: "Airspace at ground level", value: cls });
  if (grid)
    facts.push({
      label: "LAANC ceiling here",
      value: grid.ceilingFt === 0 ? "0 ft (no automatic approval)" : `${grid.ceilingFt} ft above ground`,
    });
  if (nearest)
    facts.push({
      label: "Nearest airport or heliport",
      value: `${nearest.name} (${nearest.ident}), ${nearest.distanceNm} NM ${compass(nearest.bearing)}`,
    });
  if (rs?.park) facts.push({ label: "National Park Service land", value: `Yes: ${rs.park.name}` });
  if (rs?.sua.length) facts.push({ label: "Special use airspace", value: rs.sua.map((s) => `${s.typeLabel} ${s.name}`).join("; ") });
  if (r.point.elevationFt !== null) facts.push({ label: "Ground elevation", value: `${r.point.elevationFt.toLocaleString()} ft` });

  if (v.incomplete || !a)
    return {
      answer: "unverified",
      headline: `We couldn't verify ${where} right now`,
      short: `The FAA's airspace service didn't answer, so this page can't confirm the airspace over ${where} at the moment. Run the live check below or try again shortly.`,
      facts,
    };

  const hardStop = rs?.park || rs?.sua.some((s) => s.type === "P" || s.type === "R") || grid?.ceilingFt === 0;

  if (hardStop) {
    const why = rs?.sua.some((s) => s.type === "P")
      ? `it sits inside prohibited airspace (${rs.sua.find((s) => s.type === "P")!.name})${rs.park ? ` and on National Park Service land (${rs.park.name})` : ""}`
      : rs?.park
        ? `it is National Park Service land (${rs.park.name}), where the Park Service bans launching and landing drones`
        : rs?.sua.some((s) => s.type === "R")
          ? `it sits inside a restricted area (${rs.sua.find((s) => s.type === "R")!.name})`
          : `it is so close to ${grid!.airports[0]?.name ?? "an airport"} that the FAA's LAANC ceiling is 0 ft`;
    return {
      answer: "no",
      headline: `Not without special permission`,
      short: `Generally no. You can't fly a drone in central ${where} without special permission, because ${why}.`,
      facts,
    };
  }

  // Normally fine, but a TFR covers it at the moment the page was built.
  const tfrNote = activeTfr
    ? ` Right now, though, a ${activeTfr.detail?.kind ? `${activeTfr.detail.kind.replace(/^([A-Z])(?=[a-z])/, (c) => c.toLowerCase())} ` : ""}TFR (FAA NOTAM ${activeTfr.id}) covers this spot${activeTfr.detail?.to ? ` until ${new Date(activeTfr.detail.to).toLocaleTimeString("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}` : ""}${activeTfr.detail?.dronesBanned ? " and bans drones" : ""}.`
    : "";

  if (grid || surface.length) {
    const near = grid?.airports.map((x) => x.name).join(" and ") || surface[0]?.name;
    return {
      answer: activeTfr ? "not-now" : "with-authorization",
      headline: activeTfr ? "Normally with authorization, but not right now" : "Yes, with FAA authorization",
      short: `Yes, with authorization. Central ${where} is in controlled airspace around ${near}, so you need FAA approval before flying${grid ? `; LAANC can approve flights up to ${grid.ceilingFt} ft here, usually in seconds` : ""}.${tfrNote || " Check for temporary flight restrictions before every flight."}`,
      facts,
    };
  }

  return {
    answer: activeTfr ? "not-now" : "yes",
    headline: activeTfr ? "Normally yes, but not right now" : "Yes, in most of the area",
    short: `${activeTfr ? "Normally yes." : "Yes."} Central ${where} is in uncontrolled Class G airspace, so you can fly up to 400 ft above the ground without FAA authorization${nearest ? `. Watch for traffic near ${nearest.name}, ${nearest.distanceNm} NM ${compass(nearest.bearing)}` : ""}.${tfrNote || " Always check for temporary flight restrictions before you fly."}`,
    facts,
  };
}
