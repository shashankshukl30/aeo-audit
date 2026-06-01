#!/usr/bin/env node
/**
 * aeo-audit CLI — npx aeo-audit https://example.com
 *
 * MIT-licensed. Part of the open AEO/GEO audit standard.
 * Spec: https://github.com/shashankshukl30/aeo-audit/blob/main/AEO-SPEC-v1.md
 */

import { gradeDomain } from "../src/grader.js";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));

if (flags.has("--help") || flags.has("-h")) {
  process.stdout.write(
    `aeo-audit · the open AEO/GEO audit standard\n\n` +
      `Usage: aeo-audit <domain> [options]\n\n` +
      `Examples:\n` +
      `  aeo-audit https://example.com\n` +
      `  npx aeo-audit example.com --json\n` +
      `  aeo-audit example.com --quiet\n\n` +
      `Options:\n` +
      `  --json     Output machine-readable JSON\n` +
      `  --quiet    Suppress decorative output (CI-friendly)\n` +
      `  --version  Print version\n` +
      `  --help     Print this help\n\n` +
      `Docs: https://vectorcite.digiocular.com/rubric\n`,
  );
  process.exit(0);
}

if (flags.has("--version") || flags.has("-v")) {
  process.stdout.write("aeo-audit v1.0.0\n");
  process.exit(0);
}

const target = positional[0];
if (target === undefined || target === "") {
  process.stderr.write(
    "error: domain required\n\n" +
      "Usage: aeo-audit <domain>\n" +
      "Run `aeo-audit --help` for options.\n",
  );
  process.exit(2);
}

const raw = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.+$/, "");
const result = await gradeDomain(raw);

if (flags.has("--json")) {
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exit(result.kind === "ok" ? 0 : 1);
}

if (result.kind !== "ok") {
  process.stderr.write(`error: could not grade ${raw} — ${result.reason}\n`);
  process.exit(1);
}

const { score, letter, checks, summary } = result.grade;
const quiet = flags.has("--quiet");

function iconFor(status) {
  if (status === "pass") return "✔";
  if (status === "warn") return "!";
  if (status === "fail") return "✘";
  return "·";
}

if (quiet) {
  process.stdout.write(`${letter} ${score}/100  ${raw}\n`);
} else {
  const border = "─".repeat(40);
  process.stdout.write(`\n┌─ AEO Audit · ${raw} ${border}\n`);
  process.stdout.write(`│  Grade: ${letter}    Score: ${score}/100\n`);
  process.stdout.write(`│  Methodology: https://vectorcite.digiocular.com/rubric\n`);
  process.stdout.write(`│\n`);
  for (const c of checks) {
    const earned = c.status === "pass" ? c.weight : c.status === "warn" ? Math.round(c.weight / 2) : 0;
    const ico = iconFor(c.status);
    const label = c.label.padEnd(22);
    const sc = `[${String(earned).padStart(2)}/${String(c.weight).padStart(2)}]`;
    const note = c.status === "pass" ? "" : "   " + c.detail.slice(0, 60);
    process.stdout.write(`│  ${ico} ${label} ${sc}${note}\n`);
  }
  process.stdout.write(`└${"─".repeat(50)}\n\n`);
  process.stdout.write(`${summary}\n\n`);
  process.stdout.write(`Full report: https://vectorcite.digiocular.com/grade/${raw}\n\n`);
}

process.exit(score < 40 ? 1 : 0);
