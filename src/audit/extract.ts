import * as cheerio from "cheerio";
import type { ExtractedSchema, PageAudit } from "./types.js";

const PHONE_RE = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const TRUST_WORDS = ["licensed", "insured", "certified", "award", "warranty", "guarantee", "case study", "years in business", "privacy policy", "terms"];
const REVIEW_WORDS = ["review", "rating", "stars", "google reviews", "yelp", "bbb"];
const CTA_WORDS = ["contact", "book", "schedule", "call", "quote", "demo", "buy", "start", "request"];
const SOCIAL_HOSTS = ["facebook.com", "linkedin.com", "instagram.com", "youtube.com", "x.com", "twitter.com", "tiktok.com"];

export function extractPage(url: string, html: string, statusCode: number, responseMs: number, bytes: number): PageAudit {
  const $ = cheerio.load(html);
  const text = normalizeText($("body").text());
  const links = $("a[href]").map((_, el) => new URL($(el).attr("href")!, url).toString()).get();
  const origin = new URL(url).origin;
  const internalLinks = [...new Set(links.filter((link) => new URL(link).origin === origin))];
  const externalLinks = [...new Set(links.filter((link) => new URL(link).origin !== origin))];
  const images = $("img").length;
  const imagesMissingAlt = $("img").filter((_, el) => !$(el).attr("alt")?.trim()).length;
  const lower = text.toLowerCase();

  return {
    url,
    statusCode,
    title: normalizeText($("title").first().text()) || undefined,
    metaDescription: $("meta[name='description']").attr("content")?.trim(),
    canonical: $("link[rel='canonical']").attr("href"),
    h1: $("h1").map((_, el) => normalizeText($(el).text())).get().filter(Boolean),
    h2: $("h2").map((_, el) => normalizeText($(el).text())).get().filter(Boolean),
    h3: $("h3").map((_, el) => normalizeText($(el).text())).get().filter(Boolean),
    wordCount: text ? text.split(/\s+/).length : 0,
    noindex: /noindex/i.test($("meta[name='robots']").attr("content") ?? ""),
    lang: $("html").attr("lang"),
    viewport: $("meta[name='viewport']").length > 0,
    openGraph: $("meta[property^='og:']").length > 0,
    twitterCard: $("meta[name^='twitter:']").length > 0,
    favicon: $("link[rel*='icon']").length > 0,
    internalLinks,
    externalLinks,
    images,
    imagesMissingAlt,
    schema: extractSchema($),
    phoneNumbers: [...new Set(text.match(PHONE_RE) ?? [])],
    emails: [...new Set(text.match(EMAIL_RE) ?? [])],
    addressSignals: extractAddressSignals(text),
    socialLinks: externalLinks.filter((link) => SOCIAL_HOSTS.some((host) => link.includes(host))),
    faqCount: countFaqs($, text),
    reviewSignals: REVIEW_WORDS.filter((word) => lower.includes(word)),
    testimonialSignals: lower.includes("testimonial") ? ["Testimonials mentioned"] : [],
    serviceSignals: extractServiceSignals($, text),
    locationMentions: extractLocationMentions(text),
    ctaSignals: CTA_WORDS.filter((word) => lower.includes(word)),
    trustSignals: TRUST_WORDS.filter((word) => lower.includes(word)),
    forms: $("form").length,
    embeddedMaps: $("iframe[src*='google.com/maps'], iframe[src*='maps.google']").length,
    bodyTextSample: text.slice(0, 4000),
    responseMs,
    bytes
  };
}

function extractSchema($: cheerio.CheerioAPI): ExtractedSchema[] {
  const jsonLd = $("script[type='application/ld+json']").map((_, el) => $(el).text()).get();
  const parsed: ExtractedSchema[] = jsonLd.map((raw) => {
    try {
      const data = JSON.parse(raw);
      const type = Array.isArray(data) ? data.map((item) => item["@type"]).filter(Boolean).join(", ") : data["@type"] ?? "Unknown";
      return { type: String(type), valid: true, data };
    } catch (error) {
      return { type: "Malformed JSON-LD", valid: false, error: error instanceof Error ? error.message : "Invalid JSON-LD" };
    }
  });

  if ($("[itemscope]").length > 0) parsed.push({ type: "Microdata", valid: true });
  if ($("[typeof], [property^='schema:']").length > 0) parsed.push({ type: "RDFa", valid: true });
  return parsed;
}

function countFaqs($: cheerio.CheerioAPI, text: string): number {
  const schemaFaqs = $("script[type='application/ld+json']").text().match(/FAQPage/gi)?.length ?? 0;
  const questionHeadings = $("h2,h3,h4").filter((_, el) => /\?/.test($(el).text())).length;
  const textQuestions = text.match(/\b(who|what|where|when|why|how|can|does|is|are)\b[^.?!]{10,120}\?/gi)?.length ?? 0;
  return schemaFaqs + questionHeadings + textQuestions;
}

function extractAddressSignals(text: string): string[] {
  const matches = text.match(/\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g) ?? [];
  return [...new Set(matches)].slice(0, 10);
}

function extractServiceSignals($: cheerio.CheerioAPI, text: string): string[] {
  const headings = $("h1,h2,h3").map((_, el) => normalizeText($(el).text())).get();
  return headings.filter((heading) => /service|solution|repair|installation|consulting|platform|product|pricing/i.test(heading)).slice(0, 20);
}

function extractLocationMentions(text: string): string[] {
  const matches = text.match(/\b[A-Z][a-z]+,\s+[A-Z]{2}\b/g) ?? [];
  return [...new Set(matches)].slice(0, 20);
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
