/**
 * The Legal to Fly mark: a drone under the 400 ft ceiling line.
 *
 * Inline rather than an <img> so it inherits nothing and needs no request.
 * Text free on purpose — the wordmark is real HTML next to it, which keeps
 * the type in Inter and selectable. The raster and tab versions live in
 * src/app/icon.svg, favicon.ico and apple-icon.png.
 */
export function Mark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Legal to Fly"
    >
      <defs>
        <clipPath id="ltf-mark-tile">
          <rect width="100" height="100" rx="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#ltf-mark-tile)">
        <rect width="100" height="100" fill="#13314f" />
        <rect y="80" width="100" height="20" fill="#ff6b35" />
        <line x1="0" y1="80" x2="100" y2="80" stroke="#fbf7ee" strokeWidth="3" />
        <line
          x1="8"
          y1="34"
          x2="92"
          y2="34"
          stroke="#ff6b35"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="9 8"
        />
      </g>
      <g stroke="#fbf7ee" strokeLinecap="round" fill="none">
        <line x1="20" y1="51" x2="44" y2="51" strokeWidth="6" />
        <line x1="56" y1="51" x2="80" y2="51" strokeWidth="6" />
        <line x1="42" y1="62" x2="32" y2="53" strokeWidth="4.5" />
        <line x1="58" y1="62" x2="68" y2="53" strokeWidth="4.5" />
      </g>
      <rect x="38" y="60" width="24" height="13" rx="5" fill="#fbf7ee" />
    </svg>
  );
}
