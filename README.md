# aeo-audit

> **The open AEO/GEO audit standard.** Score any URL against the 47-signal VectorCite Rubric. MIT-licensed. No account, no API key.

[![npm version](https://img.shields.io/npm/v/aeo-audit.svg)](https://www.npmjs.com/package/aeo-audit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AEO Score](https://vectorcite.digiocular.com/badge/vectorcite.digiocular.com)](https://vectorcite.digiocular.com/grade/vectorcite.digiocular.com)

## What is AEO?

**Answer Engine Optimization** — the practice of making your pages get cited by AI engines (ChatGPT, Perplexity, Claude, Google AI Overviews) inside their generated answers. The successor to SEO. Different signal weights, different mechanics, same goal: be the source.

## Why this exists

Most AEO platforms publish a number from a black box and charge $99–$1500/month for it. `aeo-audit` publishes the entire scoring methodology (the [AEO Spec v1](./AEO-SPEC-v1.md)) and ships the audit code as a single npx command.

**Use it for free, fork it, embed it in your CI, build a competing tool on top of it.** The methodology is the standard; the hosted product (vectorcite.digiocular.com) is the convenient version.

Same play as Lighthouse, OWASP, Mozilla Observatory.

## Usage

```bash
npx aeo-audit https://example.com
```

Output:

```
┌─ AEO Audit · example.com ─────────────────────────
│  Grade: B    Score: 78/100
│  Methodology: https://vectorcite.digiocular.com/rubric
│
│  ✔ HTTPS                 [10/10]
│  ✔ robots.txt + AI bots  [15/15]
│  ✘ llms.txt              [ 0/10]   No /llms.txt published
│  ✔ sitemap.xml           [10/10]
│  ✔ Open Graph image      [10/10]
│  ✘ JSON-LD schema        [ 0/20]   No JSON-LD detected
│  ✔ <title> length        [ 5/ 5]
│  ✔ meta description      [ 5/ 5]
└─────────────────────────────────────────────────

Full report: https://vectorcite.digiocular.com/grade/example.com
```

## Install

```bash
# One-off
npx aeo-audit https://example.com

# Global install
npm install -g aeo-audit
aeo-audit https://example.com

# As a library
npm install aeo-audit
```

```js
import { gradeDomain } from 'aeo-audit';

const result = await gradeDomain('example.com');
console.log(result.grade.score, result.grade.letter, result.grade.checks);
```

## CLI options

```bash
aeo-audit <domain> [options]

Options:
  --json     Output machine-readable JSON
  --quiet    Suppress decorative output (CI-friendly)
  --version  Print version
  --help     Print this help
```

## CI integration

```yaml
# .github/workflows/aeo.yml
name: AEO audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npx aeo-audit https://your-site.com --json > aeo.json
      - run: |
          SCORE=$(jq -r '.grade.score' aeo.json)
          if [ "$SCORE" -lt 75 ]; then
            echo "AEO score below threshold: $SCORE"
            exit 1
          fi
```

## README badge

Add a live AEO badge to your README:

```markdown
[![AEO Score](https://vectorcite.digiocular.com/badge/YOUR-DOMAIN.com)](https://vectorcite.digiocular.com/grade/YOUR-DOMAIN.com)
```

Updates every 24h. Click-through goes to the full audit.

## The rubric

This package implements the **quick rubric** (8 signals, all at the homepage level). The **full rubric** (47 signals, scored per-page against a buyer query) runs at [vectorcite.digiocular.com/audit](https://vectorcite.digiocular.com/audit) and exposes the data at [/api/v1/rubric](https://vectorcite.digiocular.com/api/v1/rubric).

Formal specification: [AEO-SPEC-v1.md](./AEO-SPEC-v1.md)

## Scoring

The 8 quick-rubric signals each have a weight (total 85). Score = `Math.round((earned / 85) * 100)`. Letter:

| Letter | Score |
|--------|-------|
| A      | 90+   |
| B      | 75–89 |
| C      | 60–74 |
| D      | 40–59 |
| F      | < 40  |

## Contributing

The rubric is open. Proposals to add, remove, or reweight signals are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).

## Related

- **[VectorCite](https://vectorcite.digiocular.com)** — hosted product implementing this spec at scale
- **[VectorCite Atlas](https://vectorcite.digiocular.com/atlas)** — directory of brands with strong AEO signals
- **[VectorCite Leaderboard](https://vectorcite.digiocular.com/leaderboard)** — public AEO benchmark dataset
- **[VectorCite Rubric API](https://vectorcite.digiocular.com/api/v1/rubric)** — JSON of the full 47-signal rubric
- **[VectorCite Leaderboard API](https://vectorcite.digiocular.com/api/v1/leaderboard)** — JSON of the live benchmark dataset

## Citation

```
VectorCite (2026). aeo-audit: The open AEO/GEO scoring standard, v1.0.
MIT License. https://github.com/shashankshukl30/aeo-audit
```
