"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toolNavItems } from "@/lib/nav-items";

interface CommandMenuDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export const CommandMenuDialog = ({
  onOpenChange,
  open,
}: CommandMenuDialogProps) => {
  const router = useRouter();

  const handleSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog
      description="Search and navigate to any tool"
      onOpenChange={onOpenChange}
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
  );
};
