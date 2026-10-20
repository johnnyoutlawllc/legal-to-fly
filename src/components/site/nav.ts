/** Every study surface, in one place, so the header menu, the footer and the
 *  home page's tool grid cannot drift apart. */
export type NavItem = { href: string; label: string; blurb: string };

export const STUDY: NavItem[] = [
  { href: "/drill", label: "Daily drill", blurb: "Ten questions a day, spaced repetition, streaks" },
  { href: "/practice", label: "Practice questions", blurb: "Twenty at a time with instant feedback" },
  { href: "/exam", label: "Mock exam", blurb: "60 questions, 2 hours, scored like the real test" },
  { href: "/flashcards", label: "Flash cards", blurb: "Hands-free quick study with timers" },
  { href: "/faa-sample", label: "FAA Sample Questions", blurb: "The FAA's own questions with answers" },
];

export const LEARN: NavItem[] = [
  { href: "/learn", label: "Ground school", blurb: "Lessons for every area of the test" },
  { href: "/basics", label: "Part 107 basics", blurb: "The rules in one sitting" },
  { href: "/acs", label: "ACS library", blurb: "Every code the FAA tests" },
];

export const TOOLS: NavItem[] = [
  { href: "/can-i-fly-here", label: "Can I fly here?", blurb: "Airspace, TFRs and weather for any spot" },
  { href: "/results", label: "Your results", blurb: "Scores and progress over time" },
];
