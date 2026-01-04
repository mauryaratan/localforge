import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor - DevTools",
  description:
    "Compress PNG and JPEG images directly in your browser using high-performance WebAssembly. Supports lossy and lossless compression, image resizing, and real-time comparison. Zero uploads, complete privacy.",
  keywords: [
    "image compression",
    "png compressor",
    "jpeg compressor",
    "image optimizer",
    "wasm",
    "webassembly",
    "pixo",
    "browser compression",
    "lossless compression",
    "lossy compression",
    "image resize",
    "devtools",
    "developer tools",
  ],
  openGraph: {
    title: "Image Compressor - DevTools",
    description:
      "Compress PNG and JPEG images in your browser with WASM. No uploads needed, complete privacy.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Image Compressor - DevTools",
    description:
      "High-performance image compression using WebAssembly. Supports PNG and JPEG.",
  },
};

const ImageCompressorLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return children;
};

export default ImageCompressorLayout;
