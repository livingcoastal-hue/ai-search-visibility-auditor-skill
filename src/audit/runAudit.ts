import type { AuditInput, AuditResult, CompetitorGap } from "./types.js";
import { resolveUrl } from "./url.js";
import { auditRobots } from "./robots.js";
import { auditSitemap } from "./sitemap.js";
import { crawlSite } from "./crawler.js";
import { scoreAudit, scoreLabel } from "./scoring.js";
import { buildRecommendations, buildStrengths } from "./recommendations.js";
import { generateContentSuggestions, generateLocalSuggestions } from "../report/contentSuggestions.js";
import { generateSchemaSuggestions } from "../report/schemaSnippets.js";

const DISCLAIMER = "This tool does not guarantee rankings or AI citations. It evaluates technical, content, local, and structured data signals that may improve search and AI answer visibility. Users are responsible for reviewing recommendations before publishing.";

export async function runAudit(input: AuditInput): Promise<AuditResult> {
  const timeoutMs = Number(process.env.AUDIT_TIMEOUT_MS ?? 12000);
  const maxPages = input.maxPages ?? Number(process.env.AUDIT_MAX_PAGES ?? 25);
  const urlResolution = await resolveUrl(input.url, timeoutMs);

  if (!urlResolution.finalUrl) {
    const empty = emptyResult(input, urlResolution);
    empty.recommendations = [{
      title: "Fix website availability before deeper analysis",
      severity: "Critical",
      priority: "Do this now",
      whyItMatters: "The site could not be resolved safely.",
      businessImpact: "Search and AI systems need access to public content before visibility can improve.",
      howToFix: "Confirm the domain, DNS, hosting, SSL, and firewall settings.",
      estimatedDifficulty: "Moderate",
      estimatedTime: "1-3 hours",
      example: urlResolution.error ?? "Unable to resolve URL.",
      copyReadyRecommendation: "Make the website publicly reachable over HTTPS before running a full AI visibility audit."
    }];
    empty.criticalIssues = empty.recommendations;
    return empty;
  }

  const robots = await auditRobots(urlResolution.finalUrl, timeoutMs);
  const sitemap = await auditSitemap(urlResolution.finalUrl, robots.sitemapUrls, timeoutMs);
  const pages = await crawlSite(urlResolution.finalUrl, robots, sitemap.discoveredUrls, maxPages, timeoutMs);
  const competitorGaps = await buildCompetitorGaps(input, pages, timeoutMs);
  const scores = scoreAudit(input, robots, sitemap, pages, competitorGaps.length);
  const recommendations = buildRecommendations(input, robots, sitemap, pages);

  return {
    input,
    generatedAt: new Date().toISOString(),
    urlResolution,
    robots,
    sitemap,
    pages,
    scores,
    scoreLabel: scoreLabel(scores.overall),
    strengths: buildStrengths(pages, robots, sitemap),
    criticalIssues: recommendations.filter((item) => item.severity === "Critical").slice(0, 5),
    quickWins: recommendations.filter((item) => item.estimatedDifficulty === "Easy").slice(0, 10),
    recommendations,
    contentSuggestions: generateContentSuggestions(input),
    schemaSuggestions: generateSchemaSuggestions(input),
    localSuggestions: generateLocalSuggestions(input),
    competitorGaps,
    gbpChecklist: googleBusinessProfileChecklist(),
    disclaimer: DISCLAIMER
  };
}

async function buildCompetitorGaps(input: AuditInput, ownPages: unknown[], timeoutMs: number): Promise<CompetitorGap[]> {
  const competitors = (input.competitorUrls ?? []).slice(0, 5);
  const gaps: CompetitorGap[] = [];

  for (const competitorUrl of competitors) {
    const resolved = await resolveUrl(competitorUrl, timeoutMs);
    if (!resolved.finalUrl) continue;
    const robots = await auditRobots(resolved.finalUrl, timeoutMs);
    const sitemap = await auditSitemap(resolved.finalUrl, robots.sitemapUrls, timeoutMs);
    const pages = await crawlSite(resolved.finalUrl, robots, sitemap.discoveredUrls, 5, timeoutMs);
    gaps.push({
      competitorUrl,
      whereYouAreAhead: ownPages.length >= pages.length ? ["Your site has at least as many crawlable sampled pages."] : [],
      whereCompetitorIsAhead: pages.length > ownPages.length ? ["Competitor has more crawlable sampled pages in this audit."] : [],
      quickWins: ["Compare their FAQ structure, schema types, proof blocks, and service page depth."],
      hardWins: ["Build stronger topical authority and citation-worthy pages around your highest-value services."]
    });
  }

  return gaps;
}

function emptyResult(input: AuditInput, urlResolution: AuditResult["urlResolution"]): AuditResult {
  const robots = {
    exists: false,
    url: "",
    sitemapUrls: [],
    botAccess: {},
    riskyLines: [],
    recommendations: []
  };
  const sitemap = { exists: false, checkedUrls: [], discoveredUrls: [], pageCount: 0, hasLastmod: false, recommendations: [] };
  const scores = {
    technicalFoundation: 0,
    aiCrawlability: 0,
    structuredData: 0,
    contentAnswerReadiness: 0,
    entityClarity: 0,
    localSeo: 0,
    trustSignal: 0,
    authorityAndCitation: 0,
    conversionReadiness: 0,
    competitorAdvantage: 0,
    overall: 0
  };
  return {
    input,
    generatedAt: new Date().toISOString(),
    urlResolution,
    robots,
    sitemap,
    pages: [],
    scores,
    scoreLabel: "At Risk",
    strengths: [],
    criticalIssues: [],
    quickWins: [],
    recommendations: [],
    contentSuggestions: [],
    schemaSuggestions: [],
    localSuggestions: [],
    competitorGaps: [],
    gbpChecklist: googleBusinessProfileChecklist(),
    disclaimer: DISCLAIMER
  };
}

function googleBusinessProfileChecklist(): string[] {
  return [
    "Primary category",
    "Secondary categories",
    "Services",
    "Products",
    "Business description",
    "Photos",
    "Posts",
    "Q&A",
    "Reviews",
    "Review responses",
    "Service areas",
    "Hours",
    "Holiday hours",
    "Booking link",
    "Website link with UTM tracking",
    "Call tracking caution",
    "NAP consistency",
    "Messaging",
    "Attributes"
  ];
}
