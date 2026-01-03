"use client";

import {
  Copy01Icon,
  Delete02Icon,
  RefreshIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  type GeneratedId,
  type IdFormat,
  type ParsedId,
  type UuidStyle,
  generateIds,
  getFormatInfo,
  parseId,
} from "@/lib/uuid-ulid";

const STORAGE_KEY = "devtools:uuid-generator:settings";

interface StoredSettings {
  format: IdFormat;
  count: number;
  style: UuidStyle;
  withHyphens: boolean;
}

const defaultSettings: StoredSettings = {
  format: "uuid-v4",
  count: 1,
  style: "lowercase",
  withHyphens: true,
};

const UuidGeneratorPage = () => {
  const [format, setFormat] = useState<IdFormat>("uuid-v4");
  const [count, setCount] = useState(1);
  const [style, setStyle] = useState<UuidStyle>("lowercase");
  const [withHyphens, setWithHyphens] = useState(true);
  const [generatedIds, setGeneratedIds] = useState<GeneratedId[]>([]);
  const [parseInput, setParseInput] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedId | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const settings: StoredSettings = JSON.parse(saved);
        setFormat(settings.format);
        setCount(settings.count);
        setStyle(settings.style);
        setWithHyphens(settings.withHyphens);
      } catch {
        // Invalid JSON, use defaults
      }
    }
    setIsHydrated(true);
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    const settings: StoredSettings = { format, count, style, withHyphens };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [format, count, style, withHyphens, isHydrated]);

  // Generate initial IDs
  useEffect(() => {
    if (!isHydrated) return;
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  const handleGenerate = () => {
    const ids = generateIds(format, count, style);
    setGeneratedIds(ids);
  };

  const handleFormatChange = (newFormat: IdFormat) => {
    setFormat(newFormat);
    // Generate new IDs immediately when format changes
    const ids = generateIds(newFormat, count, style);
    setGeneratedIds(ids);
  };

  const handleCountChange = (value: number | readonly number[]) => {
    const newCount = Array.isArray(value) ? value[0] : value;
    setCount(newCount);
  };

  const handleStyleChange = (newStyle: UuidStyle) => {
    setStyle(newStyle);
    // Re-apply style to existing IDs
    setGeneratedIds((prev) =>
      prev.map((id) => ({
        ...id,
        value:
          id.format === "ulid"
            ? id.value
            : newStyle === "uppercase"
              ? id.value.toUpperCase()
              : id.value.toLowerCase(),
      }))
    );
  };

  const handleHyphensChange = (checked: boolean) => {
    setWithHyphens(checked);
    // Re-apply format to existing UUIDs
    setGeneratedIds((prev) =>
      prev.map((id) => {
        if (id.format === "ulid") return id;
        const clean = id.value.replace(/-/g, "");
        const formatted = checked
          ? [
              clean.slice(0, 8),
              clean.slice(8, 12),
              clean.slice(12, 16),
              clean.slice(16, 20),
              clean.slice(20, 32),
            ].join("-")
          : clean;
        return {
          ...id,
          value:
            style === "uppercase"
              ? formatted.toUpperCase()
              : formatted.toLowerCase(),
        };
      })
    );
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyAll = async () => {
    const allIds = generatedIds.map((id) => id.value).join("\n");
    await handleCopy(allIds);
  };

  const handleClear = () => {
    setGeneratedIds([]);
  };

  const handleParseInputChange = (value: string) => {
    setParseInput(value);
    if (value.trim()) {
      const result = parseId(value);
      setParsedResult(result);
    } else {
      setParsedResult(null);
    }
  };

  const formatInfo = getFormatInfo(format);

  return (
    <div className="flex max-w-7xl flex-col gap-6 xl:flex-row xl:items-start">
      {/* Main Section */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">UUID / ULID Generator</h1>
          <p className="text-muted-foreground text-xs">
            Generate unique identifiers for your applications
          </p>
        </div>

        {/* Format Selection */}
        <div className="flex flex-col gap-3">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
            Format
          </Label>
          <ToggleGroup variant="outline" size="sm" className="justify-start">
            <ToggleGroupItem
              value="uuid-v4"
              aria-label="UUID v4 format"
              aria-pressed={format === "uuid-v4"}
              pressed={format === "uuid-v4"}
              onClick={() => handleFormatChange("uuid-v4")}
              className="cursor-pointer px-3"
            >
              UUID v4
            </ToggleGroupItem>
            <ToggleGroupItem
              value="uuid-v7"
              aria-label="UUID v7 format"
              aria-pressed={format === "uuid-v7"}
              pressed={format === "uuid-v7"}
              onClick={() => handleFormatChange("uuid-v7")}
              className="cursor-pointer px-3"
            >
              UUID v7
            </ToggleGroupItem>
            <ToggleGroupItem
              value="ulid"
              aria-label="ULID format"
              aria-pressed={format === "ulid"}
              pressed={format === "ulid"}
              onClick={() => handleFormatChange("ulid")}
              className="cursor-pointer px-3"
            >
              ULID
            </ToggleGroupItem>
          </ToggleGroup>
          <p className="text-[10px] text-muted-foreground">
            {formatInfo.description}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-end gap-6">
          {/* Count */}
          <div className="flex min-w-[200px] flex-col gap-3">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Count: {count}
            </Label>
            <Slider
              value={[count]}
              onValueChange={handleCountChange}
              min={1}
              max={50}
              step={1}
              className="cursor-pointer"
              aria-label="Number of IDs to generate"
            />
          </div>

          {/* Style (only for UUIDs) */}
          {format !== "ulid" && (
            <div className="flex flex-col gap-3">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                Case
              </Label>
              <ToggleGroup variant="outline" size="sm">
                <ToggleGroupItem
                  value="lowercase"
                  aria-label="Lowercase"
                  aria-pressed={style === "lowercase"}
                  pressed={style === "lowercase"}
                  onClick={() => handleStyleChange("lowercase")}
                  className="cursor-pointer px-3"
                >
                  lower
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="uppercase"
                  aria-label="Uppercase"
                  aria-pressed={style === "uppercase"}
                  pressed={style === "uppercase"}
                  onClick={() => handleStyleChange("uppercase")}
                  className="cursor-pointer px-3"
                >
                  UPPER
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Hyphens (only for UUIDs) */}
          {format !== "ulid" && (
            <div className="flex items-center gap-3">
              <Switch
                id="hyphens"
                checked={withHyphens}
                onCheckedChange={handleHyphensChange}
                className="cursor-pointer"
                aria-label="Include hyphens"
              />
              <Label
                htmlFor="hyphens"
                className="cursor-pointer text-xs text-muted-foreground"
              >
                Hyphens
              </Label>
            </div>
          )}
        </div>

        {/* Generated IDs */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Generated
                {generatedIds.length > 0 && (
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-normal text-muted-foreground">
                    {generatedIds.length}
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  aria-label="Generate new IDs"
                  className="cursor-pointer"
                  onClick={handleGenerate}
                  size="xs"
                  tabIndex={0}
                  variant="outline"
                >
                  <HugeiconsIcon
                    data-icon="inline-start"
                    icon={RefreshIcon}
                    size={14}
                  />
                  Generate
                </Button>
                {generatedIds.length > 0 && (
                  <>
                    <Button
                      aria-label="Copy all IDs"
                      className="cursor-pointer"
                      onClick={handleCopyAll}
                      size="xs"
                      tabIndex={0}
                      variant="ghost"
                    >
                      <HugeiconsIcon
                        data-icon="inline-start"
                        icon={Copy01Icon}
                        size={14}
                      />
                      Copy All
                    </Button>
                    <Button
                      aria-label="Clear all"
                      className="cursor-pointer"
                      onClick={handleClear}
                      size="xs"
                      tabIndex={0}
                      variant="ghost"
                    >
                      <HugeiconsIcon
                        data-icon="inline-start"
                        icon={Delete02Icon}
                        size={14}
                      />
                      Clear
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {generatedIds.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                Click "Generate" to create IDs
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {generatedIds.map((id, index) => (
                  <div
                    key={`${id.value}-${index}`}
                    className="group flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50"
                  >
                    <code className="flex-1 font-mono text-xs break-all">
                      {id.value}
                    </code>
                    {id.timestampReadable && (
                      <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:inline">
                        {id.timestampReadable}
                      </span>
                    )}
                    <Button
                      aria-label="Copy ID"
                      className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleCopy(id.value)}
                      size="icon-xs"
                      tabIndex={0}
                      variant="ghost"
                    >
                      <HugeiconsIcon icon={Copy01Icon} size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parser */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Search01Icon} size={16} />
              Parse / Validate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Enter a UUID or ULID to parse..."
                value={parseInput}
                onChange={(e) => handleParseInputChange(e.target.value)}
                className="font-mono text-xs"
                aria-label="UUID or ULID to parse"
              />
              {parsedResult && (
                <div className="rounded-md border bg-muted/30 p-4">
                  <div className="grid gap-3 text-xs sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                        Status
                      </span>
                      <span
                        className={
                          parsedResult.isValid
                            ? "text-green-600 dark:text-green-400"
                            : "text-destructive"
                        }
                      >
                        {parsedResult.isValid ? "Valid" : "Invalid"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                        Format
                      </span>
                      <span>
                        {parsedResult.format === "uuid-v4" && "UUID v4"}
                        {parsedResult.format === "uuid-v7" && "UUID v7"}
                        {parsedResult.format === "ulid" && "ULID"}
                        {parsedResult.format === "unknown" && "Unknown"}
                        {parsedResult.version !== undefined &&
                          parsedResult.version !== 4 &&
                          parsedResult.version !== 7 &&
                          ` (v${parsedResult.version})`}
                      </span>
                    </div>
                    {parsedResult.variant && (
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                          Variant
                        </span>
                        <span>{parsedResult.variant}</span>
                      </div>
                    )}
                    {parsedResult.timestampReadable && (
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                          Timestamp
                        </span>
                        <span>{parsedResult.timestampReadable}</span>
                      </div>
                    )}
                    {parsedResult.timestamp && (
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                          Unix (ms)
                        </span>
                        <span className="font-mono">{parsedResult.timestamp}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Info & Reference */}
      <div className="w-full shrink-0 xl:sticky xl:top-4 xl:w-72">
        <div className="flex flex-col gap-4">
          {/* Format Comparison */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Format Comparison</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">UUID v4</span>
                    <span className="text-muted-foreground">36 chars</span>
                  </div>
                  <code className="rounded bg-muted/50 px-2 py-1 font-mono text-[10px] break-all">
                    xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
                  </code>
                  <p className="text-[10px] text-muted-foreground">
                    Random, not sortable. Best for distributed systems.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">UUID v7</span>
                    <span className="text-muted-foreground">36 chars</span>
                  </div>
                  <code className="rounded bg-muted/50 px-2 py-1 font-mono text-[10px] break-all">
                    tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
                  </code>
                  <p className="text-[10px] text-muted-foreground">
                    Time-ordered. Great for database primary keys.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ULID</span>
                    <span className="text-muted-foreground">26 chars</span>
                  </div>
                  <code className="rounded bg-muted/50 px-2 py-1 font-mono text-[10px] break-all">
                    01ARZ3NDEKTSV4RRFFQ69G5FAV
                  </code>
                  <p className="text-[10px] text-muted-foreground">
                    Lexicographically sortable. Compact and URL-safe.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Use Cases</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-4">
              <div className="rounded-md border bg-muted/30 px-3 py-2">
                <span className="font-medium text-xs">Database Primary Keys</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  UUID v7 or ULID for time-ordered queries
                </p>
              </div>
              <div className="rounded-md border bg-muted/30 px-3 py-2">
                <span className="font-medium text-xs">API Keys</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  UUID v4 for unpredictable tokens
                </p>
              </div>
              <div className="rounded-md border bg-muted/30 px-3 py-2">
                <span className="font-medium text-xs">Event Streams</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  ULID for sortable event IDs
                </p>
              </div>
              <div className="rounded-md border bg-muted/30 px-3 py-2">
                <span className="font-medium text-xs">URL Slugs</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  ULID for compact, URL-safe IDs
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UuidGeneratorPage;
