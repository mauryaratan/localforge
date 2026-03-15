// biome-ignore-all lint/performance/noNamespaceImport: React namespace usage keeps hooks colocated and matches current component style

"use client";

import * as React from "react";

type CommandMenuDialogComponent =
  typeof import("./command-menu-dialog").CommandMenuDialog;

export const CommandMenu = () => {
  const [open, setOpen] = React.useState(false);
  const [DialogComponent, setDialogComponent] =
    React.useState<CommandMenuDialogComponent | null>(null);

  const loadDialog = React.useCallback(async () => {
    if (DialogComponent) {
      return DialogComponent;
    }

    const mod = await import("./command-menu-dialog");
    setDialogComponent(() => mod.CommandMenuDialog);
    return mod.CommandMenuDialog;
  }, [DialogComponent]);

  const handleOpen = React.useCallback(() => {
    loadDialog().then(() => {
      setOpen(true);
    });
  }, [loadDialog]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (open) {
          setOpen(false);
          return;
        }

        loadDialog().then(() => {
          setOpen(true);
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loadDialog, open]);

  return (
    <>
      <button
        aria-label="Open command menu"
        className="inline-flex h-8 items-center justify-between gap-2 rounded-none border border-input bg-background px-3 text-muted-foreground text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-64"
        onClick={handleOpen}
        tabIndex={0}
        type="button"
      >
        <span className="hidden sm:inline">Search tools...</span>
        <span className="inline sm:hidden">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      {DialogComponent ? (
        <DialogComponent onOpenChange={setOpen} open={open} />
      ) : null}
    </>
  );
};
