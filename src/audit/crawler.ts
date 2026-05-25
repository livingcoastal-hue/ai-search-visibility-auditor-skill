import robotsParser from "robots-parser";
import { assertPublicHttpUrl } from "../security/ssrf.js";
import { fetchText } from "./fetch.js";
import { extractPage } from "./extract.js";
import type { PageAudit, RobotsAudit } from "./types.js";

export async function crawlSite(finalUrl: string, robots: RobotsAudit, sitemapUrls: string[], maxPages: number, timeoutMs: number): Promise<PageAudit[]> {
  const origin = new URL(finalUrl).origin;
  const robotsRules = robots.raw ? robotsParser(robots.url, robots.raw) : undefined;
  const queue = [...new Set([finalUrl, ...sitemapUrls.filter((url) => safeSameOrigin(url, origin)).slice(0, Math.max(0, maxPages - 1))])];
  const visited = new Set<string>();
  const pages: PageAudit[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const next = queue.shift()!;
    if (visited.has(next)) continue;
    visited.add(next);

    try {
      await assertPublicHttpUrl(next);
      if (robotsRules && robotsRules.isAllowed(next, "AI-Search-Visibility-Auditor") === false) continue;

      const response = await fetchText(next, timeoutMs);
      if (!response.contentType.includes("text/html") || response.statusCode >= 400) continue;

      const page = extractPage(next, response.text, response.statusCode, response.responseMs, response.bytes);
      pages.push(page);

      for (const link of page.internalLinks) {
        const clean = stripUrl(link);
        if (safeSameOrigin(clean, origin) && !visited.has(clean) && queue.length < maxPages * 4) queue.push(clean);
      }
    } catch {
      continue;
    }
  }

  return pages;
}

function safeSameOrigin(url: string, origin: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.origin === origin && !/\.(pdf|jpg|jpeg|png|gif|webp|zip|docx?|xlsx?)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

function stripUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.toString();
}
