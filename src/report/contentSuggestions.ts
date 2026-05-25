import type { AuditInput } from "../audit/types.js";
import { findIndustryTemplate } from "../data/industryTemplates.js";

export function generateContentSuggestions(input: AuditInput): string[] {
  const template = findIndustryTemplate(input.industry);
  const base = [
    "Add a short answer block near the top of each key service page that explains who the service is for, what problem it solves, where it is available, and what the next step is.",
    "Add FAQ sections written as natural customer questions, then mark them up with FAQPage schema when appropriate.",
    "Create comparison or decision-support content that helps buyers understand options, tradeoffs, cost factors, and timing.",
    "Add proof blocks with testimonials, reviews, certifications, case studies, or original examples."
  ];

  if (!template) return base;

  return [
    ...base,
    `Industry content gaps to consider for ${template.industry}: ${template.missingPages.slice(0, 8).join(", ")}.`,
    `Useful FAQ ideas: ${template.faqIdeas.join(" ")}`
  ];
}

export function generateLocalSuggestions(input: AuditInput): string[] {
  if (!input.city && !input.state && !input.googleBusinessProfileUrl) {
    return ["If the business serves local customers, add city, state, service area, phone, address, and Google Business Profile details to unlock local recommendations."];
  }

  return [
    "Build a city page strategy around real services, customer proof, FAQs, and service-area details rather than thin doorway pages.",
    "Add service-area schema and LocalBusiness schema with consistent NAP information.",
    "Create local FAQs that answer near me, emergency, pricing, timing, and service coverage questions.",
    "Add review snippets, local project examples, staff or technician proof, and careful driving/service-area context.",
    "Use a Google Business Profile checklist for categories, services, photos, posts, Q&A, reviews, hours, holiday hours, and UTM tracking."
  ];
}
