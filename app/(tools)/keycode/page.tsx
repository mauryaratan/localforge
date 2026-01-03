"use client";

import { Copy01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatEventJson,
  getKeyDescription,
  getLocationDescription,
  getSimilarKeyCodes,
  getUnicodeChar,
  getUnicodeValue,
  type KeyEventInfo,
  keyboardEventToInfo,
  keyCodeTable,
  modifierSymbols,
} from "@/lib/keycode";

const STORAGE_KEY_HISTORY = "devtools:keycode:history";
const MAX_HISTORY = 20;

const KeycodePage = () => {
  const [currentKey, setCurrentKey] = useState<KeyEventInfo | null>(null);
  const [history, setHistory] = useState<KeyEventInfo[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        // Ignore parse errors
      }
    }
    setIsHydrated(true);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (history.length > 0) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } else {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    }
  }, [history, isHydrated]);

  // Global keydown listener - always active
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Allow browser shortcuts (Cmd+R, Cmd+T, etc.)
      if (event.metaKey || event.ctrlKey) {
        return;
      }

      // Ignore if typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      event.preventDefault();

      const info = keyboardEventToInfo(event, "keydown");
      setCurrentKey(info);

      // Don't add repeating keys to history
      if (!event.repeat) {
        setHistory((prev) => {
          const newHistory = [info, ...prev].slice(0, MAX_HISTORY);
          return newHistory;
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopy = useCallback(async (text: string, label: string) => {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    toast.success("History cleared");
  }, []);

  const handleHistoryClick = useCallback((info: KeyEventInfo) => {
    setCurrentKey(info);
  }, []);

  const similarCodes = currentKey ? getSimilarKeyCodes(currentKey.keyCode) : [];
  const keyDescription = currentKey
    ? getKeyDescription(currentKey.keyCode)
    : null;
  const unicodeValue = currentKey ? getUnicodeValue(currentKey.key) : "";
  const unicodeChar = currentKey ? getUnicodeChar(currentKey.key) : "";

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">JavaScript Keycode Finder</h1>
          <p className="text-muted-foreground text-xs">
            Press any key to see its event properties
          </p>
        </div>

        {/* Key Capture Area */}
        <Card>
          <CardContent className="py-6">
            {currentKey ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                {/* Big keyCode display */}
                <div className="flex flex-col items-center gap-1 sm:min-w-[140px]">
                  <div className="font-bold text-[72px] text-foreground/90 tabular-nums leading-none tracking-tight">
                    {currentKey.keyCode}
                  </div>
                  <span className="font-mono text-muted-foreground text-xs">
                    keyCode
                  </span>
                </div>

                {/* Key properties table */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-muted-foreground text-xs">
                        event.key
                      </span>
                      <button
                        className="cursor-pointer truncate font-medium font-mono hover:text-primary"
                        onClick={() => handleCopy(currentKey.key, "event.key")}
                        tabIndex={0}
                        type="button"
                      >
                        {currentKey.key === " " ? "Space" : currentKey.key}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-muted-foreground text-xs">
                        event.code
                      </span>
                      <button
                        className="cursor-pointer truncate font-medium font-mono hover:text-primary"
                        onClick={() =>
                          handleCopy(currentKey.code, "event.code")
                        }
                        tabIndex={0}
                        type="button"
                      >
                        {currentKey.code}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-muted-foreground text-xs">
                        which
                      </span>
                      <span className="font-medium font-mono tabular-nums">
                        {currentKey.which}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-muted-foreground text-xs">
                        location
                      </span>
                      <span className="font-medium font-mono tabular-nums">
                        {currentKey.location}
                      </span>
                    </div>
                  </div>

                  {/* Modifiers inline */}
                  <div className="mt-3 flex items-center gap-2 border-t pt-3">
                    <span className="text-muted-foreground text-xs">
                      Modifiers:
                    </span>
                    <div className="flex gap-1.5">
                      <ModifierKey
                        active={currentKey.metaKey}
                        label="Meta"
                        symbol={modifierSymbols.meta}
                      />
                      <ModifierKey
                        active={currentKey.shiftKey}
                        label="Shift"
                        symbol={modifierSymbols.shift}
                      />
                      <ModifierKey
                        active={currentKey.altKey}
                        label="Alt"
                        symbol={modifierSymbols.alt}
                      />
                      <ModifierKey
                        active={currentKey.ctrlKey}
                        label="Ctrl"
                        symbol={modifierSymbols.ctrl}
                      />
                    </div>
                    {currentKey.repeat && (
                      <Badge className="ml-auto" variant="secondary">
                        repeat
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-muted-foreground">
                <span className="font-medium text-lg">Press Any Key</span>
                <span className="text-xs">Listening for keypresses...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Grid */}
        {currentKey && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Key & Code */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm">Key Value</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <button
                  className="mb-2 w-full cursor-pointer text-left font-medium font-mono text-xl hover:text-primary"
                  onClick={() => handleCopy(currentKey.key, "event.key")}
                  tabIndex={0}
                  type="button"
                >
                  {currentKey.key === " " ? "Space" : currentKey.key}
                </button>
                <p className="text-muted-foreground text-xs">
                  The value of the key pressed. Accounts for modifiers.
                </p>
              </CardContent>
            </Card>

            {/* Physical Code */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm">Physical Code</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <button
                  className="mb-2 w-full cursor-pointer text-left font-medium font-mono text-xl hover:text-primary"
                  onClick={() => handleCopy(currentKey.code, "event.code")}
                  tabIndex={0}
                  type="button"
                >
                  {currentKey.code}
                </button>
                <p className="text-muted-foreground text-xs">
                  Physical key location, independent of keyboard layout.
                </p>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm">Location</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-2 font-medium font-mono text-xl tabular-nums">
                  {currentKey.location}
                </div>
                <p className="text-muted-foreground text-xs">
                  {getLocationDescription(currentKey.location)}
                </p>
              </CardContent>
            </Card>

            {/* Unicode */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm">Unicode</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {unicodeValue ? (
                  <>
                    <div className="mb-2 flex items-baseline gap-3">
                      <span className="font-mono text-xl">{unicodeChar}</span>
                      <button
                        aria-label={`Copy ${unicodeValue}`}
                        className="cursor-pointer font-mono text-muted-foreground text-sm hover:text-foreground"
                        onClick={() => handleCopy(unicodeValue, "Unicode")}
                        tabIndex={0}
                        type="button"
                      >
                        {unicodeValue}
                      </button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Unicode character and code point.
                    </p>
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Not a printable character
                  </span>
                )}
              </CardContent>
            </Card>

            {/* Similar Keys */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm">Similar Codes</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {similarCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {similarCodes.slice(0, 6).map((code) => (
                      <span
                        className="rounded bg-muted px-2 py-0.5 font-mono text-xs tabular-nums"
                        key={code}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No similar keys
                  </span>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-2 font-medium text-xl capitalize">
                  {keyDescription?.name || "Unknown"}
                </div>
                <p className="text-muted-foreground text-xs">
                  {keyDescription?.description || ""}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Event JSON Dump */}
        {currentKey && (
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Event Object</CardTitle>
                <Button
                  aria-label="Copy event JSON"
                  className="cursor-pointer"
                  onClick={() =>
                    handleCopy(formatEventJson(currentKey), "Event JSON")
                  }
                  size="icon-xs"
                  tabIndex={0}
                  variant="ghost"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <pre className="overflow-x-auto rounded-md bg-muted/50 p-4 font-mono text-xs tabular-nums leading-relaxed">
                {formatEventJson(currentKey)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:h-fit lg:w-72">
        {/* History */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>History</CardTitle>
              {history.length > 0 && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Clear history"
                        className="cursor-pointer"
                        onClick={handleClearHistory}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Clear history</TooltipContent>
                </Tooltip>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {history.length > 0 ? (
              <ScrollArea className="h-[180px]">
                <div className="flex flex-wrap gap-2 pr-3">
                  {history.map((item, index) => (
                    <button
                      aria-label={`View ${item.key} key info`}
                      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border font-mono text-sm tabular-nums transition-all hover:bg-muted ${
                        currentKey?.timestamp === item.timestamp
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background"
                      }`}
                      key={`${item.timestamp}-${index}`}
                      onClick={() => handleHistoryClick(item)}
                      tabIndex={0}
                      type="button"
                    >
                      {getUnicodeChar(item.key) ||
                        (item.key.length <= 3 ? item.key : item.keyCode)}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground text-xs">
                No keys pressed yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Key Reference */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Quick Reference</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ScrollArea className="h-[300px]">
              <div className="pr-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="w-12 pb-2 font-medium">Code</th>
                      <th className="pb-2 font-medium">Key</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {keyCodeTable.map(({ code, description }) => (
                      <tr
                        className={`transition-colors ${
                          currentKey?.keyCode === code
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50"
                        }`}
                        key={code}
                      >
                        <td className="py-1.5 font-mono tabular-nums">
                          {code}
                        </td>
                        <td className="py-1.5">{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Modifier Key Component
interface ModifierKeyProps {
  symbol: string;
  label: string;
  active: boolean;
}

const ModifierKey = ({ symbol, label, active }: ModifierKeyProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            aria-label={`${label}: ${active ? "pressed" : "not pressed"}`}
            className={`flex h-7 w-7 items-center justify-center rounded border text-sm transition-all ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted/50 text-muted-foreground"
            }`}
            role="img"
          />
        }
      >
        {symbol}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

export default KeycodePage;
