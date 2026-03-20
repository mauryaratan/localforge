"use client";

import type { ErrorInfo } from "next/error";
import Link from "next/link";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RouteError({
  error,
  unstable_retry: unstableRetry,
}: ErrorInfo) {
  const errorDigest =
    "digest" in error && typeof error.digest === "string"
      ? error.digest
      : undefined;

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
        <CardContent className="flex flex-col gap-4 pt-6">
          {errorDigest ? (
            <p className="font-mono text-[11px] text-muted-foreground">
              Digest: {errorDigest}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              className={buttonVariants()}
              onClick={() => unstableRetry()}
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
