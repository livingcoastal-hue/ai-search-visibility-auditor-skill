import type { AuditInput, PageAudit, RobotsAudit, ScoreBreakdown, SitemapAudit } from "./types.js";

export function scoreAudit(input: AuditInput, robots: RobotsAudit, sitemap: SitemapAudit, pages: PageAudit[], competitorCount: number): ScoreBreakdown {
  const homepage = pages[0];
  const allSchemas = pages.flatMap((page) => page.schema);
  const hasSchema = allSchemas.some((schema) => schema.valid);
  const schemaTypes = allSchemas.map((schema) => schema.type).join(" ");
  const hasLocalSchema = /LocalBusiness|PostalAddress|Place/i.test(schemaTypes);
  const hasFaqSchema = /FAQPage/i.test(schemaTypes);
  const hasServiceSchema = /Service|Product/i.test(schemaTypes);
  const pagesIndexable = pages.filter((page) => !page.noindex).length;
  const totalFaqs = pages.reduce((sum, page) => sum + page.faqCount, 0);
  const hasNap = pages.some((page) => page.phoneNumbers.length || page.emails.length || page.addressSignals.length);
  const hasTrust = pages.some((page) => page.trustSignals.length || page.reviewSignals.length || page.testimonialSignals.length);
  const hasCta = pages.some((page) => page.ctaSignals.length || page.forms > 0);
  const hasAbout = pages.some((page) => /\/about/i.test(page.url) || page.bodyTextSample.toLowerCase().includes("about us"));
  const hasContact = pages.some((page) => /\/contact/i.test(page.url) || page.emails.length || page.phoneNumbers.length);
  const hasServicePages = pages.some((page) => /service|solution|product|practice|repair|installation/i.test(page.url + page.h1.join(" ")));

  const technicalFoundation = normalize([
    [pages.length > 0, 20],
    [Boolean(homepage?.title), 10],
    [Boolean(homepage?.metaDescription), 10],
    [Boolean(homepage?.canonical), 8],
    [Boolean(homepage?.viewport), 7],
    [pagesIndexable === pages.length && pages.length > 0, 15],
    [sitemap.exists, 15],
    [robots.exists, 5],
    [pages.every((page) => page.responseMs < 2000), 10]
  ]);

  const aiCrawlability = normalize([
    [robots.botAccess.Googlebot, 15],
    [robots.botAccess.Bingbot, 15],
    [robots.botAccess["OAI-SearchBot"], 15],
    [robots.botAccess["ChatGPT-User"], 10],
    [robots.botAccess.PerplexityBot, 10],
    [robots.botAccess.ClaudeBot, 10],
    [robots.botAccess.Applebot, 5],
    [pagesIndexable === pages.length && pages.length > 0, 20]
  ]);

  const structuredData = normalize([
    [hasSchema, 25],
    [hasLocalSchema || !isLocalInput(input), 15],
    [hasServiceSchema, 15],
    [hasFaqSchema || totalFaqs === 0, 10],
    [schemaTypes.includes("Organization"), 10],
    [schemaTypes.includes("WebSite"), 10],
    [allSchemas.every((schema) => schema.valid), 15]
  ]);

  const contentAnswerReadiness = normalize([
    [averageWords(pages) > 500, 15],
    [totalFaqs > 0, 15],
    [pages.some((page) => /what|how|why|when|where|cost|price|compare/i.test(page.bodyTextSample)), 20],
    [hasServicePages, 15],
    [pages.some((page) => page.h2.length >= 3), 10],
    [pages.some((page) => /process|expect|benefit|problem|solution/i.test(page.bodyTextSample)), 15],
    [pages.some((page) => page.externalLinks.length > 0), 10]
  ]);

  const entityClarity = normalize([
    [Boolean(input.businessName) || Boolean(homepage?.title), 20],
    [hasNap, 20],
    [hasSchema, 15],
    [pages.some((page) => page.socialLinks.length > 0), 10],
    [hasAbout, 10],
    [hasServicePages, 15],
    [pages.some((page) => page.locationMentions.length > 0) || !isLocalInput(input), 10]
  ]);

  const localSeo = normalize([
    [!isLocalInput(input) || hasNap, 20],
    [!isLocalInput(input) || hasLocalSchema, 20],
    [!isLocalInput(input) || pages.some((page) => page.embeddedMaps > 0), 10],
    [!isLocalInput(input) || pages.some((page) => page.locationMentions.length > 0), 15],
    [!isLocalInput(input) || pages.some((page) => /service area|near me|city|county|neighborhood/i.test(page.bodyTextSample)), 15],
    [!isLocalInput(input) || hasTrust, 20]
  ]);

  const trustSignal = normalize([
    [hasAbout, 15],
    [hasContact, 15],
    [hasTrust, 25],
    [pages.some((page) => /privacy policy|terms|return policy|warranty|guarantee/i.test(page.bodyTextSample)), 15],
    [pages.some((page) => page.socialLinks.length > 0), 10],
    [pages.some((page) => /case stud|portfolio|client|award|certified|licensed|insured/i.test(page.bodyTextSample)), 20]
  ]);

  const authorityAndCitation = normalize([
    [pages.some((page) => page.externalLinks.length > 0), 15],
    [hasSchema, 15],
    [hasTrust, 20],
    [pages.some((page) => /source|research|study|data|according to|mentioned in|featured in/i.test(page.bodyTextSample)), 20],
    [pages.length >= 5, 15],
    [pages.some((page) => /author|reviewed by|updated/i.test(page.bodyTextSample)), 15]
  ]);

  const conversionReadiness = normalize([
    [hasCta, 30],
    [hasContact, 20],
    [pages.some((page) => /pricing|price|cost|quote|estimate/i.test(page.bodyTextSample)), 15],
    [pages.some((page) => page.forms > 0), 15],
    [hasTrust, 20]
  ]);

  const competitorAdvantage = competitorCount > 0 ? 50 : 70;
  const parts = [technicalFoundation, aiCrawlability, structuredData, contentAnswerReadiness, entityClarity, localSeo, trustSignal, authorityAndCitation, conversionReadiness, competitorAdvantage];
  const overall = Math.round(parts.reduce((sum, score) => sum + score, 0) / parts.length);

  return {
    technicalFoundation,
    aiCrawlability,
    structuredData,
    contentAnswerReadiness,
    entityClarity,
    localSeo,
    trustSignal,
    authorityAndCitation,
    conversionReadiness,
    competitorAdvantage,
    overall
  };
}

export function scoreLabel(score: number): string {
  if (score >= 90) return "AI Ready";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Needs Improvement";
  if (score >= 40) return "Weak";
  return "At Risk";
}

function normalize(items: Array<[boolean, number]>): number {
  const possible = items.reduce((sum, [, points]) => sum + points, 0);
  const earned = items.reduce((sum, [ok, points]) => sum + (ok ? points : 0), 0);
  return Math.round((earned / possible) * 100);
}

function averageWords(pages: PageAudit[]): number {
  if (pages.length === 0) return 0;
  return pages.reduce((sum, page) => sum + page.wordCount, 0) / pages.length;
}

function isLocalInput(input: AuditInput): boolean {
  return Boolean(input.city || input.state || input.googleBusinessProfileUrl || /plumb|hvac|roof|dent|med spa|restaurant|attorney|contractor|home service/i.test(input.industry ?? ""));
}
