import { fetchText } from "./fetch.js";
import type { SitemapAudit } from "./types.js";

const COMMON_SITEMAPS = ["/sitemap.xml", "/sitemap_index.xml", "/post-sitemap.xml", "/page-sitemap.xml", "/sitemap.txt"];

export async function auditSitemap(finalUrl: string, robotsSitemaps: string[], timeoutMs: number): Promise<SitemapAudit> {
  const origin = new URL(finalUrl).origin;
  const checkedUrls = [...new Set([...robotsSitemaps, ...COMMON_SITEMAPS.map((path) => new URL(path, origin).toString())])];
  const discoveredUrls: string[] = [];
  let hasLastmod = false;

  for (const url of checkedUrls) {
    try {
      const response = await fetchText(url, timeoutMs, 2_000_000);
      if (response.statusCode >= 400) continue;

      if (url.endsWith(".txt")) {
        discoveredUrls.push(...response.text.split(/\r?\n/).filter((line) => /^https?:\/\//i.test(line.trim())));
      } else {
        const locs = [...response.text.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => match[1].trim());
        discoveredUrls.push(...locs);
        hasLastmod ||= /<lastmod>/i.test(response.text);
      }
    } catch {
      continue;
    }
  }

  const uniqueUrls = [...new Set(discoveredUrls)];
  const recommendations: string[] = [];
  if (uniqueUrls.length === 0) recommendations.push("No usable sitemap was found. Add an XML sitemap and reference it in robots.txt.");
  if (uniqueUrls.length > 0 && !hasLastmod) recommendations.push("The sitemap does not appear to use lastmod dates. Add accurate update dates for important pages.");

  return {
    exists: uniqueUrls.length > 0,
    checkedUrls,
    discoveredUrls: uniqueUrls,
    pageCount: uniqueUrls.length,
    hasLastmod,
    recommendations
  };
}
