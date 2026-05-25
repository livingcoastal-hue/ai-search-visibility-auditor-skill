import type { AuditInput } from "../audit/types.js";

export function generateSchemaSuggestions(input: AuditInput): string[] {
  const businessName = input.businessName ?? "Business Name";
  const url = input.url;
  const city = input.city ?? "City";
  const state = input.state ?? "State";
  const service = input.targetServiceOrProduct ?? "Primary service";

  return [
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: businessName,
      url,
      logo: "https://www.example.com/logo.png",
      sameAs: ["https://www.linkedin.com/company/example"]
    }, null, 2),
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: businessName,
      url,
      telephone: "+1-000-000-0000",
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressRegion: state,
        addressCountry: input.country ?? "US"
      },
      areaServed: [city, state].filter(Boolean).join(", "),
      priceRange: "$$"
    }, null, 2),
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      name: service,
      provider: {
        "@type": "Organization",
        name: businessName
      },
      areaServed: input.city ? `${city}, ${state}` : undefined,
      serviceType: service
    }, null, 2)
  ];
}
