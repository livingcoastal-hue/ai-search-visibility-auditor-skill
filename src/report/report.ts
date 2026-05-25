import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditResult, Recommendation } from "../audit/types.js";

export function renderMarkdownReport(result: AuditResult): string {
  return `# AI Search Visibility Audit

Generated: ${result.generatedAt}

Website: ${result.urlResolution.finalUrl ?? result.input.url}

## Executive Summary

Overall AI Search Visibility Score: **${result.scores.overall}/100 (${result.scoreLabel})**

This audit evaluates whether the website is easy for search engines and AI answer systems to crawl, understand, trust, and cite. It does not guarantee rankings or AI citations.

## Scorecard

| Category | Score |
| --- | ---: |
| Technical Foundation | ${result.scores.technicalFoundation} |
| AI Crawlability | ${result.scores.aiCrawlability} |
| Structured Data | ${result.scores.structuredData} |
| Content Answer Readiness | ${result.scores.contentAnswerReadiness} |
| Entity Clarity | ${result.scores.entityClarity} |
| Local SEO | ${result.scores.localSeo} |
| Trust Signal | ${result.scores.trustSignal} |
| Authority and Citation | ${result.scores.authorityAndCitation} |
| Conversion Readiness | ${result.scores.conversionReadiness} |
| Competitor Advantage | ${result.scores.competitorAdvantage} |

## Strengths

${result.strengths.map((item) => `- ${item}`).join("\n")}

## Top Critical Issues

${formatRecommendations(result.criticalIssues)}

## Quick Wins

${formatRecommendations(result.quickWins)}

## Technical Findings

- Final URL: ${result.urlResolution.finalUrl ?? "Not resolved"}
- Redirect chain: ${result.urlResolution.redirectChain.join(" -> ") || "None recorded"}
- Crawled pages: ${result.pages.length}
- Sitemap found: ${result.sitemap.exists ? `Yes (${result.sitemap.pageCount} URLs)` : "No"}

## AI Bot Access

${Object.entries(result.robots.botAccess).map(([bot, allowed]) => `- ${bot}: ${allowed ? "Allowed or not explicitly blocked" : "Blocked"}`).join("\n")}

${result.robots.recommendations.length ? `Recommendations:\n${result.robots.recommendations.map((item) => `- ${item}`).join("\n")}` : ""}

## Structured Data Findings

${result.pages.flatMap((page) => page.schema.map((schema) => `- ${page.url}: ${schema.type} (${schema.valid ? "valid" : "invalid"})`)).join("\n") || "- No structured data detected."}

## Content Readiness

${result.contentSuggestions.map((item) => `- ${item}`).join("\n")}

## Local Visibility

${result.localSuggestions.map((item) => `- ${item}`).join("\n")}

## Recommendations

${formatRecommendations(result.recommendations)}

## 30 Day Action Plan

${result.recommendations.filter((item) => item.priority === "Do this now").slice(0, 8).map((item) => `- ${item.title}`).join("\n") || "- No immediate critical items found."}

## 60 Day Action Plan

${result.recommendations.filter((item) => item.priority === "Do this next").slice(0, 8).map((item) => `- ${item.title}`).join("\n") || "- Continue improving content, schema, and trust proof."}

## 90 Day Action Plan

- Expand topical authority pages.
- Build stronger citation-worthy content.
- Add competitor comparison and answer-engine prompt testing.
- Add monitoring for weekly visibility and crawlability changes.

## Schema Recommendations

${result.schemaSuggestions.map((item, index) => `### Schema ${index + 1}\n\n\`\`\`json\n${item}\n\`\`\``).join("\n\n")}

## Google Business Profile Checklist

${result.gbpChecklist.map((item) => `- ${item}`).join("\n")}

## Disclaimer

${result.disclaimer}
`;
}

export async function writeReportFiles(result: AuditResult, outDir = "out"): Promise<void> {
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "audit.json"), JSON.stringify(result, null, 2));
  await writeFile(path.join(outDir, "report.md"), renderMarkdownReport(result));
  await writeFile(path.join(outDir, "issues.csv"), renderIssuesCsv(result.recommendations));
}

function formatRecommendations(recommendations: Recommendation[]): string {
  if (recommendations.length === 0) return "- No issues in this category.";
  return recommendations.map((item) => `### ${item.title}

- Severity: ${item.severity}
- Priority: ${item.priority}
- Why it matters: ${item.whyItMatters}
- Business impact: ${item.businessImpact}
- How to fix: ${item.howToFix}
- Difficulty: ${item.estimatedDifficulty}
- Estimated time: ${item.estimatedTime}
- Example: ${item.example}`).join("\n\n");
}

function renderIssuesCsv(recommendations: Recommendation[]): string {
  const rows = [["Title", "Severity", "Priority", "Why It Matters", "Business Impact", "How To Fix", "Difficulty", "Time"]];
  for (const item of recommendations) {
    rows.push([item.title, item.severity, item.priority, item.whyItMatters, item.businessImpact, item.howToFix, item.estimatedDifficulty, item.estimatedTime]);
  }
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}
