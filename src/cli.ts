import { Command } from "commander";
import { runAudit } from "./audit/runAudit.js";
import { writeReportFiles } from "./report/report.js";

const program = new Command();

program
  .name("ai-search-visibility-auditor")
  .requiredOption("--url <url>", "Website URL to audit")
  .option("--business-name <name>", "Business name")
  .option("--industry <industry>", "Industry")
  .option("--city <city>", "City")
  .option("--state <state>", "State")
  .option("--country <country>", "Country")
  .option("--service <service>", "Target service or product")
  .option("--audience <audience>", "Target audience")
  .option("--competitors <urls>", "Comma-separated competitor URLs")
  .option("--keywords <keywords>", "Comma-separated main keywords")
  .option("--gbp <url>", "Google Business Profile URL")
  .option("--max-pages <number>", "Maximum pages to crawl", "25")
  .option("--out <dir>", "Output directory", "out");

program.parse(process.argv);
const options = program.opts();

const result = await runAudit({
  url: options.url,
  businessName: options.businessName,
  industry: options.industry,
  city: options.city,
  state: options.state,
  country: options.country,
  targetServiceOrProduct: options.service,
  targetAudience: options.audience,
  competitorUrls: options.competitors ? String(options.competitors).split(",").map((url) => url.trim()).filter(Boolean) : [],
  googleBusinessProfileUrl: options.gbp,
  mainKeywords: options.keywords ? String(options.keywords).split(",").map((keyword) => keyword.trim()).filter(Boolean) : [],
  maxPages: Number(options.maxPages)
});

await writeReportFiles(result, options.out);

console.log(`AI Search Visibility Score: ${result.scores.overall}/100 (${result.scoreLabel})`);
console.log(`Crawled pages: ${result.pages.length}`);
console.log(`Recommendations: ${result.recommendations.length}`);
console.log(`Reports written to: ${options.out}`);
