"use client";

import {
  Copy01Icon,
  Delete02Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type CssOutputFormat,
  convertSvgToCss,
  type EncodingType,
  exampleLabels,
  exampleSvgs,
  formatBytes,
} from "@/lib/svg-css";

const STORAGE_KEY = "devtools:svg-to-css:input";

type PreviewBackground = "white" | "checkered" | "black";

const cssFormatLabels: Record<CssOutputFormat, string> = {
  dataUri: "Data URI only",
  backgroundImage: "background-image",
  backgroundImageFull: "background-image (full)",
  maskImage: "mask-image",
  listStyleImage: "list-style-image",
};

const SvgToCssPage = () => {
  const [input, setInput] = useState("");
  const [encoding, setEncoding] = useState<EncodingType>("url");
  const [outputFormat, setOutputFormat] =
    useState<CssOutputFormat>("backgroundImage");
  const [previewBg, setPreviewBg] = useState<PreviewBackground>("checkered");
  const [copied, setCopied] = useState<Record<string, boolean>>({});
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

  // Convert SVG to CSS
  const result = useMemo(() => {
    if (!input.trim()) return null;
    return convertSvgToCss(input, encoding);
  }, [input, encoding]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [key]: true }));
      toast.success("Copied to clipboard");
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      }, 1500);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

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

  const currentOutput = result?.css[outputFormat] ?? "";

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">SVG to CSS</h1>
          <p className="text-muted-foreground text-xs">
            Convert SVG to CSS data URI for use as background-image, mask, or
            list bullets
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
                <CopyButton
                  copied={copied.input}
                  disabled={!input}
                  label="Copy SVG"
                  onCopy={() => handleCopy(input, "input")}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              aria-label="SVG input"
              className="field-sizing-fixed! max-h-[400px] min-h-[200px] resize-y rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:ring-0"
              onChange={(e) => setInput(e.target.value)}
              placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="#6366f1" />\n</svg>`}
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
                    Encoded: {formatBytes(result.encodedSize)}
                  </Badge>
                  {result.encodedSize > result.originalSize && (
                    <Badge variant="outline">
                      +
                      {Math.round(
                        ((result.encodedSize - result.originalSize) /
                          result.originalSize) *
                          100
                      )}
                      %
                    </Badge>
                  )}
                </>
              )}
              {result && !result.isValid && (
                <Badge variant="destructive">{result.error}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CSS Output */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-4">
              <CardTitle>CSS Output</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={(v) => setOutputFormat(v as CssOutputFormat)}
                  value={outputFormat}
                >
                  <SelectTrigger
                    aria-label="Output format"
                    className="h-8 w-[180px] text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(cssFormatLabels) as CssOutputFormat[]).map(
                      (format) => (
                        <SelectItem key={format} value={format}>
                          {cssFormatLabels[format]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <CopyButton
                  copied={copied.output}
                  disabled={!currentOutput}
                  label="Copy CSS"
                  onCopy={() => handleCopy(currentOutput, "output")}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              aria-label="CSS output"
              className="field-sizing-fixed! max-h-[300px] min-h-[120px] resize-y rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:ring-0"
              placeholder="CSS output will appear here..."
              readOnly
              spellCheck={false}
              value={currentOutput}
            />
          </CardContent>
        </Card>

        {/* Preview */}
        {result?.isValid && (
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Preview</CardTitle>
                <ToggleGroup size="sm" variant="outline">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <ToggleGroupItem
                          aria-label="White background"
                          aria-pressed={previewBg === "white"}
                          className="cursor-pointer px-2"
                          onClick={() => setPreviewBg("white")}
                          pressed={previewBg === "white"}
                          value="white"
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
                        <ToggleGroupItem
                          aria-label="Checkered background"
                          aria-pressed={previewBg === "checkered"}
                          className="cursor-pointer px-2"
                          onClick={() => setPreviewBg("checkered")}
                          pressed={previewBg === "checkered"}
                          value="checkered"
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
                        <ToggleGroupItem
                          aria-label="Dark background"
                          aria-pressed={previewBg === "black"}
                          className="cursor-pointer px-2"
                          onClick={() => setPreviewBg("black")}
                          pressed={previewBg === "black"}
                          value="black"
                        />
                      }
                    >
                      <span className="size-3 rounded-sm border bg-zinc-900" />
                    </TooltipTrigger>
                    <TooltipContent>Dark</TooltipContent>
                  </Tooltip>
                </ToggleGroup>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div
                className={`flex items-center justify-center rounded-md border p-8 ${getPreviewBgClass(previewBg)}`}
              >
                <div
                  className="size-24"
                  style={{
                    backgroundImage: `url("${result.dataUri}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:w-72">
        {/* Encoding Options */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm">Encoding</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs
              onValueChange={(v) => setEncoding(v as EncodingType)}
              value={encoding}
            >
              <TabsList className="w-full">
                <TabsTrigger className="flex-1" value="url">
                  URL Encoded
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="base64">
                  Base64
                </TabsTrigger>
              </TabsList>
              <TabsContent className="mt-3" value="url">
                <p className="text-muted-foreground text-xs">
                  URL encoding produces smaller output and works in all modern
                  browsers. Recommended for most use cases.
                </p>
              </TabsContent>
              <TabsContent className="mt-3" value="base64">
                <p className="text-muted-foreground text-xs">
                  Base64 encoding provides better compatibility with legacy
                  browsers (IE9+) but produces larger output.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm">Examples</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-5 gap-2 lg:grid-cols-3">
              {(
                Object.keys(exampleSvgs) as Array<keyof typeof exampleSvgs>
              ).map((key) => (
                <Tooltip key={key}>
                  <TooltipTrigger
                    render={
                      <button
                        aria-label={`Load ${exampleLabels[key]} example`}
                        className="flex cursor-pointer items-center justify-center rounded-md border bg-muted/50 p-2 transition-colors hover:bg-muted"
                        onClick={() => handleLoadExample(key)}
                        tabIndex={0}
                        type="button"
                      />
                    }
                  >
                    <div
                      className="size-6"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - using trusted example SVGs
                      dangerouslySetInnerHTML={{ __html: exampleSvgs[key] }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{exampleLabels[key]}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm">Tips</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="flex flex-col gap-2 text-muted-foreground text-xs">
              <li className="flex gap-2">
                <span className="text-foreground">•</span>
                <span>
                  Optimize your SVG before converting to reduce CSS size
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground">•</span>
                <span>
                  The xmlns attribute is required and will be added
                  automatically
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground">•</span>
                <span>
                  Use mask-image for icons that need to match text color
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground">•</span>
                <span>
                  CSS classes inside SVG won&apos;t work with URL encoding
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

type CopyButtonProps = {
  copied: boolean;
  disabled?: boolean;
  onCopy: () => void;
  label: string;
};

const CopyButton = ({ copied, disabled, onCopy, label }: CopyButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            className="cursor-pointer"
            disabled={disabled}
            onClick={onCopy}
            size="icon-xs"
            tabIndex={0}
            variant="ghost"
          />
        }
      >
        <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={14} />
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied!" : label}</TooltipContent>
    </Tooltip>
  );
};

export default SvgToCssPage;
