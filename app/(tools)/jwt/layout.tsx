import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Encoder & Decoder",
  description:
    "Decode, verify, and generate JSON Web Tokens (JWT) in your browser. Supports HS256, HS384, HS512 algorithms. View claims, verify signatures, and create new tokens securely.",
  keywords: [
    "jwt",
    "jwt decoder",
    "jwt encoder",
    "json web token",
    "jwt debugger",
    "jwt validator",
    "jwt signature",
    "hs256",
    "hs384",
    "hs512",
    "jwt claims",
    "token decoder",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "JWT Encoder & Decoder - LocalForge",
    description:
      "Decode, verify, and generate JSON Web Tokens. View claims, verify signatures, and create new tokens.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JWT Encoder & Decoder - LocalForge",
    description: "Decode, verify, and generate JSON Web Tokens securely in your browser",
  },
};

const JWTLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default JWTLayout;
