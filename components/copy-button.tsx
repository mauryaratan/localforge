"use client";

import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyButtonProps {
  copied: boolean;
  disabled?: boolean;
  label: string;
  onCopy: () => void;
  size?: "icon-xs" | "icon-sm" | "icon";
}

export const CopyButton = ({
  copied,
  disabled,
  label,
  onCopy,
  size = "icon-xs",
}: CopyButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            className="cursor-pointer"
            disabled={disabled}
            onClick={onCopy}
            size={size}
            tabIndex={0}
            variant="ghost"
          />
        }
      >
        <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={14} />
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied!" : label}</TooltipContent>
    </Tooltip>
  );
};
