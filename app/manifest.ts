import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LocalForge — Privacy-First Developer Utilities",
    short_name: "LocalForge",
    description:
      "Privacy-first developer utilities that run entirely in your browser. Format JSON, encode/decode Base64, parse URLs, generate UUIDs, and more — your data never leaves your device.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
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
  };
}
