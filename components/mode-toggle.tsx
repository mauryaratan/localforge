"use client";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ModeToggle = () => {
  const { setTheme, theme } = useTheme();

  const handleSetLight = () => {
    setTheme("light");
  };

  const handleSetDark = () => {
    setTheme("dark");
  };

  const handleSetSystem = () => {
    setTheme("system");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Toggle theme"
        className="focus:outline-none"
        render={
          <Button size="icon-sm" variant="ghost">
            <HugeiconsIcon
              className="rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"
              icon={Sun03Icon}
              size={16}
              strokeWidth={2}
            />
            <HugeiconsIcon
              className="absolute rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100"
              icon={Moon02Icon}
              size={16}
              strokeWidth={2}
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          data-active={theme === "light" || undefined}
          onClick={handleSetLight}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          data-active={theme === "dark" || undefined}
          onClick={handleSetDark}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          data-active={theme === "system" || undefined}
          onClick={handleSetSystem}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
