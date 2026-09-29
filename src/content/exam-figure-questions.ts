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
];

export const EXAM_CALCULATION_QUESTIONS: Question[] = [
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

function figure(number: number, label: string): Question["figure"] {
  return {
    src: `/faa-figures/figure-${number}.png`,
    label: `Figure ${number} · ${label}`,
    alt: `FAA-CT-8080-2H Figure ${number}: ${label}`,
  };
}

function question(
  number: number,
  slug: string,
  stem: string,
  options: [string, string, string],
  correct: 0 | 1 | 2,
  explanation: string,
  acs: string,
  citation: string,
  image?: Question["figure"],
): Question {
  return {
    id: `10000000-0000-4000-8000-${String(number).padStart(12, "0")}`,
    slug,
    stem,
    explanation,
    acs_element_code: acs,
    difficulty: "hard",
    citation,
    choices: choices(`challenge-${number}`, options, correct),
    ...(image ? { figure: image } : {}),
  };
}

EXAM_FIGURE_QUESTIONS.push(
  question(6, "figure-20-balloon-hazard", "Refer to FAA-CT-8080-2H, Figure 20, area 5. The caution box near Kitty Hawk warns of an unmarked tethered balloon. How high may its cable extend?", ["3,008 feet MSL", "3,008 feet AGL", "300 feet MSL"], 0, "The caution box says the balloon cable extends to 3,008 feet MSL and directs pilots to check NOTAMs.", "UA.V.B.K6a", "FAA-CT-8080-2H, Figure 20", figure(20, "Sectional chart near Elizabeth City")),
  question(7, "figure-21-garrison-elevation", "Refer to FAA-CT-8080-2H, Figure 21, area 2. What field elevation is printed for Garrison Airport?", ["1,937 feet MSL", "2,295 feet MSL", "1,937 feet AGL"], 0, "The airport data for Garrison shows 1937. Field elevations on the sectional are in feet MSL.", "UA.V.B.K6a", "FAA-CT-8080-2H, Figure 21", figure(21, "Sectional chart near Garrison")),
  question(8, "figure-22-coeur-field-elevation", "Refer to FAA-CT-8080-2H, Figure 22, area 2. What is the field elevation of Coeur d'Alene Airport?", ["2,320 feet MSL", "4,859 feet MSL", "2,320 feet AGL"], 0, "The Coeur d'Alene airport data lists 2320 for field elevation, in feet MSL.", "UA.V.B.K6a", "FAA-CT-8080-2H, Figure 22", figure(22, "Sectional chart near Coeur d'Alene")),
  question(9, "figure-59-military-training-route", "Refer to FAA-CT-8080-2H, Figure 59, area 2. What flight planning concern is raised by the gray route labeled VR1667?", ["Military aircraft may use this low-altitude training route", "The route is reserved for drones above 400 feet AGL", "It guarantees separation from military aircraft"], 0, "A VR route is a military training route. Four-digit route numbers indicate segments conducted at or below 1,500 feet AGL, so low-flying military traffic may be a hazard.", "UA.II.A.K2", "FAA-CT-8080-2H, Figure 59", figure(59, "Sectional chart with military training routes")),
  question(10, "figure-12-kjfk-wind", "Refer to FAA-CT-8080-2H, Figure 12. What wind is reported at KJFK?", ["From 180° true at 4 knots", "Toward 180° magnetic at 4 knots", "From 040° true at 18 knots"], 0, "The KJFK report contains 18004KT: wind from 180 degrees true at 4 knots.", "UA.III.A.K2", "FAA-CT-8080-2H, Figure 12", figure(12, "METAR reports")),
  question(11, "figure-12-kmdw-ceiling-visibility", "Refer to FAA-CT-8080-2H, Figure 12. What do KMDW's 1 1/2SM and OVC007 report?", ["Visibility 1.5 statute miles and overcast ceiling 700 feet AGL", "Visibility 11 miles and overcast ceiling 7,000 feet AGL", "Visibility 1.5 nautical miles and scattered clouds at 700 feet AGL"], 0, "1 1/2SM is visibility of one and a half statute miles. OVC007 means an overcast layer at 700 feet AGL, which is a ceiling.", "UA.III.A.K2", "FAA-CT-8080-2H, Figure 12", figure(12, "METAR reports")),
  question(12, "figure-12-klax-ceiling", "Refer to FAA-CT-8080-2H, Figure 12. KLAX reports SCT007 SCT250. What ceiling does that report establish?", ["No ceiling is reported by those scattered layers", "A ceiling at 700 feet AGL", "A ceiling at 25,000 feet AGL"], 0, "A ceiling is the lowest broken or overcast layer, or vertical visibility. Scattered layers do not establish a ceiling.", "UA.III.A.K2", "FAA-CT-8080-2H, Figure 12", figure(12, "METAR reports")),
);

EXAM_CALCULATION_QUESTIONS.push(
  question(14, "calc-load-factor-45", "Refer to FAA-CT-8080-2H, Figure 2. A 40-pound unmanned airplane holds altitude in a 45° bank. Approximately what load does its structure support?", ["40 pounds", "57 pounds", "80 pounds"], 1, "Figure 2 gives 1.414 G at 45 degrees. 40 × 1.414 = 56.56, or about 57 pounds.", "UA.IV.A.K1a", "FAA-CT-8080-2H, Figure 2", figure(2, "Load factor chart")),
  question(15, "calc-load-factor-60", "Refer to FAA-CT-8080-2H, Figure 2. A 25-pound unmanned airplane holds altitude in a 60° bank. Approximately what load does its structure support?", ["25 pounds", "35 pounds", "50 pounds"], 2, "Figure 2 gives a 2.0 load factor at 60 degrees. 25 × 2 = 50 pounds.", "UA.IV.A.K1a", "FAA-CT-8080-2H, Figure 2", figure(2, "Load factor chart")),
  question(16, "calc-altitude-msl-landing", "A launch site is at 920 feet MSL. A nearby charted airspace floor is 1,300 feet MSL. How high AGL could the aircraft climb before reaching that floor?", ["380 feet AGL", "920 feet AGL", "1,300 feet AGL"], 0, "Subtract launch-site elevation from the airspace floor: 1,300 − 920 = 380 feet AGL. An operational limit may require staying lower.", "UA.II.A.K1b", "FAA-CT-8080-2H, sectional-chart altitude references"),
  question(17, "calc-groundspeed-time", "Your aircraft's planned ground speed is 12 knots. How long will it take to fly 2 nautical miles one way in still conditions?", ["5 minutes", "10 minutes", "12 minutes"], 1, "12 knots is 12 nautical miles per hour, or 0.2 nautical miles per minute. Two nautical miles takes 10 minutes.", "UA.IV.A.K2", "FAA-S-ACS-10B, UA.IV.A.K2"),
  question(18, "calc-battery-reserve", "A flight battery provides 26 minutes at the planned load. The outbound leg takes 11 minutes, the return leg 10 minutes, and your plan calls for a 6-minute reserve. What should you do?", ["Fly as planned; 5 minutes remain", "Shorten the route or use a different plan", "Increase airspeed and ignore the reserve"], 1, "The mission needs 11 + 10 + 6 = 27 minutes, one minute more than the expected 26-minute endurance. Reduce the planned flight time and retain a reserve.", "UA.IV.A.K2", "FAA-S-ACS-10B, UA.IV.A.K2"),
  question(19, "calc-headwind-return", "A drone cruises at 18 knots through the air. A 6-knot headwind affects the outbound leg and becomes a tailwind on return. For a 1-nautical-mile leg each way, approximately how long is the round trip?", ["5 minutes", "7.5 minutes", "10 minutes"], 1, "Outbound ground speed is 12 knots, so 1 NM takes 5 minutes. Return ground speed is 24 knots, so 1 NM takes 2.5 minutes. Total is 7.5 minutes.", "UA.IV.A.K2", "FAA-S-ACS-10B, UA.IV.A.K2"),
);

// These are original scenario prompts aligned to the FAA ACS, rather than FAA test items.
export const EXAM_SCENARIO_QUESTIONS: Question[] = [
  question(20, "scenario-metar-min-visibility", "Your preflight METAR reports visibility of 2 statute miles at the launch site. You have no waiver. What is the Part 107 decision?", ["Launch if the visual observer can see the drone", "Delay the flight until visibility is at least 3 statute miles", "Launch below 200 feet AGL"], 1, "Part 107 requires at least 3 statute miles of flight visibility from the control station. A visual observer or lower altitude does not remove that minimum.", "UA.III.A.K2", "14 CFR 107.51(c)"),
  question(21, "scenario-chart-class-c-authorization", "Your client wants an inspection inside the lateral boundary and altitude limits of a Class C shelf. What must the remote PIC have before launching?", ["Prior ATC authorization for the operation", "A flight plan filed after takeoff", "Only permission from the property owner"], 0, "Part 107 operations in Class C airspace require prior ATC authorization. The property owner's permission does not grant airspace access.", "UA.II.A.K1b", "14 CFR 107.41"),
  question(22, "scenario-weather-trend", "The latest METAR is legal, but a nearby thunderstorm is moving toward your planned route. What is the sound preflight response?", ["Use only the last reported visibility to decide", "Assess the trend and delay or revise the flight if the storm threatens safety", "Fly quickly before the next METAR is issued"], 1, "Weather planning includes trends and hazards along the whole operation, not only whether one METAR meets minimums at one moment.", "UA.III.B.K1e", "FAA-S-ACS-10B, UA.III.B.K1e"),
  question(23, "scenario-visual-observer-traffic", "A visual observer spots a low-flying helicopter approaching the work area while the drone is airborne. What should the remote PIC do?", ["Yield right of way and move the drone clear", "Hold position because the drone is below 400 feet", "Ask the helicopter to avoid the drone"], 0, "A small UAS must yield right of way to all other aircraft and may not create a collision hazard.", "UA.I.B.K14a", "14 CFR 107.37"),
];
