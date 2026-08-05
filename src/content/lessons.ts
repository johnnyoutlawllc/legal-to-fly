/** Ground school lessons. Generated from the project's training notes;
 *  edit the source markdown and regenerate rather than editing bodies here.
 *  Bodies are constrained markdown rendered by components/Lesson.tsx. */

export type Lesson = {
  slug: string;
  title: string;
  area: string;
  order: number;
  minutes: number;
  acs: string[];
  cites: string[];
  body: string;
};

export const LESSONS: Lesson[] = [
  {
    slug: "airspace",
    title: "The National Airspace System",
    area: "II",
    order: 1,
    minutes: 3,
    acs: ["UA.II.A"],
    cites: ["14 CFR 107.41"],
    body: `Six letters, one picture. Controlled airspace is A, B, C, D, E. Uncontrolled is
G. There is no Class F in the United States. "Controlled" means ATC is providing
separation services there - and for a drone it means **you need FAA authorization
before flying in it** (B, C, D, and Class E designated to the surface for an
airport - that's the §107.41 list).

## AGL vs MSL first

- **AGL** = above ground level: height above the dirt under you.
- **MSL** = mean sea level: height above the average ocean surface - a constant
  reference that doesn't care about terrain.
- Sectional charts use both. Class B/C/D altitudes chart in MSL; the Class E
  floors (700/1,200) are AGL; your 400-ft drone ceiling is AGL.

## The classes

**Class A - "Above all."** 18,000 to 60,000 ft MSL. IFR only, airliner
territory. Irrelevant to drones except as the top of Class E: E runs up to but
not including 18,000 (17,999).

**Class B - "Biggest/Busiest."** The nation's busiest airports (ATL, DFW, LAX,
JFK, ORD, DEN). Upside-down wedding cake, usually 2–5 shelves, typically topping
around 10,000 MSL. Solid blue lines. Always towered. Drones need authorization - and the surface core is generally a no-go without a specific reason.

**Class C.** Moderately busy airports with towers, radar approach control, and
airline service. Two-tier cake: inner core typically surface to ~4,000 MSL,
outer shelf floor typically 1,300–2,100 MSL. Solid magenta lines. Authorization
required.

**Class D.** Smaller towered airports. Surface to typically 2,500 ft **above
the field** (charted as an MSL number in the dashed-blue box). Dashed blue
lines. Authorization required. When the tower is part-time and closed, the
airspace usually reverts to E or G - the chart note "See NOTAMs/Directory for
Class D/E eff hrs" tells you where to check.

**Class E.** Everything controlled that isn't A/B/C/D. Where it *starts* is the
whole game:
- at **700 ft AGL** inside a faded magenta vignette,
- at **1,200 ft AGL** in most other places (with or without a faded blue ring),
- at a **specific MSL altitude** where a blue zipper line says so,
- at the **surface** where a dashed magenta line encircles an airport - and
  only this surface-designated E is in §107.41's authorization list.
Class E at altitude above you is legal drone airspace (your 400-ft world
usually sits under it anyway - but the 400-over-structure rule can carry you
into it legally).

**Class G.** Uncontrolled, surface up to the overlying E floor (1,199 AGL at
most). Where most drone flying happens. No authorization needed - but every
Part 107 operating rule still applies: 400 AGL, VLOS, visibility, cloud
clearances.

## Authorization mechanics

- **LAANC** (Low Altitude Authorization and Notification Capability): near
  real-time authorization through FAA-approved apps. The controlled airspace
  around an airport is divided into grid squares, each with a pre-approved
  maximum altitude; request at or below it and approval is near-instant.
  Launched October 2017; before that, manual applications took weeks.
- Where LAANC isn't available: manual request through **FAA DroneZone**.
- When FAA materials say "ATC authorization," for a drone that means **FAA
  authorization via LAANC/DroneZone** - you do not call the tower.

## Reading it on the chart

Covered in depth in the sectional-charts lesson, but the pairing to memorize:

| Class | Line on chart |
|-------|---------------|
| B | Solid blue |
| C | Solid magenta |
| D | Dashed blue |
| E to surface | Dashed magenta |
| E at 700 AGL | Faded magenta vignette |
| E at 1,200 AGL | Faded blue vignette, or nothing at all |
| G | Whatever's under the E floor |

The trap: **no ring doesn't mean no airspace.** An unmarked airport sits in
Class G with Class E starting at 1,200 AGL. Airspace exists everywhere; the
chart only draws the boundaries that differ from the default.

## Phonetic alphabet

Worth memorizing - the exam and every frequency you'll listen to use it:
Alfa Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliett Kilo Lima Mike
November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray
Yankee Zulu.
`,
  },
  {
    slug: "sectional-charts",
    title: "Reading the Sectional Chart",
    area: "II",
    order: 2,
    minutes: 10,
    acs: ["UA.II.A","UA.II.B"],
    cites: ["14 CFR 107.41","14 CFR 107.51","FAA-CT-8080-2H"],
    body: `A sectional chart is the legal map of low-altitude flying: where the airspace
boundaries sit, where the airports are, what sticks up out of the ground, and
where manned traffic concentrates. Learn to read it and "can I fly here?"
becomes a question you answer in seconds. The exam hands you excerpts from the Airman Knowledge
Testing Supplement (FAA-CT-8080-2H) and expects you to read them. Roughly a fifth
of the exam touches this skill. The chart legend is printed in the front of the
supplement and you may use it during the test - but you won't have time to look
everything up, so learn the symbols.

Scale: 1:500,000. One inch is about 6.9 nautical miles.

## Airports: color and shape

- **Blue airport symbol = the airport has a control tower.** Magenta = no tower.
- **Blue does NOT mean Class B airspace.** The color of the airport symbol is
  about the tower, not the airspace class. A blue (towered) airport can sit inside
  Class C or D. This trap is staged on the exam.
- **Runway-shaped outline** as the airport icon = the airport has a runway longer
  than 8,069 ft. **Circle with runway marks inside** = runways between 1,500 and
  8,069 ft. **Plain circle (no runway marks)** = soft-surface strips (grass,
  gravel, dirt). You will essentially never see a *blue* plain circle - towered
  airports have paved runways.
- **Star on top of the symbol** = rotating beacon, operating sunset to sunrise.
- **Tick marks around the symbol** = fuel services available and the field is
  attended during normal working hours. What kind of fuel is in the Chart
  Supplement, not on the chart.
- **Small open dot on the field** = a VOR navigation station is on the airport.
  A big tick-marked circle around it is the VOR **compass rose**, which reads in
  **magnetic** degrees.
- **H in a circle** = heliport. **Anchor** = seaplane base. **X on the field** =
  closed/abandoned airport (still charted so pilots know it's closed; landing
  there without a real emergency is a §91.13 careless-operation problem).
- **R in a magenta circle** = restricted (private) airport - permission required.
  Absence of the R does not make a private strip public.
- **U in a circle** = unverified airport (FAA can't confirm current status).
- **Magenta flag** = VFR checkpoint. This is the answer to "why does a remote
  pilot care about this flag": **manned traffic concentrates there**, because
  pilots and ATC use it as a visual reporting point.

## The airport data block

The text next to the airport symbol, top to bottom. Example, DFW-style:

\`\`\`
NO SVFR
DALLAS-FT WORTH INTL (DFW)
CT - 124.15 *  © 122.95
ATIS 123.775
606  L 134  122.95
RP 12R, 30R
\`\`\`

- **NO SVFR** - Special VFR clearances not allowed (busy Class B/C fields).
  Standard VFR needs 3 SM visibility; a Special VFR clearance lets manned
  aircraft in with as little as 1 SM. Not for drones; just recognize it.
- **(DFW)** - location identifier.
- **CT - 124.15** - control tower frequency, always in **MHz** (the exam offers
  wrong-unit distractors). Big airports list several.
- **star (*) after CT** - the tower is **part-time**. Hours live in the Chart
  Supplement. When the tower is closed the airspace typically reverts to Class E
  or G and pilots self-announce.
- **© (C in circle)** - **CTAF**, the Common Traffic Advisory Frequency pilots
  use to self-announce when there's no (or a closed) tower. At part-time-tower
  fields the CTAF is usually the tower frequency. The exam *will* ask you to
  find a CTAF.
- **ATIS 123.775** - continuous recorded broadcast of airport info (weather,
  runway in use). When the exam asks "what frequency for weather at this
  airport," the answer is the **ATIS/AWOS/ASOS frequency - the tower frequency
  is the distractor.**
- **606** - field elevation in feet **MSL**. Always the leftmost figure on the
  bottom line.
- **L** - runway lighting. ***L** = lighting with limitations (often
  pilot-activated: keying the mic clicks the lights on).
- **134** - length of the *longest* runway in **hundreds of feet: add two
  zeros** → 13,400 ft.
- **122.95** - UNICOM (pilot-to-pilot advisory frequency, not ATC). Usually
  122.7/122.8/122.95-family numbers.
- **RP 12R, 30R** - **right traffic pattern** for those runways only. The
  default pattern is LEFT-hand; runways not listed after RP are left-pattern.
  At the biggest airports (LAX, JFK, Dulles) runway numbers and RP notes are
  deliberately absent from the chart - ATC directs everything there.

## Airspace lines (the part that decides whether you need authorization)

- **Solid blue line** = Class B. **Solid magenta** = Class C.
- **Dashed blue** = Class D. **Dashed magenta** = Class E down to the surface.
- **Faded/shaded magenta vignette** = Class E starts at **700 ft AGL** inside
  the band. Outside it (and with no marking at all) Class E starts at
  **1,200 ft AGL**; below that floor is Class G.
- **Faded blue vignette** (rare, mostly western US) = Class E floor at 1,200 AGL
  drawn explicitly.
- **Blue "zipper" line** = Class E begins at the specific **MSL** altitude
  printed next to it (e.g. 3400 MSL). Below it, Class G runs up to that MSL
  figure - the one case where a Class G ceiling is MSL-referenced.
- **Altitude "fractions"** on B/C shelves: ceiling over floor, in hundreds of
  feet - add two zeros. \`42/21\` = 4,200 MSL ceiling, 2,100 MSL floor. \`SFC\` as
  the bottom number = the shelf starts at the surface.
- **Any number in a box is MSL. Always.** Class D ceilings print in a dashed
  box: \`[26]\` = 2,600 MSL.
- **A minus sign in the box means "up to but not including."** \`[-20]\` =
  Class D from the surface to 1,999 MSL. The minus exists because a Class B or
  C shelf sits directly on top at 2,000. \`[32]\` with no minus = ceiling exactly
  3,200 MSL, nothing pressing down on it.
- **Class C is layered like a two-tier wedding cake**: typical inner core
  surface-to-4,000 MSL, outer shelf floor ~1,300–2,100 MSL. Class B is the
  full upside-down wedding cake with 3+ shelves. Real charts use real numbers
  (Atlantic City: SFC–4,100 and 1,300–4,100) - read them, don't assume.
- **Look for hidden airspace**: dashed-blue Class D circles tucked *inside*
  magenta Class C shelves are easy to miss at supplement print size.
- **Mode C veil**: the thin ring labeled MODE C, 30 NM around Class B core
  airports - inside it, aircraft need altitude-reporting transponders. Know
  what the ring is; it isn't a drone authorization boundary.

## Special-use airspace

- **R-#### with blue perpendicular hash marks** = Restricted area (live fire,
  missile tests, etc.). If it's "hot" you stay out without permission from the
  controlling agency; if "cold" you may transit - check NOTAMs or ask ATC.
- **W-## = Warning area**: starts beyond 3 NM offshore, over international
  waters - advisory, not FAA-controlled, but the hazards are just as real.
- **MOA (magenta hash marks)** = Military Operations Area. You may fly there
  without authorization (if the underlying class permits), but treat it as hot
  and check NOTAMs. Hash-mark orientation is the tell: **perpendicular = restricted;
  slanted = MOA.**
- **VR/IR + number = Military Training Route** (fast, low military traffic).
  **Four digits = the whole route is at or below 1,500 ft AGL** (i.e., in your
  world). Three digits or fewer = it has segments above 1,500.
- **Victor airways**: faded blue lines VOR-to-VOR, labeled V12, V289... - highways in the sky, 8 NM wide (4 each side), always Class E from 1,200 AGL
  to 17,999 MSL. To you they mean: concentrated manned traffic along that line.
- **Isogonic line**: dashed magenta straight line labeled e.g. 9°W - magnetic
  variation between true and magnetic north.
- **TAC boundary**: white band labeled TAC = the edge of a more-detailed
  Terminal Area Chart. **It's a chart, not a frequency** - the exam offers
  "something you tune to" as a distractor.

## Obstacles

- Top number = height of the top in **MSL**. Parenthesized number = **AGL**.
  \`2549 (1731)\` - and note MSL − AGL = ground elevation (818 here). Anchor the
  ground elevation once and you can convert between references freely.
- **Tall skinny icon** = obstacle 1,000 ft AGL or taller. **Short icon** =
  under 1,000 AGL. **M-shaped double peak** = multiple obstacles clustered.
- **Lightning bolts** at the tip = high-intensity lighting. **UC** = under
  construction - height not verified, be suspicious.
- Guy wires: the 2,000-ft standoff from tower guy wires is **guidance, not
  regulation** - but the wires are nearly invisible, which is the actual danger.

## MEF - the big blue quadrant numbers

Each 30-minute × 30-minute lat/long quadrant carries a **Maximum Elevation
Figure**: big digit = thousands, small digit = hundreds. Big 2 small 6 = 2,600.

- It is the height of the **highest obstacle or terrain in the quadrant,** in
  **MSL** (MSL because it's constant; AGL varies with the ground).
- It is a **safety reference, not a law** - the exam likes to imply it's a
  legal minimum. It isn't.
- How it's built (and how they'll make you compute it):
  - Highest obstacle is **man-made**: obstacle MSL + 100 ft, round UP to the
    next hundred. 2,477 → 2,577 → **2,600**.
  - Highest feature is **natural terrain**: + 100 ft possible vertical error
    + 200 ft for possible unlit natural growth, round UP. 6,850 → 7,150 → **7,200**.

## Latitude and longitude

- Latitude = horizontal lines ("latitude means lateral"), degrees north/south
  of the equator (0°). Longitude = vertical meridians, degrees east/west of the
  prime meridian at Greenwich. **Latitude is always stated first.**
- **One degree = 60 minutes.** On the chart, small ticks are 1 minute, bigger
  ticks 5 and 10 minutes, and the full line halfway between degree lines is the
  **30-minute line** - count from it instead of from the degree line when the
  target is nearer to it.
- Get to the neighborhood first: find the whole-degree intersection, then count
  minutes. Counting *west* means counting in the west direction - direction of
  count is where people go wrong.
- Formats: 36°24'N (degrees-minutes), with seconds (47°34'30"N), or decimal
  (46.9°N). Decimal → minutes: multiply the fraction by 60 (0.9 × 60 = 54').
- Exam-phrasing to recognize: lat/long lines "cross the equator at right angles."

## The one skill that ties it together: max legal altitude

The classic hard question: "You're inspecting towers at [location]. Flying the
maximum allowable altitude, what airspace are you in?" The procedure:

1. Find the tallest tower in the group. Read its AGL height.
2. Max altitude = tower AGL + 400 ft, **only within a 400-ft radius of the
   structure** (§107.51's 400-over-structure allowance).
3. Compare against the airspace floors above you. **The 400-over-structure rule
   does NOT let you enter lateral B/C/D or surface-Class-E without
   authorization.** But it CAN legally carry you up through an overlying
   700/1,200-AGL Class E floor when you're operating from Class G.
4. Convert AGL ↔ MSL by adding/subtracting ground elevation when the shelf
   floors are MSL. Never bolt 400 onto an MSL number without thinking about
   what reference you're in.

Worked example (supplement Figure 25, Area 8): towers SW of Dallas Executive,
tallest 2,549 MSL / 1,731 AGL. Max altitude 1,731 + 400 = 2,131 AGL = 2,949 MSL.
Class E starts at 1,200 AGL there, Class B floor above is 3,000 MSL. Answer:
you're in **Class E**, 51 ft under the B shelf - legal, no authorization needed
at or above 400 AGL? No: legal because Class E at altitude is not one of
§107.41's restricted volumes. That distinction - E-at-altitude vs
E-designated-to-the-surface - is the sharpest trap in the whole area.

## Traps to drill

- Blue airport ≠ Class B.
- Boxed minus = up to but not including.
- Weather frequency = ATIS/AWOS/ASOS, never the tower.
- Frequencies are MHz.
- MSL vs AGL: which one did the question ask for? Both appear as choices.
- MEF is not a legal altitude.
- 400-over-structure does not defeat §107.41 airspace authorization.
- TAC is a chart, not a broadcast.
`,
  },
  {
    slug: "weather",
    title: "Weather for Remote Pilots",
    area: "III",
    order: 3,
    minutes: 5,
    acs: ["UA.III.B"],
    cites: ["14 CFR 107.51","AC 00-6B"],
    body: `Weather is the most-tested Area III material, and it's two skills: understanding
what the atmosphere is doing, and decoding the reports that describe it
(METAR/TAF - next lesson).

## Your legal minimums (memorize cold)

- **Visibility: 3 statute miles**, measured **from the control station** (where
  you're standing), not "how far you can see the drone."
- **Cloud clearance: 500 ft below, 2,000 ft horizontally** from any cloud.
- The **remote pilot in command** is responsible for checking all of it before
  flight. (Any "who is responsible" question: the RPIC.)

## What makes weather

**Uneven solar heating of the Earth's surface** is the primary cause of all
weather changes - the exam phrases it as "variation of solar heating." Warm air
rises (updrafts, thermals); cool air sinks. Rising warm air cools, its moisture
condenses: clouds.

- **Thermals** (rising columns off hot surfaces) are the primary cause of
  low-level **turbulence**. "What condition causes turbulence?" → uneven
  heating of the Earth's surface.
- **Wind** = air moving from **high pressure to low pressure**. Global winds:
  pressure differences plus the Earth's rotation.
- **Wind shear** = a sudden, drastic change in wind speed or direction over a
  small distance. It can occur **at any altitude** (that's the exam answer) but
  is most dangerous close to the ground. Microbursts - violent thunderstorm
  downdrafts - are the killer case.
- Wind and drones: control authority loss, faster battery drain (motors fight
  the wind), and the return-to-home trap: flying downwind feels easy until the
  drone can't fight its way back upwind.

## Air masses and fronts

An **air mass** is a large body of air that takes on the character of the
surface it forms over (over water: moist; over desert: hot and dry) - and it
changes character as it moves. Where two air masses meet, the boundary is a
**front**. That's the exam definition: *the boundary between two different air
masses is called a front.*

- **Cold front**: cold dense air shoves warm air up fast → cumulus buildups,
  thunderstorms, gusty winds. Cold fronts move **faster** than warm fronts.
  Hearing "cold front" in a forecast is your red flag.
- **Warm front**: warm air slides gently over cold → low stratus, steady rain,
  reduced visibility.
- **Stationary front**: neither side wins → lingering clouds and rain.
- **Occluded front**: a cold front overtakes a warm front → complex, unstable
  weather.
- **The most recognizable sign a front has passed: a rapid change in
  temperature.** Second sign: the wind shifts (direction and speed). Not
  humidity, not cloud cover - temperature.

## Stable vs unstable air

The one contrast that decodes half the questions:

| | Stable air | Unstable air |
|---|---|---|
| Motion | smooth, resists vertical movement | rising/sinking currents, turbulence |
| Clouds | stratus (layered) | cumulus (puffy, building) |
| Precipitation | steady drizzle | showery |
| **Visibility** | **POOR (haze, fog trapped)** | **GOOD** |

Stable air *feels* nicer and is smoother to fly in, but it traps haze and fog - poor visibility. Unstable air is bumpy but clear. The exam banks on you
guessing that backwards.

## Clouds

- Low clouds: surface to ~6,500 ft AGL.
- **Stratus** = gray, flat, layered; stable air; drizzle and mist; visibility
  killer; threat to VLOS and legal minimums.
- **Cumulus** = puffy, flat base, cauliflower top; fair weather in unstable
  air - unless they keep building vertically into **cumulonimbus**.

## Thunderstorms: three stages, in order

1. **Cumulus stage** - strong updrafts build the cloud. No precipitation yet
   (the updraft holds the moisture up), essentially no lightning.
2. **Mature stage - the most dangerous.** The tell: **updrafts and downdrafts
   coexist.** Precipitation begins falling (that's what marks the start of the
   stage), lightning, hail (updrafts recycling ice), microbursts, gust fronts
   spreading along the ground.
3. **Dissipating stage** - downdrafts everywhere; the cold outflow cuts off the
   warm inflow that fed the storm, and it starves.

Part 107 doesn't name a standoff distance from storms, but visibility and
cloud-clearance rules make flying near one effectively illegal as well as dumb.

## Density altitude

The concept the FAA uses to ask "do you understand performance?"

- Air density drops with **heat, altitude, and humidity** (humid air is LESS
  dense - water vapor is lighter than the O2/N2 it displaces; most people
  guess backwards).
- **Density altitude is the altitude the air "feels like."** Hot, humid, high →
  the air behaves like thinner air from a higher elevation: **high density
  altitude = thin air = less lift, less prop efficiency, more battery, worse
  performance.**
- Direction check, because it reads inverted: HIGH density altitude = BAD.
  LOW density altitude (cool, dry, low) = dense air = the drone flies great.

## Dew point, fog, and frost

- **Dew point** = the temperature at which air becomes saturated. The
  **spread** between temperature and dew point is your fog early-warning:
  27°C/17°C is comfortable; when the spread closes to near zero, expect fog,
  mist, low cloud - and the end of your legal 3 SM.
- **Temperature = dew point → 100% relative humidity → fog/cloud forms.**
- **Fog is a cloud at ground level.** Dew = condensation on surfaces; frost =
  vapor straight to ice.
- Dew/fog form best on **clear, calm nights** (ground radiates heat away
  fastest); wind and cloud cover prevent it.
- Fog and drones: visibility gone, moisture in motors and sensors, degraded
  GPS/radio. Fog = you don't fly.

## Traps to drill

- 3 SM is measured at the control station, not at the drone.
- Density altitude direction: high = bad. Humidity lowers density.
- Stable = poor visibility. Unstable = good visibility.
- Thunderstorm stage order and the mature-stage tell (updrafts + downdrafts,
  precipitation starts).
- Front passage = temperature change first, wind second.
- Wind shear: any altitude.
`,
  },
  {
    slug: "metar-taf",
    title: "Decoding METARs and TAFs",
    area: "III",
    order: 4,
    minutes: 4,
    acs: ["UA.III.A"],
    cites: ["AC 00-45H"],
    body: `Aviation weather reports look like line noise until someone shows you the
pattern; then they're free points. Two formats matter:

- **METAR** - METeorological Aerodrome **R**eport. Ends in **R = Report**:
  current, observed weather. Issued **hourly**, valid for the hour. Your
  just-before-flight check.
- **TAF** - Terminal Aerodrome **F**orecast. Ends in **F = Forecast**:
  predicted weather. Issued **four times daily at 0000Z, 0600Z, 1200Z, 1800Z**,
  valid **24–30 hours**. Your planning-tomorrow's-job check.
- **SPECI** - an unscheduled METAR, issued the moment weather changes enough
  to matter to aviation safety. Routine report on the clock, special report
  when something breaks the routine.
- **PIREP** - pilot report from the air (turbulence, icing, cloud tops).
  Background knowledge only.

Both METAR and TAF describe conditions within about **5 statute miles** of the
station. Get them at aviationweather.gov.

## Universal conventions (these ARE the exam)

- **Wind direction is where the wind is coming FROM**, in degrees **TRUE**
  north. (Runway numbers and your compass are MAGNETIC - reports are true.)
- **Speeds in knots** (KT), not mph.
- **Temperatures in Celsius.** An answer choice in Fahrenheit is automatically
  wrong.
- **All times are Zulu (UTC)**, marked Z. Zulu never changes and has no
  daylight saving. Later time groups inside a report drop the Z - they're
  still Zulu.
- **Cloud heights: add two zeros, read as AGL.** These are ground-based
  stations, so bases reference the ground, not sea level.

## METAR, field by field

\`\`\`
METAR KATL 121755Z 18015G25KT 10SM FEW020 BKN250 18/12 A2992 RMK AO2 SLP110
\`\`\`

| Token | Meaning |
|-------|---------|
| \`METAR\` | Report type (could be SPECI). |
| \`KATL\` | ICAO station. Leading **K = contiguous US** (KJFK, KLAX). |
| \`121755Z\` | 12th day of the month, 17:55 Zulu. |
| \`18015G25KT\` | Wind FROM 180° true (south) at 15 knots, **G**usting 25. |
| \`10SM\` | Visibility 10 **statute miles**. |
| \`FEW020\` | Few clouds, base 2,000 ft AGL (add two zeros). |
| \`BKN250\` | Broken layer at 25,000 ft. Multiple layers get listed low-to-high. |
| \`18/12\` | Temperature 18°C, dew point 12°C. |
| \`A2992\` | Altimeter 29.92 inches of mercury (standard sea-level pressure). |
| \`RMK ...\` | Remarks. |

Cloud coverage codes: **SKC/CLR** clear, **FEW** 1–2 oktas, **SCT** scattered
(3–4), **BKN** broken (5–7), **OVC** overcast (8). BKN and OVC are "ceilings."

Weather modifiers show up when visibility drops: \`1SM -DZ BR\` = one mile in
light drizzle and mist. **Minus = light intensity**, plus = heavy. Common codes:
RA rain, DZ drizzle, SN snow, BR mist, FG fog, TS thunderstorm, SH showers.

Remarks worth recognizing: **AO2** = automated station that can tell rain from
snow; **PK WND** = peak wind since last report; **RAB45** = rain began at :45;
**SLP** = sea-level pressure; **T-group** = temp/dew point to tenths.

**The remote-pilot payoff:** when temperature and dew point converge, the air
is saturating - fog and mist are next, and your 3 SM legal visibility is about
to disappear. \`18/17\` at dusk means don't count on flying at dawn.

## TAF, field by field

\`\`\`
TAF KJFK 121130Z 1212/1318 18012KT P6SM BKN040
     FM121600 20015G25KT
\`\`\`

| Token | Meaning |
|-------|---------|
| \`TAF\` | Report type - first token, top left. |
| \`KJFK\` | Airport the forecast covers. |
| \`121130Z\` | Issued the 12th at 11:30 Zulu. |
| \`1212/1318\` | **Valid period, DDHH/DDHH**: from the 12th at 1200Z through the 13th at 1800Z. Day and hour - not hours and minutes. |
| \`18012KT\` | Wind from 180° at 12 kt. |
| \`P6SM\` | **P = plus = greater than**: visibility better than 6 statute miles. |
| \`BKN040\` | Broken at 4,000 AGL. |
| \`FM121600\` | **FM = "from"**: from the 12th at 1600Z, conditions change to the line that follows. |

Other change markers you may see: **TEMPO** (temporary fluctuations),
**BECMG** (gradual becoming), **PROB30** (30% probability). FM is the one the
exam leans on.

## How to practice

Read the code out loud the way it's spoken: "wind from one-eight-zero at
one-five, gusting two-five." If you can say it, you can decode it - and you'll
also understand the same information when an ATIS broadcast reads it to you.
Pull real METARs from aviationweather.gov for airports near you and decode
them until it's boring.

## Traps to drill

- METAR = now, TAF = forecast (R = report, F = forecast).
- TAF issue schedule (0000/0600/1200/1800Z) and 24–30-hour validity.
- Wind FROM, degrees TRUE, knots.
- Celsius only. AGL cloud bases, add two zeros.
- P6SM = greater than 6 SM.
- Times without a Z are still Zulu.
- Validity \`1212/1318\` is day+hour on both sides.
- Temp/dew-point convergence = fog incoming = 3 SM at risk.
`,
  },
  {
    slug: "loading-performance",
    title: "Loading and Performance",
    area: "IV",
    order: 5,
    minutes: 3,
    acs: ["UA.IV.A"],
    cites: ["FAA-H-8083-25","FAA-CT-8080-2H fig. 2"],
    body: `The smallest area on the exam (7–11%) and the most math-shaped. A handful of
concepts covers every question.

## Center of gravity

The point where the aircraft's weight balances in every direction - hang it
from a string glued there and it hangs level. Set by the **manufacturer**,
normally slightly forward of the center of lift. For a drone, battery and
payload placement are what move it.

- CG too far forward = nose-heavy; too far aft = tail-heavy.
- **Loading outside the designed CG limits degrades performance**: sluggish
  handling, altered stall behavior, reduced control. That phrase - "performance
  is negatively affected" - is usually the exam answer.

## Load factor

**Load factor = the G-forces the aircraft experiences in a maneuver.** It is
not about takeoff weight or required lift - distractors will offer both.

- Straight-and-level flight = **1.0 G**.
- Any turn increases it: banking tilts the lift vector, so the wings/rotors
  must produce more total lift to hold altitude.
- The chart the exam gives you (testing supplement **Figure 2**) maps bank
  angle → load factor: 10° ≈ 1.015 (negligible), 30° ≈ 1.15, 40° ≈ 1.3,
  **60° = 2.0 - the load factor doubles at 60° of bank.** Memorize the 60°=2G
  point; read the rest off the chart.
- **Structural load = aircraft weight × load factor.** A 50-lb aircraft in a
  40° banked level turn: 50 × 1.3 = **65 lb** the structure must support.
  A 33-lb aircraft at 30°: 33 × 1.15 ≈ **38 lb**. The exam wants the closest
  answer choice, not decimal perfection - and yes, a basic calculator is
  allowed at the testing center.

## Stalls and the critical angle of attack

A stall is an aerodynamic event, not an engine event: **airflow separates from
the wing and lift collapses.**

- **Critical angle of attack** = the maximum angle between the wing's chord
  line and the relative wind before that separation happens - typically
  **17–20°**.
- **The critical angle of attack is CONSTANT for a given aircraft.** It does
  not change with airspeed, weight, or altitude. Any answer implying it varies
  is wrong. An aircraft can stall at any airspeed and any attitude - what's
  fixed is the angle.
- **Stall speed rises with weight** (a heavier aircraft needs more speed to
  make enough lift): heavier = stalls faster = worse. It also rises in a
  banked turn, because load factor raises the effective weight - that's why
  steep low turns kill.

## Density altitude (performance summary)

High density altitude - hot, high, humid - means thin air: less lift, less
prop/rotor efficiency, more battery draw, longer takeoff distances for manned
aircraft. Full treatment in the weather lesson; here it's the performance
punchline: **high density altitude = degraded performance.**

## Traps to drill

- Load factor questions with CG or gross-weight answer choices: wrong axis - the answer involving "maneuvers other than straight-and-level" is the one.
- 60° bank = 2G, exactly.
- Critical AoA never changes; exceeding it always stalls the wing - the same
  fact gets asked in both directions.
- Heavier = higher stall speed.
- Chart-reading answers are approximate - pick nearest.
`,
  },
  {
    slug: "airport-operations",
    title: "Airport Operations",
    area: "V",
    order: 6,
    minutes: 4,
    acs: ["UA.V.A","UA.V.B"],
    cites: ["AIM ch. 4","14 CFR 107.43"],
    body: `You'll never taxi an aircraft, but you share the sky with people who do - and
the exam checks that you can predict where manned traffic will be and what the
radio chatter means.

## Everything happens into the wind

Aircraft take off AND land into the wind: a headwind produces lift at lower
ground speed, so less runway is needed both ways. This single fact explains
runway choice, pattern direction, and half the radio calls you'll hear.

Vocabulary trap: **upwind and headwind are different words.** The *upwind leg*
is a position in the pattern (flown parallel to the runway in the takeoff
direction); a *headwind* is wind on the nose.

## The traffic pattern

Five legs, flown as a rectangle around the runway:

**Upwind → Crosswind → Downwind → Base → Final.**

- **Standard patterns are LEFT-hand** (all turns left - the pilot in command
  sits in the left seat, so left turns keep the runway in view out the pilot's
  window). Right patterns exist where terrain or noise demands; the sectional
  marks them **RP**.
- **Downwind leg** = parallel to the runway, opposite the landing direction.
  Exam phrasing: "flying parallel to the runway opposite the landing
  direction" → downwind.
- **Standard entry: 45° angle into the downwind leg.** That's where everyone
  expects merging traffic.
- Base = the 90° turn toward the runway, descending. Final = lined up with the
  runway, landing assured into the wind.
- The crosswind leg's quiet genius: an aircraft with engine trouble right
  after takeoff is already positioned in the pattern to circle back and land.

## Runway numbers

- A runway number is its **magnetic heading rounded to the nearest 10°, with
  the trailing zero dropped**. Runway 26 = 260° = pointing west. Add a zero to
  read it.
- Parallel runways: **L / C / R** suffixes (36L, 36C, 36R).
- Landing runway 18 = heading 180° = flying **south**.
- **The +180 trick:** "A pilot reports left downwind for runway 16 - what's
  their heading?" Downwind runs opposite the runway: 160° + 180° = **340°**.
  Any "opposite direction" question is an add-or-subtract-180 question.

## Radio and information services

- **CTAF** - Common Traffic Advisory Frequency: pilots self-announce position
  and intentions at non-towered (or closed-tower) fields. Marked © on the
  chart.
- **UNICOM** - advisory frequency run by the airport operator (fuel, services),
  usually 122.7/122.8/122.95.
- **ATIS** - continuous recorded broadcast at towered airports: weather,
  runway in use, notices. Exam cue: "continuous 24-hour broadcast to assist
  ATC" → ATIS.
- **AWOS / ASOS** - automated weather stations at smaller fields (AWOS-3's
  digit = equipment level). On a "which frequency for weather" question, the
  tower frequency is always the distractor.

## Signs and surface markings (supplement Figure 65)

The spatial order to memorize: **taxiway → hold-short line → mandatory sign →
runway.**

- **Black sign, yellow letters** = taxiway location sign - where you ARE.
- **Yellow sign, black letters** = direction/destination/exit sign - a way
  OFF. Always has an arrow.
- **Red sign, white letters** = mandatory instruction sign - STOP until ATC
  clears you. Sits at runway entrances.
- **Hold-short line** = two solid + two dashed yellow lines across the
  pavement. Approaching from the **solid side: stop, get clearance.** From the
  **dashed side (leaving the runway): cross freely.** Same logic as solid vs
  dashed lane lines on a road.
- **Runway incursion** = entering a runway/taxiway without clearance - the
  most preventable accident type at an airport.

## NOTAMs, TFRs, LAANC

- **NOTAM** - Notice to Air Missions (renamed from "Airmen"): time-sensitive
  advisories - runway closures, airspace restrictions, navaid outages, even
  bird activity. Checking them is part of a legitimate preflight. Sources:
  1-800-WX-BRIEF, 1800wxbrief.com, FAA NOTAM search.
- **TFR** - Temporary Flight Restriction: pop-up no-fly zones for VIP movement
  (Presidential TFRs), major events and stadiums, wildfires (never fly near
  firefighting aircraft), disasters. Check tfr.faa.gov. Violations bring
  certificate suspension/revocation and civil or criminal penalties.
- **LAANC** - near-real-time controlled-airspace authorization through
  FAA-approved apps (see the airspace lesson).

## Traps to drill

- Upwind leg ≠ headwind.
- Downwind heading = runway heading ± 180.
- Runway numbers are magnetic.
- RP on the chart = right pattern for the listed runways only; everything else
  defaults left.
- Hold-short lines are directional (solid side stops, dashed side doesn't).
- Weather frequency ≠ tower frequency.
- Big airports print no runway/pattern data on sectionals on purpose - ATC
  runs everything there.
`,
  },
  {
    slug: "adm-physiology",
    title: "Decision-Making, Physiology, and Emergencies",
    area: "V",
    order: 7,
    minutes: 3,
    acs: ["UA.V.C","UA.V.D","UA.V.E"],
    cites: ["14 CFR 107.21","14 CFR 107.27","FAA-H-8083-2"],
    body: `Area V's judgment material. Most of it is common sense wearing official
vocabulary - learn the vocabulary.

## ADM, CRM, SRM

- **ADM (aeronautical decision-making)** is the umbrella term: the systematic
  process of assessing risk and making safe choices. CRM and risk management
  live under it.
- **CRM (crew resource management)**: using ALL available resources - visual
  observers, crew, checklists, information sources - effectively. Applies to
  any operation with more than one person.
- **SRM (single-pilot resource management)**: the same discipline flying alone.

## The five hazardous attitudes (and antidotes)

The exam gives you a quote or scenario and asks which attitude it shows - and
sometimes asks for the FAA's antidote phrasing:

| Attitude | Sounds like | Antidote |
|----------|-------------|----------|
| Anti-authority | "Don't tell me what to do." | "Follow the rules - they're usually right." |
| Impulsivity | "Do it now!" | "Not so fast. Think first." |
| Invulnerability | "It won't happen to me." | "It could happen to me." |
| Macho | "I can handle anything." | "Taking chances is foolish." |
| Resignation | "What's the point?" | "I'm not helpless. I can make a difference." |

## Risk management

Definition: identifying, assessing, and mitigating hazards **before and during**
flight. The four-step sequence, in order:

1. **Identify** the hazard ← "What is the FIRST step?" - always this.
2. **Assess** the risk.
3. **Mitigate** (checklists, spare batteries, altitude margins, weather checks).
4. **Decide and monitor** - proceed or delay, and keep re-evaluating.

**Situational awareness**: perceiving, understanding, and anticipating
everything affecting the operation - built by experience, lost by fixation.

## Physiological factors

The RPIC must be in condition to fly; these are the testable degraders:

- **Fatigue** - slows reaction and judgment; the fix is rest, not caffeine.
- **Stress** - narrows attention, drives risky shortcuts.
- **Hyperventilation** - breathing too fast flushes **CO2** from the blood:
  dizziness, tingling, blurred vision. Remedy: **breathe into a paper bag or
  consciously slow your breathing.**
- **Hypoxia** - oxygen deficiency (altitude): confusion, dizziness,
  unconsciousness. Distinguish by cause: hyperventilation = low CO2; hypoxia =
  low O2. Symptoms overlap; the cause is the discriminator.
- **Dehydration** - headaches, dizziness, impaired concentration; worse in
  heat, worsened by caffeine.
- **Alcohol and drugs** - **8 hours bottle-to-throttle, 0.04% BAC max**, and
  the rules apply to the whole crew, VO included. Refusing a law-enforcement
  BAC test costs you the certificate. Any drug (including over-the-counter)
  that affects your faculties makes you unfit to operate.
- **Vision** - glasses/contacts are fine ("unaided vision" doesn't exclude
  them); **binoculars may only be used momentarily**, never to maintain VLOS.
  Proper traffic scanning: **short, regular eye movements in ~30° sectors,
  2–3 seconds each, overlapping ~10°** - not a continuous sweep. Fixating one
  point creates tunnel vision.

## Emergencies

- **Lost link**: know your programmed lost-link behavior before takeoff; test
  whether commands respond; use Return-to-Home deliberately.
- **Flyaway** (drone departs uncontrolled): the real work is preflight - GPS
  lock before launch, compass/IMU calibration, site survey for interference
  (metal structures, power lines, radio towers), verified RTH altitude. In the
  moment: follow your emergency procedure, attempt manual recovery, and file
  the §107.9 report if the outcome requires it.
- **Critically low battery**: fastest direct route home; land early rather
  than stretch it.
- **Sudden weather**: reduce altitude, get it down, reassess.
- The RPIC may **deviate from any Part 107 rule to the extent needed to meet
  an in-flight emergency** - and must report the deviation to the FAA if asked.

## Traps to drill

- First step of risk management = identify.
- Paper bag = hyperventilation, oxygen = hypoxia.
- Hazardous-attitude questions quote a mindset; match it, then know the
  official antidote wording.
- Binoculars: momentary only. Glasses: always fine.
- Scanning: sectors, not sweeps.
`,
  },
  {
    slug: "exam-day",
    title: "Exam Day and the Under-Taught Topics",
    area: "I",
    order: 8,
    minutes: 3,
    acs: ["UA.I.C","UA.I.E"],
    cites: ["14 CFR 107.7","14 CFR 107.39","14 CFR 107.57"],
    body: `The topics test-takers keep reporting from real exams that standard study
guides skip, plus the mechanics of the test itself.

## The mechanics

- 60 questions, three choices each (A/B/C), 2 hours, 70% to pass, $175 at a
  PSI center. Basic calculator allowed; the testing supplement (FAA-CT-8080-2H)
  with all figures and the chart legend is handed to you.
- Every candidate gets a different question form. Some forms run harder.
- FAA's study-time guidance: 15–20 hours. Don't book the test date until
  practice scores say you're ready - a deadline before competence just adds
  stress.
- Missed questions print as **ACS codes** (UA.I.B.K21b-style) on your test
  report. Match them to the ACS document to target a retake or the recurrent
  training. (LegalToFly's whole reporting model is built on these codes.)

## Test-taking tactics worth stealing

- **Reframe the question before touching the answers.** Reword the FAA's
  formal phrasing into plain language, decide what's being asked, THEN look at
  choices. On chart questions: solve first, then find your answer in the list.
- Distractor anatomy: typically one absurd choice, one plausible trap, one
  correct. The correct answer is often positioned so you read the traps first.
- When two answers both seem right, pick the *most complete/closest* one - the
  exam asks for the best answer, not a perfect one.
- Chart-figure questions eat clock. Bank the fast questions first.

## Manned-aircraft flight controls (yes, it's on the drone exam)

Three axes intersect at the center of gravity. The pairs to memorize cold:

| Surface | Motion | Axis |
|---------|--------|------|
| Ailerons (wings) | Roll | Longitudinal |
| Elevator (tail) | Pitch | Lateral |
| Rudder (tail fin) | Yaw | Vertical |

## Operations over people (§107.39 categories)

- **Category 1**: ≤ 0.55 lb (250 g), no exposed rotating parts (prop guards),
  Remote ID compliant.
- **Category 2**: < 55 lb, impact below **11 ft-lb** of kinetic energy, no
  exposed rotating parts, manufacturer Means of Compliance + Declaration of
  Compliance filed with the FAA.
- **Category 3**: same as 2 but **25 ft-lb**, with tighter operational limits
  (closed/restricted-access sites, or people under cover / not gathered).
- **Category 4**: the only category requiring an **FAA airworthiness
  certificate**. That question appears verbatim.
- **Sustained flight (hovering) over open-air assemblies** is the restricted
  concept - transit is treated differently from loitering.
- Intuition for the energy limits: 11 ft-lb is roughly a baseball arriving at
  a firm toss - it hurts, it doesn't hospitalize. 25 ft-lb is the same ball
  thrown hard. The category limits are set where impacts stop being bruises.

## Drugs, alcohol, and the FAA

- Conviction (federal OR state) for growing/possessing/selling/transporting
  marijuana or other controlled substances → certificate application **denied
  for one year from the conviction date** ("never" and "18 months" are the
  distractors).
- Operating while using marijuana → **immediate suspension/revocation** action.
- Medical marijuana: federally, marijuana is still a controlled substance, and
  the FAA recognizes **no medical exemption**. State cards don't matter to
  §107.57.

## FAA inspection

"On FAA request, the remote PIC must..." → **make the sUAS available for
inspection or testing, and produce the required documents** (certificate,
registration). "Refuse without a warrant" is the bait choice.

## Part 107 applicability sorting

- 0.5-lb toy flown for fun → recreational (49 USC 44809), not Part 107.
- 12-lb drone shooting real-estate footage for pay → **Part 107.**
- 45-lb agricultural sprayer → **Part 137** (chemical dispensing), regardless
  of weight.

## After you pass

Recurrent training every **24 calendar months** (free, online). Address change:
notify the FAA within 30 days. Keep the certificate on you when flying.
`,
  },
];

export const lessonBySlug = (slug: string) =>
  LESSONS.find((l) => l.slug === slug);

export const lessonsForArea = (area: string) =>
  LESSONS.filter((l) => l.area === area).sort((a, b) => a.order - b.order);
