import type { MetadataRoute } from "next";
import { navItems } from "@/lib/nav-items";

const DEFAULT_SITE_URL = "https://localforge.app";

export const siteConfig = {
  name: "LocalForge",
  title: "LocalForge — Privacy-First Developer Utilities",
  description:
    "Privacy-first developer utilities that run entirely in your browser. Format JSON, encode/decode Base64, parse URLs, generate UUIDs, and more — your data never leaves your device.",
  creator: "LocalForge Contributors",
  keywords: [
    "developer tools",
    "localforge",
    "json formatter",
    "base64 encoder",
    "url parser",
    "uuid generator",
    "regex tester",
    "color converter",
    "cron parser",
    "offline tools",
    "privacy tools",
    "local-first",
    "pwa",
    "web tools",
  ],
  ogImage: "/og.jpg",
  xHandle: "@localforge",
  themeColor: {
    light: "#ffffff",
    dark: "#171717",
  },
  url: DEFAULT_SITE_URL,
} as const;

export const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

export const buildManifest = (): MetadataRoute.Manifest => ({
  name: siteConfig.name,
  short_name: siteConfig.name,
  description: siteConfig.description,
  start_url: "/",
  display: "standalone",
  background_color: siteConfig.themeColor.dark,
  theme_color: siteConfig.themeColor.dark,
  orientation: "any",
  categories: ["developer", "productivity", "utilities"],
  icons: [
    {
      src: "/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
  ],
});

export const buildRobots = (siteUrl = getSiteUrl()): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
  },
  sitemap: `${siteUrl}/sitemap.xml`,
});

export const buildSitemap = (
  siteUrl = getSiteUrl(),
  lastModified = new Date()
): MetadataRoute.Sitemap => {
  const toolPages = navItems.map((item) => ({
    url: `${siteUrl}${item.href}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolPages,
  ];
};
