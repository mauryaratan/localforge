"use client";

import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { AutoDirectionIndicator } from "@/components/auto-direction-indicator";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCopiedState } from "@/hooks/use-copied-state";
import { decodeURLComponent, encodeURLComponent } from "@/lib/url-parser";
import { scheduleStorageValue } from "@/lib/utils";

const STORAGE_KEY = "devtools:url-encoder:input";

const URLEncoderPage = () => {
  const [decodedText, setDecodedText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const { copied, handleCopy } = useCopiedState();
  const [lastEdited, setLastEdited] = useState<"decoded" | "encoded">(
    "decoded"
  );
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
    if (!isHydrated) {
      return;
    }
    scheduleStorageValue(STORAGE_KEY, decodedText);
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

  const handleClear = () => {
    setDecodedText("");
    setEncodedText("");
  };

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-medium text-lg">URL Encoder / Decoder</h1>
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
                aria-label="Clear all"
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
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">
            {/* Decoded (Plain Text) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
                  htmlFor="decoded-input"
                >
                  Decoded (Plain Text)
                </label>
                <CopyButton
                  copied={copied.decoded}
                  disabled={!decodedText}
                  label="Copy decoded text"
                  onCopy={() => handleCopy(decodedText, "decoded")}
                />
              </div>
              <Textarea
                aria-label="Decoded text input"
                className="min-h-[200px] resize-none font-mono text-xs"
                id="decoded-input"
                onChange={(e) => handleDecodedChange(e.target.value)}
                placeholder="hello world & special=chars"
                value={decodedText}
              />
              <CharCount text={decodedText} />
            </div>

            {/* Direction Indicator */}
            <AutoDirectionIndicator
              forwardActive={lastEdited === "decoded"}
              reverseActive={lastEdited === "encoded"}
            />

            {/* Encoded (URL Safe) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
                  htmlFor="encoded-input"
                >
                  Encoded (URL Safe)
                </label>
                <CopyButton
                  copied={copied.encoded}
                  disabled={!encodedText}
                  label="Copy encoded text"
                  onCopy={() => handleCopy(encodedText, "encoded")}
                />
              </div>
              <Textarea
                aria-label="Encoded text input"
                className="min-h-[200px] resize-none font-mono text-xs"
                id="encoded-input"
                onChange={(e) => handleEncodedChange(e.target.value)}
                placeholder="hello%20world%20%26%20special%3Dchars"
                value={encodedText}
              />
              <CharCount text={encodedText} />
            </div>
          </div>

          {/* Quick Reference */}
          <div className="mt-6 border-t pt-4">
            <p className="mb-2 text-[10px] text-muted-foreground uppercase tracking-wider">
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
                  aria-label={`Insert ${char}`}
                  className="rounded-sm bg-muted/50 px-2 py-1 font-mono text-xs transition-colors hover:bg-muted"
                  key={encoded}
                  onClick={() => handleDecodedChange(decodedText + char)}
                  tabIndex={0}
                  type="button"
                >
                  <span className="text-foreground">
                    {char === " " ? "␣" : char}
                  </span>
                  <span className="mx-1 text-muted-foreground">→</span>
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

const CharCount = ({ text }: { text: string }) => {
  return (
    <p className="text-right text-[10px] text-muted-foreground">
      {text.length} characters
    </p>
  );
};

export default URLEncoderPage;
