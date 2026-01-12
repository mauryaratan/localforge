import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <svg
      fill="none"
      height="32"
      viewBox="0 0 32 32"
      width="32"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect
        fill="#0d9488"
        fillOpacity="0.15"
        height="24"
        rx="4"
        stroke="#0d9488"
        strokeWidth="1.5"
        width="28"
        x="2"
        y="4"
      />
      {/* Left bracket */}
      <path
        d="M8 10L12 16L8 22"
        stroke="#0d9488"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      {/* Underscore cursor */}
      <path
        d="M14 22H20"
        stroke="#0d9488"
        strokeLinecap="round"
        strokeWidth="2"
      />
      {/* Privacy dot indicator */}
      <circle cx="24" cy="10" fill="#0d9488" r="3" />
    </svg>,
    {
      ...size,
    }
  );
}
