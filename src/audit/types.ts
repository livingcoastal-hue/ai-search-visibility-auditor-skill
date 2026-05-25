export type Severity = "Critical" | "High" | "Medium" | "Low";
export type Priority = "Do this now" | "Do this next" | "Do this later";

export interface AuditInput {
  url: string;
  businessName?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  targetServiceOrProduct?: string;
  targetAudience?: string;
  competitorUrls?: string[];
  googleBusinessProfileUrl?: string;
  mainKeywords?: string[];
  maxPages?: number;
}

export interface UrlResolution {
  inputUrl: string;
  normalizedUrl: string;
  finalUrl?: string;
  redirectChain: string[];
  statusCode?: number;
  error?: string;
}

export interface RobotsAudit {
  exists: boolean;
  url: string;
  sitemapUrls: string[];
  botAccess: Record<string, boolean>;
  riskyLines: string[];
  recommendations: string[];
  raw?: string;
}

export interface SitemapAudit {
  exists: boolean;
  checkedUrls: string[];
  discoveredUrls: string[];
  pageCount: number;
  hasLastmod: boolean;
  recommendations: string[];
}

export interface ExtractedSchema {
  type: string;
  valid: boolean;
  data?: unknown;
  error?: string;
}

export interface PageAudit {
  url: string;
  statusCode: number;
  title?: string;
  metaDescription?: string;
  canonical?: string;
  h1: string[];
  h2: string[];
  h3: string[];
  wordCount: number;
  noindex: boolean;
  lang?: string;
  viewport: boolean;
  openGraph: boolean;
  twitterCard: boolean;
  favicon: boolean;
  internalLinks: string[];
  externalLinks: string[];
  images: number;
  imagesMissingAlt: number;
  schema: ExtractedSchema[];
  phoneNumbers: string[];
  emails: string[];
  addressSignals: string[];
  socialLinks: string[];
  faqCount: number;
  reviewSignals: string[];
  testimonialSignals: string[];
  serviceSignals: string[];
  locationMentions: string[];
  ctaSignals: string[];
  trustSignals: string[];
  forms: number;
  embeddedMaps: number;
  bodyTextSample: string;
  responseMs: number;
  bytes: number;
}

export interface PageContentReadinessAudit {
  url: string;
  title?: string;
  h1: string[];
  aeoScore: number;
  geoScore: number;
  answerReadinessScore: number;
  entityClarityScore: number;
  citationReadinessScore: number;
  label: string;
  strengths: string[];
  gaps: string[];
  tips: string[];
  missingQuestions: string[];
  recommendedBlocks: string[];
}

export interface ScoreBreakdown {
  technicalFoundation: number;
  aiCrawlability: number;
  structuredData: number;
  contentAnswerReadiness: number;
  entityClarity: number;
  localSeo: number;
  trustSignal: number;
  authorityAndCitation: number;
  conversionReadiness: number;
  competitorAdvantage: number;
  overall: number;
}

export interface Recommendation {
  title: string;
  severity: Severity;
  priority: Priority;
  whyItMatters: string;
  businessImpact: string;
  howToFix: string;
  estimatedDifficulty: "Easy" | "Moderate" | "Hard";
  estimatedTime: string;
  example: string;
  copyReadyRecommendation: string;
}

export interface CompetitorGap {
  competitorUrl: string;
  whereYouAreAhead: string[];
  whereCompetitorIsAhead: string[];
  quickWins: string[];
  hardWins: string[];
}

export interface AuditResult {
  input: AuditInput;
  generatedAt: string;
  urlResolution: UrlResolution;
  robots: RobotsAudit;
  sitemap: SitemapAudit;
  pages: PageAudit[];
  pageContentAudits: PageContentReadinessAudit[];
  scores: ScoreBreakdown;
  scoreLabel: string;
  strengths: string[];
  criticalIssues: Recommendation[];
  quickWins: Recommendation[];
  recommendations: Recommendation[];
  contentSuggestions: string[];
  schemaSuggestions: string[];
  localSuggestions: string[];
  competitorGaps: CompetitorGap[];
  gbpChecklist: string[];
  disclaimer: string;
}
