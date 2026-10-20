/** Line icons, 24px grid, drawn with currentColor so they take the text colour. */
type P = { className?: string };

function Svg({ className = "h-5 w-5", children }: P & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {children}
    </svg>
  );
}

export const IconDrill = (p: P) => (
  <Svg {...p}>
    <path d="M12 3c1.5 3 4.5 4.5 4.5 8.5a4.5 4.5 0 0 1-9 0c0-2 1-3.2 2-4.2.3 1.4 1 2.2 2 2.7C11 7.5 11.2 5 12 3Z" />
    <path d="M10.5 16.5a1.5 1.5 0 0 0 3 0c0-1-.8-1.6-1.5-2.5-.7.9-1.5 1.5-1.5 2.5Z" />
  </Svg>
);

export const IconPractice = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
    <path d="m8 9 1.5 1.5L12.5 7.5M8 15.5l1.5 1.5 3-3M15 9.5h2M15 16h2" />
  </Svg>
);

export const IconExam = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="13" r="7.5" />
    <path d="M12 9v4l2.5 2M10 2.5h4M18.5 6.5l1.2-1.2" />
  </Svg>
);

export const IconCards = (p: P) => (
  <Svg {...p}>
    <rect x="7" y="6" width="13" height="14" rx="2.5" />
    <path d="M4 16.5V5.5A2.5 2.5 0 0 1 6.5 3H15" />
    <path d="M11 11.5h5M11 14.5h3" />
  </Svg>
);

export const IconFaa = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6L12 3Z" />
    <path d="m8.8 12 2.2 2.2 4.4-4.4" />
  </Svg>
);

export const IconBook = (p: P) => (
  <Svg {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5M8.5 7.5h7M8.5 11h5" />
  </Svg>
);

export const IconCode = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <path d="M7.5 9.5h2M7.5 12.5h5M7.5 15.5h3.5M14.5 9.5h2" />
  </Svg>
);

export const IconMap = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Svg>
);

export const IconChart = (p: P) => (
  <Svg {...p}>
    <path d="M4 20h16M7 16.5v-5M12 16.5V7M17 16.5v-8" />
  </Svg>
);

export const IconCite = (p: P) => (
  <Svg {...p}>
    <path d="M7 4h7l4 4v12H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
    <path d="M14 4v4h4M9.5 12.5h5M9.5 15.5h5" />
  </Svg>
);

export const IconTarget = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" />
  </Svg>
);

export const IconArrow = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export const IconChevron = ({ className = "h-3.5 w-3.5" }: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="m4 6 4 4 4-4" />
  </svg>
);
