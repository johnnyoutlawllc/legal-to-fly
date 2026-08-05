/** Instructor roster for Tutor-style learning. Johnny Outlaw is a character,
 *  not the site owner. Canonical facts never change; voice and grammar do. */

export type InstructorId = "commander" | "outlaw" | "ace" | "uncle" | "cat";

export type Instructor = {
  id: InstructorId;
  name: string;
  tagline: string;
  blurb: string;
  /** Accent used on the picker card and guide ring */
  accent: string;
};

export const INSTRUCTORS: Instructor[] = [
  {
    id: "commander",
    name: "Flight Commander",
    tagline: "By the book. No excuses.",
    blurb: "Strict, precise, cites the rule before the story.",
    accent: "#5b8def",
  },
  {
    id: "outlaw",
    name: "Johnny Outlaw",
    tagline: "Casual. Correct. Abides.",
    blurb: "A chill coach character who still wants you legal and paid.",
    accent: "#ff6b35",
  },
  {
    id: "ace",
    name: "Ace",
    tagline: "Hype you up. Keep you legal.",
    blurb: "Anime-style flight instructor. Stylish, not a dating sim.",
    accent: "#e879a9",
  },
  {
    id: "uncle",
    name: "Drunk Uncle",
    tagline: "Wrong often. Your job to catch him.",
    blurb: "Confident myths first. The real rule always lands before you move on.",
    accent: "#c4a35a",
  },
  {
    id: "cat",
    name: "The Cat",
    tagline: "Says nothing. Judging you.",
    blurb: "Silent mascot. Points by sitting on what matters.",
    accent: "#a3a3a3",
  },
];

export function instructorById(id: InstructorId | null): Instructor | null {
  if (!id) return null;
  return INSTRUCTORS.find((i) => i.id === id) ?? null;
}

export type HomeVoice = {
  eyebrow: string;
  headline: string;
  sub: string;
  drillCta: string;
  learnCta: string;
  pathCta: string;
  examCta: string;
  footnote: string;
};

const HOME_DEFAULT: HomeVoice = {
  eyebrow: "FAA Part 107 · Remote Pilot Certificate",
  headline: "You already know how to fly. Now make it official.",
  sub: "The Part 107 test is the only thing between your drone and getting paid to fly it. We turned studying for it into a game: five areas to clear, progress bars that only go up, badges for the shelf, and a daily ten-question drill that does the remembering for you.",
  drillCta: "Start today's drill",
  learnCta: "Read the ground school",
  pathCta: "See your flight path",
  examCta: "Take a mock exam",
  footnote:
    "Free, no account needed. Ten questions a day is the whole strategy. The drill brings back what you miss right before you'd forget it.",
};

export const HOME_VOICE: Record<InstructorId, HomeVoice> = {
  commander: {
    eyebrow: "Part 107 · Knowledge test prep",
    headline: "Clear the certificate. Then you fly for hire.",
    sub: "Sixty questions. Seventy percent. ACS codes on every miss. You will drill daily, read the ground school, and take the mock until the report is clean. That is the mission.",
    drillCta: "Begin today's drill",
    learnCta: "Open ground school",
    pathCta: "Review flight path",
    examCta: "Sit a mock exam",
    footnote:
      "No account required. Ten questions a day. Misses return on schedule. Excuses do not.",
  },
  outlaw: {
    eyebrow: "Part 107 · Get legal, get paid",
    headline: "You can fly. Let's make the FAA cool with it.",
    sub: "The test is the gate between hobby hours and invoice hours. Five areas, a daily drill that remembers what you forget, and a mock that scores like the real UAG. The Dude studies. Then the Dude abides.",
    drillCta: "Hit today's drill",
    learnCta: "Ground school, casual",
    pathCta: "Check the flight path",
    examCta: "Mock exam time",
    footnote:
      "Free, no account. Ten a day keeps you honest. Miss something and it comes back before it leaves your head.",
  },
  ace: {
    eyebrow: "Part 107 · Let's clear this together",
    headline: "You already fly. I'll help you pass.",
    sub: "We'll knock out the five areas, keep a daily drill streak, and run mocks that look like the real test: three choices, ACS codes, receipts on every answer. Ready when you are.",
    drillCta: "Start today's drill!",
    learnCta: "Ground school with me",
    pathCta: "See your progress",
    examCta: "Try a mock exam",
    footnote:
      "Free and no account needed. Ten questions a day is enough if you actually show up.",
  },
  uncle: {
    eyebrow: "Part 107 · Or whatever, you'll be fine",
    headline: "Just wing it. (Don't. That's the joke.)",
    sub: "I'll tell you half-true hangar stories. You catch me, learn the real rule, and still clear the five areas plus the daily drill. If you believe everything I say, the FAA will have a word.",
    drillCta: "Yeah yeah, do the drill",
    learnCta: "Read the boring stuff",
    pathCta: "That progress thing",
    examCta: "Fake test, real panic",
    footnote:
      "Free. No account. Ten a day. And when I say 'just call the tower,' I am wrong. Catch me.",
  },
  cat: HOME_DEFAULT,
};

export function homeVoice(id: InstructorId | null): HomeVoice {
  if (!id) return HOME_DEFAULT;
  return HOME_VOICE[id];
}

export type FeedbackBank = { right: string[]; wrong: string[] };

export const CHECK_VOICE: Record<InstructorId, FeedbackBank> = {
  commander: {
    right: ["Affirmative.", "Correct.", "That is the regulation."],
    wrong: ["Incorrect.", "Negatory. Read the rule.", "Wrong. Try again with the citation."],
  },
  outlaw: {
    right: ["That'll work.", "Clean.", "Abides."],
    wrong: ["Nah.", "FAA would like a word.", "Hard landing. Read the why."],
  },
  ace: {
    right: ["Nice!", "You got it!", "That's the one."],
    wrong: ["Ah, not quite.", "Close. Look at the rule.", "Reset and try again."],
  },
  uncle: {
    right: ["Huh. Guess you were paying attention.", "Alright, fine.", "Lucky shot."],
    wrong: ["See? Nobody knows this stuff.", "I would've missed that too.", "Whatever, next round."],
  },
  cat: {
    right: ["…", "😺", "…"],
    wrong: ["…", "😾", "…"],
  },
};

/** Page-level tip overrides keyed loosely by path prefix. */
export function pageTips(pathname: string): { tip: string; myth?: string }[] {
  if (pathname.startsWith("/learn/") && pathname !== "/learn") {
    return [
      { tip: "Headings mark exam-sized ideas. Slow down on each one." },
      { tip: "Quick checks are practice, not graded. Tap one before you scroll past." },
      {
        tip: "When you finish, drill that area while it is fresh.",
        myth: "Eh, just mark it read and skip the questions. Reading is enough.",
      },
    ];
  }
  if (pathname.startsWith("/learn")) {
    return [
      { tip: "Lessons run in order: charts, airspace, weather, then judgment." },
      { tip: "Each lesson ends by sending you into that area's questions." },
    ];
  }
  if (pathname.startsWith("/drill")) {
    return [
      { tip: "Ten questions. Misses come back until you clear them." },
      {
        tip: "Only the first try on a card grades the schedule.",
        myth: "Spam answers until green. The app won't notice.",
      },
    ];
  }
  if (pathname.startsWith("/practice")) {
    return [
      { tip: "Immediate feedback with citation and ACS code on every answer." },
      { tip: "Use area filters when a lesson just told you what to hit." },
    ];
  }
  if (pathname.startsWith("/exam")) {
    return [
      { tip: "Sixty questions, two hours, seventy percent. No feedback until submit." },
      {
        tip: "Flag tough ones and finish the rest. Unanswered counts wrong.",
        myth: "Skip the hard ones. Blank is safer than a guess.",
      },
    ];
  }
  if (pathname.startsWith("/study")) {
    return [
      { tip: "This bank is scored by ACS area. Clear the thin spots first." },
    ];
  }
  // home
  return [
    { tip: "Pick an instructor, then start with today's drill." },
    { tip: "Your flight path only goes up. Badges unlock as you clear areas." },
    {
      tip: "The mock exam mirrors the real UAG: three choices, ACS miss list.",
      myth: "Mocks are harder than the real test, so ignore a low score.",
    },
  ];
}

export function voiceTip(
  id: InstructorId,
  tip: string,
  myth?: string
): { line: string; correcting?: string } {
  if (id === "cat") return { line: "…" };
  if (id === "uncle" && myth) {
    return { line: myth, correcting: tip };
  }
  if (id === "commander") return { line: tip };
  if (id === "outlaw") return { line: tip };
  if (id === "ace") return { line: tip };
  return { line: tip };
}
