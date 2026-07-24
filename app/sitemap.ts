import type { MetadataRoute } from "next"

const baseUrl = "https://keepel.chemicaldev.com"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-07-22"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date("2026-07-22"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]
}
