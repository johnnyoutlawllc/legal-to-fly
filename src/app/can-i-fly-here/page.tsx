import type { Metadata } from "next";
import { FlyCheck } from "@/components/flycheck/FlyCheck";
import { Faq, FlyFooter, FlyHeader, HowItWorks, PlacesGrid } from "@/components/flycheck/PageBits";

const TITLE = "Can I Fly My Drone Here? Free No-Fly Zone & Airspace Check";
const DESCRIPTION =
  "Enter any U.S. address or use your location to see if you can legally fly a drone there: FAA airspace and LAANC limits, no-fly zones, temporary flight restrictions, nearby airports, and the weather, in plain English. Free.";

export const metadata: Metadata = {
  title: `${TITLE} | Legal to Fly`,
  description: DESCRIPTION,
  alternates: { canonical: "/can-i-fly-here" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/can-i-fly-here", siteName: "Legal to Fly", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const FAQ = [
  {
    q: "How do I know if I can fly my drone at a specific address?",
    a: "Check three things: the airspace at ground level, whether a temporary flight restriction (TFR) covers the spot, and local land rules such as National Park Service property. This page checks all three against live FAA and Park Service data. Class G airspace needs no authorization below 400 ft; Class B, C, D and Class E surface areas near airports need FAA authorization, usually through LAANC.",
  },
  {
    q: "Where can't I fly a drone?",
    a: "Inside active temporary flight restrictions (VIP visits, wildfires, major events), prohibited areas like the airspace over the White House, National Park Service land, within 3 NM of large stadiums during major events, and in controlled airspace near airports without authorization. Many cities and parks also have their own launch and landing rules.",
  },
  {
    q: "Do I need permission to fly near an airport?",
    a: "Only if the airport sits in controlled airspace (Class B, C, D or a Class E surface area). Then you need FAA authorization, which LAANC usually grants in seconds up to the ceiling shown on the FAA's UAS Facility Map. Small airports in Class G airspace need no authorization, but you must always give way to crewed aircraft.",
  },
  {
    q: "What weather can I fly in?",
    a: "Part 107 requires at least 3 statute miles of visibility and staying 500 ft below clouds. Wind is not a legal limit, but your drone has one, so this page compares the wind with the limit you choose.",
  },
  {
    q: "Can I fly a drone at night?",
    a: "Yes. Part 107 pilots can fly at night and in twilight with anti-collision lighting visible for 3 statute miles, after passing the current knowledge test or recurrent training (14 CFR 107.29). Recreational flyers may also fly at night with lighting.",
  },
  {
    q: "Does this replace LAANC or B4UFLY?",
    a: "No. It explains what the FAA data means for a spot. If you need authorization, request it through an FAA-approved LAANC provider, and check NOTAMs before every flight. The pilot is always responsible for the flight.",
  },
];

export default function CanIFlyHerePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Can I Fly Here? by Legal to Fly",
      url: "https://legaltofly.com/can-i-fly-here",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: DESCRIPTION,
      featureList: [
        "FAA airspace class at any U.S. address",
        "LAANC ceiling from FAA UAS Facility Maps",
        "Active temporary flight restrictions with NOTAM details",
        "National Park Service no-drone land",
        "Airports and heliports within 5 NM",
        "Decoded METAR and TAF weather",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FlyHeader />
      <main className="flex-1">
        <FlyCheck />
        <div className="mx-auto max-w-6xl px-6 pb-16">
          <PlacesGrid />
          <div className="mt-12">
            <Faq items={FAQ} />
          </div>
          <HowItWorks />
        </div>
      </main>
      <FlyFooter />
    </div>
  );
}
