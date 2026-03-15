"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl items-center justify-center px-4 py-12">
      <Card className="w-full border border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b">
          <p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.3em]">
            App Error
          </p>
          <CardTitle className="text-2xl">Something broke mid-forge</CardTitle>
          <p className="max-w-xl text-muted-foreground text-sm">
            LocalForge hit an unexpected error while rendering this route. Retry
            the segment or head back to a stable page.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {error.digest ? (
            <p className="font-mono text-[11px] text-muted-foreground">
              Digest: {error.digest}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              className={buttonVariants()}
              onClick={() => reset()}
              type="button"
            >
              Try Again
            </button>
            <Link className={buttonVariants({ variant: "outline" })} href="/">
              Back Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
