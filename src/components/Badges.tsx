import { BADGES, type BadgeDef, type BadgeId, type EarnedMap } from "@/lib/badges";

/** Trailhead-style badge art, house palette. One hexagon, a glyph per badge.
 *  Earned badges get the accent tile; locked ones sit dim until you win them. */

const HEX = "50 3 91 26.5 91 73.5 50 97 9 73.5 9 26.5";

function Glyph({ id }: { id: BadgeId }) {
  const stroke = { stroke: "currentColor", strokeWidth: 6, strokeLinecap: "round" as const, fill: "none" };
  switch (id) {
    case "basics": // the number itself
      return (
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="26"
          fontWeight="700"
          fill="currentColor"
          fontFamily="inherit"
        >
          107
        </text>
      );
    case "preflight": // clipboard check
      return (
        <g {...stroke}>
          <rect x="32" y="26" width="36" height="48" rx="6" />
          <path d="M42 26h16" strokeWidth="10" />
          <path d="M40 52l8 8 14 -16" />
        </g>
      );
    case "streak3":
    case "streak7":
    case "streak30": {
      const n = id === "streak3" ? "3" : id === "streak7" ? "7" : "30";
      return (
        <g>
          <path
            d="M50 22c3 10 14 14 14 27a14 14 0 1 1 -28 0c0-8 6-11 8-18 3 4 5 6 6 9"
            {...stroke}
          />
          <text
            x="50"
            y="86"
            textAnchor="middle"
            fontSize="22"
            fontWeight="700"
            fill="currentColor"
            fontFamily="inherit"
          >
            {n}
          </text>
        </g>
      );
    }
    case "area-I":
    case "area-II":
    case "area-III":
    case "area-IV":
    case "area-V":
      return (
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontSize="34"
          fontWeight="700"
          fill="currentColor"
          fontFamily="inherit"
        >
          {id.slice(5)}
        </text>
      );
    case "solo": // the drone from the mark
      return (
        <g stroke="currentColor" strokeLinecap="round" fill="none">
          <line x1="24" y1="42" x2="44" y2="42" strokeWidth="7" />
          <line x1="56" y1="42" x2="76" y2="42" strokeWidth="7" />
          <line x1="43" y1="53" x2="34" y2="44" strokeWidth="5" />
          <line x1="57" y1="53" x2="66" y2="44" strokeWidth="5" />
          <rect x="39" y="51" width="22" height="13" rx="5" fill="currentColor" stroke="none" />
        </g>
      );
    case "checkride": // shield check
      return (
        <g {...stroke}>
          <path d="M50 24l22 8v18c0 14-9 22-22 28-13-6-22-14-22-28V32z" />
          <path d="M40 51l8 8 13-15" />
        </g>
      );
    case "ace": // star
      return (
        <path
          d="M50 24l8.2 16.6 18.3 2.7-13.2 12.9 3.1 18.2L50 65.8l-16.4 8.6 3.1-18.2-13.2-12.9 18.3-2.7z"
          fill="currentColor"
        />
      );
  }
}

export function BadgeIcon({
  badge,
  earned,
  className = "h-16 w-16",
}: {
  badge: BadgeDef;
  earned: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={badge.name}>
      <polygon
        points={HEX}
        fill={earned ? "var(--accent)" : "var(--surface-2)"}
        stroke={earned ? "var(--accent)" : "var(--border)"}
        strokeWidth="3"
      />
      <g color={earned ? "#0a0a0a" : "var(--muted)"}>
        <Glyph id={badge.id} />
      </g>
    </svg>
  );
}

export function BadgeShelf({ earned }: { earned: EarnedMap }) {
  const count = BADGES.filter((b) => earned[b.id]).length;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Badges</h2>
        <span className="text-sm text-[var(--muted)]">
          {count} of {BADGES.length} earned
        </span>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {BADGES.map((b) => {
          const got = !!earned[b.id];
          return (
            <div
              key={b.id}
              title={got ? `Earned ${earned[b.id]}` : b.hint}
              className={`flex flex-col items-center rounded-xl border p-4 text-center transition-colors ${
                got
                  ? "border-[var(--accent)]/40 bg-[var(--surface)]"
                  : "border-[var(--border)] bg-[var(--surface)] opacity-70"
              }`}
            >
              <BadgeIcon badge={b} earned={got} />
              <p className="mt-3 text-sm font-medium leading-tight">{b.name}</p>
              <p className="mt-1 text-xs leading-snug text-[var(--muted)]">{b.hint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The celebration strip for session-complete screens. */
export function NewBadges({ badges }: { badges: BadgeDef[] }) {
  if (badges.length === 0) return null;
  return (
    <div className="mt-6 rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/10 p-5">
      <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
        {badges.length === 1 ? "Badge earned" : "Badges earned"}
      </p>
      <div className="mt-3 flex flex-wrap gap-5">
        {badges.map((b) => (
          <div key={b.id} className="flex items-center gap-3">
            <BadgeIcon badge={b} earned className="h-12 w-12" />
            <div>
              <p className="font-semibold leading-tight">{b.name}</p>
              <p className="text-xs text-[var(--muted)]">{b.hint}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
