"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExampleButtonProps {
  ariaLabel?: string;
  className?: string;
  label: string;
  onClick: () => void;
}

export const ExampleButton = ({
  label,
  onClick,
  ariaLabel,
  className,
}: ExampleButtonProps) => {
  return (
    <Button
      aria-label={ariaLabel ?? `Load ${label} example`}
      className={cn("cursor-pointer justify-start", className)}
      onClick={onClick}
      size="sm"
      tabIndex={0}
      variant="outline"
    >
      {label}
    </Button>
  );
};
