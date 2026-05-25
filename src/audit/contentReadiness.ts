import type { AuditInput, PageAudit, PageContentReadinessAudit } from "./types.js";
import { scoreLabel } from "./scoring.js";

const QUESTION_PATTERNS = {
  who: /\b(who we are|who is|who should|about us|our team)\b/i,
  what: /\b(what is|what are|what we do|services include|we provide|we offer)\b/i,
  where: /\b(where|service area|serving|near me|in atlanta|city|county|neighborhood)\b/i,
  when: /\b(when|same day|emergency|24\/7|hours|schedule|appointment|response time)\b/i,
  why: /\b(why choose|why work|benefits|trusted|licensed|insured|certified|warranty|guarantee)\b/i,
  how: /\b(how it works|how we|process|steps|inspection|estimate|diagnose)\b/i
};

const INTENT_PATTERNS = {
  pricing: /\b(cost|price|pricing|estimate|quote|financing|factors)\b/i,
  comparison: /\b(compare|comparison|vs\.?|versus|best|alternative|pros and cons)\b/i,
  proof: /\b(review|testimonial|case study|project|before and after|licensed|insured|certified|award|years in business)\b/i,
  local: /\b(atlanta|near me|service area|county|neighborhood|directions|map|local)\b/i,
  emergency: /\b(emergency|same day|urgent|24\/7|after hours|fast response)\b/i,
  sourceLike: /\b(according to|data|study|source|research|guide|updated|reviewed by|author)\b/i
};

export function auditPageContentReadiness(input: AuditInput, pages: PageAudit[]): PageContentReadinessAudit[] {
  return pages.map((page) => auditSinglePage(input, page));
}

export function contentReadinessRecommendations(audits: PageContentReadinessAudit[]): string[] {
  const weakPages = audits.filter((audit) => audit.answerReadinessScore < 75 || audit.geoScore < 75 || audit.aeoScore < 75);
  const tips = new Set<string>();

  for (const audit of weakPages.slice(0, 5)) {
    for (const tip of audit.tips.slice(0, 3)) tips.add(`${shortUrl(audit.url)}: ${tip}`);
  }

  return [...tips];
}

function auditSinglePage(input: AuditInput, page: PageAudit): PageContentReadinessAudit {
  const text = page.bodyTextSample;
  const combined = `${page.title ?? ""} ${page.h1.join(" ")} ${page.h2.join(" ")} ${text}`;
  const questionCoverage = countMatches(QUESTION_PATTERNS, combined);
  const intentCoverage = countMatches(INTENT_PATTERNS, combined);
  const hasClearH1 = page.h1.length === 1 && page.h1[0].length >= 12;
  const hasGoodStructure = page.h2.length >= 3 && page.wordCount >= 600;
  const hasFaqs = page.faqCount >= 3;
  const hasShortAnswerSignals = /\b(is a|we help|we provide|we offer|specializes in|serves|serving)\b/i.test(text.slice(0, 1200));
  const hasServiceClarity = page.serviceSignals.length > 0 || /service|repair|installation|replacement|consulting|management/i.test(combined);
  const hasLocalClarity = page.locationMentions.length > 0 || Boolean(input.city && new RegExp(input.city, "i").test(combined));
  const hasEntitySignals = Boolean(input.businessName && new RegExp(escapeRegExp(input.businessName), "i").test(combined)) || page.phoneNumbers.length > 0;
  const hasProof = page.trustSignals.length > 0 || page.reviewSignals.length > 0 || page.testimonialSignals.length > 0;
  const hasSchema = page.schema.some((schema) => schema.valid);
  const hasSpecificSchema = page.schema.some((schema) => /LocalBusiness|Plumber|Service|FAQPage|Organization|Article|Product|BreadcrumbList/i.test(schema.type));
  const hasExternalReferences = page.externalLinks.length > 0 || INTENT_PATTERNS.sourceLike.test(combined);
  const hasCta = page.ctaSignals.length > 0 || page.forms > 0;

  const answerReadinessScore = score([
    [hasClearH1, 10],
    [hasGoodStructure, 15],
    [questionCoverage >= 4, 20],
    [hasShortAnswerSignals, 15],
    [hasFaqs, 15],
    [hasServiceClarity, 15],
    [hasCta, 10]
  ]);

  const aeoScore = score([
    [hasFaqs, 20],
    [questionCoverage >= 5, 20],
    [INTENT_PATTERNS.pricing.test(combined), 15],
    [INTENT_PATTERNS.comparison.test(combined), 10],
    [INTENT_PATTERNS.emergency.test(combined) || !isLocalBusiness(input), 10],
    [hasShortAnswerSignals, 15],
    [hasSpecificSchema, 10]
  ]);

  const geoScore = score([
    [hasEntitySignals, 15],
    [hasServiceClarity, 15],
    [hasLocalClarity || !isLocalBusiness(input), 15],
    [hasProof, 15],
    [hasSchema, 10],
    [hasGoodStructure, 10],
    [hasExternalReferences, 10],
    [INTENT_PATTERNS.sourceLike.test(combined), 10]
  ]);

  const entityClarityScore = score([
    [hasEntitySignals, 25],
    [hasServiceClarity, 20],
    [hasLocalClarity || !isLocalBusiness(input), 20],
    [page.phoneNumbers.length > 0, 10],
    [page.socialLinks.length > 0 || hasSchema, 10],
    [hasProof, 15]
  ]);

  const citationReadinessScore = score([
    [hasProof, 20],
    [hasExternalReferences, 15],
    [page.wordCount >= 1000, 15],
    [hasSpecificSchema, 15],
    [INTENT_PATTERNS.sourceLike.test(combined), 15],
    [page.faqCount >= 4, 10],
    [page.trustSignals.length >= 2, 10]
  ]);

  const strengths = buildStrengths(page, {
    hasClearH1,
    hasGoodStructure,
    hasFaqs,
    hasServiceClarity,
    hasLocalClarity,
    hasProof,
    hasSpecificSchema,
    hasCta
  });
  const gaps = buildGaps(input, page, {
    questionCoverage,
    intentCoverage,
    hasClearH1,
    hasGoodStructure,
    hasFaqs,
    hasShortAnswerSignals,
    hasServiceClarity,
    hasLocalClarity,
    hasEntitySignals,
    hasProof,
    hasSpecificSchema,
    hasExternalReferences
  });

  const tips = gaps.map(gapToTip);
  const missingQuestions = buildMissingQuestions(input, combined);
  const recommendedBlocks = buildRecommendedBlocks(input, page, gaps);
  const average = Math.round((answerReadinessScore + aeoScore + geoScore + entityClarityScore + citationReadinessScore) / 5);

  return {
    url: page.url,
    title: page.title,
    h1: page.h1,
    aeoScore,
    geoScore,
    answerReadinessScore,
    entityClarityScore,
    citationReadinessScore,
    label: scoreLabel(average),
    strengths,
    gaps,
    tips,
    missingQuestions,
    recommendedBlocks
  };
}

function buildStrengths(page: PageAudit, flags: Record<string, boolean>): string[] {
  const strengths: string[] = [];
  if (flags.hasClearH1) strengths.push("Clear single H1.");
  if (flags.hasGoodStructure) strengths.push("Good content depth and heading structure.");
  if (flags.hasFaqs) strengths.push("FAQ or question-style content is present.");
  if (flags.hasServiceClarity) strengths.push("Service/topic signals are clear.");
  if (flags.hasLocalClarity) strengths.push("Local market or service-area signals are present.");
  if (flags.hasProof) strengths.push("Trust proof is visible.");
  if (flags.hasSpecificSchema) strengths.push("Relevant structured data is present.");
  if (flags.hasCta) strengths.push("Conversion action signals are visible.");
  if (page.wordCount > 1500) strengths.push("Substantial page copy gives answer engines more context.");
  return strengths;
}

function buildGaps(input: AuditInput, page: PageAudit, flags: Record<string, boolean | number>): string[] {
  const gaps: string[] = [];
  if (!flags.hasClearH1) gaps.push("H1 is missing, duplicated, or not descriptive enough.");
  if (!flags.hasGoodStructure) gaps.push("Page needs stronger H2/H3 structure and deeper explanatory content.");
  if ((flags.questionCoverage as number) < 4) gaps.push("Page does not clearly answer enough who, what, where, when, why, and how questions.");
  if (!flags.hasShortAnswerSignals) gaps.push("Page needs a concise answer block near the top.");
  if (!flags.hasFaqs) gaps.push("Page needs buyer-focused FAQs.");
  if (!flags.hasServiceClarity) gaps.push("Service or product entity is not clear enough.");
  if (isLocalBusiness(input) && !flags.hasLocalClarity) gaps.push("Local city, neighborhood, or service-area clarity is weak.");
  if (!flags.hasEntitySignals) gaps.push("Business entity signals are weak or hard to extract.");
  if (!flags.hasProof) gaps.push("Page needs more trust proof such as reviews, credentials, case studies, or project examples.");
  if (!flags.hasSpecificSchema) gaps.push("Page needs more specific schema for AEO/GEO understanding.");
  if (!flags.hasExternalReferences) gaps.push("Page needs citation-worthy details, source-style claims, or useful external references.");
  if (page.images > 0 && page.imagesMissingAlt / page.images > 0.4) gaps.push("Many images are missing alt text, reducing semantic clarity.");
  return gaps;
}

function gapToTip(gap: string): string {
  const tips: Record<string, string> = {
    "H1 is missing, duplicated, or not descriptive enough.": "Use one descriptive H1 that names the service, audience, and location when relevant.",
    "Page needs stronger H2/H3 structure and deeper explanatory content.": "Add scannable H2 sections for problem, service, process, pricing factors, FAQs, and proof.",
    "Page does not clearly answer enough who, what, where, when, why, and how questions.": "Add direct answers for who the page helps, what is offered, where it is available, when to act, why to choose the business, and how the process works.",
    "Page needs a concise answer block near the top.": "Add a 40-70 word summary answer immediately below the H1.",
    "Page needs buyer-focused FAQs.": "Add 4-8 FAQs based on real customer questions and mark them up with FAQPage schema when appropriate.",
    "Service or product entity is not clear enough.": "Name the exact service repeatedly but naturally in the H1, intro, headings, schema, and CTA.",
    "Local city, neighborhood, or service-area clarity is weak.": "Add service-area copy with city, neighborhoods, nearby areas, and local proof.",
    "Business entity signals are weak or hard to extract.": "Add crawlable business name, phone, address/service area, and sameAs links.",
    "Page needs more trust proof such as reviews, credentials, case studies, or project examples.": "Add review snippets, credentials, before/after examples, project notes, or case studies.",
    "Page needs more specific schema for AEO/GEO understanding.": "Add LocalBusiness, Service, FAQPage, BreadcrumbList, and industry-specific schema where relevant.",
    "Page needs citation-worthy details, source-style claims, or useful external references.": "Add original facts, expert notes, updated dates, citations, or references that answer engines can trust.",
    "Many images are missing alt text, reducing semantic clarity.": "Write descriptive image alt text that identifies the service, equipment, location, or proof shown."
  };
  return tips[gap] ?? gap;
}

function buildMissingQuestions(input: AuditInput, text: string): string[] {
  const questions = [
    ["What does this company do?", QUESTION_PATTERNS.what],
    ["Where does this company serve?", QUESTION_PATTERNS.where],
    [`How much does ${input.targetServiceOrProduct ?? "this service"} cost?`, INTENT_PATTERNS.pricing],
    ["When should someone call?", QUESTION_PATTERNS.when],
    ["What makes this business different?", QUESTION_PATTERNS.why],
    ["What should customers expect during the process?", QUESTION_PATTERNS.how],
    ["Is emergency or same-day service available?", INTENT_PATTERNS.emergency]
  ] as const;

  return questions.filter(([, pattern]) => !pattern.test(text)).map(([question]) => question).slice(0, 6);
}

function buildRecommendedBlocks(input: AuditInput, page: PageAudit, gaps: string[]): string[] {
  const blocks: string[] = [];
  if (gaps.some((gap) => gap.includes("answer block"))) {
    blocks.push(`Short answer block: "${page.title ?? input.businessName ?? "This business"} helps ${input.targetAudience ?? "customers"} with ${input.targetServiceOrProduct ?? "the service"}${input.city ? ` in ${input.city}` : ""}. Explain the outcome, service area, proof, and next step in 2-3 plain-English sentences."`);
  }
  if (gaps.some((gap) => gap.includes("FAQs") || gap.includes("who, what"))) {
    blocks.push("FAQ block: Add questions for cost, timing, service area, process, emergency availability, and why customers choose the business.");
  }
  if (gaps.some((gap) => gap.includes("trust proof"))) {
    blocks.push("Proof block: Add reviews, licenses, certifications, years in business, project examples, or before/after details.");
  }
  if (gaps.some((gap) => gap.includes("schema"))) {
    blocks.push("Schema block: Add JSON-LD for LocalBusiness/Organization, Service, FAQPage, and BreadcrumbList.");
  }
  if (gaps.some((gap) => gap.includes("Local"))) {
    blocks.push("Local block: Add city/service-area details, neighborhoods served, local project examples, and GBP-aligned NAP.");
  }
  if (gaps.some((gap) => gap.includes("citation-worthy"))) {
    blocks.push("Citation block: Add expert explanations, updated dates, source-style claims, original observations, or references.");
  }
  return blocks;
}

function score(items: Array<[boolean, number]>): number {
  const possible = items.reduce((sum, [, points]) => sum + points, 0);
  const earned = items.reduce((sum, [ok, points]) => sum + (ok ? points : 0), 0);
  return Math.round((earned / possible) * 100);
}

function countMatches(patterns: Record<string, RegExp>, text: string): number {
  return Object.values(patterns).filter((pattern) => pattern.test(text)).length;
}

function isLocalBusiness(input: AuditInput): boolean {
  return Boolean(input.city || input.state || input.googleBusinessProfileUrl || /plumb|hvac|roof|dent|med spa|restaurant|attorney|contractor|home service/i.test(input.industry ?? ""));
}

function shortUrl(url: string): string {
  const parsed = new URL(url);
  return parsed.pathname === "/" ? parsed.hostname : parsed.pathname;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
