"use client";

import {
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  FileEditIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  csvToJson,
  delimiterOptions,
  detectDelimiter,
  exampleCsv,
  exampleJson,
  getCsvStats,
  getJsonArrayStats,
  jsonToCsv,
  validateCsv,
  validateJson,
} from "@/lib/json-csv";

type CopiedState = Record<string, boolean>;
type ConversionMode = "json-to-csv" | "csv-to-json";

const STORAGE_KEY_INPUT = "devtools:json-csv:input";
const STORAGE_KEY_MODE = "devtools:json-csv:mode";

const JsonCsvPage = () => {
  const [mode, setMode] = useState<ConversionMode>("json-to-csv");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<CopiedState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Options for JSON to CSV
  const [delimiter, setDelimiter] = useState(",");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [flattenNested, setFlattenNested] = useState(true);

  // Options for CSV to JSON
  const [hasHeader, setHasHeader] = useState(true);

  // Stats
  const [rowCount, setRowCount] = useState<number | undefined>();
  const [columnCount, setColumnCount] = useState<number | undefined>();

  const isJsonMode = mode === "json-to-csv";

  // Load from localStorage on mount
  useEffect(() => {
    const savedInput = localStorage.getItem(STORAGE_KEY_INPUT);
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ConversionMode;

    if (savedMode === "json-to-csv" || savedMode === "csv-to-json") {
      setMode(savedMode);
    }
    if (savedInput) {
      setInput(savedInput);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input/mode changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    if (input) {
      localStorage.setItem(STORAGE_KEY_INPUT, input);
    } else {
      localStorage.removeItem(STORAGE_KEY_INPUT);
    }
    localStorage.setItem(STORAGE_KEY_MODE, mode);
  }, [input, mode, isHydrated]);

  // Convert when input or options change
  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      setRowCount(undefined);
      setColumnCount(undefined);
      return;
    }

    if (isJsonMode) {
      const result = jsonToCsv(input, {
        delimiter,
        includeHeader,
        flattenNested,
      });
      if (result.success) {
        setOutput(result.output);
        setError(null);
        setRowCount(result.rowCount);
        setColumnCount(result.columnCount);
      } else {
        setOutput("");
        setError(result.error || "Conversion failed");
        setRowCount(undefined);
        setColumnCount(undefined);
      }
    } else {
      const result = csvToJson(input, {
        delimiter,
        hasHeader,
      });
      if (result.success) {
        setOutput(result.output);
        setError(null);
        setRowCount(result.rowCount);
        setColumnCount(result.columnCount);
      } else {
        setOutput("");
        setError(result.error || "Conversion failed");
        setRowCount(undefined);
        setColumnCount(undefined);
      }
    }
  }, [input, isJsonMode, delimiter, includeHeader, flattenNested, hasHeader]);

  // Auto-detect delimiter when CSV input changes
  useEffect(() => {
    if (!isJsonMode && input.trim()) {
      const detected = detectDelimiter(input);
      setDelimiter(detected);
    }
  }, [input, isJsonMode]);

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
    setInput("");
    setOutput("");
    setError(null);
    setRowCount(undefined);
    setColumnCount(undefined);
  }, []);

  const handleModeChange = useCallback(
    (newMode: ConversionMode) => {
      if (newMode === mode) return;

      // Use the current output as the new input (reverse conversion)
      if (output) {
        setInput(output);
      } else {
        setInput("");
      }
      setMode(newMode);
    },
    [mode, output]
  );

  const handleLoadExample = useCallback((example: string) => {
    setInput(example);
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;

    const extension = isJsonMode ? "csv" : "json";
    const mimeType = isJsonMode ? "text/csv" : "application/json";
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, isJsonMode]);

  const isValidInput = useMemo(() => {
    if (!input.trim()) return null;
    return isJsonMode
      ? validateJson(input).isValid
      : validateCsv(input).isValid;
  }, [input, isJsonMode]);

  const inputStats = useMemo(() => {
    if (!input.trim() || !isValidInput) return null;
    return isJsonMode
      ? getJsonArrayStats(input)
      : getCsvStats(input, delimiter);
  }, [input, isJsonMode, isValidInput, delimiter]);

  const inputLabel = isJsonMode ? "JSON" : "CSV";
  const outputLabel = isJsonMode ? "CSV" : "JSON";

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="font-medium text-lg">JSON / CSV Converter</h1>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-input bg-muted/30 p-0.5">
              <button
                aria-pressed={isJsonMode}
                className={`cursor-pointer rounded-sm px-3 py-1.5 font-medium text-xs transition-colors ${
                  isJsonMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => handleModeChange("json-to-csv")}
                tabIndex={0}
                type="button"
              >
                JSON → CSV
              </button>
              <button
                aria-pressed={!isJsonMode}
                className={`cursor-pointer rounded-sm px-3 py-1.5 font-medium text-xs transition-colors ${
                  isJsonMode
                    ? "text-muted-foreground hover:text-foreground"
                    : "bg-background text-foreground shadow-sm"
                }`}
                onClick={() => handleModeChange("csv-to-json")}
                tabIndex={0}
                type="button"
              >
                CSV → JSON
              </button>
            </div>
          </div>
        </div>

        {/* Options */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm">Options</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Label htmlFor="delimiter" className="text-xs whitespace-nowrap">
                  Delimiter
                </Label>
                <Select value={delimiter} onValueChange={(v) => v && setDelimiter(v)}>
                  <SelectTrigger
                    id="delimiter"
                    className="h-8 w-[130px] cursor-pointer"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {delimiterOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="cursor-pointer"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isJsonMode ? (
                <>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="include-header"
                      checked={includeHeader}
                      onCheckedChange={setIncludeHeader}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="include-header" className="cursor-pointer text-xs">
                      Include header row
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="flatten-nested"
                      checked={flattenNested}
                      onCheckedChange={setFlattenNested}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="flatten-nested" className="cursor-pointer text-xs">
                      Flatten nested objects
                    </Label>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Switch
                    id="has-header"
                    checked={hasHeader}
                    onCheckedChange={setHasHeader}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="has-header" className="cursor-pointer text-xs">
                    First row is header
                  </Label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>{inputLabel} Input</CardTitle>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Clear input"
                        className="cursor-pointer"
                        disabled={!input}
                        onClick={handleClearInput}
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
                <CopyButton
                  copied={copied.input}
                  label={`Copy ${inputLabel}`}
                  onCopy={() => handleCopy(input, "input")}
                  text={input}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              aria-label={`${inputLabel} input`}
              className="h-[220px] max-h-[400px] min-h-[180px] resize-y !field-sizing-fixed font-mono text-xs leading-relaxed"
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isJsonMode
                  ? '[{"name": "John", "age": 30}]'
                  : "name,age\nJohn,30"
              }
              spellCheck={false}
              value={input}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {isValidInput === true && (
                <>
                  <Badge variant="default">Valid {inputLabel}</Badge>
                  {inputStats && (
                    <span className="text-muted-foreground text-xs">
                      {isJsonMode
                        ? `${(inputStats as { items: number; keys: number }).items} items · ${(inputStats as { items: number; keys: number }).keys} keys`
                        : `${(inputStats as { rows: number; columns: number }).rows} rows · ${(inputStats as { rows: number; columns: number }).columns} columns`}
                    </span>
                  )}
                </>
              )}
              {isValidInput === false && error && (
                <Badge variant="destructive">{error}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>{outputLabel} Output</CardTitle>
                {rowCount !== undefined && columnCount !== undefined && (
                  <span className="text-muted-foreground text-xs">
                    {rowCount} rows · {columnCount} columns
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label={`Download ${outputLabel}`}
                        className="cursor-pointer"
                        disabled={!output}
                        onClick={handleDownload}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Download01Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Download {outputLabel}</TooltipContent>
                </Tooltip>
                <CopyButton
                  copied={copied.output}
                  label={`Copy ${outputLabel}`}
                  onCopy={() => handleCopy(output, "output")}
                  text={output}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              aria-label={`${outputLabel} output`}
              className="h-[220px] max-h-[400px] min-h-[180px] resize-y !field-sizing-fixed bg-muted/30 font-mono text-xs leading-relaxed"
              placeholder={`${outputLabel} output will appear here...`}
              readOnly
              spellCheck={false}
              value={output}
            />
          </CardContent>
        </Card>
      </div>

      {/* Examples sidebar */}
      <div className="shrink-0 lg:sticky lg:top-4 lg:h-fit lg:w-72">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={FileEditIcon} size={14} />
              {inputLabel} Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              {isJsonMode ? (
                <>
                  <ExampleButton
                    label="Simple Array"
                    onClick={() => handleLoadExample(exampleJson.simple)}
                  />
                  <ExampleButton
                    label="Nested Objects"
                    onClick={() => handleLoadExample(exampleJson.nested)}
                  />
                  <ExampleButton
                    label="Products Data"
                    onClick={() => handleLoadExample(exampleJson.products)}
                  />
                </>
              ) : (
                <>
                  <ExampleButton
                    label="Simple CSV"
                    onClick={() => handleLoadExample(exampleCsv.simple)}
                  />
                  <ExampleButton
                    label="Semicolon Delimited"
                    onClick={() => handleLoadExample(exampleCsv.semicolon)}
                  />
                  <ExampleButton
                    label="Quoted Values"
                    onClick={() => handleLoadExample(exampleCsv.quoted)}
                  />
                </>
              )}
            </div>

            {/* Info section */}
            <div className="mt-6 border-t pt-4">
              <h4 className="mb-2 font-medium text-xs">
                {isJsonMode ? "JSON to CSV" : "CSV to JSON"} Tips
              </h4>
              <div className="flex flex-col gap-2 text-muted-foreground text-xs">
                {isJsonMode ? (
                  <>
                    <p>• Input must be a JSON array of objects or a single object</p>
                    <p>• Nested objects can be flattened with dot notation keys</p>
                    <p>• Arrays within objects are converted to JSON strings</p>
                    <p>• All unique keys across objects become CSV columns</p>
                  </>
                ) : (
                  <>
                    <p>• Delimiter is auto-detected from the first line</p>
                    <p>• Quoted values preserve commas and newlines</p>
                    <p>• Numbers and booleans are parsed automatically</p>
                    <p>• JSON arrays/objects in cells are parsed back</p>
                  </>
                )}
              </div>
            </div>

            {/* Delimiter info */}
            {!isJsonMode && input.trim() && (
              <div className="mt-4 border-t pt-4">
                <h4 className="mb-2 font-medium text-xs">Detected Settings</h4>
                <div className="text-muted-foreground text-xs">
                  <p>
                    Delimiter:{" "}
                    <code className="rounded bg-muted px-1">
                      {delimiter === "\t"
                        ? "Tab"
                        : delimiter === ","
                          ? "Comma"
                          : delimiter === ";"
                            ? "Semicolon"
                            : delimiter === "|"
                              ? "Pipe"
                              : delimiter}
                    </code>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
  size = "icon-xs",
}: CopyButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            className="cursor-pointer"
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

type ExampleButtonProps = {
  label: string;
  onClick: () => void;
};

const ExampleButton = ({ label, onClick }: ExampleButtonProps) => {
  return (
    <Button
      aria-label={`Load ${label} example`}
      className="cursor-pointer justify-start"
      onClick={onClick}
      size="sm"
      tabIndex={0}
      variant="outline"
    >
      {label}
    </Button>
  );
};

export default JsonCsvPage;
