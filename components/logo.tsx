import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

export const Logo = ({
  className,
  size = "md",
  showText = true,
}: LogoProps) => {
  const sizes = {
    sm: { icon: 20, text: "text-sm" },
    md: { icon: 24, text: "text-base" },
    lg: { icon: 32, text: "text-lg" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        aria-hidden="true"
        fill="none"
        height={icon}
        viewBox="0 0 32 32"
        width={icon}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Terminal bracket with privacy shield */}
        <rect
          className="fill-primary/10 stroke-primary"
          height="24"
          rx="4"
          strokeWidth="1.5"
          width="28"
          x="2"
          y="4"
        />
        {/* Left bracket */}
        <path
          className="stroke-primary"
          d="M8 10L12 16L8 22"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        {/* Underscore cursor */}
        <path
          className="stroke-primary"
          d="M14 22H20"
          strokeLinecap="round"
          strokeWidth="2"
        />
        {/* Privacy dot indicator */}
        <circle className="fill-primary" cx="24" cy="10" r="3" />
      </svg>
      {showText && (
        <span className={cn("font-medium tracking-tight", text)}>
          LocalForge
        </span>
      )}
    </div>
  );
};

export const LogoIcon = ({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        className="fill-primary/10 stroke-primary"
        height="24"
        rx="4"
        strokeWidth="1.5"
        width="28"
        x="2"
        y="4"
      />
      <path
        className="stroke-primary"
        d="M8 10L12 16L8 22"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        className="stroke-primary"
        d="M14 22H20"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle className="fill-primary" cx="24" cy="10" r="3" />
    </svg>
  );
};
