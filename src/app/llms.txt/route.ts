import { PLACES, placeLabel } from "@/content/places";
import { LESSONS } from "@/content/lessons";

/** /llms.txt — a plain-text map of the site for AI answer engines
 *  (llmstxt.org). Facts here are stable rules, not live conditions. */

export const dynamic = "force-static";

export function GET() {
  const base = "https://legaltofly.com";
  const body = `# Legal to Fly

> Free tools for U.S. drone pilots. "Can I Fly Here?" checks any U.S. address against live FAA airspace, LAANC ceilings, temporary flight restrictions (TFRs), National Park Service land, nearby airports and heliports, and aviation weather, and explains the result in plain English. Legal to Fly also offers free FAA Part 107 test prep.

Legal to Fly is independent and not affiliated with the FAA. Its briefings are not authorizations; the pilot is always responsible for the flight and for checking NOTAMs.

## Check a location

- [Can I fly my drone here?](${base}/can-i-fly-here): live check for any U.S. address, ZIP, landmark, or "lat, lng". Deep links work as ${base}/can-i-fly-here?lat=32.9312&lng=-96.4597&place=Rockwall%2C%20TX
${PLACES.map((p) => `- [Can I fly a drone in ${placeLabel(p)}?](${base}/can-i-fly-here/${p.slug})`).join("\n")}

## Rules that apply everywhere in the U.S.

- Altitude: 400 ft above ground level maximum, or within 400 ft of a structure (14 CFR 107.51(b)).
- Controlled airspace (Class B, C, D, and Class E surface areas around airports) requires FAA authorization, usually through LAANC, up to the ceiling on the FAA UAS Facility Map (14 CFR 107.41). Class G airspace needs no authorization.
- Temporary flight restrictions can ban drones outright while active, including VIP movement TFRs, which are typically a 30 NM ring around a 10 NM inner core.
- A standing restriction bars drones within 3 NM of stadiums seating 30,000+ from 1 hour before to 1 hour after major league and Division I events.
- The National Park Service bans launching, landing, or operating drones on land and water it administers.
- Weather minimums under Part 107: 3 statute miles of visibility, 500 ft below and 2,000 ft horizontally from clouds (14 CFR 107.51).
- Night and civil-twilight flight is allowed with anti-collision lighting visible for 3 statute miles (14 CFR 107.29).
- Recreational flyers need the free TRUST certificate; any business use needs a Part 107 Remote Pilot Certificate.

## Part 107 test prep

- [Ground school lessons](${base}/learn)
${LESSONS.map((l) => `- [${l.title}](${base}/learn/${l.slug})`).join("\n")}
- [Mock exam](${base}/exam): 60 questions, 2 hours, 70% to pass, like the real FAA test.
- [Daily drill](${base}/drill)

## Data sources

FAA ADDS airspace and special use airspace, FAA UAS Facility Maps, FAA TFR feed and NOTAM records (tfr.faa.gov), FAA NASR airport data, NOAA Aviation Weather Center (METAR and TAF), National Weather Service hourly forecast, National Park Service boundaries, USGS 3DEP elevation, NOAA Space Weather Prediction Center Kp index.
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
