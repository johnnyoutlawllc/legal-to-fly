import type { MetadataRoute } from "next";

/** Search engines and AI answer engines are both welcome. The AI crawlers are
 *  named explicitly so a future blanket rule can't shut them out by accident. */
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/api/"] })),
    ],
    sitemap: "https://legaltofly.com/sitemap.xml",
    host: "https://legaltofly.com",
  };
}
