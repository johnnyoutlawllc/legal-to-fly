import type { MetadataRoute } from "next";
import { LESSONS } from "@/content/lessons";
import { PLACES } from "@/content/places";

const BASE = "https://legaltofly.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 0.9, "weekly"],
    ["/can-i-fly-here", 1, "daily"],
    ["/learn", 0.7, "monthly"],
    ["/drill", 0.6, "monthly"],
    ["/practice", 0.6, "monthly"],
    ["/exam", 0.6, "monthly"],
    ["/acs", 0.4, "monthly"],
    ["/basics", 0.5, "monthly"],
  ];
  return [
    ...pages.map(([p, priority, changeFrequency]) => ({ url: `${BASE}${p}`, lastModified: now, priority, changeFrequency })),
    ...PLACES.map((p) => ({
      url: `${BASE}/can-i-fly-here/${p.slug}`,
      lastModified: now,
      priority: 0.8,
      changeFrequency: "daily" as const,
    })),
    ...LESSONS.map((l) => ({ url: `${BASE}/learn/${l.slug}`, lastModified: now, priority: 0.5, changeFrequency: "monthly" as const })),
  ];
}
