export interface FetchTextResult {
  url: string;
  statusCode: number;
  text: string;
  responseMs: number;
  bytes: number;
  contentType: string;
}

export async function fetchText(url: string, timeoutMs: number, maxBytes = 2_500_000): Promise<FetchTextResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: { "user-agent": "AI-Search-Visibility-Auditor/0.1" }
  });
  clearTimeout(timer);

  const arrayBuffer = await response.arrayBuffer();
  const bytes = arrayBuffer.byteLength;
  if (bytes > maxBytes) {
    throw new Error(`Response exceeded size limit of ${maxBytes} bytes.`);
  }

  return {
    url,
    statusCode: response.status,
    text: new TextDecoder().decode(arrayBuffer),
    responseMs: Date.now() - started,
    bytes,
    contentType: response.headers.get("content-type") ?? ""
  };
}
