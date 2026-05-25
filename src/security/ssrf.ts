import dns from "node:dns/promises";
import net from "node:net";

const PRIVATE_V4 = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^0\./
];

export function isPrivateIp(ip: string): boolean {
  if (net.isIP(ip) === 4) return PRIVATE_V4.some((pattern) => pattern.test(ip));
  if (net.isIP(ip) === 6) {
    const normalized = ip.toLowerCase();
    return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
  }
  return false;
}

export async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs can be audited.");
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error("Local and private hostnames cannot be crawled.");
  }

  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error("Private IP addresses cannot be crawled.");
  }

  const records = await dns.lookup(hostname, { all: true });
  if (records.some((record) => isPrivateIp(record.address))) {
    throw new Error("The hostname resolves to a private network address.");
  }

  return url;
}
