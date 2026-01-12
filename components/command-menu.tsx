"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toolNavItems } from "@/lib/nav-items";

export const CommandMenu = () => {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        aria-label="Open command menu"
        className="inline-flex h-8 items-center justify-between gap-2 rounded-none border border-input bg-background px-3 text-muted-foreground text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-64"
        onClick={() => setOpen(true)}
        tabIndex={0}
        type="button"
      >
        <span className="hidden sm:inline">Search tools...</span>
        <span className="inline sm:hidden">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog
        description="Search and navigate to any tool"
        onOpenChange={setOpen}
        open={open}
        title="Command Menu"
      >
        <CommandInput placeholder="Search tools..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tools">
            {toolNavItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(item.href)}
                value={item.title}
              >
                <HugeiconsIcon icon={item.icon} size={16} />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
