"use client";

import {
  Copy01Icon,
  Delete02Icon,
  FileEditIcon,
  MinusSignIcon,
  TextWrapIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
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
  exampleJson,
  exampleYaml,
  formatJson,
  jsonToYaml,
  minifyJson,
  validateJson,
  validateYaml,
  yamlToJson,
} from "@/lib/json-yaml";

type CopiedState = Record<string, boolean>;
type ConversionMode = "json-to-yaml" | "yaml-to-json";

const STORAGE_KEY_INPUT = "devtools:json-yaml:input";
const STORAGE_KEY_MODE = "devtools:json-yaml:mode";

const JsonYamlPage = () => {
  const [mode, setMode] = useState<ConversionMode>("json-to-yaml");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<CopiedState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  const isJsonMode = mode === "json-to-yaml";

  // Load from localStorage on mount
  useEffect(() => {
    const savedInput = localStorage.getItem(STORAGE_KEY_INPUT);
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ConversionMode;

    if (savedMode === "json-to-yaml" || savedMode === "yaml-to-json") {
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

  // Convert when input or mode changes
  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    const result = isJsonMode ? jsonToYaml(input) : yamlToJson(input);
    if (result.success) {
      setOutput(result.output);
      setError(null);
    } else {
      setOutput("");
      setError(result.error || "Conversion failed");
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
  }, []);

  const handleFormatJson = useCallback(() => {
    if (!isJsonMode) return;
    const result = formatJson(input);
    if (result.success) {
      setInput(result.output);
    }
  }, [input, isJsonMode]);

  const handleMinifyJson = useCallback(() => {
    if (!isJsonMode) return;
    const result = minifyJson(input);
    if (result.success) {
      setInput(result.output);
    }
  }, [input, isJsonMode]);

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

  const isValidInput = input.trim()
    ? isJsonMode
      ? validateJson(input).isValid
      : validateYaml(input).isValid
    : null;

  const examples = isJsonMode ? exampleJson : exampleYaml;
  const inputLabel = isJsonMode ? "JSON" : "YAML";
  const outputLabel = isJsonMode ? "YAML" : "JSON";

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="font-medium text-lg">JSON / YAML Converter</h1>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-input bg-muted/30 p-0.5">
              <button
                aria-pressed={isJsonMode}
                className={`cursor-pointer rounded-sm px-3 py-1.5 font-medium text-xs transition-colors ${
                  isJsonMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => handleModeChange("json-to-yaml")}
                tabIndex={0}
                type="button"
              >
                JSON → YAML
              </button>
              <button
                aria-pressed={!isJsonMode}
                className={`cursor-pointer rounded-sm px-3 py-1.5 font-medium text-xs transition-colors ${
                  isJsonMode
                    ? "text-muted-foreground hover:text-foreground"
                    : "bg-background text-foreground shadow-sm"
                }`}
                onClick={() => handleModeChange("yaml-to-json")}
                tabIndex={0}
                type="button"
              >
                YAML → JSON
              </button>
            </div>
          </div>
        </div>

        {/* Input */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>{inputLabel} Input</CardTitle>
              <div className="flex items-center gap-1">
                {isJsonMode && (
                  <>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            aria-label="Format JSON"
                            className="cursor-pointer"
                            disabled={!isValidInput}
                            onClick={handleFormatJson}
                            size="icon-xs"
                            tabIndex={0}
                            variant="ghost"
                          />
                        }
                      >
                        <HugeiconsIcon icon={TextWrapIcon} size={14} />
                      </TooltipTrigger>
                      <TooltipContent>Format JSON</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            aria-label="Minify JSON"
                            className="cursor-pointer"
                            disabled={!isValidInput}
                            onClick={handleMinifyJson}
                            size="icon-xs"
                            tabIndex={0}
                            variant="ghost"
                          />
                        }
                      >
                        <HugeiconsIcon icon={MinusSignIcon} size={14} />
                      </TooltipTrigger>
                      <TooltipContent>Minify JSON</TooltipContent>
                    </Tooltip>
                  </>
                )}
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              aria-label={`${inputLabel} input`}
              className="min-h-[200px] resize-y font-mono text-sm"
              onChange={(e) => setInput(e.target.value)}
              placeholder={isJsonMode ? '{"key": "value"}' : "key: value"}
              spellCheck={false}
              value={input}
            />
            <div className="mt-3 flex items-center gap-2">
              {isValidInput === true && (
                <Badge variant="default">Valid {inputLabel}</Badge>
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
              <CardTitle>{outputLabel} Output</CardTitle>
              <CopyButton
                copied={copied.output}
                label={`Copy ${outputLabel}`}
                onCopy={() => handleCopy(output, "output")}
                text={output}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              aria-label={`${outputLabel} output`}
              className="min-h-[200px] resize-y bg-muted/30 font-mono text-sm"
              placeholder={`${outputLabel} output will appear here...`}
              readOnly
              spellCheck={false}
              value={output}
            />
          </CardContent>
        </Card>
      </div>

      {/* Examples sidebar */}
      <div className="shrink-0 lg:w-72">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={FileEditIcon} size={14} />
              {inputLabel} Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              <ExampleButton
                label="Simple Object"
                onClick={() => handleLoadExample(examples.simple)}
              />
              <ExampleButton
                label="Nested Object"
                onClick={() => handleLoadExample(examples.nested)}
              />
              <ExampleButton
                label="Arrays"
                onClick={() => handleLoadExample(examples.array)}
              />
              <ExampleButton
                label="Kubernetes Config"
                onClick={() => handleLoadExample(examples.complex)}
              />
            </div>
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
  size = "icon-sm",
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

export default JsonYamlPage;
