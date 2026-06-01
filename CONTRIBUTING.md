# Contributing to aeo-audit

Thanks for your interest in improving the open AEO/GEO audit standard.

## What we accept

- Bug fixes in `src/grader.js`
- New conformance tests
- Documentation improvements
- Translations of README.md to other languages
- Proposals to refine the AEO Spec v1

## Proposing rubric changes

The rubric (signals + weights + thresholds) is the spec. Changes to it carry more weight than code-only changes.

**Adding a signal**: open an issue with:

1. The signal name + what it measures.
2. Evidence the signal predicts AI engine citation behavior (research paper, public engine docs, empirical A/B test data).
3. The proposed weight and where it slots in.

**Adjusting weights**: open an issue with:

1. The signal whose weight you propose changing.
2. Empirical evidence the current weight under- or over-represents the signal's predictive power.
3. The new weight.

No opinion-only weight changes. Numbers come from data.

## Code conventions

- ES modules (`type: module`)
- Node 20+ syntax — no transpile needed
- No dependencies in the main package (keep it `npx`-runnable cold-start)
- Functions exported from `src/index.js`

## Local development

```bash
git clone https://github.com/shashankshukl30/aeo-audit.git
cd aeo-audit
node bin/aeo-audit.js https://example.com
```

## License

By contributing you agree your contributions are licensed under MIT.
