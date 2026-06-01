/**
 * The aeo-audit grading engine — Node 20+ port of VectorCite's quick
 * grader. MIT-licensed.
 *
 * Same scoring logic as VectorCite's hosted /grade/[domain] page, so a
 * local CLI score matches the public leaderboard score for the same
 * domain.
 */

import { RUBRIC } from "./rubric.js";

const FETCH_TIMEOUT_MS = 8_000;
const USER_AGENT = "aeo-audit/1.0 (+https://github.com/shashankshukl30/aeo-audit)";

function sanitize(rawDomain) {
  const d = String(rawDomain ?? "").trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.+$/, "");
  if (d.length === 0 || d.length > 253) return null;
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(d)) return null;
  return d;
}

async function safeGet(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
    });
    clearTimeout(t);
    const text = await res.text();
    return { status: res.status, text, ok: res.ok };
  } catch {
    return null;
  }
}

async function safeHead(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal, headers: { "user-agent": USER_AGENT } });
    clearTimeout(t);
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

function gradeLetter(score) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function summaryFor(letter, domain) {
  const m = {
    A: `${domain} is well-positioned for AI citation. The core trust + discoverability signals are in place.`,
    B: `${domain} has most fundamentals right but is missing one or two high-leverage signals.`,
    C: `${domain} has serious AEO gaps. The fixes are mostly cheap — schema, llms.txt, crawl-time signals.`,
    D: `${domain} is largely invisible to answer engines today. The structural fixes here are foundational.`,
    F: `${domain} is failing the AI-engine basics. Start with HTTPS, robots, sitemap, schema before any content work.`
  };
  return m[letter];
}

export async function gradeDomain(rawDomain) {
  const domain = sanitize(rawDomain);
  if (domain === null) return { kind: "invalid", reason: "invalid domain syntax" };
  return runQuickGrade(domain);
}

export async function runQuickGrade(domain) {
  const base = `https://${domain}`;
  const [apex, robots, llms, sitemap] = await Promise.all([
    safeGet(base),
    safeGet(`${base}/robots.txt`),
    safeHead(`${base}/llms.txt`),
    safeHead(`${base}/sitemap.xml`),
  ]);

  if (apex === null) return { kind: "unreachable", reason: "apex page unreachable" };

  const checks = [];

  checks.push({
    key: "https",
    label: "HTTPS",
    status: apex.ok ? "pass" : "warn",
    detail: apex.ok ? "TLS responds correctly." : `Apex returned ${apex.status}.`,
    weight: 10
  });

  let robotsStatus = "fail";
  let robotsDetail = "No robots.txt found.";
  if (robots !== null && robots.status === 200) {
    const txt = robots.text.toLowerCase();
    const aiBots = ["gptbot", "claudebot", "claude-web", "perplexitybot", "google-extended", "oai-searchbot", "chatgpt-user"];
    const mentions = aiBots.filter((b) => txt.includes(b));
    const blocks = mentions.some((b) => {
      const idx = txt.indexOf(b);
      const w = txt.slice(idx, idx + 400);
      return w.includes("disallow: /");
    });
    if (blocks) {
      robotsStatus = "fail";
      robotsDetail = "robots.txt blocks AI bots.";
    } else if (mentions.length > 0) {
      robotsStatus = "pass";
      robotsDetail = `robots.txt explicitly addresses ${mentions.length} AI bot(s).`;
    } else {
      robotsStatus = "warn";
      robotsDetail = "robots.txt exists but doesn't mention AI bots.";
    }
  }
  checks.push({ key: "robots", label: "robots.txt + AI bots", status: robotsStatus, detail: robotsDetail, weight: 15 });

  checks.push({
    key: "llms-txt",
    label: "llms.txt",
    status: llms.ok ? "pass" : "fail",
    detail: llms.ok ? "llms.txt found." : "No /llms.txt published.",
    weight: 10
  });

  checks.push({
    key: "sitemap",
    label: "sitemap.xml",
    status: sitemap.ok ? "pass" : "warn",
    detail: sitemap.ok ? "sitemap.xml present." : "No /sitemap.xml.",
    weight: 10
  });

  const html = apex.text;
  const htmlLower = html.toLowerCase();

  const hasOg = /<meta[^>]{0,200}property=["']og:image["'][^>]{0,200}content=["'][^"']+["']/i.test(html);
  checks.push({
    key: "og-image",
    label: "Open Graph image",
    status: hasOg ? "pass" : "fail",
    detail: hasOg ? "og:image is set." : "No og:image set.",
    weight: 10
  });

  const hasJsonLd =
    htmlLower.includes("application/ld+json") ||
    /<script[^>]{0,200}type=["']application\/ld\+json["']/i.test(html);
  checks.push({
    key: "json-ld",
    label: "JSON-LD schema",
    status: hasJsonLd ? "pass" : "fail",
    detail: hasJsonLd ? "JSON-LD detected." : "No JSON-LD on the homepage.",
    weight: 20
  });

  const titleMatch = /<title[^>]{0,200}>([^<]{1,250})<\/title>/i.exec(html);
  const title = titleMatch !== null ? titleMatch[1].trim() : "";
  let titleStatus = "pass";
  let titleDetail = `Title length ${title.length} chars — in the 50–60 band.`;
  if (title.length === 0) {
    titleStatus = "fail";
    titleDetail = "No <title> on the homepage.";
  } else if (title.length < 30) {
    titleStatus = "warn";
    titleDetail = `Title only ${title.length} chars — under 30.`;
  } else if (title.length > 70) {
    titleStatus = "warn";
    titleDetail = `Title ${title.length} chars — over 70 truncates.`;
  }
  checks.push({ key: "title", label: "<title> length", status: titleStatus, detail: titleDetail, weight: 5 });

  const metaMatch = /<meta[^>]{0,200}name=["']description["'][^>]{0,200}content=["']([^"']{1,400})["']/i.exec(html);
  const meta = metaMatch !== null ? metaMatch[1].trim() : "";
  let metaStatus = "pass";
  let metaDetail = `Meta description ${meta.length} chars — in the 80–160 sweet spot.`;
  if (meta.length === 0) {
    metaStatus = "fail";
    metaDetail = "No meta description.";
  } else if (meta.length < 80) {
    metaStatus = "warn";
    metaDetail = `Meta only ${meta.length} chars — too short.`;
  } else if (meta.length > 160) {
    metaStatus = "warn";
    metaDetail = `Meta ${meta.length} chars — over 160 truncates.`;
  }
  checks.push({ key: "meta-description", label: "meta description", status: metaStatus, detail: metaDetail, weight: 5 });

  const total = checks.reduce((acc, c) => acc + c.weight, 0);
  const earned = checks.reduce((acc, c) => {
    if (c.status === "pass") return acc + c.weight;
    if (c.status === "warn") return acc + c.weight * 0.5;
    return acc;
  }, 0);
  const score = Math.round((earned / total) * 100);
  const letter = gradeLetter(score);

  return {
    kind: "ok",
    grade: {
      domain,
      score,
      letter,
      checks,
      summary: summaryFor(letter, domain),
      methodology: "https://vectorcite.digiocular.com/rubric",
      reportUrl: `https://vectorcite.digiocular.com/grade/${domain}`
    }
  };
}
