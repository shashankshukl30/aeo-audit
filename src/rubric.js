/**
 * The AEO quick rubric — 8 signals, 85 total weight, all evaluated at
 * the homepage level. Mirrors the rubric exposed at
 * https://vectorcite.digiocular.com/api/v1/rubric (filtered to the
 * 8 high-leverage quick-check signals).
 *
 * Full 47-signal rubric runs server-side at vectorcite.digiocular.com
 * and requires a buyer query — not portable to a one-shot CLI.
 */

export const RUBRIC = {
  version: "v1.0",
  license: "MIT",
  spec: "https://github.com/shashankshukl30/aeo-audit/blob/main/AEO-SPEC-v1.md",
  signals: [
    { key: "https", label: "HTTPS", weight: 10, what: "Site responds correctly over TLS without mixed content.", why: "AI crawlers refuse to crawl mixed-content pages. HTTPS is table stakes." },
    { key: "robots", label: "robots.txt + AI bots", weight: 15, what: "robots.txt explicitly addresses GPTBot/ClaudeBot/PerplexityBot.", why: "Default-allow gets you crawled, but explicit allow signals intent." },
    { key: "llms-txt", label: "llms.txt", weight: 10, what: "Whether /llms.txt exists per llmstxt.org spec.", why: "Explicit channel for telling AI engines exactly which content to ingest." },
    { key: "sitemap", label: "sitemap.xml", weight: 10, what: "sitemap.xml present at the standard location.", why: "AI crawlers can enumerate your indexable surface; without it, they link-follow only." },
    { key: "og-image", label: "Open Graph image", weight: 10, what: "og:image is set on the homepage.", why: "AI engine link previews + social shares use OG meta as the citation card." },
    { key: "json-ld", label: "JSON-LD schema", weight: 20, what: "At least one schema.org JSON-LD block on the homepage.", why: "Schema.org is the single highest-leverage signal for AI Overview eligibility." },
    { key: "title", label: "<title> length", weight: 5, what: "Title length is 30-70 chars (50-60 sweet spot).", why: "AI engines truncate at 70 chars; under 30 wastes prime real estate." },
    { key: "meta-description", label: "meta description", weight: 5, what: "Meta description present, 80-160 chars.", why: "AI engines use meta description as a primary summary candidate." }
  ]
};
