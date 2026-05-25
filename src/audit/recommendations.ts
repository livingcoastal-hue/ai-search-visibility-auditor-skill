import type { AuditInput, PageAudit, Recommendation, RobotsAudit, SitemapAudit } from "./types.js";

export function buildRecommendations(input: AuditInput, robots: RobotsAudit, sitemap: SitemapAudit, pages: PageAudit[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const homepage = pages[0];
  const schemaTypes = pages.flatMap((page) => page.schema).map((schema) => schema.type).join(" ");
  const totalFaqs = pages.reduce((sum, page) => sum + page.faqCount, 0);

  if (!homepage) {
    recs.push(rec("Website could not be crawled", "Critical", "Do this now", "The audit could not access crawlable HTML.", "AI and search systems need accessible content before they can understand or cite the business.", "Confirm the site is online, not blocking standard crawlers, and returns HTML for the homepage.", "Check hosting, firewall, and robots settings.", "Hard", "1-3 hours"));
    return recs;
  }

  if (!robots.exists) recs.push(rec("Add a clear robots.txt file", "Medium", "Do this next", "A robots file helps communicate crawler policies and sitemap locations.", "Clear crawler instructions reduce ambiguity for search and AI discovery systems.", "Publish a robots.txt file with public page access rules and a sitemap declaration.", "Add `Sitemap: https://example.com/sitemap.xml` and explicit rules for major crawlers.", "Easy", "30 minutes"));
  if (!robots.botAccess.Googlebot || !robots.botAccess.Bingbot) recs.push(rec("Review blocked search crawlers", "Critical", "Do this now", "Googlebot or Bingbot appears blocked.", "Blocking primary search crawlers can reduce organic search and AI answer eligibility.", "Update robots.txt so public marketing pages can be crawled by Googlebot and Bingbot.", "Allow public pages while keeping admin, checkout, and private areas blocked.", "Moderate", "1 hour"));
  if (!robots.botAccess["OAI-SearchBot"]) recs.push(rec("Decide whether to allow OAI-SearchBot", "High", "Do this now", "OAI-SearchBot supports ChatGPT Search crawling.", "If ChatGPT Search visibility matters, blocking this bot may limit inclusion opportunities.", "Consider allowing OAI-SearchBot for public pages while keeping private or licensed content protected.", "Add a user-agent rule that allows public marketing and resource pages.", "Easy", "30 minutes"));
  if (!sitemap.exists) recs.push(rec("Create and submit an XML sitemap", "High", "Do this now", "No usable sitemap was discovered.", "A sitemap helps crawlers find important pages and understand the site structure.", "Generate an XML sitemap, include important service/product/location pages, and reference it in robots.txt.", "Use `/sitemap.xml` and include lastmod dates for key pages.", "Moderate", "1-2 hours"));
  if (homepage.noindex) recs.push(rec("Remove noindex from important public pages", "Critical", "Do this now", "The homepage appears to include a noindex directive.", "Noindex tells search systems not to index the page, which can block visibility.", "Remove noindex from public pages that should appear in search and AI answers.", "Keep noindex only on private, duplicate, or low-value pages.", "Easy", "15 minutes"));
  if (!homepage.title || homepage.title.length < 25) recs.push(rec("Improve the homepage title tag", "Medium", "Do this next", "The title tag is missing or too thin.", "Titles help crawlers and answer engines identify the page topic and business relevance.", "Write a clear title that includes the business, primary service, and market when relevant.", `${input.businessName ?? "Business Name"} | ${input.targetServiceOrProduct ?? "Primary Service"} ${input.city ? `in ${input.city}` : ""}`.trim(), "Easy", "20 minutes"));
  if (!homepage.metaDescription || homepage.metaDescription.length < 70) recs.push(rec("Write a stronger meta description", "Medium", "Do this next", "The meta description is missing or too short.", "A clear description reinforces what the business does and why the page is useful.", "Add a plain-English summary with service, audience, location, and trust proof.", "Describe the service, who it helps, where it is available, and why customers choose the business.", "Easy", "20 minutes"));
  if (!schemaTypes) recs.push(rec("Add structured data for entity clarity", "High", "Do this now", "No structured data was detected.", "Schema helps machines understand the business entity, services, locations, and content type.", "Add Organization, WebSite, Service, Breadcrumb, and LocalBusiness schema when relevant.", "Start with Organization and WebSite schema, then add Service or LocalBusiness schema.", "Moderate", "2-4 hours"));
  if (totalFaqs === 0) recs.push(rec("Add answer-ready FAQ sections", "High", "Do this next", "No meaningful FAQ content was detected.", "Answer engines rely on clear question-and-answer content for conversational queries.", "Add FAQs that answer real buyer questions about services, pricing factors, timing, trust, and location.", "What does this company do? Where does it serve? How much does the service cost? What should customers expect?", "Moderate", "2-3 hours"));
  if (!pages.some((page) => page.phoneNumbers.length || page.emails.length)) recs.push(rec("Make contact details easier to extract", "High", "Do this now", "No phone or email signal was detected in crawled pages.", "Contact details strengthen trust, local entity clarity, and conversion readiness.", "Add crawlable phone, email, and contact page information in text, not only inside images.", "Place NAP information in the footer, contact page, and LocalBusiness schema.", "Easy", "30 minutes"));
  if (!pages.some((page) => page.reviewSignals.length || page.testimonialSignals.length)) recs.push(rec("Add trust proof customers and AI systems can read", "High", "Do this next", "Reviews, testimonials, or proof signals were limited.", "Trust proof helps buyers decide and gives answer engines more confidence in recommendations.", "Add testimonials, review summaries, case studies, certifications, credentials, or customer results.", "Include specific outcomes, service context, city, and customer type where appropriate.", "Moderate", "2-5 hours"));
  if (!pages.some((page) => page.ctaSignals.length || page.forms > 0)) recs.push(rec("Strengthen conversion paths", "Medium", "Do this next", "Clear calls to action were limited.", "AI visibility only creates value if users can take the next step easily.", "Add clear CTAs for calls, quotes, demos, bookings, or consultations across key pages.", "Use action-oriented buttons such as Request a Quote, Schedule a Consultation, or Book Service.", "Easy", "1 hour"));

  return recs;
}

export function buildStrengths(pages: PageAudit[], robots: RobotsAudit, sitemap: SitemapAudit): string[] {
  const strengths: string[] = [];
  if (pages.length > 0) strengths.push(`Crawled ${pages.length} public page${pages.length === 1 ? "" : "s"} successfully.`);
  if (robots.exists) strengths.push("robots.txt is present and can be evaluated.");
  if (sitemap.exists) strengths.push(`A sitemap was discovered with ${sitemap.pageCount} URL${sitemap.pageCount === 1 ? "" : "s"}.`);
  if (pages.some((page) => page.schema.some((schema) => schema.valid))) strengths.push("Structured data is present on at least one crawled page.");
  if (pages.some((page) => page.faqCount > 0)) strengths.push("Some FAQ or question-style content was detected.");
  if (pages.some((page) => page.trustSignals.length > 0)) strengths.push("Trust signals are visible in the crawled content.");
  return strengths.length ? strengths : ["The site has a reachable starting point for improvement."];
}

function rec(title: string, severity: Recommendation["severity"], priority: Recommendation["priority"], whyItMatters: string, businessImpact: string, howToFix: string, example: string, estimatedDifficulty: Recommendation["estimatedDifficulty"], estimatedTime: string): Recommendation {
  return {
    title,
    severity,
    priority,
    whyItMatters,
    businessImpact,
    howToFix,
    estimatedDifficulty,
    estimatedTime,
    example,
    copyReadyRecommendation: `${title}: ${howToFix}`
  };
}
