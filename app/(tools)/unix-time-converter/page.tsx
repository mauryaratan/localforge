"use client";

import {
  Add01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Clock01Icon,
  Copy01Icon,
  Delete02Icon,
  FileImportIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  COMMON_TIMEZONES,
  formatInTimezone,
  getAllTimezones,
  getCurrentTimestamps,
  getDetailedRelativeTime,
  getReferenceTimestamps,
  type InputFormat,
  parseInput,
  type TimestampUnit,
  type TimezoneMode,
  type TimezoneResult,
  toMilliseconds,
} from "@/lib/unix-time";

const STORAGE_KEY_INPUT = "devtools:unix-time:input";
const STORAGE_KEY_FORMAT = "devtools:unix-time:format";
const STORAGE_KEY_UNIT = "devtools:unix-time:unit";
const STORAGE_KEY_TIMEZONE = "devtools:unix-time:timezone";
const STORAGE_KEY_EXTRA_TZ = "devtools:unix-time:extra-tz";

const UNIT_OPTIONS: { value: TimestampUnit; label: string }[] = [
  { value: "seconds", label: "Seconds" },
  { value: "milliseconds", label: "Milliseconds" },
  { value: "microseconds", label: "Microseconds" },
  { value: "nanoseconds", label: "Nanoseconds" },
];

const FORMAT_OPTIONS: { value: InputFormat; label: string }[] = [
  { value: "auto", label: "Auto-detect" },
  { value: "seconds", label: "Unix (seconds)" },
  { value: "milliseconds", label: "Unix (milliseconds)" },
  { value: "iso8601", label: "ISO 8601" },
];

type CurrentTimestamps = {
  seconds: number;
  milliseconds: number;
  microseconds: number;
  nanoseconds: number;
};

const UnixTimeConverterPage = () => {
  // Initialize with null to avoid hydration mismatch - timestamps differ between server/client
  const [currentTime, setCurrentTime] = useState<CurrentTimestamps | null>(
    null
  );
  const [input, setInput] = useState("");
  const [inputFormat, setInputFormat] = useState<InputFormat>("auto");
  const [unit, setUnit] = useState<TimestampUnit>("seconds");
  const [timezone, setTimezone] = useState<TimezoneMode>("local");
  const [extraTimezones, setExtraTimezones] = useState<string[]>([]);
  const [selectedTz, setSelectedTz] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [allTimezones, setAllTimezones] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load timezones and set initial time on mount (client-side only)
  useEffect(() => {
    setAllTimezones(getAllTimezones());
    setCurrentTime(getCurrentTimestamps());
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedInput = localStorage.getItem(STORAGE_KEY_INPUT);
    const savedFormat = localStorage.getItem(STORAGE_KEY_FORMAT) as InputFormat;
    const savedUnit = localStorage.getItem(STORAGE_KEY_UNIT) as TimestampUnit;
    const savedTimezone = localStorage.getItem(
      STORAGE_KEY_TIMEZONE
    ) as TimezoneMode;
    const savedExtraTz = localStorage.getItem(STORAGE_KEY_EXTRA_TZ);

    if (savedInput) {
      setInput(savedInput);
    }
    if (savedFormat && FORMAT_OPTIONS.some((o) => o.value === savedFormat)) {
      setInputFormat(savedFormat);
    }
    if (savedUnit && UNIT_OPTIONS.some((o) => o.value === savedUnit)) {
      setUnit(savedUnit);
    }
    if (savedTimezone === "local" || savedTimezone === "utc") {
      setTimezone(savedTimezone);
    }
    if (savedExtraTz) {
      try {
        const parsed = JSON.parse(savedExtraTz);
        if (Array.isArray(parsed)) {
          setExtraTimezones(parsed);
        }
      } catch {
        // Invalid JSON
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when values change (after hydration)
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (input) {
      localStorage.setItem(STORAGE_KEY_INPUT, input);
    } else {
      localStorage.removeItem(STORAGE_KEY_INPUT);
    }

    localStorage.setItem(STORAGE_KEY_FORMAT, inputFormat);
    localStorage.setItem(STORAGE_KEY_UNIT, unit);
    localStorage.setItem(STORAGE_KEY_TIMEZONE, timezone);
    localStorage.setItem(STORAGE_KEY_EXTRA_TZ, JSON.stringify(extraTimezones));
  }, [input, inputFormat, unit, timezone, extraTimezones, isHydrated]);

  // Update current time every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(getCurrentTimestamps());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async (text: string, label?: string) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(label ? `${label} copied` : "Copied");
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text.trim());
      }
    } catch {
      // Clipboard API failed
    }
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const handleUseNow = useCallback(() => {
    const now = currentTime ?? getCurrentTimestamps();
    setInput(now.seconds.toString());
    setInputFormat("seconds");
  }, [currentTime]);

  const handleLoadReference = useCallback((timestamp: number) => {
    setInput(timestamp.toString());
    setInputFormat("seconds");
  }, []);

  const handleAddTimezone = useCallback(() => {
    if (selectedTz && !extraTimezones.includes(selectedTz)) {
      setExtraTimezones((prev) => [...prev, selectedTz]);
      setSelectedTz("");
    }
  }, [selectedTz, extraTimezones]);

  const handleRemoveTimezone = useCallback((tz: string) => {
    setExtraTimezones((prev) => prev.filter((t) => t !== tz));
  }, []);

  // Parse and convert input
  const parseResult = input.trim()
    ? parseInput(input, inputFormat, unit)
    : null;
  const timestamp = parseResult?.success ? parseResult.timestamp : null;
  const date =
    timestamp !== null && timestamp !== undefined
      ? new Date(toMilliseconds(timestamp, unit))
      : null;
  const detailedRelative = date ? getDetailedRelativeTime(date) : null;

  // Format date for extra timezones
  const extraTzResults: TimezoneResult[] = date
    ? extraTimezones
        .map((tz) => formatInTimezone(date, tz))
        .filter((r): r is TimezoneResult => r !== null)
    : [];

  const referenceTimestamps = getReferenceTimestamps(timezone);

  // Available timezones for dropdown (exclude already added)
  const availableTimezones = allTimezones.filter(
    (tz) => !extraTimezones.includes(tz)
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="font-medium text-lg">Unix Time Converter</h1>
          <p className="text-muted-foreground text-sm">
            Convert between Unix timestamps and human-readable dates. Supports
            math expressions like{" "}
            <code className="rounded bg-muted px-1">now+1d</code> or{" "}
            <code className="rounded bg-muted px-1">1704067200+3600</code>
          </p>
        </div>

        {/* Current Unix Time */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="border-primary/10 border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <HugeiconsIcon
                  className="text-primary"
                  icon={Clock01Icon}
                  size={16}
                />
                Current Unix Time
              </CardTitle>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="text-muted-foreground text-xs">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {UNIT_OPTIONS.map((opt) => (
                <CurrentTimeCard
                  key={opt.value}
                  label={opt.label}
                  onCopy={() => {
                    if (currentTime) {
                      handleCopy(
                        currentTime[opt.value].toString(),
                        opt.label
                      );
                    }
                  }}
                  value={currentTime?.[opt.value] ?? null}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <HugeiconsIcon icon={Clock01Icon} size={14} />
                Input
              </CardTitle>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Use current time"
                        className="cursor-pointer"
                        onClick={handleUseNow}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={RefreshIcon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Now</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Paste from clipboard"
                        className="cursor-pointer"
                        onClick={handlePaste}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={FileImportIcon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Paste</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Clear"
                        className="cursor-pointer"
                        disabled={!input}
                        onClick={handleClear}
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  aria-label="Timestamp or date input"
                  className="flex-1 font-mono"
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter timestamp, date, or expression (e.g., now+1d)"
                  type="text"
                  value={input}
                />
                <select
                  aria-label="Input format"
                  className="h-8 w-44 cursor-pointer rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  onChange={(e) =>
                    setInputFormat(e.target.value as InputFormat)
                  }
                  value={inputFormat}
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Output unit:</Label>
                  <ToggleGroup variant="outline" size="sm">
                    {UNIT_OPTIONS.map((opt) => (
                      <ToggleGroupItem
                        key={opt.value}
                        value={opt.value}
                        aria-pressed={unit === opt.value}
                        pressed={unit === opt.value}
                        onClick={() => setUnit(opt.value)}
                        className="cursor-pointer px-2"
                      >
                        {opt.label.slice(0, 2)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Timezone:</Label>
                  <ToggleGroup variant="outline" size="sm">
                    <ToggleGroupItem
                      value="local"
                      aria-pressed={timezone === "local"}
                      pressed={timezone === "local"}
                      onClick={() => setTimezone("local")}
                      className="cursor-pointer px-2.5"
                    >
                      Local
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="utc"
                      aria-pressed={timezone === "utc"}
                      pressed={timezone === "utc"}
                      onClick={() => setTimezone("utc")}
                      className="cursor-pointer px-2.5"
                    >
                      UTC
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              {parseResult?.success === false && (
                <Badge variant="destructive">{parseResult.error}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        {date && timestamp !== null && (
          <Card className="fade-in-50 animate-in duration-200">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                <CardTitle className="text-sm">
                  {timezone === "utc" ? "UTC" : "Local"} Time
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Main formats */}
                <div className="grid gap-2">
                  <DateOutputRow
                    
                    label="Full Date"
                    onCopy={() =>
                      handleCopy(
                        date.toLocaleString("en-US", {
                          timeZone: timezone === "utc" ? "UTC" : undefined,
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        }),
                        "out-full"
                      )
                    }
                    value={date.toLocaleString("en-US", {
                      timeZone: timezone === "utc" ? "UTC" : undefined,
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  />
                  <DateOutputRow
                    
                    label="ISO 8601"
                    onCopy={() => handleCopy(date.toISOString(), "out-iso")}
                    value={date.toISOString()}
                  />
                  <DateOutputRow
                    
                    label="Unix Time"
                    onCopy={() => handleCopy(String(timestamp), "out-unix")}
                    value={String(timestamp)}
                  />
                </div>

                {/* Detailed relative time */}
                {detailedRelative && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">
                      Relative
                    </Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted/50 px-3 py-2 font-mono text-sm">
                        {detailedRelative.formatted}
                      </code>
                      <Button
                        aria-label="Copy relative time"
                        className="cursor-pointer"
                        disabled={!detailedRelative.formatted}
                        onClick={() =>
                          handleCopy(detailedRelative.formatted, "Relative time")
                        }
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      >
                        <HugeiconsIcon icon={Copy01Icon} size={14} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Other formats */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">
                    Other Formats
                  </Label>
                  <div className="grid gap-1.5">
                    <FormatRow
                      
                      label="US Date"
                      onCopy={() => {
                        const m =
                          (timezone === "utc"
                            ? date.getUTCMonth()
                            : date.getMonth()) + 1;
                        const d =
                          timezone === "utc"
                            ? date.getUTCDate()
                            : date.getDate();
                        const y =
                          timezone === "utc"
                            ? date.getUTCFullYear()
                            : date.getFullYear();
                        handleCopy(
                          `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`,
                          "fmt-us"
                        );
                      }}
                      value={(() => {
                        const m =
                          (timezone === "utc"
                            ? date.getUTCMonth()
                            : date.getMonth()) + 1;
                        const d =
                          timezone === "utc"
                            ? date.getUTCDate()
                            : date.getDate();
                        const y =
                          timezone === "utc"
                            ? date.getUTCFullYear()
                            : date.getFullYear();
                        return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
                      })()}
                    />
                    <FormatRow
                      
                      label="ISO Date"
                      onCopy={() => {
                        const y =
                          timezone === "utc"
                            ? date.getUTCFullYear()
                            : date.getFullYear();
                        const m =
                          (timezone === "utc"
                            ? date.getUTCMonth()
                            : date.getMonth()) + 1;
                        const d =
                          timezone === "utc"
                            ? date.getUTCDate()
                            : date.getDate();
                        handleCopy(
                          `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
                          "fmt-iso-date"
                        );
                      }}
                      value={(() => {
                        const y =
                          timezone === "utc"
                            ? date.getUTCFullYear()
                            : date.getFullYear();
                        const m =
                          (timezone === "utc"
                            ? date.getUTCMonth()
                            : date.getMonth()) + 1;
                        const d =
                          timezone === "utc"
                            ? date.getUTCDate()
                            : date.getDate();
                        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                      })()}
                    />
                    <FormatRow
                      
                      label="Date Time"
                      onCopy={() => {
                        const m =
                          (timezone === "utc"
                            ? date.getUTCMonth()
                            : date.getMonth()) + 1;
                        const d =
                          timezone === "utc"
                            ? date.getUTCDate()
                            : date.getDate();
                        const y =
                          timezone === "utc"
                            ? date.getUTCFullYear()
                            : date.getFullYear();
                        const h =
                          timezone === "utc"
                            ? date.getUTCHours()
                            : date.getHours();
                        const min =
                          timezone === "utc"
                            ? date.getUTCMinutes()
                            : date.getMinutes();
                        handleCopy(
                          `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}-${y} ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
                          "fmt-datetime"
                        );
                      }}
                      value={(() => {
                        const m =
                          (timezone === "utc"
                            ? date.getUTCMonth()
                            : date.getMonth()) + 1;
                        const d =
                          timezone === "utc"
                            ? date.getUTCDate()
                            : date.getDate();
                        const y =
                          timezone === "utc"
                            ? date.getUTCFullYear()
                            : date.getFullYear();
                        const h =
                          timezone === "utc"
                            ? date.getUTCHours()
                            : date.getHours();
                        const min =
                          timezone === "utc"
                            ? date.getUTCMinutes()
                            : date.getMinutes();
                        return `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}-${y} ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
                      })()}
                    />
                    <FormatRow
                      
                      label="Short"
                      onCopy={() => {
                        const shortMonths = [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ];
                        const m =
                          timezone === "utc"
                            ? date.getUTCMonth()
                            : date.getMonth();
                        const d =
                          timezone === "utc"
                            ? date.getUTCDate()
                            : date.getDate();
                        const h =
                          timezone === "utc"
                            ? date.getUTCHours()
                            : date.getHours();
                        const min =
                          timezone === "utc"
                            ? date.getUTCMinutes()
                            : date.getMinutes();
                        const h12 = h % 12 || 12;
                        const ampm = h < 12 ? "AM" : "PM";
                        handleCopy(
                          `${shortMonths[m]} ${d}, ${h12}:${String(min).padStart(2, "0")} ${ampm}`,
                          "fmt-short"
                        );
                      }}
                      value={(() => {
                        const shortMonths = [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ];
                        const m =
                          timezone === "utc"
                            ? date.getUTCMonth()
                            : date.getMonth();
                        const d =
                          timezone === "utc"
                            ? date.getUTCDate()
                            : date.getDate();
                        const h =
                          timezone === "utc"
                            ? date.getUTCHours()
                            : date.getHours();
                        const min =
                          timezone === "utc"
                            ? date.getUTCMinutes()
                            : date.getMinutes();
                        const h12 = h % 12 || 12;
                        const ampm = h < 12 ? "AM" : "PM";
                        return `${shortMonths[m]} ${d}, ${h12}:${String(min).padStart(2, "0")} ${ampm}`;
                      })()}
                    />
                    <FormatRow
                      
                      label="Month Year"
                      onCopy={() => {
                        const months = [
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ];
                        const m =
                          timezone === "utc"
                            ? date.getUTCMonth()
                            : date.getMonth();
                        const y =
                          timezone === "utc"
                            ? date.getUTCFullYear()
                            : date.getFullYear();
                        handleCopy(`${months[m]} ${y}`, "fmt-month-year");
                      }}
                      value={(() => {
                        const months = [
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ];
                        const m =
                          timezone === "utc"
                            ? date.getUTCMonth()
                            : date.getMonth();
                        const y =
                          timezone === "utc"
                            ? date.getUTCFullYear()
                            : date.getFullYear();
                        return `${months[m]} ${y}`;
                      })()}
                    />
                  </div>
                </div>

                {/* Multiple Timezones */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground text-xs">
                      Other Timezones
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <select
                      aria-label="Select timezone"
                      className="h-8 flex-1 cursor-pointer rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      onChange={(e) => setSelectedTz(e.target.value)}
                      value={selectedTz}
                    >
                      <option value="">Select timezone...</option>
                      {COMMON_TIMEZONES.filter(
                        (tz) => !extraTimezones.includes(tz)
                      ).map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                      <option disabled>─────────────</option>
                      {availableTimezones
                        .filter(
                          (tz) =>
                            !(
                              COMMON_TIMEZONES.includes(
                                tz as (typeof COMMON_TIMEZONES)[number]
                              ) || extraTimezones.includes(tz)
                            )
                        )
                        .slice(0, 100)
                        .map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                    </select>
                    <Button
                      aria-label="Add timezone"
                      className="cursor-pointer"
                      disabled={!selectedTz}
                      onClick={handleAddTimezone}
                      size="sm"
                      tabIndex={0}
                      variant="outline"
                    >
                      <HugeiconsIcon icon={Add01Icon} size={14} />
                      Add
                    </Button>
                  </div>
                  {extraTzResults.length > 0 && (
                    <div className="space-y-2">
                      {extraTzResults.map((result) => (
                        <div
                          className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2"
                          key={result.timezone}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-xs">
                              {result.timezone}
                            </div>
                            <div className="truncate font-mono text-muted-foreground text-xs">
                              {result.formatted}
                            </div>
                          </div>
                          <Button
                            aria-label={`Copy ${result.timezone} time`}
                            className="cursor-pointer"
                            disabled={!result.formatted}
                            onClick={() =>
                              handleCopy(
                                result.formatted,
                                result.timezone
                              )
                            }
                            size="icon-xs"
                            tabIndex={0}
                            variant="ghost"
                          >
                            <HugeiconsIcon icon={Copy01Icon} size={14} />
                          </Button>
                          <Button
                            aria-label={`Remove ${result.timezone}`}
                            className="cursor-pointer"
                            onClick={() =>
                              handleRemoveTimezone(result.timezone)
                            }
                            size="icon-xs"
                            tabIndex={0}
                            variant="ghost"
                          >
                            <HugeiconsIcon icon={Cancel01Icon} size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="shrink-0 lg:w-72">
        <div className="space-y-4 lg:sticky lg:top-4">
          {/* Reference Timestamps */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm">Reference Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <ReferenceGroup label="Today">
                  <ReferenceItem
                    label="Start"
                    onClick={handleLoadReference}
                    value={referenceTimestamps.startOfDay}
                  />
                  <ReferenceItem
                    label="End"
                    onClick={handleLoadReference}
                    value={referenceTimestamps.endOfDay}
                  />
                </ReferenceGroup>
                <ReferenceGroup label="This Week">
                  <ReferenceItem
                    label="Start"
                    onClick={handleLoadReference}
                    value={referenceTimestamps.startOfWeek}
                  />
                  <ReferenceItem
                    label="End"
                    onClick={handleLoadReference}
                    value={referenceTimestamps.endOfWeek}
                  />
                </ReferenceGroup>
                <ReferenceGroup label="This Month">
                  <ReferenceItem
                    label="Start"
                    onClick={handleLoadReference}
                    value={referenceTimestamps.startOfMonth}
                  />
                  <ReferenceItem
                    label="End"
                    onClick={handleLoadReference}
                    value={referenceTimestamps.endOfMonth}
                  />
                </ReferenceGroup>
                <ReferenceGroup label="This Year">
                  <ReferenceItem
                    label="Start"
                    onClick={handleLoadReference}
                    value={referenceTimestamps.startOfYear}
                  />
                  <ReferenceItem
                    label="End"
                    onClick={handleLoadReference}
                    value={referenceTimestamps.endOfYear}
                  />
                </ReferenceGroup>
              </div>
            </CardContent>
          </Card>

          {/* Expression Tips */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm">Expression Tips</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <code className="text-muted-foreground">now</code>
                  <span>Current time</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-muted-foreground">now+1d</code>
                  <span>Tomorrow</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-muted-foreground">now-1w</code>
                  <span>1 week ago</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-muted-foreground">now+2h</code>
                  <span>2 hours later</span>
                </div>
                <div className="mt-2 border-border/50 border-t pt-2">
                  <span className="text-muted-foreground">
                    Units: s, m, h, d, w
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notable Timestamps */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm">Notable Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <Button
                  aria-label="Load Unix Epoch timestamp"
                  className="w-full cursor-pointer justify-start text-xs"
                  onClick={() => handleLoadReference(0)}
                  size="sm"
                  tabIndex={0}
                  variant="outline"
                >
                  Unix Epoch (0)
                </Button>
                <Button
                  aria-label="Load Y2K timestamp"
                  className="w-full cursor-pointer justify-start text-xs"
                  onClick={() => handleLoadReference(946_684_800)}
                  size="sm"
                  tabIndex={0}
                  variant="outline"
                >
                  Y2K (946684800)
                </Button>
                <Button
                  aria-label="Load Y2038 Problem timestamp"
                  className="w-full cursor-pointer justify-start text-xs"
                  onClick={() => handleLoadReference(2_147_483_647)}
                  size="sm"
                  tabIndex={0}
                  variant="outline"
                >
                  Y2038 (2147483647)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface CurrentTimeCardProps {
  label: string;
  value: number | null;
  onCopy: () => void;
}

const CurrentTimeCard = ({
  label,
  value,
  onCopy,
}: CurrentTimeCardProps) => {
  return (
    <button
      aria-label={`Copy ${label} timestamp`}
      className="group relative flex cursor-pointer flex-col gap-1 rounded-lg border border-border/50 bg-background/60 p-3 text-left transition-colors hover:border-primary/30"
      disabled={value === null}
      onClick={onCopy}
      tabIndex={0}
      type="button"
    >
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="break-all font-mono text-xs">
        {value !== null ? value : "—"}
      </span>
      <span className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
        <HugeiconsIcon
          className="text-muted-foreground"
          icon={Copy01Icon}
          size={12}
        />
      </span>
    </button>
  );
};

interface DateOutputRowProps {
  label: string;
  value: string;
  onCopy: () => void;
}

const DateOutputRow = ({
  label,
  value,
  onCopy,
}: DateOutputRowProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-muted-foreground text-xs">
        {label}
      </span>
      <code className="flex-1 truncate rounded bg-muted/50 px-2 py-1.5 font-mono text-xs">
        {value}
      </code>
      <Button
        aria-label={`Copy ${label}`}
        className="cursor-pointer"
        disabled={!value}
        onClick={onCopy}
        size="icon-xs"
        tabIndex={0}
        variant="ghost"
      >
        <HugeiconsIcon icon={Copy01Icon} size={14} />
      </Button>
    </div>
  );
};

interface FormatRowProps {
  label: string;
  value: string;
  onCopy: () => void;
}

const FormatRow = ({ label, value, onCopy }: FormatRowProps) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <code className="flex-1 truncate rounded bg-muted/30 px-2 py-1 font-mono">
        {value}
      </code>
      <Button
        aria-label={`Copy ${label}`}
        className="cursor-pointer"
        disabled={!value}
        onClick={onCopy}
        size="icon-xs"
        tabIndex={0}
        variant="ghost"
      >
        <HugeiconsIcon icon={Copy01Icon} size={14} />
      </Button>
    </div>
  );
};

interface ReferenceGroupProps {
  label: string;
  children: React.ReactNode;
}

const ReferenceGroup = ({ label, children }: ReferenceGroupProps) => {
  return (
    <div className="space-y-1">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

interface ReferenceItemProps {
  label: string;
  value: number;
  onClick: (value: number) => void;
}

const ReferenceItem = ({ label, value, onClick }: ReferenceItemProps) => {
  return (
    <button
      aria-label={`Load ${label} timestamp`}
      className="group flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 text-xs transition-colors hover:bg-muted/50"
      onClick={() => onClick(value)}
      tabIndex={0}
      type="button"
    >
      <span>{label}</span>
      <code className="font-mono text-muted-foreground transition-colors group-hover:text-foreground">
        {value}
      </code>
    </button>
  );
};

interface ConstantRowProps {
  label: string;
  value: number;
}

// Format number with commas (locale-independent to avoid hydration mismatch)
const formatNumber = (n: number): string => {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const ConstantRow = ({ label, value }: ConstantRowProps) => {
  return (
    <div className="flex items-center justify-between rounded px-2 py-1 transition-colors hover:bg-muted/30">
      <span className="text-muted-foreground">{label}</span>
      <code className="font-mono">{formatNumber(value)}</code>
    </div>
  );
};

export default UnixTimeConverterPage;
