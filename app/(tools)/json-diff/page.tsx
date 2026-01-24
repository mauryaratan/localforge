"use client";

import {
  Add01Icon,
  Copy01Icon,
  Delete02Icon,
  MinusSignIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  compareJson,
  type DiffLine,
  examplePairs,
  formatValue,
  validateJson,
} from "@/lib/json-diff";
import { cn, getStorageValue, setStorageValue } from "@/lib/utils";

const STORAGE_KEY_ORIGINAL = "devtools:json-diff:original";
const STORAGE_KEY_MODIFIED = "devtools:json-diff:modified";

const JsonDiffPage = () => {
  const [original, setOriginal] = useState(() =>
    getStorageValue(STORAGE_KEY_ORIGINAL)
  );
  const [modified, setModified] = useState(() =>
    getStorageValue(STORAGE_KEY_MODIFIED)
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    setStorageValue(STORAGE_KEY_ORIGINAL, original);
    setStorageValue(STORAGE_KEY_MODIFIED, modified);
  }, [original, modified, isHydrated]);

  const originalValidation = useMemo(() => {
    if (!original.trim()) return { isValid: null, error: null };
    const result = validateJson(original);
    return { isValid: result.isValid, error: result.error || null };
  }, [original]);

  const modifiedValidation = useMemo(() => {
    if (!modified.trim()) return { isValid: null, error: null };
    const result = validateJson(modified);
    return { isValid: result.isValid, error: result.error || null };
  }, [modified]);

  const diffResult = useMemo(() => {
    if (!(original.trim() && modified.trim())) return null;
    if (!(originalValidation.isValid && modifiedValidation.isValid))
      return null;
    return compareJson(original, modified);
  }, [
    original,
    modified,
    originalValidation.isValid,
    modifiedValidation.isValid,
  ]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleClearAll = useCallback(() => {
    setOriginal("");
    setModified("");
  }, []);

  const handleSwap = useCallback(() => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
  }, [original, modified]);

  const handleLoadExample = useCallback(
    (example: { original: string; modified: string }) => {
      setOriginal(example.original);
      setModified(example.modified);
    },
    []
  );

  const changedDiffs =
    diffResult?.diffs.filter((d) => d.type !== "unchanged") || [];
  const hasChanges = changedDiffs.length > 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex max-w-5xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">JSON Diff Viewer</h1>
          <p className="text-muted-foreground text-xs">
            Compare two JSON objects and visualize their differences
          </p>
        </div>

        {/* Input Cards - Side by Side */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Original JSON */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Original</CardTitle>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          aria-label="Clear original"
                          className="cursor-pointer"
                          disabled={!original}
                          onClick={() => setOriginal("")}
                          size="icon-xs"
                          variant="ghost"
                        />
                      }
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </TooltipTrigger>
                    <TooltipContent>Clear</TooltipContent>
                  </Tooltip>
                  <Button
                    aria-label="Copy original JSON"
                    className="cursor-pointer"
                    disabled={!original}
                    onClick={() => handleCopy(original, "Original JSON")}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                aria-label="Original JSON"
                className="!field-sizing-fixed h-[200px] min-h-[150px] resize-y font-mono text-xs leading-relaxed"
                onChange={(e) => setOriginal(e.target.value)}
                placeholder='{"key": "value"}'
                spellCheck={false}
                value={original}
              />
              <div className="mt-2">
                {originalValidation.isValid === true && (
                  <Badge variant="default">Valid JSON</Badge>
                )}
                {originalValidation.isValid === false && (
                  <Badge variant="destructive">
                    {originalValidation.error}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Modified JSON */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Modified</CardTitle>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          aria-label="Clear modified"
                          className="cursor-pointer"
                          disabled={!modified}
                          onClick={() => setModified("")}
                          size="icon-xs"
                          variant="ghost"
                        />
                      }
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </TooltipTrigger>
                    <TooltipContent>Clear</TooltipContent>
                  </Tooltip>
                  <Button
                    aria-label="Copy modified JSON"
                    className="cursor-pointer"
                    disabled={!modified}
                    onClick={() => handleCopy(modified, "Modified JSON")}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                aria-label="Modified JSON"
                className="!field-sizing-fixed h-[200px] min-h-[150px] resize-y font-mono text-xs leading-relaxed"
                onChange={(e) => setModified(e.target.value)}
                placeholder='{"key": "new value"}'
                spellCheck={false}
                value={modified}
              />
              <div className="mt-2">
                {modifiedValidation.isValid === true && (
                  <Badge variant="default">Valid JSON</Badge>
                )}
                {modifiedValidation.isValid === false && (
                  <Badge variant="destructive">
                    {modifiedValidation.error}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label="Swap original and modified"
                  className="cursor-pointer"
                  disabled={!(original || modified)}
                  onClick={handleSwap}
                  size="sm"
                  variant="outline"
                />
              }
            >
              <HugeiconsIcon className="mr-1" icon={RefreshIcon} size={14} />
              Swap
            </TooltipTrigger>
            <TooltipContent>Swap original and modified</TooltipContent>
          </Tooltip>
          <Button
            aria-label="Clear all"
            className="cursor-pointer"
            disabled={!(original || modified)}
            onClick={handleClearAll}
            size="sm"
            variant="outline"
          >
            <HugeiconsIcon className="mr-1" icon={Delete02Icon} size={14} />
            Clear All
          </Button>
        </div>

        {/* Diff Output */}
        {diffResult && diffResult.success && (
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <span>Differences</span>
                  <div className="flex items-center gap-2">
                    {diffResult.summary.added > 0 && (
                      <Badge
                        className="border-green-500 text-green-600 dark:text-green-400"
                        variant="outline"
                      >
                        <HugeiconsIcon
                          className="mr-1"
                          icon={Add01Icon}
                          size={12}
                        />
                        {diffResult.summary.added} added
                      </Badge>
                    )}
                    {diffResult.summary.removed > 0 && (
                      <Badge
                        className="border-red-500 text-red-600 dark:text-red-400"
                        variant="outline"
                      >
                        <HugeiconsIcon
                          className="mr-1"
                          icon={MinusSignIcon}
                          size={12}
                        />
                        {diffResult.summary.removed} removed
                      </Badge>
                    )}
                    {diffResult.summary.changed > 0 && (
                      <Badge
                        className="border-amber-500 text-amber-600 dark:text-amber-400"
                        variant="outline"
                      >
                        {diffResult.summary.changed} changed
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {hasChanges ? (
                <div className="space-y-1 rounded-md bg-muted/30 p-3 font-mono text-xs">
                  {changedDiffs.map((diff, index) => (
                    <DiffLineItem diff={diff} key={`${diff.path}-${index}`} />
                  ))}
                </div>
              ) : (
                <div className="rounded-md bg-muted/30 p-4 text-center text-muted-foreground text-sm">
                  No differences found — the JSON objects are identical.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {diffResult && !diffResult.success && diffResult.error && (
          <Card>
            <CardContent className="pt-4">
              <Badge variant="destructive">{diffResult.error}</Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="shrink-0 lg:sticky lg:top-4 lg:h-fit lg:w-72">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Examples</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              {Object.entries(examplePairs).map(([key, example]) => (
                <Button
                  aria-label={`Load ${example.label} example`}
                  className="cursor-pointer justify-start"
                  key={key}
                  onClick={() => handleLoadExample(example)}
                  size="sm"
                  variant="outline"
                >
                  {example.label}
                </Button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 border-t pt-4">
              <h4 className="mb-2 font-medium text-xs">Legend</h4>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-green-500 bg-green-500/20" />
                  <span className="text-muted-foreground">Added</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-red-500 bg-red-500/20" />
                  <span className="text-muted-foreground">Removed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-amber-500 bg-amber-500/20" />
                  <span className="text-muted-foreground">Changed</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 border-t pt-4">
              <h4 className="mb-2 font-medium text-xs">Tips</h4>
              <ul className="flex flex-col gap-1.5 text-muted-foreground text-xs">
                <li>• Paste JSON from APIs or config files</li>
                <li>• Use Swap to reverse comparison</li>
                <li>• Nested changes show full paths</li>
                <li>• All processing happens locally</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface DiffLineItemProps {
  diff: DiffLine;
}

const DiffLineItem = ({ diff }: DiffLineItemProps) => {
  const bgColor = cn({
    "bg-green-500/10": diff.type === "added",
    "bg-red-500/10": diff.type === "removed",
    "bg-amber-500/10": diff.type === "changed",
  });

  const textColor = cn({
    "text-green-600 dark:text-green-400": diff.type === "added",
    "text-red-600 dark:text-red-400": diff.type === "removed",
    "text-amber-600 dark:text-amber-400": diff.type === "changed",
  });

  const prefix =
    diff.type === "added" ? "+" : diff.type === "removed" ? "-" : "~";

  return (
    <div className={cn("flex items-start gap-2 rounded-sm px-2 py-1", bgColor)}>
      <span className={cn("font-bold", textColor)}>{prefix}</span>
      <span className="text-muted-foreground">{diff.path}:</span>
      {diff.type === "changed" ? (
        <span>
          <span className="text-red-600 line-through dark:text-red-400">
            {formatValue(diff.oldValue)}
          </span>
          <span className="mx-1">→</span>
          <span className="text-green-600 dark:text-green-400">
            {formatValue(diff.newValue)}
          </span>
        </span>
      ) : diff.type === "added" ? (
        <span className={textColor}>{formatValue(diff.newValue)}</span>
      ) : (
        <span className={textColor}>{formatValue(diff.oldValue)}</span>
      )}
    </div>
  );
};

export default JsonDiffPage;
