---
name: ai-search-visibility-auditor
description: Audit a website for AI search visibility, crawlability, schema, answer readiness, local SEO, trust, citations, and report-ready recommendations for Google AI Overviews, Google AI Mode, ChatGPT Search, Perplexity, Bing Copilot, Gemini-style answer engines, and local map based AI results.
---

# AI Search Visibility Auditor

Use this skill when the user asks to audit, score, improve, or report on a business website's readiness for modern AI search and answer engines.

This skill is designed to be practical. It does not promise rankings, citations, or AI mentions. It evaluates technical, structured, content, local, trust, and citation signals that can improve eligibility, clarity, crawlability, and recommendation readiness.

## Required Inputs

Ask only for missing essentials:

- `url`: required website URL.
- `businessName`: optional, inferred from the site when missing.
- `industry`: optional, improves content gap recommendations.
- `city`, `state`, `country`: optional, important for local businesses.
- `targetServiceOrProduct`: optional.
- `targetAudience`: optional.
- `competitorUrls`: optional, 1 to 5 URLs.
- `googleBusinessProfileUrl`: optional.
- `mainKeywords`: optional.

If only a URL is provided, run the audit with inferred details and state which inputs were inferred.

## Operating Principles

- Be evidence based. Separate observed facts from inferred risks.
- Speak like a smart consultant: clear, calm, business friendly, and action oriented.
- Do not use fear based language or ranking guarantees.
- Explain bot access tradeoffs. OAI-SearchBot can support ChatGPT Search visibility. GPTBot relates to OpenAI training. Site owners may intentionally allow one and block the other.
- Respect crawl limits and robots.txt.
- Prevent unsafe crawling. Do not crawl localhost, private IPs, link-local addresses, or unusual protocols.
- Use deterministic scoring first. AI analysis can enrich recommendations but should not be the sole source of scores.
- Mark unavailable checks clearly. For example, Google Business Profile API, live SERP tracking, PageSpeed Insights, and AI answer-engine testing require optional integrations.

## Workflow

1. Normalize and validate the URL.
2. Resolve redirects and record the final URL.
3. Check `robots.txt` for Googlebot, Bingbot, OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, and Applebot.
4. Discover sitemaps from common paths and robots declarations.
5. Crawl the homepage and important internal pages up to the configured limit.
6. Extract metadata, headings, canonicals, indexability, links, images, schema, NAP, FAQs, reviews, testimonials, CTAs, trust signals, local signals, and content snippets.
7. Audit every crawled page for AEO and GEO readiness using H1s, headings, body copy, FAQs, short-answer coverage, entity clarity, local clarity, trust proof, schema, and citation readiness.
8. Score the site across the core categories.
9. Generate prioritized findings and recommendations.
10. Build a report with executive summary, scorecard, page-level AEO/GEO findings, 30/60/90-day roadmap, schema recommendations, content recommendations, and appendices.
11. If competitors are provided, crawl and compare their signals against the audited site.

## Scoring Categories

Return an overall `aiSearchVisibilityScore` from 0 to 100 and these sub-scores:

- Technical Foundation
- AI Crawlability
- Structured Data
- Content Answer Readiness
- Entity Clarity
- Local SEO
- Trust Signal
- Authority and Citation
- Conversion Readiness
- Competitor Advantage

Score labels:

- `90-100`: AI Ready
- `75-89`: Strong
- `60-74`: Needs Improvement
- `40-59`: Weak
- `0-39`: At Risk

## Recommendation Format

Every issue should include:

- `title`
- `severity`: Critical, High, Medium, Low
- `priority`: Do this now, Do this next, Do this later
- `whyItMatters`
- `businessImpact`
- `howToFix`
- `estimatedDifficulty`
- `estimatedTime`
- `example`
- `copyReadyRecommendation`

## Runnable MVP

This skill includes a TypeScript CLI audit engine.

Install dependencies:

```bash
npm install
```

Run an audit:

```bash
npm run audit -- --url https://example.com --business-name "Example Co" --industry "SaaS"
```

Run with competitors:

```bash
npm run audit -- --url https://example.com --competitors https://competitor-a.com,https://competitor-b.com
```

Outputs are written to `out/`:

- Markdown report
- JSON raw audit data
- CSV issues export

## Output Contract

The audit result must include:

- Executive summary
- Scorecard
- Strengths
- Critical issues
- Quick wins
- Technical crawlability findings
- AI bot access findings
- Sitemap findings
- Structured data findings
- Content readiness findings
- Page-level AEO and GEO readiness findings
- Missing questions and recommended content blocks
- Local visibility findings
- Trust and authority findings
- Competitor gap findings when available
- 30/60/90-day roadmap
- Schema recommendations
- Content recommendations
- Legal and ethical disclaimer

## Optional AI Enhancement

If an OpenAI-compatible API key is available, use the prompt in `src/ai/promptTemplate.ts` to enrich recommendations. AI output must conform to `src/ai/outputSchema.ts`. Scores remain deterministic unless the user explicitly asks for AI-adjusted scoring.

## Deliverable Tone

Use:

- Improve eligibility
- Strengthen signals
- Increase clarity
- Improve crawlability
- Improve citation readiness
- Improve answer quality
- Improve local entity strength

Avoid:

- Guaranteed ranking
- Guaranteed AI citation
- Hack the algorithm
- Trick AI
- Secret loophole
