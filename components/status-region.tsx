import type { ReactNode } from "react";

interface StatusRegionProps {
  children: ReactNode;
  className?: string;
  /** "polite" for results (default), "assertive" for errors */
  tone?: "polite" | "assertive";
}

/**
 * Announces async/derived result changes to assistive tech. Render it
 * PERSISTENTLY (the region must exist before content changes) and swap
 * its children.
 */
export const StatusRegion = ({
  children,
  className,
  tone = "polite",
}: StatusRegionProps) => (
  <div
    aria-live={tone}
    className={className}
    role={tone === "assertive" ? "alert" : "status"}
  >
    {children}
  </div>
);
