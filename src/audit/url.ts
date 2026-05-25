import { assertPublicHttpUrl } from "../security/ssrf.js";
import type { UrlResolution } from "./types.js";

export function normalizeUrl(input: string): string {
  const withProtocol = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
  const url = new URL(withProtocol);
  url.hash = "";
  return url.toString();
}

export async function resolveUrl(inputUrl: string, timeoutMs: number): Promise<UrlResolution> {
  const normalizedUrl = normalizeUrl(inputUrl);
  await assertPublicHttpUrl(normalizedUrl);
  const redirectChain: string[] = [];
  let current = normalizedUrl;

  try {
    for (let i = 0; i < 6; i += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": "AI-Search-Visibility-Auditor/0.1" }
      });
      clearTimeout(timer);

      redirectChain.push(current);
      if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
        current = new URL(response.headers.get("location")!, current).toString();
        await assertPublicHttpUrl(current);
        continue;
      }

      return {
        inputUrl,
        normalizedUrl,
        finalUrl: current,
        redirectChain,
        statusCode: response.status
      };
    }

    return {
      inputUrl,
      normalizedUrl,
      finalUrl: current,
      redirectChain,
      error: "Redirect chain exceeded the safe limit."
    };
  } catch (error) {
    return {
      inputUrl,
      normalizedUrl,
      redirectChain,
      error: error instanceof Error ? error.message : "Unable to resolve URL."
    };
  }
}
