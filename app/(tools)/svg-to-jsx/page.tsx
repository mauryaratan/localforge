"use client";

import {
  Copy01Icon,
  Delete02Icon,
  FileEditIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  convertSvgToJsx,
  exampleLabels,
  exampleSvgs,
  formatBytes,
  type OutputFormat,
} from "@/lib/svg-jsx";

const STORAGE_KEY = "devtools:svg-to-jsx:input";

type PreviewBackground = "white" | "checkered" | "black";

const outputFormatLabels: Record<OutputFormat, string> = {
  jsx: "JSX Only",
  component: "React Component",
  componentTs: "TypeScript Component",
};

const SvgToJsxPage = () => {
  const [input, setInput] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jsx");
  const [componentName, setComponentName] = useState("SvgIcon");
  const [memo, setMemo] = useState(false);
  const [spreadProps, setSpreadProps] = useState(true);
  const [singleQuotes, setSingleQuotes] = useState(false);
  const [cleanupIds, setCleanupIds] = useState(false);
  const [previewBg, setPreviewBg] = useState<PreviewBackground>("checkered");
  const [copied, setCopied] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setInput(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    if (input) {
      localStorage.setItem(STORAGE_KEY, input);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [input, isHydrated]);

  // Convert SVG to JSX
  const result = useMemo(() => {
    if (!input.trim()) return null;
    return convertSvgToJsx(input, {
      outputFormat,
      componentName,
      memo,
      spreadProps,
      singleQuotes,
      cleanupIds,
    });
  }, [input, outputFormat, componentName, memo, spreadProps, singleQuotes, cleanupIds]);

  const handleCopy = useCallback(async () => {
    if (!result?.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  }, [result]);

  const handleClearInput = useCallback(() => {
    setInput("");
  }, []);

  const handleLoadExample = useCallback((key: keyof typeof exampleSvgs) => {
    setInput(exampleSvgs[key]);
  }, []);

  const getPreviewBgClass = (bg: PreviewBackground): string => {
    switch (bg) {
      case "white":
        return "bg-white";
      case "black":
        return "bg-zinc-900";
      case "checkered":
      default:
        return "bg-[repeating-conic-gradient(#8882_0_25%,transparent_0_50%)] bg-size-[16px_16px] dark:bg-[repeating-conic-gradient(#fff1_0_25%,transparent_0_50%)]";
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">SVG to JSX</h1>
          <p className="text-muted-foreground text-xs">
            Convert SVG code to JSX for React components with proper attribute transformations
          </p>
        </div>

        {/* SVG Input */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>SVG Input</CardTitle>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Clear input"
                        className="cursor-pointer"
                        disabled={!input}
                        onClick={handleClearInput}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Clear</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              aria-label="SVG input"
              className="min-h-[200px] max-h-[400px] resize-y rounded-none border-0 field-sizing-fixed! font-mono text-xs leading-relaxed focus-visible:ring-0"
              onChange={(e) => setInput(e.target.value)}
              placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2">\n  <circle cx="12" cy="12" r="10" />\n</svg>`}
              spellCheck={false}
              value={input}
            />
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
              {result && result.isValid && (
                <>
                  <Badge variant="default">Valid SVG</Badge>
                  <Badge variant="secondary">
                    Original: {formatBytes(result.originalSize)}
                  </Badge>
                  <Badge variant="secondary">
                    Output: {formatBytes(result.outputSize)}
                  </Badge>
                </>
              )}
              {result && !result.isValid && (
                <Badge variant="destructive">{result.error}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* JSX Output */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-4">
              <CardTitle>JSX Output</CardTitle>
              <div className="flex items-center gap-2">
                <Tabs
                  value={outputFormat}
                  onValueChange={(v) => setOutputFormat(v as OutputFormat)}
                >
                  <TabsList className="h-8">
                    {(Object.keys(outputFormatLabels) as OutputFormat[]).map(
                      (format) => (
                        <TabsTrigger
                          key={format}
                          className="text-xs px-2"
                          value={format}
                        >
                          {outputFormatLabels[format]}
                        </TabsTrigger>
                      )
                    )}
                  </TabsList>
                </Tabs>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Copy JSX"
                        className="cursor-pointer"
                        disabled={!result?.output}
                        onClick={handleCopy}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>{copied ? "Copied!" : "Copy JSX"}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              aria-label="JSX output"
              className="min-h-[200px] max-h-[400px] resize-y rounded-none border-0 field-sizing-fixed! font-mono text-xs leading-relaxed focus-visible:ring-0"
              placeholder="JSX output will appear here..."
              readOnly
              spellCheck={false}
              value={result?.output || ""}
            />
          </CardContent>
        </Card>

        {/* Preview */}
        {result?.isValid && input.trim() && (
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Preview</CardTitle>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          aria-label="White background"
                          aria-pressed={previewBg === "white"}
                          className={`cursor-pointer flex items-center justify-center rounded-md border p-1.5 transition-colors ${previewBg === "white" ? "bg-muted border-primary" : "hover:bg-muted/50"}`}
                          onClick={() => setPreviewBg("white")}
                          tabIndex={0}
                          type="button"
                        />
                      }
                    >
                      <span className="size-3 rounded-sm border bg-white" />
                    </TooltipTrigger>
                    <TooltipContent>White</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          aria-label="Checkered background"
                          aria-pressed={previewBg === "checkered"}
                          className={`cursor-pointer flex items-center justify-center rounded-md border p-1.5 transition-colors ${previewBg === "checkered" ? "bg-muted border-primary" : "hover:bg-muted/50"}`}
                          onClick={() => setPreviewBg("checkered")}
                          tabIndex={0}
                          type="button"
                        />
                      }
                    >
                      <span className="size-3 rounded-sm border bg-[repeating-conic-gradient(#8882_0_25%,transparent_0_50%)] bg-size-[4px_4px]" />
                    </TooltipTrigger>
                    <TooltipContent>Checkered</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          aria-label="Dark background"
                          aria-pressed={previewBg === "black"}
                          className={`cursor-pointer flex items-center justify-center rounded-md border p-1.5 transition-colors ${previewBg === "black" ? "bg-muted border-primary" : "hover:bg-muted/50"}`}
                          onClick={() => setPreviewBg("black")}
                          tabIndex={0}
                          type="button"
                        />
                      }
                    >
                      <span className="size-3 rounded-sm border bg-zinc-900" />
                    </TooltipTrigger>
                    <TooltipContent>Dark</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div
                className={`flex items-center justify-center rounded-md border p-8 ${getPreviewBgClass(previewBg)}`}
              >
                <div
                  className="size-24 [&>svg]:w-full [&>svg]:h-full"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - using user-provided SVG for preview
                  dangerouslySetInnerHTML={{ __html: input }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:w-72">
        {/* Options */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm">Options</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">
            {/* Component Name */}
            {outputFormat !== "jsx" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="component-name" className="text-xs">
                  Component Name
                </Label>
                <Input
                  id="component-name"
                  aria-label="Component name"
                  className="h-8 text-xs"
                  onChange={(e) => setComponentName(e.target.value)}
                  placeholder="SvgIcon"
                  value={componentName}
                />
              </div>
            )}

            {/* Spread Props */}
            <div className="flex items-center justify-between">
              <Label htmlFor="spread-props" className="text-xs">
                Spread props on SVG
              </Label>
              <Switch
                id="spread-props"
                aria-label="Spread props on SVG element"
                checked={spreadProps}
                className="cursor-pointer"
                onCheckedChange={setSpreadProps}
              />
            </div>

            {/* React.memo */}
            {outputFormat !== "jsx" && (
              <div className="flex items-center justify-between">
                <Label htmlFor="memo" className="text-xs">
                  Wrap with React.memo
                </Label>
                <Switch
                  id="memo"
                  aria-label="Wrap component with React.memo"
                  checked={memo}
                  className="cursor-pointer"
                  onCheckedChange={setMemo}
                />
              </div>
            )}

            {/* Single Quotes */}
            <div className="flex items-center justify-between">
              <Label htmlFor="single-quotes" className="text-xs">
                Use single quotes
              </Label>
              <Switch
                id="single-quotes"
                aria-label="Use single quotes instead of double quotes"
                checked={singleQuotes}
                className="cursor-pointer"
                onCheckedChange={setSingleQuotes}
              />
            </div>

            {/* Cleanup IDs */}
            <div className="flex items-center justify-between">
              <Label htmlFor="cleanup-ids" className="text-xs">
                Prefix IDs (avoid conflicts)
              </Label>
              <Switch
                id="cleanup-ids"
                aria-label="Prefix IDs to avoid conflicts when using multiple SVGs"
                checked={cleanupIds}
                className="cursor-pointer"
                onCheckedChange={setCleanupIds}
              />
            </div>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm">Examples</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              {(Object.keys(exampleSvgs) as Array<keyof typeof exampleSvgs>).map(
                (key) => (
                  <button
                    key={key}
                    aria-label={`Load ${exampleLabels[key]} example`}
                    className="cursor-pointer flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2 text-left text-xs transition-colors hover:bg-muted"
                    onClick={() => handleLoadExample(key)}
                    tabIndex={0}
                    type="button"
                  >
                    <div
                      className="size-5 shrink-0 [&>svg]:w-full [&>svg]:h-full"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - using trusted example SVGs
                      dangerouslySetInnerHTML={{ __html: exampleSvgs[key] }}
                    />
                    <span className="text-muted-foreground">{exampleLabels[key]}</span>
                  </button>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transformations Info */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm">Transformations</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="flex flex-col gap-2 text-muted-foreground text-xs">
              <li className="flex gap-2">
                <span className="text-foreground font-mono">class</span>
                <span>→</span>
                <span className="text-foreground font-mono">className</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground font-mono">stroke-width</span>
                <span>→</span>
                <span className="text-foreground font-mono">strokeWidth</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground font-mono">fill-opacity</span>
                <span>→</span>
                <span className="text-foreground font-mono">fillOpacity</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground font-mono">xlink:href</span>
                <span>→</span>
                <span className="text-foreground font-mono">xlinkHref</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground font-mono">style="..."</span>
                <span>→</span>
                <span className="text-foreground font-mono">{"style={{ }}"}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SvgToJsxPage;
