import type { AuditResult } from "../audit/types.js";

export function buildAiAnalysisPrompt(result: AuditResult): string {
  return `You are an AI search visibility consultant. Analyze the following website data and identify how well this business is positioned for AI driven search results. Focus on Google AI Overviews, AI Mode, ChatGPT Search, Perplexity style citation engines, Bing Copilot, and local map based AI answers. Do not guarantee rankings. Explain strengths, weaknesses, and practical fixes. Prioritize actions that improve crawlability, structured data, answer clarity, entity clarity, trust, local relevance, and citation readiness. Return structured JSON with findings, scores, recommendations, and copy examples.

Required JSON shape:
{
  "summary": "",
  "strengths": [],
  "criticalIssues": [],
  "quickWins": [],
  "scores": {
    "technical": 0,
    "aiCrawlability": 0,
    "structuredData": 0,
    "contentReadiness": 0,
    "entityClarity": 0,
    "localSeo": 0,
    "trust": 0,
    "authority": 0,
    "conversion": 0
  },
  "recommendations": [
    {
      "title": "",
      "severity": "",
      "priority": "",
      "whyItMatters": "",
      "howToFix": "",
      "example": "",
      "estimatedDifficulty": ""
    }
  ],
  "contentSuggestions": [],
  "schemaSuggestions": [],
  "localSuggestions": [],
  "competitorGaps": []
}

Website data:
${JSON.stringify(result, null, 2)}
`;
}
