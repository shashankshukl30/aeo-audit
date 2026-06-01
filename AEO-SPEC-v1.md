# AEO-SPEC-v1

**Status**: Stable v1.0 · **Last updated**: 2026-06-01 · **License**: MIT

The formal specification of the open AEO/GEO scoring rubric. This document defines the methodology that [`aeo-audit`](https://github.com/shashankshukl30/aeo-audit) implements and that [VectorCite](https://vectorcite.digiocular.com) hosts as a service.

Versioning: the methodology follows semantic versioning. v1.x is backward-compatible (signals may be added but not removed; weights may shift by < 0.05). Breaking changes ship as v2.

## 1. Scope

The AEO Spec defines:

1. The set of measurable signals that predict whether a page will be cited by AI answer engines (ChatGPT, Claude, Perplexity, Google AI Overview, Microsoft Copilot, etc.).
2. The weight each signal carries in the composite score.
3. The pass/warn/fail thresholds for each signal.
4. The composite scoring formula and letter grade thresholds.

The spec is **engine-agnostic** — it captures signals that matter across all major answer engines.

## 2. Two-tier rubric structure

### Quick rubric (8 signals)

Evaluated against the homepage URL alone, no buyer query required. Suitable for CLI audits, CI integration, badge-embeds. Implemented in `aeo-audit` (this repo).

### Full rubric (47 signals)

Evaluated against a specific URL + buyer query, requires server-side fetch + HTML parsing + competitor analysis + Wikidata lookup. Implemented in VectorCite's hosted Mirror Engine. JSON spec at [vectorcite.digiocular.com/api/v1/rubric](https://vectorcite.digiocular.com/api/v1/rubric).

The quick rubric is a strict subset of the full rubric.

## 3. The 8 quick-rubric signals

| Key                | Weight | Pass condition |
|--------------------|-------:|----------------|
| `https`            | 10     | Apex responds with 2xx/3xx over HTTPS |
| `robots`           | 15     | robots.txt explicitly addresses 1+ AI bot (GPTBot, ClaudeBot, OAI-SearchBot, PerplexityBot, ChatGPT-User, Claude-Web, Google-Extended) without blocking |
| `llms-txt`         | 10     | /llms.txt exists per llmstxt.org spec |
| `sitemap`          | 10     | /sitemap.xml exists at standard location |
| `og-image`         | 10     | og:image meta tag present on homepage |
| `json-ld`          | 20     | At least one `<script type='application/ld+json'>` block on homepage |
| `title`            | 5      | `<title>` length 30-70 chars (50-60 ideal) |
| `meta-description` | 5      | meta description 80-160 chars |

**Total weight**: 85.

## 4. Per-signal scoring

Each signal evaluates to one of three states:

- **pass** — full weight earned
- **warn** — half weight earned (signal present but suboptimal)
- **fail** — zero weight earned

## 5. Composite score

```
score = round((earned_weights_sum / 85) * 100)
```

Result is an integer 0-100.

## 6. Letter grade mapping

| Letter | Score range |
|:------:|:-----------:|
| A      | 90-100      |
| B      | 75-89       |
| C      | 60-74       |
| D      | 40-59       |
| F      | 0-39        |

## 7. Conformance

A conforming AEO Spec v1 implementation MUST:

1. Evaluate all 8 quick-rubric signals.
2. Use the weights specified in section 3.
3. Apply the pass/warn/fail logic specified in section 4.
4. Compute the composite score per section 5.
5. Map to letter grades per section 6.

A conforming implementation MAY:

- Add additional signals beyond the 8, provided they're documented as extensions.
- Provide different output formats (JSON, SVG badge, HTML report).
- Cache results.

## 8. Source attribution

The rubric is informed by:

- Aggarwal et al. (NeurIPS 2024), "GEO: Generative Engine Optimization" — empirically-validated citation factors.
- Google's Search Generative Experience (SGE) evaluation guide.
- Anthropic's web-search retrieval methodology (Claude tool docs).
- OpenAI's published GPTBot + OAI-SearchBot documentation.
- The llmstxt.org specification.
- Google's E-E-A-T quality rater guidelines.

## 9. Changelog

- **v1.0.0** (2026-06-01) — initial open spec covering 8 quick-rubric signals.

## 10. Citation

```
VectorCite (2026). AEO-SPEC-v1: The Open AEO/GEO Scoring Standard, version 1.0.
MIT License. https://github.com/shashankshukl30/aeo-audit/blob/main/AEO-SPEC-v1.md
```
