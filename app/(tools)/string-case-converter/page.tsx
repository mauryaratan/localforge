"use client";

import {
  Copy01Icon,
  Delete02Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  CASE_INFO,
  type CaseType,
  convertCase,
  detectCase,
  getCharacterCount,
  getWordCount,
} from "@/lib/string-case";

type CopiedState = Record<string, boolean>;

const STORAGE_KEY = "devtools:string-case:input";

const EXAMPLE_INPUTS = [
  { label: "Variable name", value: "getUserAccountDetails" },
  { label: "Class name", value: "UserAccountManager" },
  { label: "Constant", value: "MAX_RETRY_COUNT" },
  { label: "URL slug", value: "my-blog-post-title" },
  { label: "Database field", value: "created_at_timestamp" },
  { label: "Title", value: "The Quick Brown Fox Jumps" },
  { label: "Sentence", value: "Hello World from JavaScript" },
  { label: "File path", value: "src/components/Button" },
];

const StringCaseConverterPage = () => {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<CopiedState>({});
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
    if (!isHydrated) {
      return;
    }

    if (input) {
      localStorage.setItem(STORAGE_KEY, input);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [input, isHydrated]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    if (!text) {
      return;
    }

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
    setInput("");
  }, []);

  const handleExampleClick = useCallback((value: string) => {
    setInput(value);
  }, []);

  // Compute all conversions
  const conversions = useMemo(() => {
    if (!input.trim()) {
      return [];
    }

    return CASE_INFO.map((info) => ({
      ...info,
      result: convertCase(input, info.type),
    }));
  }, [input]);

  // Detect input case
  const detectedCase = useMemo(() => {
    return detectCase(input);
  }, [input]);

  // Stats
  const charCount = getCharacterCount(input);
  const charCountNoSpaces = getCharacterCount(input, true);
  const wordCount = getWordCount(input);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">String Case Converter</h1>
          <p className="text-muted-foreground text-xs">
            Convert text between camelCase, PascalCase, snake_case, kebab-case,
            and more
          </p>
        </div>

        {/* Input */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Input</CardTitle>
              {detectedCase && (
                <Badge className="text-[10px]" variant="outline">
                  Detected: {detectedCase}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative">
              <Textarea
                aria-label="Text input"
                className="min-h-24 pr-8 font-mono"
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your text here... Try: getUserAccountDetails, my-blog-post, MAX_RETRY_COUNT"
                value={input}
              />
              {input && (
                <Button
                  aria-label="Clear input"
                  className="absolute top-2 right-1 cursor-pointer"
                  onClick={handleClearInput}
                  size="icon-xs"
                  tabIndex={0}
                  variant="ghost"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </Button>
              )}
            </div>

            {/* Stats */}
            {input && (
              <div className="mt-3 flex flex-wrap gap-3">
                <Badge className="text-[10px]" variant="secondary">
                  {charCount} characters
                </Badge>
                <Badge className="text-[10px]" variant="secondary">
                  {charCountNoSpaces} characters (no spaces)
                </Badge>
                <Badge className="text-[10px]" variant="secondary">
                  {wordCount} words
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversions Grid */}
        {conversions.length > 0 && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Converted Cases</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {conversions.map(({ type, label, result }) => (
                  <ConversionCard
                    caseType={type}
                    copied={copied[type]}
                    key={type}
                    label={label}
                    onCopy={() => handleCopy(result, type)}
                    result={result}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Case Reference */}
        {!input && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Supported Case Formats</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CASE_INFO.map(({ type, label, description, example }) => (
                  <div
                    className="flex flex-col gap-1 rounded-sm bg-muted/50 p-3"
                    key={type}
                  >
                    <span className="font-medium text-xs">{label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {description}
                    </span>
                    <code className="mt-1 font-mono text-[11px] text-primary">
                      {example}
                    </code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar with examples */}
      <div className="shrink-0 lg:sticky lg:top-4 lg:w-64 lg:self-start">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Example Inputs</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              {EXAMPLE_INPUTS.map((example) => (
                <button
                  aria-label={`Use example: ${example.label}`}
                  className="group flex cursor-pointer flex-col items-start gap-0.5 rounded-sm bg-muted/50 p-2 text-left transition-colors hover:bg-muted"
                  key={example.value}
                  onClick={() => handleExampleClick(example.value)}
                  tabIndex={0}
                  type="button"
                >
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {example.label}
                  </span>
                  <code className="font-mono text-xs transition-colors group-hover:text-primary">
                    {example.value}
                  </code>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface ConversionCardProps {
  caseType: CaseType;
  label: string;
  result: string;
  copied: boolean;
  onCopy: () => void;
}

const ConversionCard = ({
  caseType,
  label,
  result,
  copied,
  onCopy,
}: ConversionCardProps) => {
  return (
    <div
      className="group flex items-center justify-between gap-2 rounded-sm bg-muted/50 p-2 transition-colors hover:bg-muted/70"
      data-case={caseType}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="truncate font-mono text-xs" title={result}>
          {result || "(empty)"}
        </span>
      </div>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label={`Copy ${label}`}
              className="cursor-pointer opacity-50 transition-opacity group-hover:opacity-100"
              disabled={!result}
              onClick={onCopy}
              size="icon-xs"
              tabIndex={0}
              variant="ghost"
            />
          }
        >
          <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={14} />
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : `Copy ${label}`}</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default StringCaseConverterPage;
