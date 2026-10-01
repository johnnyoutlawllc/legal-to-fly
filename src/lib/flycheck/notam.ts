/** Turning FAA NOTAM shorthand into sentences a non-pilot can read.
 *  "ALL ACFT OPS WI THE 10NM RADIUS ... ARE PROHIBITED EXC FOR" becomes
 *  "All aircraft operations within the 10 NM radius ... are prohibited except for". */

const ABBR: Record<string, string> = {
  ACFT: "aircraft", OPS: "operations", OPR: "operating", OPRS: "operators", WI: "within", ABV: "above",
  BLW: "below", BTN: "between", EXC: "except", AUTH: "authorized", FLT: "flight", FLTS: "flights",
  ARR: "arriving", DEP: "departing", CTC: "contact", TFC: "traffic", APCH: "approach", MIL: "military",
  INCL: "including", ALT: "altitude", FT: "ft", SFC: "surface", FAC: "facility", CDN: "coordinating",
  PAX: "passenger", HR: "hours", HRS: "hours", LCL: "local", DLY: "daily", RWY: "runway", HEL: "helicopter",
  ACT: "active", FREQ: "frequency", FRQ: "frequency", CTL: "control", REQ: "request", APV: "approved",
  ASSOC: "associated", PSN: "position", ENTR: "entering", AVBL: "available", ASAP: "as soon as possible",
  NML: "normal", EMERG: "emergency", EMGERGENCY: "emergency", TRNG: "training", INFO: "information",
  OPN: "operation", ACTVT: "activated", WEF: "with effect from", TIL: "until", SVC: "service",
};
const KEEP = new Set([
  "FAA", "ATC", "UAS", "VIP", "DOD", "DHS", "DOJ", "TSA", "USSS", "MSL", "AGL", "NM", "VFR", "IFR", "TFR",
  "DEN", "SOSC", "SGI", "FDC", "NOTAM", "US", "USA", "FRZ", "SFRA", "ADIZ", "VOR", "DME", "VORTAC", "IAW", "CFR",
]);

export function plainNotam(s: string): string {
  const words = s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(\d+)NM\b/g, "$1 NM")
    .replace(/\(S\)/g, "(s)")
    .replace(/\bOPR WHO\b/g, "OPRS WHO")
    .replace(/HTTPS?:\/\/\S+/gi, (u) => u.toLowerCase())
    .replace(/\b[A-Z][A-Z]+\b/g, (w) => {
      if (KEEP.has(w)) return w;
      return ABBR[w] ?? w.toLowerCase();
    });
  // Sentence case: capital after a sentence break and at "A." style list markers.
  return words.replace(/(^|[.:]\s+|^[A-Z]\.\s+)([a-z])/g, (_, a, b) => a + b.toUpperCase());
}

export const TFR_TYPE: Record<string, string> = {
  "91.137": "Disaster or hazard area",
  "91.138": "Disaster area (Hawaii)",
  "91.139": "Emergency air traffic rules",
  "91.141": "VIP movement",
  "91.143": "Space launch or reentry",
  "91.144": "Abnormally high pressure",
  "91.145": "Air show or major sporting event",
  "99.7": "Special security instructions",
};

/** Does this NOTAM text bar drones? Matches the phrasings the FAA actually uses. */
export function bansDrones(instructions: string[]): boolean {
  const all = instructions.join(" ");
  return (
    /(MODEL ACFT|UAS|UNMANNED)[^.]*(NOT AUTH|PROHIBITED)/.test(all) ||
    /(NOT AUTH|PROHIBITED)[^.]*(MODEL ACFT|UAS|UNMANNED)/.test(all) ||
    /ALL ACFT OPS[^.]*PROHIBITED/.test(all)
  );
}
