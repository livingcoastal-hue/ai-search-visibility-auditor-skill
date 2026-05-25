import { describe, expect, it } from "vitest";
import { auditPageContentReadiness } from "../src/audit/contentReadiness.js";
import type { PageAudit } from "../src/audit/types.js";

const basePage: PageAudit = {
  url: "https://example.com/service",
  statusCode: 200,
  title: "Emergency Plumbing in Atlanta",
  metaDescription: "Emergency plumbing in Atlanta.",
  canonical: "https://example.com/service",
  h1: ["Emergency Plumbing in Atlanta"],
  h2: ["What We Do", "How It Works", "Why Choose Us", "Pricing Factors"],
  h3: [],
  wordCount: 1200,
  noindex: false,
  viewport: true,
  openGraph: true,
  twitterCard: false,
  favicon: true,
  internalLinks: [],
  externalLinks: ["https://www.example.org/source"],
  images: 2,
  imagesMissingAlt: 0,
  schema: [{ type: "Service", valid: true }, { type: "FAQPage", valid: true }],
  phoneNumbers: ["404-555-1212"],
  emails: [],
  addressSignals: ["GA 30301"],
  socialLinks: [],
  faqCount: 5,
  reviewSignals: ["review"],
  testimonialSignals: [],
  serviceSignals: ["Emergency Plumbing Services"],
  locationMentions: ["Atlanta, GA"],
  ctaSignals: ["call", "quote"],
  trustSignals: ["licensed", "insured"],
  forms: 1,
  embeddedMaps: 0,
  bodyTextSample: "We provide emergency plumbing in Atlanta. What should you do when a pipe bursts? Call us for same day help. Our process starts with diagnosis and a clear estimate. Pricing depends on access, parts, and timing. We are licensed and insured with customer reviews. According to our field experience, fast shutoff reduces water damage.",
  responseMs: 300,
  bytes: 20000
};

describe("page content readiness", () => {
  it("scores strong AEO and GEO pages highly", () => {
    const [audit] = auditPageContentReadiness({ url: "https://example.com", industry: "Plumbing", city: "Atlanta", state: "GA" }, [basePage]);

    expect(audit.aeoScore).toBeGreaterThanOrEqual(80);
    expect(audit.geoScore).toBeGreaterThanOrEqual(80);
    expect(audit.gaps.length).toBeLessThan(3);
  });

  it("flags thin pages with missing answer structure", () => {
    const thinPage = {
      ...basePage,
      h1: [],
      h2: [],
      wordCount: 120,
      faqCount: 0,
      schema: [],
      trustSignals: [],
      reviewSignals: [],
      serviceSignals: [],
      locationMentions: [],
      bodyTextSample: "Welcome to our website. We do great work. Contact us today."
    };
    const [audit] = auditPageContentReadiness({ url: "https://example.com", industry: "Plumbing", city: "Atlanta", state: "GA" }, [thinPage]);

    expect(audit.answerReadinessScore).toBeLessThan(50);
    expect(audit.gaps).toContain("Page needs a concise answer block near the top.");
    expect(audit.recommendedBlocks.length).toBeGreaterThan(0);
  });
});
