"use client";

import {
  Clock01Icon,
  Copy01Icon,
  Delete02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CRON_EXAMPLES,
  type CronExample,
  formatNextRun,
  type ParsedCron,
  parseCron,
} from "@/lib/cron-parser";

const STORAGE_KEY = "devtools:cron-parser:input";

const CronParserPage = () => {
  const [cronInput, setCronInput] = useState("");
  const [parsed, setParsed] = useState<ParsedCron | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCronInput(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input changes (after hydration)
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (cronInput) {
      localStorage.setItem(STORAGE_KEY, cronInput);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [cronInput, isHydrated]);

  // Parse cron when input changes
  useEffect(() => {
    if (cronInput) {
      const result = parseCron(cronInput);
      setParsed(result);
    } else {
      setParsed(null);
    }
  }, [cronInput]);

  const handleCopy = useCallback(async (text: string, label?: string) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(label ? `${label} copied` : "Copied");
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleClearInput = useCallback(() => {
    setCronInput("");
    setParsed(null);
  }, []);

  const handleExampleClick = useCallback((example: CronExample) => {
    setCronInput(example.expression);
  }, []);

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex min-w-0 max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">Cron Parser</h1>
          <p className="text-muted-foreground text-xs">
            Parse cron expressions to understand their schedule
          </p>
        </div>

        {/* Cron Input */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Cron Expression</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  aria-label="Cron expression input"
                  className="pr-8 font-mono"
                  onChange={(e) => setCronInput(e.target.value)}
                  placeholder="* * * * * (minute hour day-of-month month day-of-week)"
                  spellCheck={false}
                  type="text"
                  value={cronInput}
                />
                {cronInput && (
                  <Button
                    aria-label="Clear input"
                    className="absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer"
                    onClick={handleClearInput}
                    size="icon-xs"
                    tabIndex={0}
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </Button>
                )}
              </div>
              <Button
                aria-label="Copy expression"
                className="cursor-pointer"
                disabled={!cronInput}
                onClick={() => handleCopy(cronInput, "Expression")}
                size="icon-xs"
                tabIndex={0}
                variant="ghost"
              >
                <HugeiconsIcon icon={Copy01Icon} size={14} />
              </Button>
            </div>

            {parsed && !parsed.isValid && parsed.error && (
              <Badge className="mt-3" variant="destructive">
                {parsed.error}
              </Badge>
            )}

            {parsed?.isValid && (
              <Badge className="mt-3" variant="default">
                Valid Expression
              </Badge>
            )}

            {/* Field reference hint */}
            <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5">MIN</span>
              <span className="rounded bg-muted px-1.5 py-0.5">HOUR</span>
              <span className="rounded bg-muted px-1.5 py-0.5">DOM</span>
              <span className="rounded bg-muted px-1.5 py-0.5">MON</span>
              <span className="rounded bg-muted px-1.5 py-0.5">DOW</span>
            </div>
          </CardContent>
        </Card>

        {/* Human-Readable Description */}
        {parsed?.isValid && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="font-medium text-sm">{parsed.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Field Breakdown */}
        {parsed?.isValid && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Field Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {parsed.fields.map((field) => (
                  <div
                    className="flex flex-col gap-1 rounded-sm bg-muted/50 p-3"
                    key={field.name}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {field.name}
                      </span>
                      <code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">
                        {field.value}
                      </code>
                    </div>
                    <span className="font-medium text-xs">
                      {field.description}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Range: {field.min}-{field.max}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Run Times */}
        {parsed?.isValid && parsed.nextRuns.length > 0 && (
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  className="text-muted-foreground"
                  icon={Clock01Icon}
                  size={16}
                />
                <CardTitle>Next 5 Executions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-2">
                {parsed.nextRuns.map((run, index) => (
                  <div
                    className="flex items-center justify-between rounded-sm bg-muted/50 p-2"
                    key={run.toISOString()}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-muted-foreground text-xs">
                        #{index + 1}
                      </span>
                      <span className="font-mono text-sm">
                        {formatNextRun(run)}
                      </span>
                    </div>
                    <Button
                      aria-label="Copy ISO timestamp"
                      className="cursor-pointer"
                      onClick={() =>
                        handleCopy(run.toISOString(), "Timestamp")
                      }
                      size="icon-xs"
                      tabIndex={0}
                      variant="ghost"
                    >
                      <HugeiconsIcon icon={Copy01Icon} size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reference Card */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Cron Syntax Reference</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <h4 className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  Special Characters
                </h4>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <code className="w-12 rounded bg-muted px-1.5 py-0.5 text-center font-mono">
                      *
                    </code>
                    <span className="text-muted-foreground">Any value</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="w-12 rounded bg-muted px-1.5 py-0.5 text-center font-mono">
                      ,
                    </code>
                    <span className="text-muted-foreground">
                      Value list (1,3,5)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <code className="w-12 rounded bg-muted px-1.5 py-0.5 text-center font-mono">
                      -
                    </code>
                    <span className="text-muted-foreground">Range (1-5)</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="w-12 rounded bg-muted px-1.5 py-0.5 text-center font-mono">
                      /
                    </code>
                    <span className="text-muted-foreground">Step (*/15)</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  Field Ranges
                </h4>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <span className="w-24 text-muted-foreground">Minute</span>
                    <code className="font-mono">0-59</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-24 text-muted-foreground">Hour</span>
                    <code className="font-mono">0-23</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-24 text-muted-foreground">
                      Day of Month
                    </span>
                    <code className="font-mono">1-31</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-24 text-muted-foreground">Month</span>
                    <code className="font-mono">1-12 or JAN-DEC</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-24 text-muted-foreground">
                      Day of Week
                    </span>
                    <code className="font-mono">0-6 or SUN-SAT</code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Examples - shown below main content on small screens */}
        <Card className="lg:hidden">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={InformationCircleIcon}
                size={16}
              />
              <CardTitle>Quick Examples</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CRON_EXAMPLES.map((example) => (
                <button
                  aria-label={`Use example: ${example.label}`}
                  className="group flex cursor-pointer flex-col gap-1 rounded-sm bg-muted/50 p-3 text-left transition-colors hover:bg-muted"
                  key={example.expression}
                  onClick={() => handleExampleClick(example)}
                  tabIndex={0}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-xs transition-colors group-hover:text-primary">
                      {example.label}
                    </span>
                    <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {example.expression}
                    </code>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {example.description}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Quick Examples */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={InformationCircleIcon}
                size={14}
              />
              <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Quick Examples
              </h2>
            </div>
            <div className="flex flex-col gap-1.5">
              {CRON_EXAMPLES.map((example) => (
                <button
                  aria-label={`Use example: ${example.label}`}
                  className="group flex cursor-pointer flex-col gap-0.5 rounded-sm border border-transparent bg-muted/50 p-2 text-left transition-colors hover:border-border hover:bg-muted"
                  key={example.expression}
                  onClick={() => handleExampleClick(example)}
                  tabIndex={0}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-xs transition-colors group-hover:text-primary">
                      {example.label}
                    </span>
                  </div>
                  <code className="font-mono text-[10px] text-muted-foreground">
                    {example.expression}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CronParserPage;
