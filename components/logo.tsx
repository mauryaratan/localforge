import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

export const Logo = ({ className, size = "md", showText = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 20, text: "text-sm" },
    md: { icon: 24, text: "text-base" },
    lg: { icon: 32, text: "text-lg" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Terminal bracket with privacy shield */}
        <rect
          x="2"
          y="4"
          width="28"
          height="24"
          rx="4"
          className="fill-primary/10 stroke-primary"
          strokeWidth="1.5"
        />
        {/* Left bracket */}
        <path
          d="M8 10L12 16L8 22"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Underscore cursor */}
        <path
          d="M14 22H20"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Privacy dot indicator */}
        <circle
          cx="24"
          cy="10"
          r="3"
          className="fill-primary"
        />
      </svg>
      {showText && (
        <span className={cn("font-medium tracking-tight", text)}>
          LocalForge
        </span>
      )}
    </div>
  );
};

export const LogoIcon = ({ className, size = 24 }: { className?: string; size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="2"
        y="4"
        width="28"
        height="24"
        rx="4"
        className="fill-primary/10 stroke-primary"
        strokeWidth="1.5"
      />
      <path
        d="M8 10L12 16L8 22"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 22H20"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="24"
        cy="10"
        r="3"
        className="fill-primary"
      />
    </svg>
  );
};
