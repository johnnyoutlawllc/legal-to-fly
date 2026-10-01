"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Airport, Overlays, WxStation } from "@/lib/flycheck/types";

/** The map card. Basemaps are the FAA's own sectional and terminal area
 *  charts plus imagery and two street styles. Overlays follow sectional
 *  conventions on purpose: Class B solid blue, C solid magenta, D dashed blue,
 *  E surface dashed magenta, the same marks the airspace lesson teaches. */

export type MapStyle = "sectional" | "terminal" | "satellite" | "dark" | "streets";
export type OverlayKey = "weather" | "grid" | "airspace" | "tfr" | "sua" | "airports";

const FAA_TILES = "https://tiles.arcgis.com/tiles/ssFJjBXIUyZDrSYZ/arcgis/rest/services";

// CARTO basemaps need a key now; without one every tile is an "API KEY
// REQUIRED" watermark. The key rides in the tile URL, so it is public by
// design (NEXT_PUBLIC_). Lock it to our domains in the CARTO dashboard.
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY;
const carto = (style: string) =>
  `https://basemaps.cartocdn.com/rastertiles/${style}/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`;

export const STYLES: Record<MapStyle, { label: string; url: string; attr: string; maxNative: number }> = {
  sectional: {
    label: "Sectional",
    url: `${FAA_TILES}/VFR_Sectional/MapServer/tile/{z}/{y}/{x}`,
    attr: "Charts: FAA Aeronautical Information Services",
    maxNative: 12,
  },
  terminal: {
    label: "Terminal",
    url: `${FAA_TILES}/VFR_Terminal/MapServer/tile/{z}/{y}/{x}`,
    attr: "Charts: FAA Aeronautical Information Services",
    maxNative: 12,
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "Imagery: Esri, Maxar, Earthstar Geographics",
    maxNative: 19,
  },
  // Without a CARTO key, fall back to Esri's keyless gray and street maps
  // rather than ship a watermark.
  dark: CARTO_KEY
    ? { label: "Dark", url: carto("dark_all"), attr: "© OpenStreetMap contributors © CARTO", maxNative: 19 }
    : {
        label: "Dark",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attr: "Esri, HERE, Garmin, © OpenStreetMap contributors",
        maxNative: 16,
      },
  streets: CARTO_KEY
    ? { label: "Streets", url: carto("voyager"), attr: "© OpenStreetMap contributors © CARTO", maxNative: 19 }
    : {
        label: "Streets",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        attr: "Esri, HERE, Garmin, © OpenStreetMap contributors",
        maxNative: 19,
      },
};

export const OVERLAYS: Record<OverlayKey, { label: string; swatch: string }> = {
  weather: { label: "Live weather", swatch: "#38bdf8" },
  grid: { label: "LAANC grid", swatch: "#22c55e" },
  airspace: { label: "Airspace", swatch: "#3b82f6" },
  tfr: { label: "TFRs", swatch: "#ef4444" },
  sua: { label: "Special use", swatch: "#a855f7" },
  airports: { label: "Airports", swatch: "#f5f5f5" },
};

/** NEXRAD base reflectivity composite from Iowa Environmental Mesonet: free,
 *  keyless, CORS-open, rebuilt every five minutes. The time bucket in the
 *  URL makes the browser pull a fresh image when the radar updates. */
const radarUrl = () =>
  `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png?t=${Math.floor(Date.now() / 300_000)}`;

const CAT_COLOR: Record<string, string> = { VFR: "#34d399", MVFR: "#60a5fa", IFR: "#f87171", LIFR: "#e879f9" };

function stationIcon(lf: typeof Leaflet, s: WxStation) {
  const c = CAT_COLOR[s.category ?? ""] ?? "#9a9a9a";
  const mph = s.windKt !== null ? Math.round(s.windKt * 1.15078) : null;
  const gust = s.gustKt ? Math.round(s.gustKt * 1.15078) : null;
  // The staff points into the wind, the way a wind barb does.
  const staff =
    s.windDir !== null && mph
      ? `<span class="fc-wx-staff" style="transform:rotate(${s.windDir}deg);height:${Math.min(30, 10 + mph)}px"></span>`
      : "";
  const label = mph === null ? "" : mph === 0 ? "calm" : `${mph}${gust ? `<em>G${gust}</em>` : ""}`;
  return lf.divIcon({
    className: "",
    html: `<div class="fc-wx" style="--c:${c}">${staff}<span class="fc-wx-dot"></span><span class="fc-wx-tag"><b>${s.id}</b>${label}</span></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const ceilingColor = (c: number) =>
  c <= 0 ? "#ef4444" : c <= 100 ? "#f97316" : c <= 200 ? "#f59e0b" : c <= 300 ? "#eab308" : "#22c55e";

function airspaceStyle(t: string): Leaflet.PathOptions {
  const blue = "#3b82f6";
  const mag = "#d946ef";
  switch (t) {
    case "CLASS_B":
      return { color: blue, weight: 2.5, fillColor: blue, fillOpacity: 0.07 };
    case "CLASS_C":
      return { color: mag, weight: 2.5, fillColor: mag, fillOpacity: 0.07 };
    case "CLASS_D":
      return { color: blue, weight: 2, dashArray: "8 6", fillColor: blue, fillOpacity: 0.05 };
    default:
      return { color: mag, weight: 2, dashArray: "8 6", fillColor: mag, fillOpacity: 0.04 };
  }
}

function suaStyle(t: string): Leaflet.PathOptions {
  const c = t === "P" || t === "R" ? "#f43f5e" : t === "MOA" ? "#a855f7" : "#0ea5e9";
  return { color: c, weight: 1.5, dashArray: "3 5", fillColor: c, fillOpacity: 0.06 };
}

interface Props {
  lat: number;
  lng: number;
  overlays: Overlays;
  airports: Airport[];
  style: MapStyle;
  visible: Record<OverlayKey, boolean>;
  onPick: (lat: number, lng: number) => void;
  /** Airport ident to light up (hovered in the list). */
  highlight?: string | null;
  onHoverAirport?: (ident: string | null) => void;
  /** Fly to a point; key changes on every request so repeats still move. */
  focus?: { lat: number; lng: number; key: number } | null;
}

export default function FlyMap({ lat, lng, overlays, airports, style, visible, onPick, highlight, onHoverAirport, focus }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const L = useRef<typeof Leaflet | null>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const base = useRef<Leaflet.TileLayer | null>(null);
  const groups = useRef<Partial<Record<OverlayKey, Leaflet.LayerGroup>>>({});
  const pin = useRef<Leaflet.Marker | null>(null);
  const pickRef = useRef(onPick);
  const hoverRef = useRef(onHoverAirport);
  const aptMarkers = useRef(new Map<string, Leaflet.Marker>());
  const radar = useRef<Leaflet.TileLayer | null>(null);
  useEffect(() => {
    pickRef.current = onPick;
    hoverRef.current = onHoverAirport;
  }, [onPick, onHoverAirport]);

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      const lf = (mod.default ?? mod) as typeof Leaflet;
      L.current = lf;
      // The wheel scrolls the page until the user clicks into the map, so a
      // long results page never gets trapped zooming the chart.
      const m = lf.map(el.current, {
        zoomControl: false,
        attributionControl: true,
        minZoom: 5,
        maxZoom: 18,
        scrollWheelZoom: false,
      });
      lf.control.zoom({ position: "bottomright" }).addTo(m);
      m.setView([lat, lng], 12);
      m.on("mouseout", () => m.scrollWheelZoom.disable());
      m.on("click", (e: Leaflet.LeafletMouseEvent) => {
        m.scrollWheelZoom.enable();
        const btn = document.createElement("button");
        btn.className = "fc-popbtn";
        btn.textContent = "Check this spot →";
        btn.onclick = () => {
          m.closePopup();
          pickRef.current(e.latlng.lat, e.latlng.lng);
        };
        const box = document.createElement("div");
        box.innerHTML = `<div class="fc-popcoord">${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}</div>`;
        box.appendChild(btn);
        lf.popup({ className: "fc-pop", closeButton: false, offset: [0, -4] }).setLatLng(e.latlng).setContent(box).openOn(m);
      });
      map.current = m;
      // Trigger the dependent effects now that the map exists.
      el.current.dispatchEvent(new Event("fc-ready"));
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Basemap, overlays and pin all redraw from props. One effect keeps the
  // ordering simple: base first, overlays above, pin on top.
  useEffect(() => {
    const draw = () => {
      const lf = L.current;
      const m = map.current;
      if (!lf || !m) return;

      const s = STYLES[style];
      if (!base.current || (base.current as unknown as { _url: string })._url !== s.url) {
        base.current?.remove();
        base.current = lf
          .tileLayer(s.url, {
            attribution: s.attr,
            maxNativeZoom: s.maxNative,
            maxZoom: 18,
            className: style === "sectional" || style === "terminal" ? "fc-chart-tiles" : "",
          })
          .addTo(m);
        base.current.bringToBack();
      }

      for (const g of Object.values(groups.current)) g?.remove();
      const gs: Partial<Record<OverlayKey, Leaflet.LayerGroup>> = {};

      gs.sua = lf.layerGroup([
        lf.geoJSON(overlays.sua, {
          style: (f) => suaStyle(String(f?.properties?.TYPE_CODE ?? "")),
          onEachFeature: (f, layer) =>
            layer.bindTooltip(`${f.properties?.NAME ?? "Special use airspace"}`, { sticky: true, className: "fc-tip" }),
          interactive: true,
        }),
      ]);
      gs.airspace = lf.layerGroup([
        lf.geoJSON(overlays.airspace, {
          style: (f) => airspaceStyle(String(f?.properties?.LOCAL_TYPE ?? "")),
          onEachFeature: (f, layer) => {
            const p = f.properties ?? {};
            const t = String(p.LOCAL_TYPE ?? "").replace("CLASS_", "Class ");
            const floor = Number(p.LOWER_VAL) ? `${Number(p.LOWER_VAL).toLocaleString()} ft` : "surface";
            layer.bindTooltip(`<b>${t}</b><br>${p.NAME ?? ""}<br>floor ${floor}`, { sticky: true, className: "fc-tip" });
          },
        }),
      ]);
      gs.grid = lf.layerGroup([
        lf.geoJSON(overlays.grid, {
          style: (f) => {
            const c = ceilingColor(Number(f?.properties?.CEILING ?? 400));
            return { color: c, weight: 0.6, fillColor: c, fillOpacity: 0.16 };
          },
          onEachFeature: (f, layer) =>
            layer.bindTooltip(
              `<b>LAANC ${f.properties?.CEILING ?? "?"} ft</b><br>${f.properties?.APT1_FAAID ?? ""}`,
              { sticky: true, className: "fc-tip" },
            ),
        }),
      ]);
      gs.tfr = lf.layerGroup([
        lf.geoJSON(overlays.tfr, {
          style: { color: "#ef4444", weight: 2, dashArray: "6 4", fillColor: "#ef4444", fillOpacity: 0.14 },
          onEachFeature: (f, layer) =>
            layer.bindTooltip(`<b>TFR</b><br>${f.properties?.TITLE ?? ""}`, { sticky: true, className: "fc-tip" }),
        }),
      ]);
      aptMarkers.current.clear();
      gs.airports = lf.layerGroup(
        airports.map((a) => {
          const mk = lf
            .marker([a.lat, a.lng], {
              icon: lf.divIcon({
                className: "",
                html: `<div class="fc-apt ${a.type === "HP" ? "fc-apt-h" : ""}">${a.type === "HP" ? "H" : a.type === "SP" ? "S" : "✈"}</div>`,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              }),
            })
            .bindTooltip(`<b>${a.ident}</b> ${a.name}<br>${a.typeLabel}${a.privateUse ? " (private)" : ""} · ${a.distanceNm} NM`, {
              className: "fc-tip",
            })
            .on("mouseover", () => hoverRef.current?.(a.ident))
            .on("mouseout", () => hoverRef.current?.(null));
          aptMarkers.current.set(a.ident, mk);
          return mk;
        }),
      );

      radar.current = lf.tileLayer(radarUrl(), {
          opacity: 0.6,
          maxNativeZoom: 12,
          maxZoom: 18,
          zIndex: 5,
          attribution: "Radar: NEXRAD via Iowa Environmental Mesonet",
        });
      gs.weather = lf.layerGroup([
        radar.current,
        ...overlays.stations.map((s) =>
          lf
            .marker([s.lat, s.lng], { icon: stationIcon(lf, s), zIndexOffset: 500 })
            .bindTooltip(
              `<b>${s.id}</b> ${s.name}<br>${s.category ?? ""}${s.wx ? ` · ${s.wx}` : ""}<br><span style="font-family:ui-monospace,monospace;font-size:11px;opacity:.75">${s.raw}</span>`,
              { className: "fc-tip", direction: "top", offset: [0, -8] },
            ),
        ),
      ]);

      (Object.keys(gs) as OverlayKey[]).forEach((k) => {
        if (visible[k]) gs[k]!.addTo(m);
      });
      groups.current = gs;

      pin.current?.remove();
      pin.current = lf
        .marker([lat, lng], {
          icon: lf.divIcon({
            className: "",
            html: '<div class="fc-pin"><span></span></div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
          interactive: false,
          zIndexOffset: 1000,
        })
        .addTo(m);
    };

    draw();
    const node = el.current;
    node?.addEventListener("fc-ready", draw);
    return () => node?.removeEventListener("fc-ready", draw);
  }, [lat, lng, overlays, airports, style, visible]);

  // Radar rebuilds every five minutes; follow it while the layer is on.
  useEffect(() => {
    if (!visible.weather) return;
    const t = setInterval(() => radar.current?.setUrl(radarUrl()), 300_000);
    return () => clearInterval(t);
  }, [visible.weather]);

  // Light up the hovered airport without redrawing anything else.
  useEffect(() => {
    for (const [id, mk] of aptMarkers.current) {
      const on = id === highlight;
      mk.getElement()?.firstElementChild?.classList.toggle("fc-apt-hl", on);
      mk.setZIndexOffset(on ? 900 : 0);
      if (on) mk.openTooltip();
      else mk.closeTooltip();
    }
  }, [highlight, airports, visible]);

  useEffect(() => {
    if (focus && map.current) map.current.flyTo([focus.lat, focus.lng], Math.max(map.current.getZoom(), 13), { duration: 0.8 });
  }, [focus]);

  // Recenter only when the point moves, so toggling layers keeps the user's zoom.
  useEffect(() => {
    const recenter = () => map.current?.setView([lat, lng], Math.max(map.current.getZoom(), 11));
    recenter();
    const node = el.current;
    node?.addEventListener("fc-ready", recenter);
    return () => node?.removeEventListener("fc-ready", recenter);
  }, [lat, lng]);

  return <div ref={el} className="h-full w-full" />;
}
