import robotsParser from "robots-parser";
import { fetchText } from "./fetch.js";
import type { RobotsAudit } from "./types.js";

const AI_BOTS = ["Googlebot", "Bingbot", "OAI-SearchBot", "GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Applebot"];

export async function auditRobots(finalUrl: string, timeoutMs: number): Promise<RobotsAudit> {
  const robotsUrl = new URL("/robots.txt", finalUrl).toString();
  try {
    const response = await fetchText(robotsUrl, timeoutMs, 500_000);
    if (response.statusCode >= 400) {
      return missingRobots(robotsUrl);
    }

    const parser = robotsParser(robotsUrl, response.text);
    const botAccess = Object.fromEntries(AI_BOTS.map((bot) => [bot, parser.isAllowed(finalUrl, bot) !== false]));
    const riskyLines = response.text
      .split(/\r?\n/)
      .filter((line) => /disallow\s*:\s*\/|user-agent\s*:\s*(oai-searchbot|gptbot|chatgpt-user|perplexitybot|claudebot|googlebot|bingbot)/i.test(line.trim()));

    const recommendations: string[] = [];
    if (!botAccess.Googlebot) recommendations.push("Googlebot appears blocked. Review this immediately because it can limit traditional search and AI Overview eligibility.");
    if (!botAccess.Bingbot) recommendations.push("Bingbot appears blocked. Review this because Bing powers several Microsoft search and assistant experiences.");
    if (!botAccess["OAI-SearchBot"]) recommendations.push("OAI-SearchBot appears blocked. If ChatGPT Search visibility matters, consider allowing it for public marketing pages.");
    if (!botAccess.GPTBot) recommendations.push("GPTBot appears blocked. This may be intentional because GPTBot relates to training access, not the same purpose as ChatGPT Search crawling.");

    return {
      exists: true,
      url: robotsUrl,
      sitemapUrls: parser.getSitemaps(),
      botAccess,
      riskyLines,
      recommendations,
      raw: response.text
    };
  } catch {
    return missingRobots(robotsUrl);
  }
}

function missingRobots(url: string): RobotsAudit {
  return {
    exists: false,
    url,
    sitemapUrls: [],
    botAccess: Object.fromEntries(AI_BOTS.map((bot) => [bot, true])),
    riskyLines: [],
    recommendations: [
      "No robots.txt file was found. This is not always harmful, but adding one helps communicate sitemap locations and crawler policies clearly."
    ]
  };
}

export function recommendedRobotsSnippet(): string {
  return [
    "User-agent: Googlebot",
    "Allow: /",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "# GPTBot controls OpenAI training access, not just ChatGPT Search visibility.",
    "# Allow or disallow it based on your content licensing policy.",
    "User-agent: GPTBot",
    "Disallow:",
    "",
    "Sitemap: https://www.example.com/sitemap.xml"
  ].join("\n");
}
