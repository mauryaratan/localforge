// biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: this interactive tool keeps related UI state in one component intentionally

"use client";

import {
  Delete02Icon,
  Download01Icon,
  FileEditIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { ExampleButton } from "@/components/example-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
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
import { useCopiedState } from "@/hooks/use-copied-state";
import { useToolStorage } from "@/hooks/use-tool-storage";
import {
  type ConversionResult,
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

type ConversionMode = "json-to-csv" | "csv-to-json";

const STORAGE_KEY_INPUT = "devtools:json-csv:input";
const STORAGE_KEY_MODE = "devtools:json-csv:mode";

const getDelimiterLabel = (delimiter: string) => {
  switch (delimiter) {
    case "\t":
      return "Tab";
    case ",":
      return "Comma";
    case ";":
      return "Semicolon";
    case "|":
      return "Pipe";
    default:
      return delimiter;
  }
};

const JsonCsvPage = () => {
  const [input, setInput] = useToolStorage(STORAGE_KEY_INPUT);
  const [modeStr, setModeStr] = useToolStorage(STORAGE_KEY_MODE, "json-to-csv");
  const mode = (
    modeStr === "csv-to-json" ? "csv-to-json" : "json-to-csv"
  ) as ConversionMode;
  const setMode = setModeStr;
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { copied, handleCopy } = useCopiedState();

  // Options for JSON to CSV
  const [delimiter, setDelimiter] = useState(",");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [flattenNested, setFlattenNested] = useState(true);

  // Options for CSV to JSON
  const [hasHeader, setHasHeader] = useState(true);

  // Tracks whether the user manually picked a delimiter, so auto-detection
  // never overwrites a manual choice. Reset on clear and mode toggle.
  const userPickedDelimiterRef = useRef(false);

  // Stats
  const [rowCount, setRowCount] = useState<number | undefined>();
  const [columnCount, setColumnCount] = useState<number | undefined>();

  const isJsonMode = mode === "json-to-csv";

  // Convert when input or options change. In CSV mode the delimiter is
  // auto-detected in the same pass unless the user picked one manually, so
  // a conversion never runs with a delimiter that is about to be replaced.
  useEffect(() => {
    if (!input.trim()) {
      userPickedDelimiterRef.current = false;
      setOutput("");
      setError(null);
      setRowCount(undefined);
      setColumnCount(undefined);
      return;
    }

    let result: ConversionResult;
    if (isJsonMode) {
      result = jsonToCsv(input, {
        delimiter,
        includeHeader,
        flattenNested,
      });
    } else {
      let csvDelimiter = delimiter;
      if (!userPickedDelimiterRef.current) {
        csvDelimiter = detectDelimiter(input);
        setDelimiter(csvDelimiter);
      }
      result = csvToJson(input, {
        delimiter: csvDelimiter,
        hasHeader,
      });
    }

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
  }, [input, isJsonMode, delimiter, includeHeader, flattenNested, hasHeader]);

  const handleClearInput = useCallback(() => {
    userPickedDelimiterRef.current = false;
    setInput("");
    setOutput("");
    setError(null);
    setRowCount(undefined);
    setColumnCount(undefined);
  }, [setInput]);

  const handleModeChange = useCallback(
    (newMode: ConversionMode) => {
      if (newMode === mode) {
        return;
      }

      userPickedDelimiterRef.current = false;
      // Use the current output as the new input (reverse conversion).
      // When conversion failed (empty output), keep the existing input so
      // toggling modes never wipes the user's text.
      if (output) {
        setInput(output);
      }
      setMode(newMode);
    },
    [mode, output, setInput, setMode]
  );

  const handleLoadExample = useCallback(
    (example: string) => {
      setInput(example);
    },
    [setInput]
  );

  const handleDownload = useCallback(() => {
    if (!output) {
      return;
    }

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
    if (!input.trim()) {
      return null;
    }
    return isJsonMode
      ? validateJson(input).isValid
      : validateCsv(input).isValid;
  }, [input, isJsonMode]);

  const inputStats = useMemo(() => {
    if (!(input.trim() && isValidInput)) {
      return null;
    }
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
                <FieldLabel
                  className="whitespace-nowrap text-xs"
                  htmlFor="delimiter"
                >
                  Delimiter
                </FieldLabel>
                <Select
                  onValueChange={(v) => {
                    if (!v) {
                      return;
                    }
                    userPickedDelimiterRef.current = true;
                    setDelimiter(v);
                  }}
                  value={delimiter}
                >
                  <SelectTrigger
                    className="h-8 w-[130px] cursor-pointer"
                    id="delimiter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {delimiterOptions.map((opt) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={opt.value}
                        value={opt.value}
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
                      checked={includeHeader}
                      className="cursor-pointer"
                      id="include-header"
                      onCheckedChange={setIncludeHeader}
                    />
                    <FieldLabel
                      className="cursor-pointer text-xs"
                      htmlFor="include-header"
                    >
                      Include header row
                    </FieldLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={flattenNested}
                      className="cursor-pointer"
                      id="flatten-nested"
                      onCheckedChange={setFlattenNested}
                    />
                    <FieldLabel
                      className="cursor-pointer text-xs"
                      htmlFor="flatten-nested"
                    >
                      Flatten nested objects
                    </FieldLabel>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={hasHeader}
                    className="cursor-pointer"
                    id="has-header"
                    onCheckedChange={setHasHeader}
                  />
                  <FieldLabel
                    className="cursor-pointer text-xs"
                    htmlFor="has-header"
                  >
                    First row is header
                  </FieldLabel>
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
                  disabled={!input}
                  label={`Copy ${inputLabel}`}
                  onCopy={() => handleCopy(input, "input")}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              aria-label={`${inputLabel} input`}
              className="!field-sizing-fixed h-[220px] max-h-[400px] min-h-[180px] resize-y font-mono text-xs leading-relaxed"
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
                  disabled={!output}
                  label={`Copy ${outputLabel}`}
                  onCopy={() => handleCopy(output, "output")}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              aria-label={`${outputLabel} output`}
              className="!field-sizing-fixed h-[220px] max-h-[400px] min-h-[180px] resize-y bg-muted/30 font-mono text-xs leading-relaxed"
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
                    <p>
                      • Input must be a JSON array of objects or a single object
                    </p>
                    <p>
                      • Nested objects can be flattened with dot notation keys
                    </p>
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
                      {getDelimiterLabel(delimiter)}
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

export default JsonCsvPage;
