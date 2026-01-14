export function buildEndpoint(origin: string, apiKey: string, tabName: string) {
  const baseUrl = origin.replace(/\/+$/, "");
  const slug = encodeURIComponent(tabName.trim().toLowerCase().replace(/\s+/g, "-"));
  return `${baseUrl}/api/${apiKey}/${slug}`;
}
