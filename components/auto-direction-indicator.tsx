"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface AutoDirectionIndicatorProps {
  forwardActive: boolean;
  reverseActive: boolean;
}

export const AutoDirectionIndicator = ({
  forwardActive,
  reverseActive,
}: AutoDirectionIndicatorProps) => {
  return (
    <div
      aria-hidden="true"
      className="hidden flex-col items-center justify-center gap-2 pt-8 lg:flex"
    >
      <div
        className={cn(
          "rounded-sm p-2 transition-colors",
          forwardActive
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        Auto
      </span>
      <div
        className={cn(
          "rounded-sm p-2 transition-colors",
          reverseActive
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
      </div>
    </div>
  );
};
