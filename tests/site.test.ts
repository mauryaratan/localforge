import { describe, expect, it } from "vitest";
import { navItems } from "@/lib/nav-items";
import {
  buildManifest,
  buildRobots,
  buildSitemap,
  siteConfig,
} from "@/lib/site";

describe("site metadata helpers", () => {
  it("builds a manifest with the shared site copy", () => {
    const manifest = buildManifest();

    expect(manifest.name).toBe(siteConfig.name);
    expect(manifest.description).toBe(siteConfig.description);
    expect(manifest.icons).toHaveLength(2);
  });

  it("builds robots with the current sitemap URL", () => {
    const robots = buildRobots("https://example.com");

    expect(robots.rules).toEqual({
      userAgent: "*",
      allow: "/",
    });
    expect(robots.sitemap).toBe("https://example.com/sitemap.xml");
  });

  it("builds a sitemap for the homepage and every tool route", () => {
    const lastModified = new Date("2026-03-16T00:00:00.000Z");
    const sitemap = buildSitemap("https://example.com", lastModified);

    expect(sitemap).toHaveLength(navItems.length + 1);
    expect(sitemap[0]).toEqual({
      url: "https://example.com",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    });
    expect(sitemap[1]?.url).toBe(`https://example.com${navItems[0]?.href}`);
    expect(sitemap.at(-1)?.url).toBe(
      `https://example.com${navItems.at(-1)?.href}`
    );
  });
});
