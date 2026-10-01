/** Token-by-token decoding of real METARs and TAFs, the same skill the
 *  "Decoding METARs and TAFs" lesson teaches. Pilot view shows each group with
 *  its meaning underneath, so a live report doubles as a practice question. */

const WX: Record<string, string> = {
  MI: "shallow", PR: "partial", BC: "patches of", DR: "low drifting", BL: "blowing", SH: "showers of",
  TS: "thunderstorm", FZ: "freezing", DZ: "drizzle", RA: "rain", SN: "snow", SG: "snow grains",
  IC: "ice crystals", PL: "ice pellets", GR: "hail", GS: "small hail", UP: "unknown precipitation",
  BR: "mist", FG: "fog", FU: "smoke", VA: "volcanic ash", DU: "dust", SA: "sand", HZ: "haze",
  PY: "spray", PO: "dust whirls", SQ: "squalls", FC: "funnel cloud", SS: "sandstorm", DS: "duststorm",
};

const COVER: Record<string, string> = {
  SKC: "sky clear", CLR: "clear below 12,000 ft", FEW: "few clouds", SCT: "scattered clouds",
  BKN: "broken clouds (a ceiling)", OVC: "overcast (a ceiling)", VV: "sky obscured, vertical visibility",
};

export function wxPlain(code: string | null | undefined): string {
  if (!code) return "";
  return code
    .split(/\s+/)
    .map((g) => {
      let s = g;
      let out = "";
      if (s.startsWith("+")) { out += "heavy "; s = s.slice(1); }
      else if (s.startsWith("-")) { out += "light "; s = s.slice(1); }
      if (s.startsWith("VC")) { s = s.slice(2); out = `${out}nearby `; }
      const parts: string[] = [];
      for (let i = 0; i < s.length; i += 2) parts.push(WX[s.slice(i, i + 2)] ?? s.slice(i, i + 2));
      return (out + parts.join(" ")).trim();
    })
    .join(", ");
}

const z = (s: string) => `${s.slice(0, 2)}:${s.slice(2, 4)}Z`;

export interface Token {
  t: string;
  m: string;
  kind: "id" | "time" | "wind" | "vis" | "wx" | "cloud" | "temp" | "alt" | "change" | "rmk" | "other";
}

function decodeGroup(t: string, i: number, ctx: { remarks: boolean; taf: boolean }): Token {
  if (ctx.remarks) return { t, m: "", kind: "rmk" };
  if (t === "RMK") { ctx.remarks = true; return { t, m: "remarks follow (station-specific notes)", kind: "rmk" }; }
  if (t === "METAR" || t === "SPECI" || t === "TAF")
    return { t, m: t === "SPECI" ? "special report: conditions changed fast" : t === "TAF" ? "terminal aerodrome forecast" : "routine hourly observation", kind: "id" };
  if (t === "AMD") return { t, m: "amended forecast", kind: "id" };
  if (t === "AUTO") return { t, m: "fully automated, no human observer", kind: "id" };
  if (t === "COR") return { t, m: "corrected report", kind: "id" };
  if (/^[KPTC][A-Z0-9]{3}$/.test(t) && i <= 2) return { t, m: "station identifier", kind: "id" };
  let m: RegExpExecArray | null;
  if ((m = /^(\d{2})(\d{4})Z$/.exec(t))) return { t, m: `day ${Number(m[1])} at ${z(m[2])}`, kind: "time" };
  if ((m = /^(\d{2})(\d{2})\/(\d{2})(\d{2})$/.exec(t)))
    return { t, m: `valid from day ${Number(m[1])} ${m[2]}Z to day ${Number(m[3])} ${m[4]}Z`, kind: "time" };
  if ((m = /^(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT$/.exec(t))) {
    const dir = m[1] === "VRB" ? "variable direction" : `from ${Number(m[1])}° true`;
    const spd = Number(m[2]);
    if (spd === 0) return { t, m: "calm wind", kind: "wind" };
    return {
      t,
      m: `wind ${dir} at ${spd} kt (${Math.round(spd * 1.151)} mph)${m[3] ? `, gusting ${Number(m[3])} kt (${Math.round(Number(m[3]) * 1.151)} mph)` : ""}`,
      kind: "wind",
    };
  }
  if ((m = /^(\d{3})V(\d{3})$/.exec(t))) return { t, m: `direction varying ${m[1]}° to ${m[2]}°`, kind: "wind" };
  if ((m = /^WS(\d{3})\/(\d{3})(\d{2})KT$/.exec(t)))
    return { t, m: `wind shear at ${Number(m[1]) * 100} ft AGL`, kind: "wind" };
  if (t === "P6SM") return { t, m: "visibility more than 6 statute miles", kind: "vis" };
  if ((m = /^(M)?(\d+\/\d+|\d+)SM$/.exec(t))) return { t, m: `visibility ${m[1] ? "less than " : ""}${m[2]} statute miles`, kind: "vis" };
  if (/^\d$/.test(t)) return { t, m: "whole miles of a split visibility", kind: "vis" };
  if ((m = /^(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?$/.exec(t)))
    return {
      t,
      m: `${COVER[m[1]]} at ${(Number(m[2]) * 100).toLocaleString("en-US")} ft AGL${m[3] === "CB" ? ", cumulonimbus" : m[3] === "TCU" ? ", towering cumulus" : ""}`,
      kind: "cloud",
    };
  if (t === "SKC" || t === "CLR" || t === "NSC") return { t, m: COVER[t] ?? "no significant cloud", kind: "cloud" };
  if ((m = /^(M?\d{2})\/(M?\d{2})?$/.exec(t))) {
    const c = (s: string) => (s.startsWith("M") ? -Number(s.slice(1)) : Number(s));
    return { t, m: `temperature ${c(m[1])}°C${m[2] ? `, dew point ${c(m[2])}°C` : ""}`, kind: "temp" };
  }
  if ((m = /^A(\d{4})$/.exec(t))) return { t, m: `altimeter ${m[1].slice(0, 2)}.${m[1].slice(2)} inHg`, kind: "alt" };
  if ((m = /^FM(\d{2})(\d{4})$/.exec(t))) return { t, m: `from day ${Number(m[1])} at ${z(m[2])}, conditions change to`, kind: "change" };
  if (t === "TEMPO") return { t, m: "temporarily, for under an hour at a time", kind: "change" };
  if (t === "BECMG") return { t, m: "gradually becoming", kind: "change" };
  if ((m = /^PROB(\d{2})$/.exec(t))) return { t, m: `${m[1]}% chance of`, kind: "change" };
  if (/^[-+]?(VC)?([A-Z]{2})+$/.test(t) && wxPlain(t) !== t.toLowerCase()) return { t, m: wxPlain(t), kind: "wx" };
  return { t, m: "", kind: "other" };
}

export function annotate(raw: string): Token[] {
  const ctx = { remarks: false, taf: raw.startsWith("TAF") };
  return raw.trim().split(/\s+/).map((t, i) => decodeGroup(t, i, ctx));
}

export const CATEGORY: Record<string, { label: string; meaning: string; color: string }> = {
  VFR: { label: "VFR", meaning: "Ceiling above 3,000 ft and visibility over 5 miles", color: "#34d399" },
  MVFR: { label: "MVFR", meaning: "Marginal: ceiling 1,000 to 3,000 ft or visibility 3 to 5 miles", color: "#60a5fa" },
  IFR: { label: "IFR", meaning: "Ceiling 500 to 999 ft or visibility 1 to 3 miles", color: "#f87171" },
  LIFR: { label: "LIFR", meaning: "Low IFR: ceiling under 500 ft or visibility under 1 mile", color: "#e879f9" },
};

export const ktToMph = (kt: number) => Math.round(kt * 1.15078);
