import type { MetadataRoute } from "next";
import { LESSONS } from "@/content/lessons";

const BASE = "https://legaltofly.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number][] = [
    ["", 1],
    ["/can-i-fly-here", 0.9],
    ["/learn", 0.8],
    ["/drill", 0.7],
    ["/practice", 0.7],
    ["/exam", 0.7],
    ["/acs", 0.5],
    ["/basics", 0.5],
  ];
  return [
    ...pages.map(([p, priority]) => ({ url: `${BASE}${p}`, lastModified: now, priority })),
    ...LESSONS.map((l) => ({ url: `${BASE}/learn/${l.slug}`, lastModified: now, priority: 0.6 })),
  ];
}
