# AI Search Visibility Auditor Skill

AI Search Visibility Auditor helps businesses see whether their website is crawlable, clearly structured, trustworthy, and ready to be understood by AI-driven search and answer engines, including Claude-style assistants.

The skill evaluates practical signals for Google AI Overviews, Google AI Mode, ChatGPT Search, Perplexity, Bing Copilot, Gemini-style answer engines, Claude-style assistants, and local map based AI results.

## What It Does

- Validates and normalizes a submitted URL.
- Detects redirects and final resolved URL.
- Checks `robots.txt` access for major search and AI crawlers.
- Discovers sitemaps from common paths and robots declarations.
- Crawls the homepage and selected internal pages.
- Extracts metadata, headings, schema, links, NAP, FAQs, local signals, trust signals, CTAs, and content blocks.
- Audits every crawled page for AEO and GEO readiness using H1s, headings, direct answer coverage, entity clarity, local clarity, proof, schema, and citation readiness.
- Scores AI search visibility across technical, crawlability, schema, content, entity, local, trust, citation, conversion, and competitor categories.
- Generates page-level tips, missing questions, recommended content blocks, prioritized recommendations, and report-ready exports.
- Includes starter industry templates for local service businesses, SaaS, ecommerce, agencies, legal, dental, restaurants, and more.

## Install

```bash
npm install
```

## Install As A Codex Skill

Use this repository as the skill source:

```text
https://github.com/livingcoastal-hue/ai-search-visibility-auditor-skill.git
```

The skill entrypoint is `SKILL.md` at the repository root. The runnable audit engine lives in `src/`.

## Run Locally

```bash
npm run audit -- --url https://example.com
```

With business details:

```bash
npm run audit -- \
  --url https://example.com \
  --business-name "Example Plumbing" \
  --industry "Plumbing" \
  --city "Atlanta" \
  --state "GA" \
  --service "Emergency plumbing"
```

With competitors:

```bash
npm run audit -- --url https://example.com --competitors https://a.com,https://b.com
```

## Environment Variables

Copy `.env.example` if you want optional AI enrichment later.

```bash
cp .env.example .env
```

Required for deterministic auditing: none.

Optional:

- `OPENAI_API_KEY`: Enables OpenAI-compatible recommendation enrichment.
- `OPENAI_BASE_URL`: Optional compatible API base URL.
- `AUDIT_MAX_PAGES`: Default page crawl limit.
- `AUDIT_TIMEOUT_MS`: Request timeout.

## How Crawling Works

The crawler:

- Accepts only `http` and `https` URLs.
- Blocks localhost, private IP ranges, link-local IPs, and non-public hostnames.
- Respects `robots.txt` for the configured user agent.
- Crawls same-origin internal pages only.
- Defaults to 25 pages.
- Limits response size and request timeouts.

## How Scoring Works

Scoring is deterministic and explainable. The scoring engine awards points for signals such as:

- Search crawler access.
- AI search crawler access.
- Sitemap availability.
- Indexable main pages.
- Metadata quality.
- Schema presence and completeness.
- Clear business/entity information.
- FAQs and direct answer blocks.
- NAP and local service-area clarity.
- Reviews, testimonials, about/contact pages, policies, and trust proof.
- Strong CTAs and conversion paths.

Scores are normalized to 100.

## How AI Analysis Works

AI enrichment is optional. The deterministic audit creates the evidence base first. If an OpenAI-compatible API key is available, the app can send structured extracted data to the prompt in `src/ai/promptTemplate.ts` and validate the returned shape from `src/ai/outputSchema.ts`.

AI recommendations should improve wording, prioritization, examples, schema copy, and content ideas. They should not override the factual crawl data.

## Exports

Audit runs create files in `out/`:

- `audit.json`: Raw structured audit data.
- `report.md`: Business-friendly report.
- `issues.csv`: Findings and recommendations.

## Deploy

This repository is a skill plus CLI MVP. To turn it into a web application:

1. Use `src/audit/runAudit.ts` as the service layer.
2. Wrap it with Next.js API routes:
   - `POST /api/audit/start`
   - `GET /api/audit/:id`
   - `POST /api/report/export`
   - `POST /api/schema/generate`
   - `POST /api/competitors/analyze`
3. Persist results in PostgreSQL using the models in `templates/prisma-schema.prisma`.
4. Run audits in a background worker for production scale.

## Known Limitations

- Page speed is estimated from response timing and page weight, not PageSpeed Insights.
- Google Business Profile is checklist-based unless a GBP integration is added.
- Live SERP, AI Overview, ChatGPT Search, Perplexity, Claude-style assistants, Gemini, and Bing Copilot citation testing requires external platform access.
- HTML extraction is strong enough for MVP audits, but browser-rendered JavaScript sites may need Playwright crawling.

## Future Improvements

- Google Search Console integration.
- PageSpeed Insights API.
- Google Business Profile API.
- SERP API integration.
- Brand mention monitoring.
- AI citation tracking.
- Weekly monitoring.
- Email reports.
- Slack alerts.
- HubSpot integration.
- GoHighLevel integration.
- ServiceTitan integration.
- WordPress plugin.
- Chrome extension.
- White label agency portal.

## Legal And Ethical Note

This tool does not guarantee rankings or AI citations. It evaluates technical, content, local, and structured data signals that may improve search and AI answer visibility. Users are responsible for reviewing recommendations before publishing.
