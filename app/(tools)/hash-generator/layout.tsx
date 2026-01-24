import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hash Generator - MD5, SHA-1, SHA-256, SHA-512",
  description:
    "Generate cryptographic hashes from text using MD5, SHA-1, SHA-256, SHA-384, and SHA-512 algorithms. Privacy-first — all processing happens in your browser.",
  keywords: [
    "hash generator",
    "md5",
    "sha1",
    "sha256",
    "sha512",
    "sha384",
    "cryptographic hash",
    "checksum",
    "hash calculator",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "Hash Generator - LocalForge",
    description:
      "Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text instantly.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hash Generator - LocalForge",
    description: "Generate cryptographic hashes from text in your browser",
  },
};

const HashGeneratorLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default HashGeneratorLayout;
