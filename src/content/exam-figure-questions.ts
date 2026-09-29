import type { Question } from "@/lib/types";

/** Original practice prompts using FAA-CT-8080-2H reference figures. */
export const FAA_SUPPLEMENT_URL =
  "https://www.faa.gov/training_testing/testing/supplements/media/sport_rec_private_akts.pdf";

function choices(id: string, options: [string, string, string], correct: 0 | 1 | 2): Question["choices"] {
  return options.map((body, index) => ({
    id: `${id}-${index}`,
    label: "ABC"[index],
    body,
    is_correct: index === correct,
    rationale: null,
    sort_order: index,
  }));
}

export const EXAM_FIGURE_QUESTIONS: Question[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "faa-figure-2-bank-load-factor",
    stem: "Refer to FAA-CT-8080-2H, Figure 2. A 33-pound unmanned airplane holds altitude in a 30° bank. Approximately how much load must its structure support?",
    explanation: "Figure 2 gives a load factor of 1.154 at a 30° bank. Multiply 33 pounds by 1.154 to get about 38 pounds. This is a load-factor calculation, not an increase in the aircraft's actual weight.",
    acs_element_code: "UA.IV.A.K1a",
    difficulty: "hard",
    citation: "FAA-CT-8080-2H, Figure 2",
    choices: choices("fig2", ["33 pounds", "38 pounds", "47 pounds"], 1),
    figure: { src: "/faa-figures/figure-2.png", label: "Figure 2 · Load Factor Chart", alt: "FAA Figure 2 chart showing a load factor of 1.154 at a 30-degree bank" },
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "faa-figure-22-coeur-dalene-ctaf",
    stem: "Refer to FAA-CT-8080-2H, Figure 22, area 2. What CTAF frequency is printed for Coeur d'Alene Airport?",
    explanation: "Look beside the Coeur d'Alene airport symbol in area 2. Its airport data lists CTAF 122.8 MHz. The nearby 135.075 MHz number is AWOS, not CTAF.",
    acs_element_code: "UA.V.B.K6a",
    difficulty: "hard",
    citation: "FAA-CT-8080-2H, Figure 22",
    choices: choices("fig22", ["122.8 MHz", "135.075 MHz", "122.05 MHz"], 0),
    figure: { src: "/faa-figures/figure-22.png", label: "Figure 22 · Sectional Chart Excerpt", alt: "FAA Figure 22 sectional chart excerpt showing Coeur d'Alene Airport in area 2" },
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    slug: "faa-figure-23-savannah-class-c-floor",
    stem: "Refer to FAA-CT-8080-2H, Figure 23, area 3. What is the floor of the outer shelf of Savannah Class C airspace?",
    explanation: "The magenta Class C label reads 41 over 13: ceiling 4,100 feet MSL and floor 1,300 feet MSL. Airspace shelf altitudes on this chart are MSL, not AGL.",
    acs_element_code: "UA.II.A.K1b",
    difficulty: "hard",
    citation: "FAA-CT-8080-2H, Figure 23",
    choices: choices("fig23", ["1,300 feet AGL", "1,300 feet MSL", "4,100 feet MSL"], 1),
    figure: { src: "/faa-figures/figure-23.png", label: "Figure 23 · Sectional Chart Excerpt", alt: "FAA Figure 23 sectional chart excerpt showing the Savannah Class C shelves and area 3" },
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    slug: "faa-figure-26-jamestown-airspace",
    stem: "Refer to FAA-CT-8080-2H, Figure 26, area 4. You plan to inspect the tower under construction at 46.9°N, 98.6°W, near Jamestown Regional Airport. What must you obtain before a Part 107 flight?",
    explanation: "The site is in controlled airspace around Jamestown Regional Airport. A Part 107 operation there requires prior ATC authorization; proximity to the airport is not itself an authorization.",
    acs_element_code: "UA.V.B.K6a",
    difficulty: "hard",
    citation: "FAA-CT-8080-2H, Figure 26",
    choices: choices("fig26", ["Permission from the military", "ATC authorization", "Permission from the National Park Service"], 1),
    figure: { src: "/faa-figures/figure-26.png", label: "Figure 26 · Sectional Chart Excerpt", alt: "FAA Figure 26 sectional chart excerpt showing Jamestown Regional Airport in area 4" },
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    slug: "agl-to-msl-tower-ceiling-calculation",
    stem: "A launch site is 1,150 feet MSL. You plan to fly 300 feet AGL above it. Approximately what altitude MSL will the aircraft reach?",
    explanation: "Add the aircraft's height above ground to the launch-site elevation above mean sea level: 1,150 + 300 = 1,450 feet MSL.",
    acs_element_code: "UA.V.B.K6a",
    difficulty: "medium",
    citation: "FAA-CT-8080-2H, sectional-chart altitude references",
    choices: choices("altitude", ["850 feet MSL", "1,150 feet MSL", "1,450 feet MSL"], 2),
  },
];
