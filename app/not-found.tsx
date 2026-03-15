import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { navItems } from "@/lib/nav-items";

const suggestedTools = navItems.slice(0, 4);

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl items-center justify-center px-4 py-12">
      <Card className="w-full border border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b">
          <p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.3em]">
            404
          </p>
          <CardTitle className="text-2xl">Route not forged</CardTitle>
          <p className="max-w-xl text-muted-foreground text-sm">
            That page is missing or moved. Jump back home, or open one of the
            tools below.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="flex flex-wrap gap-2">
            <Link className={buttonVariants()} href="/">
              Back Home
            </Link>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/json-formatter"
            >
              Open JSON Formatter
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestedTools.map((item) => (
              <Link
                className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
                href={item.href}
                key={item.href}
              >
                <HugeiconsIcon
                  className="text-primary"
                  icon={item.icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
