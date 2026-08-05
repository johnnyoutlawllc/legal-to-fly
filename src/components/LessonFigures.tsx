import React from "react";

/** Named SVG diagrams for ground-school lessons, referenced from lesson
 *  bodies with `::fig <name> | optional caption`. Sectional-chart colors
 *  (blue/magenta) are deliberately literal, not theme tokens — they mean
 *  something on a real chart. */

const BLUE = "#5b9bd5";
const MAGENTA = "#d95fb0";
const YELLOW = "#f2d94e";
const GREEN = "#34d399";
const RED = "#f87171";
const ORANGE = "#ff6b35";
const INK = "#f5f5f5";
const MUT = "#9a9a9a";
const DIM = "#6e6e6e";
const CLOUD = "#262626";
const CLOUD_EDGE = "#4a4a4a";
const RAIN = "#6fa8dc";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function AirspaceProfile() {
  return (
    <svg viewBox="0 0 680 330" role="img" aria-label="Side view of the airspace classes" className="w-full">
      {/* Class A */}
      <rect x={8} y={10} width={664} height={38} fill="rgba(255,255,255,0.03)" />
      <text x={340} y={33} textAnchor="middle" fontSize={11} fill={MUT}>
        CLASS A · 18,000 MSL – FL600 · IFR only
      </text>
      <line x1={8} y1={48} x2={672} y2={48} stroke="#444" strokeDasharray="6 4" />
      <text x={668} y={44} textAnchor="end" fontSize={8.5} fill={DIM}>18,000 MSL</text>

      {/* Class E backdrop */}
      <rect x={8} y={48} width={664} height={244} fill="rgba(91,155,213,0.05)" />
      <text x={650} y={70} textAnchor="end" fontSize={12} fill={BLUE} opacity={0.75} fontWeight={600}>
        CLASS E
      </text>

      {/* Class B — upside-down wedding cake */}
      <rect x={40} y={100} width={180} height={64} fill="rgba(91,155,213,0.10)" stroke={BLUE} strokeWidth={1.5} />
      <rect x={70} y={164} width={120} height={64} fill="rgba(91,155,213,0.10)" stroke={BLUE} strokeWidth={1.5} />
      <rect x={100} y={228} width={60} height={64} fill="rgba(91,155,213,0.10)" stroke={BLUE} strokeWidth={1.5} />
      <text x={130} y={96} textAnchor="middle" fontSize={8.5} fill={DIM}>10,000 MSL</text>
      <text x={130} y={124} textAnchor="middle" fontSize={13} fontWeight={700} fill={BLUE}>CLASS B</text>
      <text x={130} y={140} textAnchor="middle" fontSize={8.5} fill={MUT}>solid blue</text>

      {/* Class C — two tiers */}
      <rect x={280} y={210} width={150} height={42} fill="rgba(217,95,176,0.10)" stroke={MAGENTA} strokeWidth={1.5} />
      <rect x={320} y={210} width={70} height={82} fill="rgba(217,95,176,0.10)" stroke={MAGENTA} strokeWidth={1.5} />
      <text x={355} y={206} textAnchor="middle" fontSize={8.5} fill={DIM}>4,000 MSL</text>
      <text x={355} y={232} textAnchor="middle" fontSize={12} fontWeight={700} fill={MAGENTA}>CLASS C</text>
      <text x={355} y={246} textAnchor="middle" fontSize={8.5} fill={MUT}>solid magenta</text>

      {/* Class D */}
      <rect x={470} y={240} width={70} height={52} fill="rgba(91,155,213,0.08)" stroke={BLUE} strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={505} y={258} textAnchor="middle" fontSize={11} fontWeight={700} fill={BLUE}>CLASS D</text>
      <text x={505} y={274} textAnchor="middle" fontSize={9} fill={MUT} fontFamily={MONO}>[25]</text>

      {/* E floors + Class G, right side */}
      <defs>
        <linearGradient id="ap-vg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MAGENTA} stopOpacity={0.5} />
          <stop offset="1" stopColor={MAGENTA} stopOpacity={0} />
        </linearGradient>
      </defs>
      <line x1={548} y1={234} x2={672} y2={234} stroke={BLUE} strokeDasharray="4 4" opacity={0.45} />
      <text x={610} y={229} textAnchor="middle" fontSize={8.5} fill={DIM}>1,200 AGL elsewhere</text>
      <rect x={548} y={254} width={124} height={10} fill="url(#ap-vg)" />
      <line x1={548} y1={254} x2={672} y2={254} stroke={MAGENTA} opacity={0.7} />
      <text x={610} y={249} textAnchor="middle" fontSize={8.5} fill={MUT}>E floor: 700 AGL (vignette)</text>
      <text x={614} y={286} textAnchor="middle" fontSize={10} fontWeight={700} fill={GREEN}>CLASS G</text>

      {/* 400 ft AGL line + drone */}
      <line x1={8} y1={266} x2={672} y2={266} stroke={ORANGE} strokeDasharray="3 5" opacity={0.85} />
      <text x={12} y={261} fontSize={9.5} fill={ORANGE}>400 ft AGL — your world</text>
      <g>
        <circle cx={240} cy={266} r={4} fill="none" stroke={ORANGE} strokeWidth={1.5} />
        <circle cx={260} cy={266} r={4} fill="none" stroke={ORANGE} strokeWidth={1.5} />
        <rect x={244} y={263} width={12} height={6} rx={2} fill={ORANGE} />
      </g>

      {/* Ground */}
      <rect x={8} y={292} width={664} height={30} fill="#141414" />
      <line x1={8} y1={292} x2={672} y2={292} stroke="#3a3a3a" />
      <text x={340} y={312} textAnchor="middle" fontSize={9} fill={DIM} letterSpacing={3}>GROUND</text>
    </svg>
  );
}

function ChartLines() {
  const rows: Array<{ y: number; label: string; sample: React.ReactNode }> = [
    { y: 28, label: "Class B — solid blue", sample: <line x1={20} y1={28} x2={180} y2={28} stroke={BLUE} strokeWidth={4} /> },
    { y: 60, label: "Class C — solid magenta", sample: <line x1={20} y1={60} x2={180} y2={60} stroke={MAGENTA} strokeWidth={4} /> },
    { y: 92, label: "Class D — dashed blue", sample: <line x1={20} y1={92} x2={180} y2={92} stroke={BLUE} strokeWidth={3} strokeDasharray="10 6" /> },
    { y: 124, label: "Class E to the surface — dashed magenta", sample: <line x1={20} y1={124} x2={180} y2={124} stroke={MAGENTA} strokeWidth={3} strokeDasharray="10 6" /> },
    {
      y: 156,
      label: "Class E at 700 AGL — magenta vignette (fades inward)",
      sample: (
        <g>
          <line x1={20} y1={150} x2={180} y2={150} stroke={MAGENTA} strokeWidth={2} opacity={0.8} />
          <rect x={20} y={150} width={160} height={14} fill="url(#cl-vm)" />
        </g>
      ),
    },
    {
      y: 188,
      label: "Class E at 1,200 AGL — blue vignette, or nothing at all",
      sample: (
        <g>
          <line x1={20} y1={182} x2={180} y2={182} stroke={BLUE} strokeWidth={2} opacity={0.8} />
          <rect x={20} y={182} width={160} height={14} fill="url(#cl-vb)" />
        </g>
      ),
    },
    {
      y: 220,
      label: "Class E begins at a charted MSL altitude — blue zipper",
      sample: (
        <path
          d="M20 220 H180 M26 220 V212 M50 220 V212 M74 220 V212 M98 220 V212 M122 220 V212 M146 220 V212 M170 220 V212 M38 220 V228 M62 220 V228 M86 220 V228 M110 220 V228 M134 220 V228 M158 220 V228"
          stroke={BLUE}
          strokeWidth={2}
          fill="none"
        />
      ),
    },
  ];
  return (
    <svg viewBox="0 0 640 250" role="img" aria-label="Sectional chart airspace line styles" className="w-full">
      <defs>
        <linearGradient id="cl-vm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MAGENTA} stopOpacity={0.5} />
          <stop offset="1" stopColor={MAGENTA} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="cl-vb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BLUE} stopOpacity={0.5} />
          <stop offset="1" stopColor={BLUE} stopOpacity={0} />
        </linearGradient>
      </defs>
      {rows.map((r) => (
        <g key={r.y}>
          {r.sample}
          <text x={200} y={r.y + 4} fontSize={11.5} fill="#c4c4c4">{r.label}</text>
        </g>
      ))}
    </svg>
  );
}

function MetarAnatomy() {
  const tokens: Array<{ x: number; w: number; text: string; color: string; label: string }> = [
    { x: 108, w: 36, text: "KATL", color: BLUE, label: "station — leading K = lower 48" },
    { x: 153, w: 63, text: "121755Z", color: YELLOW, label: "12th of the month, 17:55 Zulu" },
    { x: 225, w: 90, text: "18015G25KT", color: ORANGE, label: "wind FROM 180° true, 15 kt, gusting 25" },
    { x: 324, w: 36, text: "10SM", color: GREEN, label: "visibility 10 statute miles" },
    { x: 369, w: 54, text: "FEW020", color: MAGENTA, label: "few clouds, 2,000 ft AGL (add two zeros)" },
    { x: 432, w: 45, text: "18/12", color: "#6fd5cf", label: "18°C / dew point 12°C" },
    { x: 486, w: 45, text: "A2992", color: "#c9c9c9", label: "altimeter 29.92 inHg" },
  ];
  const col1 = tokens.slice(0, 4);
  const col2 = tokens.slice(4);
  return (
    <svg viewBox="0 0 640 210" role="img" aria-label="A METAR string, token by token" className="w-full">
      <text y={44} fontSize={15} fontFamily={MONO}>
        {tokens.map((t) => (
          <tspan key={t.text} x={t.x} fill={t.color} textLength={t.w} lengthAdjust="spacingAndGlyphs">
            {t.text}
          </tspan>
        ))}
      </text>
      {tokens.map((t) => (
        <rect key={t.text} x={t.x} y={52} width={t.w} height={3} fill={t.color} opacity={0.8} rx={1.5} />
      ))}
      {col1.map((t, i) => (
        <g key={t.text}>
          <rect x={44} y={86 + i * 28} width={10} height={10} rx={2} fill={t.color} />
          <text x={62} y={95 + i * 28} fontSize={11} fill="#bdbdbd">
            <tspan fontFamily={MONO} fill={t.color}>{t.text}</tspan> — {t.label}
          </text>
        </g>
      ))}
      {col2.map((t, i) => (
        <g key={t.text}>
          <rect x={356} y={86 + i * 28} width={10} height={10} rx={2} fill={t.color} />
          <text x={374} y={95 + i * 28} fontSize={11} fill="#bdbdbd">
            <tspan fontFamily={MONO} fill={t.color}>{t.text}</tspan> — {t.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TrafficPattern() {
  return (
    <svg viewBox="0 0 640 320" role="img" aria-label="Standard left-hand traffic pattern" className="w-full">
      <defs>
        <marker id="tp-a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#cfcfcf" />
        </marker>
        <marker id="tp-w" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={ORANGE} />
        </marker>
        <marker id="tp-e" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={GREEN} />
        </marker>
      </defs>

      {/* wind */}
      <line x1={40} y1={28} x2={130} y2={28} stroke={ORANGE} strokeWidth={2} markerEnd="url(#tp-w)" />
      <text x={85} y={18} textAnchor="middle" fontSize={10} fill={ORANGE} letterSpacing={2}>WIND</text>

      {/* runway */}
      <rect x={230} y={66} width={170} height={18} fill="#222" stroke="#484848" />
      <line x1={244} y1={75} x2={386} y2={75} stroke="#555" strokeWidth={2} strokeDasharray="10 8" />
      <text x={385} y={62} textAnchor="middle" fontSize={11} fill="#aaa" fontFamily={MONO}>27</text>

      {/* legs */}
      <line x1={230} y1={75} x2={115} y2={75} stroke="#cfcfcf" strokeWidth={2} markerEnd="url(#tp-a)" />
      <text x={172} y={58} textAnchor="middle" fontSize={10.5} fill={INK} letterSpacing={1.5}>UPWIND</text>
      <line x1={105} y1={78} x2={105} y2={228} stroke="#cfcfcf" strokeWidth={2} markerEnd="url(#tp-a)" />
      <text x={92} y={155} textAnchor="middle" fontSize={10.5} fill={INK} letterSpacing={1.5} transform="rotate(-90 92 155)">CROSSWIND</text>
      <line x1={108} y1={235} x2={512} y2={235} stroke="#cfcfcf" strokeWidth={2} markerEnd="url(#tp-a)" />
      <text x={312} y={258} textAnchor="middle" fontSize={10.5} fill={INK} letterSpacing={1.5}>DOWNWIND</text>
      <line x1={520} y1={232} x2={520} y2={82} stroke="#cfcfcf" strokeWidth={2} markerEnd="url(#tp-a)" />
      <text x={534} y={155} textAnchor="middle" fontSize={10.5} fill={INK} letterSpacing={1.5} transform="rotate(90 534 155)">BASE</text>
      <line x1={517} y1={75} x2={408} y2={75} stroke="#cfcfcf" strokeWidth={2} markerEnd="url(#tp-a)" />
      <text x={462} y={58} textAnchor="middle" fontSize={10.5} fill={INK} letterSpacing={1.5}>FINAL</text>

      {/* aircraft on downwind */}
      <polygon points="300,229 316,235 300,241" fill={ORANGE} />

      <text x={312} y={162} textAnchor="middle" fontSize={11} fill={DIM} letterSpacing={2}>↺ ALL TURNS LEFT</text>

      {/* 45° entry */}
      <line x1={230} y1={302} x2={302} y2={241} stroke={GREEN} strokeWidth={2} strokeDasharray="6 5" markerEnd="url(#tp-e)" />
      <text x={205} y={312} textAnchor="middle" fontSize={10} fill={GREEN}>45° entry</text>
    </svg>
  );
}

function ThunderstormStages() {
  return (
    <svg viewBox="0 0 640 260" role="img" aria-label="The three stages of a thunderstorm" className="w-full">
      <defs>
        <marker id="ts-g" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={GREEN} />
        </marker>
        <marker id="ts-r" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={RED} />
        </marker>
      </defs>
      <line x1={16} y1={204} x2={624} y2={204} stroke="#333" />

      {/* 1 cumulus */}
      <circle cx={88} cy={158} r={18} fill={CLOUD} stroke={CLOUD_EDGE} />
      <circle cx={112} cy={146} r={22} fill={CLOUD} stroke={CLOUD_EDGE} />
      <circle cx={134} cy={160} r={16} fill={CLOUD} stroke={CLOUD_EDGE} />
      <line x1={98} y1={200} x2={98} y2={172} stroke={GREEN} strokeWidth={2} markerEnd="url(#ts-g)" />
      <line x1={124} y1={200} x2={124} y2={168} stroke={GREEN} strokeWidth={2} markerEnd="url(#ts-g)" />
      <text x={110} y={228} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>1 · CUMULUS</text>
      <text x={110} y={244} textAnchor="middle" fontSize={9.5} fill={MUT}>updrafts build it — no rain yet</text>

      {/* 2 mature */}
      <ellipse cx={322} cy={82} rx={46} ry={11} fill={CLOUD} stroke={CLOUD_EDGE} />
      <circle cx={292} cy={116} r={24} fill={CLOUD} stroke={CLOUD_EDGE} />
      <circle cx={322} cy={98} r={28} fill={CLOUD} stroke={CLOUD_EDGE} />
      <circle cx={350} cy={120} r={20} fill={CLOUD} stroke={CLOUD_EDGE} />
      <line x1={300} y1={196} x2={300} y2={144} stroke={GREEN} strokeWidth={2} markerEnd="url(#ts-g)" />
      <line x1={344} y1={144} x2={344} y2={196} stroke={RED} strokeWidth={2} markerEnd="url(#ts-r)" />
      <line x1={318} y1={170} x2={312} y2={198} stroke={RAIN} strokeWidth={1.5} />
      <line x1={330} y1={170} x2={324} y2={198} stroke={RAIN} strokeWidth={1.5} />
      <path d="M362,150 L352,172 L362,172 L350,198" stroke={YELLOW} strokeWidth={2} fill="none" />
      <text x={320} y={228} textAnchor="middle" fontSize={11} fontWeight={700} fill={ORANGE}>2 · MATURE — MOST DANGEROUS</text>
      <text x={320} y={244} textAnchor="middle" fontSize={9.5} fill={MUT}>up + down drafts together, precip begins</text>

      {/* 3 dissipating */}
      <circle cx={505} cy={140} r={20} fill={CLOUD} stroke={CLOUD_EDGE} opacity={0.85} />
      <circle cx={530} cy={128} r={24} fill={CLOUD} stroke={CLOUD_EDGE} opacity={0.85} />
      <circle cx={556} cy={142} r={18} fill={CLOUD} stroke={CLOUD_EDGE} opacity={0.85} />
      <line x1={515} y1={168} x2={515} y2={200} stroke={RED} strokeWidth={2} markerEnd="url(#ts-r)" />
      <line x1={545} y1={168} x2={545} y2={200} stroke={RED} strokeWidth={2} markerEnd="url(#ts-r)" />
      <text x={530} y={228} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>3 · DISSIPATING</text>
      <text x={530} y={244} textAnchor="middle" fontSize={9.5} fill={MUT}>downdrafts everywhere — it starves</text>
    </svg>
  );
}

function Fronts() {
  const WARM = "#e07a5f";
  return (
    <svg viewBox="0 0 640 240" role="img" aria-label="Cold front vs warm front" className="w-full">
      <defs>
        <marker id="fr-g" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={GREEN} />
        </marker>
        <marker id="fr-b" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={BLUE} />
        </marker>
        <marker id="fr-w" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={WARM} />
        </marker>
      </defs>
      <line x1={320} y1={20} x2={320} y2={220} stroke="#262626" />
      <line x1={16} y1={200} x2={624} y2={200} stroke="#333" />

      {/* cold front */}
      <text x={160} y={26} textAnchor="middle" fontSize={12} fontWeight={700} fill={BLUE} letterSpacing={1}>COLD FRONT</text>
      <text x={160} y={42} textAnchor="middle" fontSize={9.5} fill={MUT}>steep and fast — cumulus, storms, gusts</text>
      <path d="M24,200 C100,192 140,160 158,90 L158,200 Z" fill="rgba(91,155,213,0.14)" />
      <path d="M24,198 C100,190 140,158 158,88" stroke={BLUE} strokeWidth={1.5} fill="none" />
      <path d="M170,196 C185,160 180,120 168,92" stroke={GREEN} strokeWidth={2} fill="none" markerEnd="url(#fr-g)" />
      <ellipse cx={208} cy={42} rx={30} ry={8} fill={CLOUD} stroke={CLOUD_EDGE} />
      <circle cx={190} cy={64} r={16} fill={CLOUD} stroke={CLOUD_EDGE} />
      <circle cx={210} cy={54} r={19} fill={CLOUD} stroke={CLOUD_EDGE} />
      <circle cx={228} cy={66} r={14} fill={CLOUD} stroke={CLOUD_EDGE} />
      <path d="M212,84 L204,102 L212,102 L202,122" stroke={YELLOW} strokeWidth={2} fill="none" />
      <line x1={232} y1={90} x2={226} y2={112} stroke={RAIN} strokeWidth={1.5} />
      <line x1={244} y1={90} x2={238} y2={112} stroke={RAIN} strokeWidth={1.5} />
      <path d="M180,194 L180,206 L192,200 Z" fill={BLUE} />
      <path d="M212,194 L212,206 L224,200 Z" fill={BLUE} />
      <path d="M244,194 L244,206 L256,200 Z" fill={BLUE} />
      <line x1={186} y1={222} x2={250} y2={222} stroke={BLUE} strokeWidth={1.5} markerEnd="url(#fr-b)" />
      <text x={258} y={226} fontSize={9.5} fill={BLUE}>moves fast</text>

      {/* warm front */}
      <text x={480} y={26} textAnchor="middle" fontSize={12} fontWeight={700} fill={WARM} letterSpacing={1}>WARM FRONT</text>
      <text x={480} y={42} textAnchor="middle" fontSize={9.5} fill={MUT}>gentle and slow — stratus, drizzle, poor vis</text>
      <path d="M356,200 C450,196 560,150 616,96 L616,200 Z" fill="rgba(224,122,95,0.12)" />
      <path d="M356,198 C450,194 560,148 616,94" stroke={WARM} strokeWidth={1.5} fill="none" />
      <ellipse cx={470} cy={150} rx={55} ry={9} fill={CLOUD} stroke={CLOUD_EDGE} />
      <ellipse cx={530} cy={124} rx={48} ry={8} fill={CLOUD} stroke={CLOUD_EDGE} />
      <ellipse cx={585} cy={100} rx={40} ry={7} fill={CLOUD} stroke={CLOUD_EDGE} />
      <line x1={440} y1={166} x2={440} y2={184} stroke={RAIN} strokeWidth={1.5} strokeDasharray="3 4" />
      <line x1={462} y1={168} x2={462} y2={186} stroke={RAIN} strokeWidth={1.5} strokeDasharray="3 4" />
      <line x1={484} y1={168} x2={484} y2={186} stroke={RAIN} strokeWidth={1.5} strokeDasharray="3 4" />
      <path d="M360,200 A7,7 0 0 1 374,200 Z" fill={WARM} />
      <path d="M392,200 A7,7 0 0 1 406,200 Z" fill={WARM} />
      <path d="M424,200 A7,7 0 0 1 438,200 Z" fill={WARM} />
      <line x1={366} y1={222} x2={406} y2={222} stroke={WARM} strokeWidth={1.5} markerEnd="url(#fr-w)" />
      <text x={414} y={226} fontSize={9.5} fill={WARM}>moves slow</text>
    </svg>
  );
}

function BankLoad() {
  // load factor = 1 / cos(bank); x = 60 + bank * 6.5, y = 220 - (LF - 1) * 85
  const pts =
    "60,220 125,218.7 190,214.6 255,206.8 320,194.1 352.5,184.8 385,172.7 417.5,156.8 450,135 482.5,103.9 515,56.5";
  const grid = [
    { g: "1.0", y: 220 },
    { g: "1.5", y: 177.5 },
    { g: "2.0", y: 135 },
    { g: "2.5", y: 92.5 },
    { g: "3.0", y: 50 },
  ];
  const xt = [
    { b: "0°", x: 60 },
    { b: "15°", x: 157.5 },
    { b: "30°", x: 255 },
    { b: "45°", x: 352.5 },
    { b: "60°", x: 450 },
    { b: "75°", x: 547.5 },
  ];
  return (
    <svg viewBox="0 0 640 268" role="img" aria-label="Load factor versus bank angle" className="w-full">
      {grid.map((r) => (
        <g key={r.g}>
          <line x1={60} y1={r.y} x2={600} y2={r.y} stroke="#242424" strokeDasharray="4 5" />
          <text x={52} y={r.y + 3.5} textAnchor="end" fontSize={10} fill={MUT}>{r.g}</text>
        </g>
      ))}
      <line x1={60} y1={220} x2={600} y2={220} stroke="#4a4a4a" />
      <line x1={60} y1={220} x2={60} y2={40} stroke="#4a4a4a" />
      {xt.map((t) => (
        <g key={t.b}>
          <line x1={t.x} y1={220} x2={t.x} y2={226} stroke="#4a4a4a" />
          <text x={t.x} y={240} textAnchor="middle" fontSize={10} fill={MUT}>{t.b}</text>
        </g>
      ))}
      <polyline points={pts} stroke={ORANGE} strokeWidth={2.5} fill="none" />
      <circle cx={255} cy={206.8} r={4} fill={BLUE} />
      <text x={255} y={194} textAnchor="middle" fontSize={9.5} fill={BLUE}>30° ≈ 1.15G</text>
      <circle cx={352.5} cy={184.8} r={4} fill={BLUE} />
      <text x={352.5} y={171} textAnchor="middle" fontSize={9.5} fill={BLUE}>45° ≈ 1.41G</text>
      <line x1={450} y1={135} x2={450} y2={220} stroke={ORANGE} strokeDasharray="4 4" opacity={0.5} />
      <line x1={60} y1={135} x2={450} y2={135} stroke={ORANGE} strokeDasharray="4 4" opacity={0.5} />
      <circle cx={450} cy={135} r={6} fill={ORANGE} />
      <text x={450} y={116} textAnchor="middle" fontSize={11} fontWeight={700} fill={ORANGE}>60° = 2G — memorize</text>
      <text x={330} y={260} textAnchor="middle" fontSize={10} fill={MUT}>bank angle</text>
      <text x={20} y={130} textAnchor="middle" fontSize={10} fill={MUT} transform="rotate(-90 20 130)">load factor (G)</text>
    </svg>
  );
}

function HoldShort() {
  return (
    <svg viewBox="0 0 640 230" role="img" aria-label="Hold-short line markings" className="w-full">
      <defs>
        <marker id="hs-r" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={RED} />
        </marker>
        <marker id="hs-g" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={GREEN} />
        </marker>
      </defs>
      <rect x={20} y={40} width={282} height={130} fill="#1b1b1b" stroke="#303030" />
      <rect x={302} y={20} width={318} height={170} fill="#141414" stroke="#303030" />
      <text x={36} y={60} fontSize={10} fill="#777" letterSpacing={2}>TAXIWAY</text>
      <text x={604} y={44} textAnchor="end" fontSize={10} fill="#777" letterSpacing={2}>RUNWAY</text>
      <line x1={34} y1={105} x2={252} y2={105} stroke={YELLOW} strokeWidth={2} opacity={0.5} />
      <line x1={320} y1={105} x2={600} y2={105} stroke="#4a4a4a" strokeWidth={3} strokeDasharray="24 16" />
      <text x={566} y={146} textAnchor="middle" fontSize={20} fontWeight={700} fill="#666" fontFamily={MONO}>27</text>

      {/* the marking: two solid, two dashed */}
      <line x1={262} y1={44} x2={262} y2={166} stroke={YELLOW} strokeWidth={5} />
      <line x1={274} y1={44} x2={274} y2={166} stroke={YELLOW} strokeWidth={5} />
      <line x1={288} y1={44} x2={288} y2={166} stroke={YELLOW} strokeWidth={5} strokeDasharray="12 9" />
      <line x1={300} y1={44} x2={300} y2={166} stroke={YELLOW} strokeWidth={5} strokeDasharray="12 9" />

      <line x1={70} y1={78} x2={240} y2={78} stroke={RED} strokeWidth={2.5} markerEnd="url(#hs-r)" />
      <text x={70} y={64} fontSize={10.5} fill={RED}>solid side first → STOP, get clearance</text>
      <line x1={430} y1={132} x2={230} y2={132} stroke={GREEN} strokeWidth={2.5} markerEnd="url(#hs-g)" />
      <text x={440} y={136} fontSize={10.5} fill={GREEN}>dashed side first → cross freely</text>

      <rect x={196} y={180} width={52} height={22} rx={3} fill="#b3261e" />
      <text x={222} y={195} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">27</text>
      <text x={258} y={195} fontSize={9.5} fill={MUT}>red sign, white letters = mandatory — hold until cleared</text>
    </svg>
  );
}

function KeCategories() {
  const cards = [
    { x: 15, cat: "CATEGORY 1", big: "0.55 lb", bigFill: INK, sub: "max takeoff weight", foot: "prop guards, Remote ID", bar: 0 },
    { x: 170, cat: "CATEGORY 2", big: "11 ft·lb", bigFill: ORANGE, sub: "max impact energy", foot: "≈ a firm-toss baseball", bar: 44 },
    { x: 325, cat: "CATEGORY 3", big: "25 ft·lb", bigFill: ORANGE, sub: "max impact energy", foot: "≈ the same ball, thrown hard", bar: 100 },
    { x: 480, cat: "CATEGORY 4", big: "A/W CERT", bigFill: INK, sub: "airworthiness certificate", foot: "the only category needing one", bar: 0 },
  ];
  return (
    <svg viewBox="0 0 640 170" role="img" aria-label="Operations over people categories" className="w-full">
      {cards.map((c) => {
        const cx = c.x + 70;
        return (
          <g key={c.cat}>
            <rect x={c.x} y={12} width={140} height={140} rx={12} fill="#161616" stroke="#2f2f2f" />
            <text x={cx} y={38} textAnchor="middle" fontSize={9.5} fill={MUT} letterSpacing={1.5}>{c.cat}</text>
            <text x={cx} y={74} textAnchor="middle" fontSize={19} fontWeight={700} fill={c.bigFill}>{c.big}</text>
            <text x={cx} y={92} textAnchor="middle" fontSize={9} fill={MUT}>{c.sub}</text>
            {c.bar > 0 && (
              <g>
                <rect x={cx - 50} y={104} width={100} height={7} rx={3.5} fill="#262626" />
                <rect x={cx - 50} y={104} width={c.bar} height={7} rx={3.5} fill={c.bar > 50 ? YELLOW : GREEN} />
              </g>
            )}
            <text x={cx} y={134} textAnchor="middle" fontSize={8.5} fill="#8a8a8a">{c.foot}</text>
          </g>
        );
      })}
    </svg>
  );
}

const REGISTRY: Record<string, React.ReactNode> = {
  "airspace-profile": <AirspaceProfile />,
  "chart-lines": <ChartLines />,
  "metar-anatomy": <MetarAnatomy />,
  "traffic-pattern": <TrafficPattern />,
  "thunderstorm-stages": <ThunderstormStages />,
  fronts: <Fronts />,
  "bank-load": <BankLoad />,
  "hold-short": <HoldShort />,
  "ke-categories": <KeCategories />,
};

export default function LessonFigure({ name, caption }: { name: string; caption?: string }) {
  const fig = REGISTRY[name];
  if (!fig) return null;
  return (
    <figure className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      {fig}
      {caption && (
        <figcaption className="mt-3 text-center text-xs leading-5 text-[var(--muted)]">{caption}</figcaption>
      )}
    </figure>
  );
}
