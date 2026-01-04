import type { MetadataRoute } from "next";
import { navItems } from "@/lib/nav-items";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://localforge.dev";

  const toolPages = navItems.map((item) => ({
    url: `${baseUrl}${item.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolPages,
  ];
}
