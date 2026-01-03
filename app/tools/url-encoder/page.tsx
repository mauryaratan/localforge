"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Tick01Icon,
  Delete02Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  encodeURLComponent,
  decodeURLComponent,
} from "@/lib/url-parser";

type CopiedState = Record<string, boolean>;

const STORAGE_KEY = "devtools:url-encoder:input";

const URLEncoderPage = () => {
  const [decodedText, setDecodedText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [copied, setCopied] = useState<CopiedState>({});
  const [lastEdited, setLastEdited] = useState<"decoded" | "encoded">("decoded");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setDecodedText(saved);
      setEncodedText(encodeURLComponent(saved));
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when decoded text changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    if (decodedText) {
      localStorage.setItem(STORAGE_KEY, decodedText);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [decodedText, isHydrated]);

  const handleDecodedChange = (value: string) => {
    setDecodedText(value);
    setEncodedText(encodeURLComponent(value));
    setLastEdited("decoded");
  };

  const handleEncodedChange = (value: string) => {
    setEncodedText(value);
    setDecodedText(decodeURLComponent(value));
    setLastEdited("encoded");
  };

  const handleCopy = async (text: string, key: string) => {
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
  };

  const handleClear = () => {
    setDecodedText("");
    setEncodedText("");
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium">URL Encoder / Decoder</h1>
        <p className="text-muted-foreground text-xs">
          Encode or decode URL components in real-time
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Transform</CardTitle>
            {(decodedText || encodedText) && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleClear}
                aria-label="Clear all"
                tabIndex={0}
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} data-icon="inline-start" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
            {/* Decoded (Plain Text) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="decoded-input"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Decoded (Plain Text)
                </label>
                <CopyButton
                  text={decodedText}
                  copied={copied.decoded}
                  onCopy={() => handleCopy(decodedText, "decoded")}
                  label="Copy decoded text"
                />
              </div>
              <Textarea
                id="decoded-input"
                value={decodedText}
                onChange={(e) => handleDecodedChange(e.target.value)}
                placeholder="hello world & special=chars"
                aria-label="Decoded text input"
                className="min-h-[200px] font-mono text-xs resize-none"
              />
              <CharCount text={decodedText} />
            </div>

            {/* Direction Indicator */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-2 pt-8">
              <div
                className={`p-2 rounded-sm transition-colors ${
                  lastEdited === "decoded"
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
                className={`p-2 rounded-sm transition-colors ${
                  lastEdited === "encoded"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              </div>
            </div>

            {/* Encoded (URL Safe) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="encoded-input"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Encoded (URL Safe)
                </label>
                <CopyButton
                  text={encodedText}
                  copied={copied.encoded}
                  onCopy={() => handleCopy(encodedText, "encoded")}
                  label="Copy encoded text"
                />
              </div>
              <Textarea
                id="encoded-input"
                value={encodedText}
                onChange={(e) => handleEncodedChange(e.target.value)}
                placeholder="hello%20world%20%26%20special%3Dchars"
                aria-label="Encoded text input"
                className="min-h-[200px] font-mono text-xs resize-none"
              />
              <CharCount text={encodedText} />
            </div>
          </div>

          {/* Quick Reference */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
              Common Encodings
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { char: " ", encoded: "%20" },
                { char: "&", encoded: "%26" },
                { char: "=", encoded: "%3D" },
                { char: "?", encoded: "%3F" },
                { char: "/", encoded: "%2F" },
                { char: "#", encoded: "%23" },
                { char: "+", encoded: "%2B" },
                { char: "@", encoded: "%40" },
              ].map(({ char, encoded }) => (
                <button
                  key={encoded}
                  type="button"
                  onClick={() => handleDecodedChange(decodedText + char)}
                  className="px-2 py-1 bg-muted/50 hover:bg-muted text-xs font-mono rounded-sm transition-colors"
                  aria-label={`Insert ${char}`}
                  tabIndex={0}
                >
                  <span className="text-foreground">{char === " " ? "␣" : char}</span>
                  <span className="text-muted-foreground mx-1">→</span>
                  <span className="text-primary">{encoded}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

type CopyButtonProps = {
  text: string;
  copied: boolean;
  onCopy: () => void;
  label: string;
};

const CopyButton = ({ text, copied, onCopy, label }: CopyButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
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

const CharCount = ({ text }: { text: string }) => {
  return (
    <p className="text-[10px] text-muted-foreground text-right">
      {text.length} characters
    </p>
  );
};

export default URLEncoderPage;
