"use client";

import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Copy01Icon,
  Delete02Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buildURL, type ParsedURL, parseURL } from "@/lib/url-parser";

type CopiedState = Record<string, boolean>;

const STORAGE_KEY = "devtools:url-parser:input";

const URLParserPage = () => {
  const [urlInput, setUrlInput] = useState("");
  const [parsed, setParsed] = useState<ParsedURL | null>(null);
  const [copied, setCopied] = useState<CopiedState>({});
  const [showParams, setShowParams] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setUrlInput(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    if (urlInput) {
      localStorage.setItem(STORAGE_KEY, urlInput);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [urlInput, isHydrated]);

  // Parse URL when input changes
  useEffect(() => {
    if (urlInput) {
      const result = parseURL(urlInput);
      setParsed(result);
    } else {
      setParsed(null);
    }
  }, [urlInput]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      }, 1500);
    } catch {
      // Clipboard API failed
    }
  }, []);

  const handleClearInput = useCallback(() => {
    setUrlInput("");
    setParsed(null);
  }, []);

  const handleUpdateParam = useCallback(
    (index: number, field: "key" | "value", newValue: string) => {
      if (!parsed) return;

      const newParams = [...parsed.searchParams];
      newParams[index] = { ...newParams[index], [field]: newValue };

      const updated = { ...parsed, searchParams: newParams };
      setParsed(updated);
      setUrlInput(buildURL(updated));
    },
    [parsed]
  );

  const handleRemoveParam = useCallback(
    (index: number) => {
      if (!parsed) return;

      const newParams = parsed.searchParams.filter((_, i) => i !== index);
      const updated = { ...parsed, searchParams: newParams };
      setParsed(updated);
      setUrlInput(buildURL(updated));
    },
    [parsed]
  );

  const handleAddParam = useCallback(() => {
    if (!parsed) return;

    const newParams = [...parsed.searchParams, { key: "", value: "" }];
    const updated = { ...parsed, searchParams: newParams };
    setParsed(updated);
  }, [parsed]);

  const urlComponents = parsed?.isValid
    ? [
        { label: "Protocol", value: parsed.protocol, key: "protocol" },
        { label: "Origin", value: parsed.origin, key: "origin" },
        { label: "Host", value: parsed.host, key: "host" },
        { label: "Hostname", value: parsed.hostname, key: "hostname" },
        { label: "Port", value: parsed.port || "(default)", key: "port" },
        { label: "Pathname", value: parsed.pathname, key: "pathname" },
        { label: "Search", value: parsed.search, key: "search" },
        { label: "Hash", value: parsed.hash, key: "hash" },
        { label: "Username", value: parsed.username, key: "username" },
        { label: "Password", value: parsed.password, key: "password" },
      ]
    : [];

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-medium text-lg">URL Parser</h1>
        <p className="text-muted-foreground text-xs">
          Parse, analyze, and modify URL components
        </p>
      </div>

      {/* URL Input */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>URL Input</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                aria-label="URL input"
                className="pr-8"
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/path?key=value#section"
                type="url"
                value={urlInput}
              />
              {urlInput && (
                <Button
                  aria-label="Clear input"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={handleClearInput}
                  size="icon-xs"
                  tabIndex={0}
                  variant="ghost"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </Button>
              )}
            </div>
            <CopyButton
              copied={copied.url}
              label="Copy URL"
              onCopy={() => handleCopy(urlInput, "url")}
              text={urlInput}
            />
          </div>

          {parsed && !parsed.isValid && parsed.error && (
            <Badge className="mt-3" variant="destructive">
              {parsed.error}
            </Badge>
          )}

          {parsed?.isValid && (
            <Badge className="mt-3" variant="default">
              Valid URL
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Parsed Components */}
      {parsed?.isValid && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>URL Components</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {urlComponents.map(({ label, value, key }) => (
                <div
                  className="flex items-center justify-between gap-2 rounded-sm bg-muted/50 p-2"
                  key={key}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {label}
                    </span>
                    <span
                      className="truncate font-mono text-xs"
                      title={value || "(empty)"}
                    >
                      {value || "(empty)"}
                    </span>
                  </div>
                  {value && value !== "(default)" && (
                    <CopyButton
                      copied={copied[key]}
                      label={`Copy ${label}`}
                      onCopy={() => handleCopy(value, key)}
                      size="icon-xs"
                      text={value}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query Parameters */}
      {parsed?.isValid && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>
                Query Parameters ({parsed.searchParams.length})
              </CardTitle>
              <Button
                aria-label={showParams ? "Collapse" : "Expand"}
                onClick={() => setShowParams(!showParams)}
                size="icon-xs"
                tabIndex={0}
                variant="ghost"
              >
                <HugeiconsIcon
                  icon={showParams ? ArrowUp01Icon : ArrowDown01Icon}
                  size={14}
                />
              </Button>
            </div>
          </CardHeader>
          {showParams && (
            <CardContent className="pt-4">
              {parsed.searchParams.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {parsed.searchParams.map((param, index) => (
                    <div
                      className="flex items-center gap-2 rounded-sm bg-muted/50 p-2"
                      key={index}
                    >
                      <Input
                        aria-label={`Parameter ${index + 1} key`}
                        className="flex-1"
                        onChange={(e) =>
                          handleUpdateParam(index, "key", e.target.value)
                        }
                        placeholder="Key"
                        value={param.key}
                      />
                      <span className="text-muted-foreground">=</span>
                      <Input
                        aria-label={`Parameter ${index + 1} value`}
                        className="flex-1"
                        onChange={(e) =>
                          handleUpdateParam(index, "value", e.target.value)
                        }
                        placeholder="Value"
                        value={param.value}
                      />
                      <CopyButton
                        copied={copied[`param-${index}`]}
                        label="Copy parameter"
                        onCopy={() =>
                          handleCopy(
                            `${param.key}=${param.value}`,
                            `param-${index}`
                          )
                        }
                        size="icon-xs"
                        text={`${param.key}=${param.value}`}
                      />
                      <Button
                        aria-label="Remove parameter"
                        onClick={() => handleRemoveParam(index)}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  No query parameters
                </p>
              )}
              <Button
                aria-label="Add parameter"
                className="mt-3"
                onClick={handleAddParam}
                size="sm"
                tabIndex={0}
                variant="outline"
              >
                <HugeiconsIcon
                  data-icon="inline-start"
                  icon={Add01Icon}
                  size={14}
                />
                Add Parameter
              </Button>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

type CopyButtonProps = {
  text: string;
  copied: boolean;
  onCopy: () => void;
  label: string;
  size?: "icon-xs" | "icon-sm" | "icon";
};

const CopyButton = ({
  text,
  copied,
  onCopy,
  label,
  size = "icon-sm",
}: CopyButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            disabled={!text}
            onClick={onCopy}
            size={size}
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

export default URLParserPage;
