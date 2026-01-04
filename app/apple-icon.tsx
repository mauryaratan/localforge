import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
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
          width="120"
          height="120"
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
            fill="#14b8a6"
            fillOpacity="0.2"
            stroke="#14b8a6"
            strokeWidth="1.5"
          />
          {/* Left bracket */}
          <path
            d="M8 10L12 16L8 22"
            stroke="#14b8a6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Underscore cursor */}
          <path
            d="M14 22H20"
            stroke="#14b8a6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Privacy dot indicator */}
          <circle cx="24" cy="10" r="3" fill="#14b8a6" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
