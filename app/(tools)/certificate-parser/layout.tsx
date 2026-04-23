import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificate Parser",
  description:
    "Inspect PEM X.509 certificates locally in your browser. Decode subject, issuer, SANs, validity, key usage, and fingerprints without uploading certs.",
  keywords: [
    "certificate parser",
    "x509",
    "pem certificate",
    "tls certificate",
    "ssl certificate",
    "certificate inspector",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "Certificate Parser - LocalForge",
    description:
      "Inspect X.509 certificates locally with SANs, validity, key usage, and fingerprints.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Certificate Parser - LocalForge",
    description: "Privacy-first X.509 certificate inspector",
  },
};

const CertificateParserLayout = ({ children }: { children: React.ReactNode }) =>
  children;

export default CertificateParserLayout;
