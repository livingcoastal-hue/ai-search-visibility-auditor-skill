# AI Search Visibility Auditor Skill

AI Search Visibility Auditor helps businesses understand whether their website is crawlable, clearly structured, trustworthy, and ready to be understood by AI-driven search and answer engines, including Google AI Overviews, Google AI Mode, ChatGPT Search, Perplexity, Claude-style assistants, Bing Copilot, Gemini-style answer engines, and local map based AI results.

It is built for agencies, consultants, local businesses, SaaS teams, ecommerce brands, service companies, and content teams that need a practical audit, not a gimmick. The skill crawls a site, extracts page signals, scores visibility readiness, and produces report-ready recommendations that explain what to fix and why it matters.

This tool does not guarantee rankings or AI citations. It evaluates technical, content, local, trust, and structured data signals that may improve crawlability, clarity, answer quality, and citation readiness.

## Why This Exists

Traditional SEO audits often stop at titles, meta descriptions, backlinks, and generic technical checks. AI search and answer engines need more context.

They need to understand:

- What the business does.
- Who it serves.
- Where it operates.
- Which services or products matter most.
- Whether pages answer real customer questions.
- Whether the site has structured data, proof, trust signals, and local entity clarity.
- Whether crawlers can access the content.
- Whether the page is useful enough to be summarized, recommended, or cited.

This skill turns those signals into a clear AI Search Visibility Score, page-level AEO/GEO findings, and prioritized fixes.

## What It Audits

The audit checks both technical access and business/content quality.

Core audit areas:

- URL validation, normalization, redirects, and final resolved URL.
- `robots.txt` access for Googlebot, Bingbot, OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, and Applebot.
- Sitemap discovery from common paths and robots declarations.
- Homepage and internal page crawling.
- Metadata, titles, descriptions, canonicals, indexability, headings, links, images, alt text, forms, and CTAs.
- JSON-LD schema extraction and structured data type detection.
- Local signals such as NAP, phone numbers, addresses, city mentions, service areas, embedded maps, and local trust proof.
- Content signals such as FAQs, short answer blocks, service clarity, pricing mentions, process explanations, comparison language, and trust proof.
- EEAT-style signals such as About, Contact, reviews, testimonials, certifications, licenses, policies, and social profiles.
- Competitor comparison when competitor URLs are provided.

## Page-Level AEO And GEO Layer

The skill includes a crawler-based page readiness layer for AEO and GEO.

For every crawled page, it evaluates:

- H1 quality.
- H2/H3 structure.
- Word count and explanatory depth.
- Whether the page answers who, what, where, when, why, and how.
- Whether there is a concise answer block near the top.
- FAQ readiness.
- Conversational search match.
- Service or product entity clarity.
- Local entity clarity.
- Trust proof.
- Schema specificity.
- Citation readiness.
- Image alt text quality.

Each page receives:

- AEO Score.
- GEO Score.
- Answer Readiness Score.
- Entity Clarity Score.
- Citation Readiness Score.
- Label: AI Ready, Strong, Needs Improvement, Weak, or At Risk.
- Strengths.
- Gaps.
- Plain-English tips.
- Missing questions the page should answer.
- Recommended content blocks to add.

Example page-level recommendation:

```text
Improve AEO/GEO readiness on /service/tankless-water-heater/

Why it matters:
AI answer engines need clear page structure, direct answers, entity signals, proof, and schema to understand when a page is relevant.

How to fix:
Add direct answers for who the page helps, what is offered, where it is available, when to act, why to choose the business, and how the process works. Add a 40-70 word summary answer immediately below the H1. Add LocalBusiness, Service, FAQPage, BreadcrumbList, and industry-specific schema where relevant.
```

## Scores

The overall AI Search Visibility Score is 0 to 100.

Score labels:

- `90-100`: AI Ready
- `75-89`: Strong
- `60-74`: Needs Improvement
- `40-59`: Weak
- `0-39`: At Risk

Score categories:

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

The scoring is deterministic first. AI can enrich recommendations later, but the score is based on observed crawl data and explainable signals.

## Recommendation Engine

Every recommendation is designed to be useful in a real client report.

Recommendations include:

- Issue title.
- Severity: Critical, High, Medium, Low.
- Priority: Do this now, Do this next, Do this later.
- Why it matters.
- Business impact.
- How to fix.
- Estimated difficulty.
- Estimated time.
- Example issue.
- Copy-ready recommendation.

The skill avoids language like guaranteed ranking, trick AI, hack the algorithm, and secret loophole. It uses business-friendly language such as improve eligibility, strengthen signals, increase clarity, improve crawlability, improve citation readiness, and improve answer quality.

## Example Test Result

Testing against `https://deltaplumbingatlanta.com` with plumbing/local inputs produced:

- Overall score: `88/100`
- Label: `Strong`
- Crawled pages: `10`
- Formal recommendations: `8`
- Technical Foundation: `100`
- AI Crawlability: `100`
- Structured Data: `40`
- Local SEO: `80`

The page-level AEO/GEO layer identified useful content opportunities, including:

- Add short answer blocks near the top of service pages.
- Add buyer-focused FAQs.
- Improve service-specific schema.
- Strengthen pages with weak who, what, where, when, why, and how coverage.
- Add descriptive image alt text.
- Improve weaker AEO pages such as service area, tankless water heater, and sewer problem pages.

## Outputs

Audit runs create files in the selected output directory:

- `audit.json`: Raw structured audit data.
- `report.md`: Business-friendly report.
- `issues.csv`: Findings and recommendations.

The Markdown report includes:

- Executive summary.
- Scorecard.
- Strengths.
- Critical issues.
- Quick wins.
- Technical findings.
- AI bot access findings.
- Structured data findings.
- Page AEO and GEO readiness.
- Content readiness.
- Local visibility.
- Prioritized recommendations.
- 30/60/90-day action plan.
- Schema recommendations.
- Google Business Profile checklist.
- Legal and ethical disclaimer.

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

Basic audit:

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

With a custom crawl size and output folder:

```bash
npm run audit -- \
  --url https://example.com \
  --industry "Plumbing" \
  --city "Atlanta" \
  --state "GA" \
  --max-pages 10 \
  --out out-example-audit
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

This makes the audit safer for local use and helps prevent accidental SSRF-style crawling.

## How AI Analysis Works

AI enrichment is optional. The deterministic audit creates the evidence base first. If an OpenAI-compatible API key is available, the app can send structured extracted data to the prompt in `src/ai/promptTemplate.ts` and validate the returned shape from `src/ai/outputSchema.ts`.

AI recommendations should improve wording, prioritization, examples, schema copy, and content ideas. They should not override the factual crawl data.

## Project Structure

```text
src/
  ai/                 AI prompt and output schema
  audit/              crawler, robots, sitemap, scoring, recommendations
  data/               industry templates
  report/             Markdown, CSV, schema, and content output helpers
  security/           URL and SSRF safety checks
tests/                scoring and content readiness tests
SKILL.md              Codex skill instructions
README.md            project documentation
```

## Deploy As A Web App

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
5. Add PDF export, saved clients, white label reports, and lead capture when moving beyond the CLI MVP.

## Known Limitations

- Page speed is estimated from response timing and page weight, not PageSpeed Insights.
- Google Business Profile is checklist-based unless a GBP integration is added.
- Live SERP, AI Overview, ChatGPT Search, Perplexity, Claude-style assistants, Gemini, and Bing Copilot citation testing requires external platform access.
- HTML extraction is strong enough for MVP audits, but browser-rendered JavaScript sites may need Playwright crawling.
- Competitor comparison is intentionally lightweight in the MVP and can be expanded with deeper crawl and SERP data.

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
