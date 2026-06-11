import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { navItems } from "@/lib/nav-items";
import {
  buildManifest,
  buildRobots,
  buildSitemap,
  siteConfig,
} from "@/lib/site";

const toolsDirectory = path.join(process.cwd(), "app", "(tools)");
const LEADING_SLASH_REGEX = /^\//;

describe("site metadata helpers", () => {
  it("builds a manifest with the shared site copy", () => {
    const manifest = buildManifest();

    expect(manifest.name).toBe(siteConfig.name);
    expect(manifest.description).toBe(siteConfig.description);
    expect(manifest.icons).toHaveLength(2);
  });

  it("manifest shortcuts are present and every URL matches a navItems href", () => {
    const manifest = buildManifest();
    const navHrefs = new Set(navItems.map((item) => item.href));
    const shortcuts = manifest.shortcuts ?? [];

    expect(shortcuts.length).toBeGreaterThan(0);

    for (const shortcut of shortcuts) {
      expect(
        navHrefs.has(shortcut.url),
        `shortcut URL "${shortcut.url}" is not present in navItems`
      ).toBe(true);
    }
  });

  it("manifest shortcuts all carry icons", () => {
    const manifest = buildManifest();
    const shortcuts = manifest.shortcuts ?? [];

    expect(shortcuts.length).toBeGreaterThan(0);

    for (const shortcut of shortcuts) {
      const icons = shortcut.icons ?? [];
      expect(
        icons.length,
        `shortcut "${shortcut.name}" is missing icons`
      ).toBeGreaterThan(0);
    }
  });

  it("manifest file_handlers targets /image-compressor and accepts image/png and image/jpeg", () => {
    const manifest = buildManifest();
    const handlers = manifest.file_handlers ?? [];

    expect(handlers.length).toBeGreaterThan(0);

    const imageHandler = handlers.find((h) => h.action === "/image-compressor");
    expect(
      imageHandler,
      "no file_handler with action /image-compressor found"
    ).toBeDefined();
    expect(imageHandler?.accept["image/png"]).toBeDefined();
    expect(imageHandler?.accept["image/jpeg"]).toBeDefined();
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

  it("keeps nav items in sync with tool route folders", () => {
    const toolFolders = readdirSync(toolsDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    const navRoutes = navItems
      .map((item) => item.href.replace(LEADING_SLASH_REGEX, ""))
      .sort();

    expect(navRoutes).toEqual(toolFolders);
  });

  it("has a page and layout for every tool route", () => {
    for (const item of navItems) {
      const routeName = item.href.replace(LEADING_SLASH_REGEX, "");
      const routeDirectory = path.join(toolsDirectory, routeName);

      expect(
        existsSync(path.join(routeDirectory, "page.tsx")),
        `${item.href} is missing page.tsx`
      ).toBe(true);
      expect(
        existsSync(path.join(routeDirectory, "layout.tsx")),
        `${item.href} is missing layout.tsx`
      ).toBe(true);
    }
  });
});
