"use client";

import type { InstructorId } from "@/lib/instructors";

/** Lightweight SVG mascots. CSS classes drive idle motion in globals.css. */

export default function InstructorAvatar({
  id,
  className = "h-16 w-16",
}: {
  id: InstructorId;
  className?: string;
}) {
  switch (id) {
    case "commander":
      return <Commander className={className} />;
    case "outlaw":
      return <Outlaw className={className} />;
    case "ace":
      return <Ace className={className} />;
    case "uncle":
      return <Uncle className={className} />;
    case "cat":
      return <Cat className={className} />;
  }
}

function Frame({
  className,
  children,
  bg,
}: {
  className?: string;
  children: React.ReactNode;
  bg: string;
}) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <rect width="80" height="80" rx="18" fill={bg} />
      {children}
    </svg>
  );
}

function Commander({ className }: { className?: string }) {
  return (
    <Frame className={`ltf-avatar ltf-avatar--commander ${className ?? ""}`} bg="#1a2744">
      <g className="ltf-avatar-bob">
        <ellipse cx="40" cy="48" rx="18" ry="20" fill="#3d5a80" />
        <circle cx="40" cy="28" r="14" fill="#e8c4a8" />
        <path d="M26 22h28l-2 8H28z" fill="#1b2838" />
        <rect x="30" y="14" width="20" height="6" rx="1" fill="#c9a227" />
        <circle cx="35" cy="28" r="1.5" fill="#1a1a1a" />
        <circle cx="45" cy="28" r="1.5" fill="#1a1a1a" />
        <path d="M36 34h8" stroke="#b08070" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="36" y="42" width="8" height="10" fill="#c9a227" opacity="0.9" />
      </g>
    </Frame>
  );
}

function Outlaw({ className }: { className?: string }) {
  return (
    <Frame className={`ltf-avatar ltf-avatar--outlaw ${className ?? ""}`} bg="#2a1810">
      <g className="ltf-avatar-bob">
        <ellipse cx="40" cy="52" rx="20" ry="18" fill="#ff6b35" />
        <circle cx="40" cy="30" r="15" fill="#d4a574" />
        <path d="M24 24c4-10 28-10 32 0" fill="#3d2914" />
        <path d="M22 26c2-3 6-4 8-2M50 24c2-2 6-1 8 2" fill="#3d2914" />
        <circle cx="34" cy="30" r="1.8" fill="#1a1a1a" />
        <circle cx="46" cy="30" r="1.8" fill="#1a1a1a" />
        <path
          d="M34 38c3 3 9 3 12 0"
          fill="none"
          stroke="#8b5a3c"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <text x="40" y="58" textAnchor="middle" fontSize="10" fill="#fbf7ee">
          ✈
        </text>
      </g>
    </Frame>
  );
}

function Ace({ className }: { className?: string }) {
  return (
    <Frame className={`ltf-avatar ltf-avatar--ace ${className ?? ""}`} bg="#3b1f36">
      <g className="ltf-avatar-bob">
        <ellipse cx="40" cy="54" rx="18" ry="16" fill="#5c7cfa" />
        <circle cx="40" cy="30" r="15" fill="#f0c4b0" />
        <path d="M22 28c2-16 34-16 36 0l-4 6H26z" fill="#2b2d42" />
        <path d="M28 18c4-6 20-6 24 0" fill="#e879a9" opacity="0.85" />
        <circle cx="34" cy="30" r="2" fill="#1a1a1a" />
        <circle cx="46" cy="30" r="2" fill="#1a1a1a" />
        <path d="M33 29.5h2.5M45 29.5h2.5" stroke="#fff" strokeWidth="0.8" />
        <path
          d="M35 37c2.5 2.5 7.5 2.5 10 0"
          fill="none"
          stroke="#c97b84"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="28" cy="36" r="3" fill="#f5a9b8" opacity="0.55" />
        <circle cx="52" cy="36" r="3" fill="#f5a9b8" opacity="0.55" />
      </g>
    </Frame>
  );
}

function Uncle({ className }: { className?: string }) {
  return (
    <Frame className={`ltf-avatar ltf-avatar--uncle ${className ?? ""}`} bg="#3a3020">
      <g className="ltf-avatar-sway">
        <ellipse cx="40" cy="54" rx="20" ry="16" fill="#6b8f71" />
        <circle cx="40" cy="32" r="15" fill="#e0b892" />
        <path d="M25 28c3-12 27-12 30 0" fill="#c4c4c4" />
        <circle cx="34" cy="32" r="1.6" fill="#1a1a1a" />
        <circle cx="46" cy="32" r="1.6" fill="#1a1a1a" />
        <path
          d="M34 40c4 1 8 1 12 0"
          fill="none"
          stroke="#8b5a3c"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect x="54" y="44" width="8" height="14" rx="2" fill="#daa520" className="ltf-avatar-beer" />
        <rect x="55" y="42" width="6" height="3" fill="#f5f5f5" opacity="0.5" />
      </g>
    </Frame>
  );
}

function Cat({ className }: { className?: string }) {
  return (
    <Frame className={`ltf-avatar ltf-avatar--cat ${className ?? ""}`} bg="#2a2a2a">
      <g className="ltf-avatar-cat">
        <ellipse cx="40" cy="48" rx="22" ry="16" fill="#c4c4c4" />
        <circle cx="40" cy="36" r="14" fill="#d4d4d4" />
        <path d="M28 28l-6-12 10 6M52 28l6-12-10 6" fill="#d4d4d4" />
        <circle cx="34" cy="36" r="2.2" fill="#1a1a1a" className="ltf-avatar-blink" />
        <circle cx="46" cy="36" r="2.2" fill="#1a1a1a" className="ltf-avatar-blink" />
        <path d="M40 38l-2 3h4z" fill="#e89a7a" />
        <path
          d="M30 42c3 4 17 4 20 0"
          fill="none"
          stroke="#999"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M18 50c8 8 16 4 22 0"
          fill="none"
          stroke="#b0b0b0"
          strokeWidth="5"
          strokeLinecap="round"
          className="ltf-avatar-tail"
        />
      </g>
    </Frame>
  );
}
