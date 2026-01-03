"use client";

import { useState, useCallback, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Tick01Icon,
  Delete02Icon,
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseURL, buildURL, type ParsedURL } from "@/lib/url-parser";

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
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium">URL Parser</h1>
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
                type="url"
                placeholder="https://example.com/path?key=value#section"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                aria-label="URL input"
                className="pr-8"
              />
              {urlInput && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={handleClearInput}
                  aria-label="Clear input"
                  tabIndex={0}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </Button>
              )}
            </div>
            <CopyButton
              text={urlInput}
              copied={copied.url}
              onCopy={() => handleCopy(urlInput, "url")}
              label="Copy URL"
            />
          </div>

          {parsed && !parsed.isValid && parsed.error && (
            <Badge variant="destructive" className="mt-3">
              {parsed.error}
            </Badge>
          )}

          {parsed?.isValid && (
            <Badge variant="default" className="mt-3">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urlComponents.map(({ label, value, key }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-sm"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                      {label}
                    </span>
                    <span
                      className="text-xs truncate font-mono"
                      title={value || "(empty)"}
                    >
                      {value || "(empty)"}
                    </span>
                  </div>
                  {value && value !== "(default)" && (
                    <CopyButton
                      text={value}
                      copied={copied[key]}
                      onCopy={() => handleCopy(value, key)}
                      label={`Copy ${label}`}
                      size="icon-xs"
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
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowParams(!showParams)}
                aria-label={showParams ? "Collapse" : "Expand"}
                tabIndex={0}
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
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-sm"
                    >
                      <Input
                        value={param.key}
                        onChange={(e) =>
                          handleUpdateParam(index, "key", e.target.value)
                        }
                        placeholder="Key"
                        aria-label={`Parameter ${index + 1} key`}
                        className="flex-1"
                      />
                      <span className="text-muted-foreground">=</span>
                      <Input
                        value={param.value}
                        onChange={(e) =>
                          handleUpdateParam(index, "value", e.target.value)
                        }
                        placeholder="Value"
                        aria-label={`Parameter ${index + 1} value`}
                        className="flex-1"
                      />
                      <CopyButton
                        text={`${param.key}=${param.value}`}
                        copied={copied[`param-${index}`]}
                        onCopy={() =>
                          handleCopy(
                            `${param.key}=${param.value}`,
                            `param-${index}`
                          )
                        }
                        label="Copy parameter"
                        size="icon-xs"
                      />
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveParam(index)}
                        aria-label="Remove parameter"
                        tabIndex={0}
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
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleAddParam}
                aria-label="Add parameter"
                tabIndex={0}
              >
                <HugeiconsIcon icon={Add01Icon} size={14} data-icon="inline-start" />
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
            variant="ghost"
            size={size}
            onClick={onCopy}
            disabled={!text}
            aria-label={label}
            tabIndex={0}
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
