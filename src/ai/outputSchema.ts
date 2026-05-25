import { z } from "zod";

export const aiRecommendationOutputSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  criticalIssues: z.array(z.string()),
  quickWins: z.array(z.string()),
  scores: z.object({
    technical: z.number().min(0).max(100),
    aiCrawlability: z.number().min(0).max(100),
    structuredData: z.number().min(0).max(100),
    contentReadiness: z.number().min(0).max(100),
    entityClarity: z.number().min(0).max(100),
    localSeo: z.number().min(0).max(100),
    trust: z.number().min(0).max(100),
    authority: z.number().min(0).max(100),
    conversion: z.number().min(0).max(100)
  }),
  recommendations: z.array(z.object({
    title: z.string(),
    severity: z.string(),
    priority: z.string(),
    whyItMatters: z.string(),
    howToFix: z.string(),
    example: z.string(),
    estimatedDifficulty: z.string()
  })),
  contentSuggestions: z.array(z.string()),
  schemaSuggestions: z.array(z.string()),
  localSuggestions: z.array(z.string()),
  competitorGaps: z.array(z.string())
});

export type AiRecommendationOutput = z.infer<typeof aiRecommendationOutputSchema>;
