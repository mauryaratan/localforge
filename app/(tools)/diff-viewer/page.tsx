"use client";

import {
  ArrowReloadHorizontalIcon,
  Copy01Icon,
  Delete02Icon,
  TextWrapIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { PatchDiff } from "@pierre/diffs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ExampleButton } from "@/components/example-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  createDiff,
  type DiffGranularity,
  diffExamples,
  normalizeForDiff,
} from "@/lib/diff-viewer";
import { getStorageValue, scheduleStorageValue } from "@/lib/utils";

const STORAGE_KEY_LEFT = "devtools:diff-viewer:left";
const STORAGE_KEY_RIGHT = "devtools:diff-viewer:right";

const DiffViewerPage = () => {
  const [leftText, setLeftText] = useState(() =>
    getStorageValue(STORAGE_KEY_LEFT)
  );
  const [rightText, setRightText] = useState(() =>
    getStorageValue(STORAGE_KEY_RIGHT)
  );
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [granularity, setGranularity] = useState<DiffGranularity>("lines");
  const [wrapLines, setWrapLines] = useState(true);
  const [ignoreTrailingWhitespace, setIgnoreTrailingWhitespace] =
    useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    scheduleStorageValue(STORAGE_KEY_LEFT, leftText);
    scheduleStorageValue(STORAGE_KEY_RIGHT, rightText);
  }, [isHydrated, leftText, rightText]);

  const diffResult = useMemo(() => {
    const original = normalizeForDiff(leftText, {
      trimTrailingWhitespace: ignoreTrailingWhitespace,
    });
    const modified = normalizeForDiff(rightText, {
      trimTrailingWhitespace: ignoreTrailingWhitespace,
    });
    return createDiff(original, modified, granularity);
  }, [granularity, ignoreTrailingWhitespace, leftText, rightText]);

  const handleCopyPatch = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(diffResult.patch);
      toast.success("Patch copied");
    } catch {
      toast.error("Failed to copy patch");
    }
  }, [diffResult.patch]);

  const handleLoadExample = useCallback(() => {
    setLeftText(diffExamples.original);
    setRightText(diffExamples.modified);
  }, []);

  const handleSwap = useCallback(() => {
    setLeftText(rightText);
    setRightText(leftText);
  }, [leftText, rightText]);

  const handleClear = useCallback(() => {
    setLeftText("");
    setRightText("");
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-4xl flex-col gap-1">
        <h1 className="font-medium text-lg">Diff Viewer</h1>
        <p className="text-muted-foreground text-xs">
          Compare text and code locally with split and unified views
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Inputs</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <ExampleButton label="Code change" onClick={handleLoadExample} />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label="Swap inputs"
                      className="cursor-pointer"
                      onClick={handleSwap}
                      size="icon-xs"
                      tabIndex={0}
                      variant="ghost"
                    />
                  }
                >
                  <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={14} />
                </TooltipTrigger>
                <TooltipContent>Swap inputs</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label="Clear inputs"
                      className="cursor-pointer"
                      onClick={handleClear}
                      size="icon-xs"
                      tabIndex={0}
                      variant="ghost"
                    />
                  }
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </TooltipTrigger>
                <TooltipContent>Clear inputs</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-0 p-0 lg:grid-cols-2">
          <Field className="gap-0 border-b lg:border-r lg:border-b-0">
            <FieldLabel className="border-b px-4 py-2" htmlFor="diff-left">
              Original
            </FieldLabel>
            <Textarea
              aria-label="Original text"
              className="field-sizing-fixed! min-h-[280px] resize-y rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:ring-0"
              id="diff-left"
              onChange={(event) => setLeftText(event.target.value)}
              placeholder="Paste original text..."
              spellCheck={false}
              value={leftText}
            />
          </Field>
          <Field className="gap-0">
            <FieldLabel className="border-b px-4 py-2" htmlFor="diff-right">
              Modified
            </FieldLabel>
            <Textarea
              aria-label="Modified text"
              className="field-sizing-fixed! min-h-[280px] resize-y rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:ring-0"
              id="diff-right"
              onChange={(event) => setRightText(event.target.value)}
              placeholder="Paste modified text..."
              spellCheck={false}
              value={rightText}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Diff</CardTitle>
              <Badge variant={diffResult.hasChanges ? "default" : "secondary"}>
                {diffResult.hasChanges ? "Changed" : "No changes"}
              </Badge>
              <Badge variant="secondary">
                +{diffResult.stats.additions} -{diffResult.stats.deletions}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tabs
                onValueChange={(value) =>
                  setViewMode(value as "split" | "unified")
                }
                value={viewMode}
              >
                <TabsList className="h-8">
                  <TabsTrigger className="px-2 text-xs" value="split">
                    Split
                  </TabsTrigger>
                  <TabsTrigger className="px-2 text-xs" value="unified">
                    Unified
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Select
                onValueChange={(value) =>
                  value && setGranularity(value as DiffGranularity)
                }
                value={granularity}
              >
                <SelectTrigger
                  aria-label="Diff granularity"
                  className="h-8 w-[112px] cursor-pointer"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="lines">
                    Lines
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="words">
                    Words
                  </SelectItem>
                </SelectContent>
              </Select>
              <Field className="w-auto flex-row items-center gap-2">
                <FieldLabel className="text-xs" htmlFor="diff-wrap">
                  <HugeiconsIcon icon={TextWrapIcon} size={14} />
                  Wrap
                </FieldLabel>
                <Switch
                  checked={wrapLines}
                  className="cursor-pointer"
                  id="diff-wrap"
                  onCheckedChange={setWrapLines}
                />
              </Field>
              <Field className="w-auto flex-row items-center gap-2">
                <FieldLabel className="text-xs" htmlFor="diff-whitespace">
                  Trim
                </FieldLabel>
                <Switch
                  checked={ignoreTrailingWhitespace}
                  className="cursor-pointer"
                  id="diff-whitespace"
                  onCheckedChange={setIgnoreTrailingWhitespace}
                />
              </Field>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label="Copy patch"
                      className="cursor-pointer"
                      disabled={!diffResult.patch.trim()}
                      onClick={handleCopyPatch}
                      size="icon-xs"
                      tabIndex={0}
                      variant="ghost"
                    />
                  }
                >
                  <HugeiconsIcon icon={Copy01Icon} size={14} />
                </TooltipTrigger>
                <TooltipContent>Copy patch</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {diffResult.hasChanges ? (
            <div className="overflow-auto p-3">
              <PatchDiff
                disableWorkerPool
                options={{
                  diffStyle: viewMode,
                  lineDiffType: granularity === "words" ? "word" : "none",
                  overflow: wrapLines ? "wrap" : "scroll",
                  theme: { dark: "pierre-dark", light: "pierre-light" },
                  themeType: "system",
                }}
                patch={diffResult.patch}
              />
            </div>
          ) : (
            <div className="p-6 text-muted-foreground text-xs">
              No differences to display.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiffViewerPage;
