import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect
          x="2"
          y="4"
          width="28"
          height="24"
          rx="4"
          fill="#0d9488"
          fillOpacity="0.15"
          stroke="#0d9488"
          strokeWidth="1.5"
        />
        {/* Left bracket */}
        <path
          d="M8 10L12 16L8 22"
          stroke="#0d9488"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Underscore cursor */}
        <path
          d="M14 22H20"
          stroke="#0d9488"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Privacy dot indicator */}
        <circle cx="24" cy="10" r="3" fill="#0d9488" />
      </svg>
    ),
    {
      ...size,
    }
  );
}
