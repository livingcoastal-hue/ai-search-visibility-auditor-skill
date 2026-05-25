export interface IndustryTemplate {
  industry: string;
  missingPages: string[];
  faqIdeas: string[];
  schemaTypes: string[];
  localSignals: string[];
}

export const industryTemplates: IndustryTemplate[] = [
  {
    industry: "Plumbing",
    missingPages: ["Emergency plumbing", "Drain cleaning", "Water heaters", "Tankless water heaters", "Leak detection", "Sewer line repair", "Commercial plumbing", "Backflow testing", "Service area pages", "Pricing guide", "FAQ hub", "Maintenance guide", "Reviews page", "Financing page"],
    faqIdeas: ["How fast can an emergency plumber arrive?", "How much does leak detection cost?", "When should I replace a water heater?", "Do you serve my neighborhood?"],
    schemaTypes: ["LocalBusiness", "Plumber", "Service", "FAQPage", "Review", "BreadcrumbList"],
    localSignals: ["City-specific service sections", "Service-area schema", "Local reviews", "Emergency intent copy", "Project examples by city"]
  },
  {
    industry: "HVAC",
    missingPages: ["AC repair", "Furnace repair", "Heat pump installation", "Maintenance plans", "Indoor air quality", "Emergency HVAC", "Financing", "Service areas"],
    faqIdeas: ["How much does HVAC repair cost?", "When should I replace my AC?", "Do you offer emergency HVAC service?", "What brands do you service?"],
    schemaTypes: ["HVACBusiness", "LocalBusiness", "Service", "FAQPage"],
    localSignals: ["Seasonal service pages", "Neighborhood coverage", "Technician credentials", "Review snippets"]
  },
  {
    industry: "SaaS",
    missingPages: ["Use cases", "Features", "Integrations", "Pricing", "Security", "Case studies", "Comparison pages", "Alternatives pages", "API docs", "Customer stories", "FAQ", "Knowledge base"],
    faqIdeas: ["Who is this product for?", "What integrations are supported?", "How is data secured?", "How does pricing work?"],
    schemaTypes: ["SoftwareApplication", "Product", "Organization", "FAQPage", "Article", "BreadcrumbList"],
    localSignals: ["Not usually local-first; focus on entity, category, use case, and integration clarity"]
  },
  {
    industry: "Marketing agency",
    missingPages: ["Services", "Case studies", "Industries", "Pricing approach", "Process", "Results", "Testimonials", "Tools", "FAQ", "Local landing pages"],
    faqIdeas: ["What results can clients expect?", "How long does SEO take?", "What industries do you serve?", "How are campaigns reported?"],
    schemaTypes: ["ProfessionalService", "Organization", "Service", "FAQPage", "Review"],
    localSignals: ["Client proof by vertical", "Local business examples", "Founder/team expertise"]
  },
  {
    industry: "Ecommerce",
    missingPages: ["Category guides", "Product comparison pages", "Buying guides", "Shipping policy", "Returns", "Warranty", "Reviews", "FAQ"],
    faqIdeas: ["Which product is best for my use case?", "How long does shipping take?", "What is the return policy?", "How do I compare these products?"],
    schemaTypes: ["Product", "Offer", "AggregateRating", "Review", "BreadcrumbList", "FAQPage"],
    localSignals: ["Local pickup and store location details when relevant"]
  }
];

export const starterIndustries = [
  "Plumbing",
  "HVAC",
  "Roofing",
  "Legal",
  "Dental",
  "Medical spa",
  "Real estate",
  "Marketing agency",
  "SaaS",
  "Ecommerce",
  "Environmental cleanup",
  "Automotive",
  "Restaurant",
  "Home services",
  "Financial services",
  "Consulting"
];

export function findIndustryTemplate(industry?: string): IndustryTemplate | undefined {
  if (!industry) return undefined;
  return industryTemplates.find((template) => industry.toLowerCase().includes(template.industry.toLowerCase()));
}
