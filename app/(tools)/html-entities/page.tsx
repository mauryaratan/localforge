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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  commonEntities,
  decodeHTMLEntities,
  type EncodingMode,
  encodeHTMLEntities,
} from "@/lib/html-entities";

type CopiedState = Record<string, boolean>;

const STORAGE_KEY = "devtools:html-entities:input";

const HTMLEntitiesPage = () => {
  const [decodedText, setDecodedText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [copied, setCopied] = useState<CopiedState>({});
  const [lastEdited, setLastEdited] = useState<"decoded" | "encoded">(
    "decoded"
  );
  const [encodingMode, setEncodingMode] = useState<EncodingMode>("named");
  const [encodeAll, setEncodeAll] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDecodedText(parsed.text || "");
        setEncodingMode(parsed.mode || "named");
        setEncodeAll(parsed.encodeAll ?? false);
        const result = encodeHTMLEntities(parsed.text || "", {
          mode: parsed.mode || "named",
          encodeAll: parsed.encodeAll ?? false,
        });
        setEncodedText(result.encoded);
      } catch {
        // Invalid JSON, treat as plain text
        setDecodedText(saved);
        const result = encodeHTMLEntities(saved, {
          mode: "named",
          encodeAll: false,
        });
        setEncodedText(result.encoded);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when decoded text changes (after hydration)
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (decodedText) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          text: decodedText,
          mode: encodingMode,
          encodeAll,
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [decodedText, encodingMode, encodeAll, isHydrated]);

  const handleDecodedChange = (value: string) => {
    setDecodedText(value);
    const result = encodeHTMLEntities(value, { mode: encodingMode, encodeAll });
    setEncodedText(result.encoded);
    setLastEdited("decoded");
  };

  const handleEncodedChange = (value: string) => {
    setEncodedText(value);
    const result = decodeHTMLEntities(value);
    setDecodedText(result.decoded);
    setLastEdited("encoded");
  };

  const handleModeChange = (mode: EncodingMode) => {
    setEncodingMode(mode);
    if (decodedText) {
      const result = encodeHTMLEntities(decodedText, { mode, encodeAll });
      setEncodedText(result.encoded);
    }
  };

  const handleEncodeAllChange = (checked: boolean) => {
    setEncodeAll(checked);
    if (decodedText) {
      const result = encodeHTMLEntities(decodedText, {
        mode: encodingMode,
        encodeAll: checked,
      });
      setEncodedText(result.encoded);
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
    setDecodedText("");
    setEncodedText("");
  };

  const handleInsertEntity = (char: string) => {
    handleDecodedChange(decodedText + char);
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">HTML Entity Encoder / Decoder</h1>
          <p className="text-muted-foreground text-xs">
            Convert special characters to HTML entities and vice versa
          </p>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Transform</CardTitle>
              <div className="flex items-center gap-3">
                {/* Encoding Mode */}
                <div className="flex items-center gap-2">
                  <Label
                    className="text-muted-foreground text-xs"
                    htmlFor="encoding-mode"
                  >
                    Format
                  </Label>
                  <Select
                    onValueChange={(v) => handleModeChange(v as EncodingMode)}
                    value={encodingMode}
                  >
                    <SelectTrigger
                      className="h-7 w-[120px] text-xs"
                      id="encoding-mode"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="named">Named</SelectItem>
                      <SelectItem value="decimal">Decimal</SelectItem>
                      <SelectItem value="hexadecimal">Hexadecimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Encode All Toggle */}
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    aria-label="Encode all characters"
                    checked={encodeAll}
                    className="h-4 w-4 cursor-pointer rounded border-muted-foreground/30 text-primary focus:ring-primary"
                    onChange={(e) => handleEncodeAllChange(e.target.checked)}
                    type="checkbox"
                  />
                  <span className="text-muted-foreground text-xs">
                    Encode all
                  </span>
                </label>

                {(decodedText || encodedText) && (
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
                    label="Copy decoded text"
                    onCopy={() => handleCopy(decodedText, "decoded")}
                    text={decodedText}
                  />
                </div>
                <Textarea
                  aria-label="Decoded text input"
                  className="min-h-[200px] resize-none font-mono text-xs"
                  id="decoded-input"
                  onChange={(e) => handleDecodedChange(e.target.value)}
                  placeholder="<div>Hello © World</div>"
                  value={decodedText}
                />
                <CharCount text={decodedText} />
              </div>

              {/* Direction Indicator */}
              <div className="hidden flex-col items-center justify-center gap-2 pt-8 lg:flex">
                <div
                  className={`rounded-sm p-2 transition-colors ${
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
                  className={`rounded-sm p-2 transition-colors ${
                    lastEdited === "encoded"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                </div>
              </div>

              {/* Encoded (HTML Entities) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
                    htmlFor="encoded-input"
                  >
                    Encoded (HTML Entities)
                  </label>
                  <CopyButton
                    copied={copied.encoded}
                    label="Copy encoded text"
                    onCopy={() => handleCopy(encodedText, "encoded")}
                    text={encodedText}
                  />
                </div>
                <Textarea
                  aria-label="Encoded text input"
                  className="min-h-[200px] resize-none font-mono text-xs"
                  id="encoded-input"
                  onChange={(e) => handleEncodedChange(e.target.value)}
                  placeholder="&lt;div&gt;Hello &copy; World&lt;/div&gt;"
                  value={encodedText}
                />
                <CharCount text={encodedText} />
              </div>
            </div>

            {/* Format Examples */}
            <div className="mt-6 border-t pt-4">
              <p className="mb-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                Encoding Format Examples
              </p>
              <div className="grid gap-2 text-xs sm:grid-cols-3">
                <div className="rounded-sm bg-muted/50 p-2">
                  <span className="text-muted-foreground">Named:</span>{" "}
                  <code className="font-mono text-foreground">
                    &amp;amp; &amp;lt; &amp;copy;
                  </code>
                </div>
                <div className="rounded-sm bg-muted/50 p-2">
                  <span className="text-muted-foreground">Decimal:</span>{" "}
                  <code className="font-mono text-foreground">
                    &amp;#38; &amp;#60; &amp;#169;
                  </code>
                </div>
                <div className="rounded-sm bg-muted/50 p-2">
                  <span className="text-muted-foreground">Hex:</span>{" "}
                  <code className="font-mono text-foreground">
                    &amp;#x26; &amp;#x3C; &amp;#xA9;
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Common Entities Reference */}
      <div className="w-full shrink-0 lg:sticky lg:top-4 lg:w-72">
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm">Common Entities</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-12rem)] overflow-y-auto pt-3">
            <div className="flex flex-col gap-1">
              {commonEntities.map(({ char, entity, name }) => (
                <button
                  aria-label={`Insert ${name}`}
                  className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                  key={entity}
                  onClick={() => handleInsertEntity(char)}
                  tabIndex={0}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono text-base text-foreground">
                      {char === " " ? "␣" : char}
                    </span>
                    <span className="text-muted-foreground">{name}</span>
                  </div>
                  <code className="font-mono text-[10px] text-primary">
                    {entity}
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

const CharCount = ({ text }: { text: string }) => {
  return (
    <p className="text-right text-[10px] text-muted-foreground">
      {text.length} characters
    </p>
  );
};

export default HTMLEntitiesPage;
