"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Copy01Icon,
  Delete02Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type Base64Mode,
  calculateSizeInfo,
  decodeBase64,
  encodeBase64,
} from "@/lib/base64";

interface CopiedState {
  [key: string]: boolean;
}

const STORAGE_KEY = "devtools:base64:input";

const EXAMPLE_STRINGS = [
  { label: "Hello World", value: "Hello, World!" },
  { label: "JSON Object", value: '{"name":"John","age":30}' },
  { label: "JWT Header", value: '{"alg":"HS256","typ":"JWT"}' },
  { label: "Unicode", value: "Héllo Wörld 你好 🌍" },
  { label: "HTML", value: '<div class="container">Content</div>' },
];

const Base64Page = () => {
  const [plainText, setPlainText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [copied, setCopied] = useState<CopiedState>({});
  const [lastEdited, setLastEdited] = useState<"plain" | "encoded">("plain");
  const [mode, setMode] = useState<Base64Mode>("standard");
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPlainText(saved);
      // Always use standard mode on initial load
      const result = encodeBase64(saved, "standard");
      if (result.success) {
        setEncodedText(result.data);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when plain text changes (after hydration)
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (plainText) {
      localStorage.setItem(STORAGE_KEY, plainText);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [plainText, isHydrated]);

  // Re-encode/decode when mode changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally omitting plainText, encodedText, lastEdited to only trigger on mode change
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (lastEdited === "plain" && plainText) {
      const result = encodeBase64(plainText, mode);
      if (result.success) {
        setEncodedText(result.data);
        setError(null);
      } else {
        setError(result.error || "Encoding failed");
      }
    } else if (lastEdited === "encoded" && encodedText) {
      const result = decodeBase64(encodedText, mode);
      if (result.success) {
        setPlainText(result.data);
        setError(null);
      } else {
        setError(result.error || "Decoding failed");
      }
    }
  }, [mode, isHydrated]);

  const handlePlainTextChange = (value: string) => {
    setPlainText(value);
    setLastEdited("plain");
    const result = encodeBase64(value, mode);
    if (result.success) {
      setEncodedText(result.data);
      setError(null);
    } else {
      setError(result.error || "Encoding failed");
    }
  };

  const handleEncodedTextChange = (value: string) => {
    setEncodedText(value);
    setLastEdited("encoded");
    const result = decodeBase64(value, mode);
    if (result.success) {
      setPlainText(result.data);
      setError(null);
    } else {
      setError(result.error || "Invalid Base64");
    }
  };

  const handleCopy = async (text: string, key: string) => {
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
  };

  const handleClear = () => {
    setPlainText("");
    setEncodedText("");
    setError(null);
  };

  const handleExampleClick = (value: string) => {
    handlePlainTextChange(value);
  };

  const sizeInfo = calculateSizeInfo(plainText, encodedText);

  return (
    <div className="flex max-w-7xl flex-col gap-6 xl:flex-row xl:items-start">
      {/* Main Section */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">Base64 Encoder / Decoder</h1>
          <p className="text-muted-foreground text-xs">
            Encode or decode Base64 strings in real-time
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-3">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
            Mode
          </Label>
          <div className="inline-flex rounded-md border bg-muted/30 p-0.5">
            <button
              aria-label="Standard Base64 mode"
              className={`cursor-pointer rounded px-3 py-1.5 text-xs transition-all ${
                mode === "standard"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMode("standard")}
              tabIndex={0}
              type="button"
            >
              Standard
            </button>
            <button
              aria-label="URL-safe Base64 mode"
              className={`cursor-pointer rounded px-3 py-1.5 text-xs transition-all ${
                mode === "url-safe"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMode("url-safe")}
              tabIndex={0}
              type="button"
            >
              URL-Safe
            </button>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {mode === "url-safe" && "(RFC 4648 / Base64URL)"}
          </span>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Transform</CardTitle>
              <div className="flex items-center gap-2">
                {error && (
                  <span className="text-destructive text-xs">{error}</span>
                )}
                {(plainText || encodedText) && (
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
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">
              {/* Plain Text */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
                    htmlFor="plain-input"
                  >
                    Plain Text
                  </label>
                  <CopyButton
                    copied={copied.plain}
                    label="Copy plain text"
                    onCopy={() => handleCopy(plainText, "plain")}
                    text={plainText}
                  />
                </div>
                <Textarea
                  aria-label="Plain text input"
                  className="min-h-[200px] resize-none font-mono text-xs"
                  id="plain-input"
                  onChange={(e) => handlePlainTextChange(e.target.value)}
                  placeholder="Enter text to encode..."
                  value={plainText}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {sizeInfo.originalBytes} bytes
                  </span>
                  <span className="text-right text-[10px] text-muted-foreground">
                    {plainText.length} characters
                  </span>
                </div>
              </div>

              {/* Direction Indicator */}
              <div className="hidden flex-col items-center justify-center gap-2 pt-8 lg:flex">
                <div
                  className={`rounded-sm p-2 transition-colors ${
                    lastEdited === "plain"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Auto
                </span>
                <div
                  className={`rounded-sm p-2 transition-colors ${
                    lastEdited === "encoded"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                </div>
              </div>

              {/* Encoded (Base64) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
                    htmlFor="encoded-input"
                  >
                    Base64 Encoded
                  </label>
                  <CopyButton
                    copied={copied.encoded}
                    label="Copy encoded text"
                    onCopy={() => handleCopy(encodedText, "encoded")}
                    text={encodedText}
                  />
                </div>
                <Textarea
                  aria-label="Base64 encoded input"
                  className={`min-h-[200px] resize-none font-mono text-xs ${
                    error && lastEdited === "encoded"
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  id="encoded-input"
                  onChange={(e) => handleEncodedTextChange(e.target.value)}
                  placeholder="Enter Base64 to decode..."
                  value={encodedText}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {sizeInfo.encodedBytes} bytes ({sizeInfo.ratio} of original)
                  </span>
                  <span className="text-right text-[10px] text-muted-foreground">
                    {encodedText.length} characters
                  </span>
                </div>
              </div>
            </div>

            {/* Size Info */}
            {plainText && encodedText && (
              <div className="mt-4 flex items-center gap-4 border-t pt-4">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Size Change
                </span>
                <span className="font-mono text-xs">
                  {sizeInfo.increase > 0 ? "+" : ""}
                  {sizeInfo.increase} bytes
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Base64 Character Set</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Standard:
                  </span>
                  <code className="rounded bg-muted/50 px-2 py-1 font-mono text-xs">
                    A-Z a-z 0-9 + / =
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    URL-Safe:
                  </span>
                  <code className="rounded bg-muted/50 px-2 py-1 font-mono text-xs">
                    A-Z a-z 0-9 - _
                  </code>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Base64 encoding increases data size by ~33%. URL-safe mode
                replaces + with - and / with _, and removes padding (=).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Examples */}
      <div className="w-full shrink-0 xl:sticky xl:top-4 xl:w-64">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Examples</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-4">
            {EXAMPLE_STRINGS.map((example) => (
              <button
                aria-label={`Use example: ${example.label}`}
                className="cursor-pointer rounded-md border bg-muted/30 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                key={example.label}
                onClick={() => handleExampleClick(example.value)}
                tabIndex={0}
                type="button"
              >
                <span className="font-medium">{example.label}</span>
                <span className="mt-1 block truncate text-muted-foreground">
                  {example.value}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface CopyButtonProps {
  text: string;
  copied: boolean;
  onCopy: () => void;
  label: string;
}

const CopyButton = ({ text, copied, onCopy, label }: CopyButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            className="cursor-pointer"
            disabled={!text}
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

export default Base64Page;
