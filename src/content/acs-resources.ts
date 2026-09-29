/** Snapshot of the FAA Airman Certification Standards index, checked September 29, 2026. */
export const ACS_SOURCE = "https://www.faa.gov/training_testing/testing/acs";
export const ACS_SOURCE_UPDATED = "September 16, 2026";

const base = "https://www.faa.gov/training_testing/testing/acs/";

export const ACS_GUIDES = [
  { title: "Airman Certification Standards Briefing", url: "https://www.faa.gov/sites/faa.gov/files/training_testing/testing/acs/acs_briefing.pdf" },
  { title: "Airman Certification Standards FAQ", url: "https://www.faa.gov/sites/faa.gov/files/training_testing/testing/acs/acs_faq.pdf" },
  { title: "Airman Certification Standards Information Brochure", url: "https://www.faa.gov/sites/faa.gov/files/training_testing/testing/acs/acs_brochure.pdf" },
  { title: "ACS Knowledge Test Table: Correct Allotted Times", url: `${base}acs_knowledge_test_table.pdf` },
  { title: "ACS Companion Guide for Pilots (FAA-G-ACS-2, with Changes 1 & 2)", url: `${base}acs_companion_guide_pilots.pdf` },
  { title: "Companion Guide to the Aviation Mechanic General, Airframe, and Powerplant Airman Certification Standards (FAA-G-ACS-1, with Change 1 & 2)", url: `${base}amt_acs_companion_guide.pdf` },
] as const;

export const ACS_STANDARDS = [
  { title: "FAA-S-8081-31B, Sport Pilot and Flight Instructors with a Sport Pilot Rating Practical Test Standards for Powered Parachute Category and Weight-Shift-Control Aircraft Category", file: "Sport_Pilot_CFI_Helicopter_SFC_ACS-31.pdf", published: "June 2026", change: "n/a", status: "Effective September 14, 2026" },
  { title: "Sport Pilot Airman Certification Standards for Helicopter ‒ Simplified Flight Controls (FAA-S-ACS-26)", file: "Sport_Pilot-Helicopter_SFC_ACS.pdf", published: "October 2025", change: "n/a", status: "October 22, 2025" },
  { title: "Airline Transport Pilot and Type Rating for Airplane Category (FAA-S-ACS-11A)", file: "atp_airplane_acs_11.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Commercial Pilot for Airplane Category (FAA-S-ACS-7B)", file: "commercial_airplane_acs_7.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Instrument Rating – Airplane (FAA-S-ACS-8C)", file: "instrument_rating_airplane_acs_8.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Private Pilot for Airplane Category (FAA-S-ACS-6C)", file: "private_airplane_acs_6.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Flight Instructor for Airplane Category (FAA-S-ACS-25)", file: "cfi_airplane_acs_25.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Private Pilot for Rotorcraft Category Helicopter Rating (FAA-S-ACS-15)", file: "private_helicopter_acs_15.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Commercial Pilot for Rotorcraft Category Helicopter Rating (FAA-S-ACS-16)", file: "commercial_helicopter_acs_16.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Flight Instructor for Rotorcraft Category Helicopter Rating (FAA-S-ACS-29)", file: "cfi_helicopter_acs_29.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Instrument Rating – Helicopter (FAA-S-ACS-14)", file: "instrument_helicopter_acs_14.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Airline Transport Pilot and Type Rating for Powered-Lift Category (FAA-S-ACS-17)", file: "atp_pl_acs_17.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Instrument Rating – Powered-Lift (FAA-S-ACS-3)", file: "instrument_pl_acs_3.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Commercial Pilot for Powered-Lift Category (FAA-S-ACS-2)", file: "commercial_pl_acs_2.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Private Pilot for Powered-Lift Category (FAA-S-ACS-13)", file: "private_pl_acs_13.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Flight Instructor for Powered-Lift Category (FAA-S-ACS-27)", file: "cfi_pl_acs_27.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Flight Instructor Instrument Powered-Lift (FAA-S-ACS-28)", file: "cfii_pl_acs_28.pdf", published: "April 2024", change: "n/a", status: "Effective May 31, 2024" },
  { title: "Aviation Mechanic General, Airframe, and Powerplant (FAA-S-ACS-1)", file: "Aviation_Mechanic_Certification_Standards.pdf", published: "November 2021", change: "n/a", status: "Effective September 21, 2022" },
  { title: "Commercial Pilot - Military Competence (FAA-S-ACS-12)", file: "mcn_acs.pdf", published: "August 2018", change: "n/a", status: "Effective October 15, 2018" },
  { title: "Remote Pilot - Small Unmanned Aircraft Systems (FAA-S-ACS-10B)", file: "uas_acs.pdf", published: "April 2021", change: "n/a", status: "Effective April 6, 2021" },
] as const;

export const ACS_TOP_TASKS = [
  { title: "Review airmen knowledge test questions", url: "https://faa.psiexams.com/FAA/login" },
  { title: "Review airmen practical test standards", url: "https://www.faa.gov/training_testing/testing/test_standards" },
  { title: "View knowledge test statistics", url: "https://www.faa.gov/data_research/aviation_data_statistics/test_statistics" },
  { title: "Find an FAA examiner", url: "https://designee.faa.gov/#/designeeLocator" },
] as const;

export function standardUrl(file: string) {
  return `${base}${file}`;
}
