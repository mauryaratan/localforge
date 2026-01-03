import { CommandIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HugeiconsIcon icon={CommandIcon} size={32} strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="font-medium text-2xl tracking-tight">DevTools</h1>
          <p className="max-w-sm text-muted-foreground text-sm">
            A collection of utilities for developers. Fast, offline-capable, and
            privacy-focused.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-muted-foreground/60 text-xs">
          <span>Select a tool from the sidebar to get started</span>
        </div>
      </div>

      <div className="absolute bottom-8 text-[10px] text-muted-foreground/40">
        PWA · Works Offline
      </div>
    </div>
  );
}
