import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)",
        borderRadius: "22.5%",
      }}
    >
      <svg
        fill="none"
        height="120"
        viewBox="0 0 32 32"
        width="120"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect
          fill="#14b8a6"
          fillOpacity="0.2"
          height="24"
          rx="4"
          stroke="#14b8a6"
          strokeWidth="1.5"
          width="28"
          x="2"
          y="4"
        />
        {/* Left bracket */}
        <path
          d="M8 10L12 16L8 22"
          stroke="#14b8a6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        {/* Underscore cursor */}
        <path
          d="M14 22H20"
          stroke="#14b8a6"
          strokeLinecap="round"
          strokeWidth="2"
        />
        {/* Privacy dot indicator */}
        <circle cx="24" cy="10" fill="#14b8a6" r="3" />
      </svg>
    </div>,
    {
      ...size,
    }
  );
}
