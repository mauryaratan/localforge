"use client";

import {
  Copy01Icon,
  Delete02Icon,
  FileValidationIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ExampleButton } from "@/components/example-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  schemaExamples,
  validateJsonAgainstSchema,
} from "@/lib/json-schema-validator";
import { getStorageValue, scheduleStorageValue } from "@/lib/utils";

const STORAGE_KEY_DATA = "devtools:json-schema-validator:data";
const STORAGE_KEY_SCHEMA = "devtools:json-schema-validator:schema";

const JsonSchemaValidatorPage = () => {
  const [dataInput, setDataInput] = useState(() =>
    getStorageValue(STORAGE_KEY_DATA)
  );
  const [schemaInput, setSchemaInput] = useState(() =>
    getStorageValue(STORAGE_KEY_SCHEMA)
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    scheduleStorageValue(STORAGE_KEY_DATA, dataInput);
    scheduleStorageValue(STORAGE_KEY_SCHEMA, schemaInput);
  }, [dataInput, isHydrated, schemaInput]);

  const result = useMemo(
    () => validateJsonAgainstSchema(dataInput, schemaInput),
    [dataInput, schemaInput]
  );

  const handleLoadExample = useCallback(() => {
    setDataInput(schemaExamples.data);
    setSchemaInput(schemaExamples.schema);
  }, []);

  const handleClear = useCallback(() => {
    setDataInput("");
    setSchemaInput("");
  }, []);

  const handleCopyIssues = useCallback(async () => {
    const text = result.valid
      ? "JSON matches the schema"
      : JSON.stringify(result.issues, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Result copied");
    } catch {
      toast.error("Failed to copy result");
    }
  }, [result.issues, result.valid]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">JSON Schema Validator</h1>
          <p className="text-muted-foreground text-xs">
            Validate JSON payloads against JSON Schema locally
          </p>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Input</CardTitle>
              <div className="flex items-center gap-2">
                <ExampleButton
                  label="API payload"
                  onClick={handleLoadExample}
                />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Clear validator inputs"
                        className="cursor-pointer"
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
          <CardContent className="grid gap-0 p-0 lg:grid-cols-2">
            <Field className="gap-0 border-b lg:border-r lg:border-b-0">
              <FieldLabel className="border-b px-4 py-2" htmlFor="schema-data">
                JSON Data
              </FieldLabel>
              <Textarea
                aria-label="JSON data"
                className="field-sizing-fixed! min-h-[360px] resize-y rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:ring-0"
                id="schema-data"
                onChange={(event) => setDataInput(event.target.value)}
                placeholder='{"id": 42, "email": "ram@example.com"}'
                spellCheck={false}
                value={dataInput}
              />
            </Field>
            <Field className="gap-0">
              <FieldLabel
                className="border-b px-4 py-2"
                htmlFor="schema-schema"
              >
                JSON Schema
              </FieldLabel>
              <Textarea
                aria-label="JSON Schema"
                className="field-sizing-fixed! min-h-[360px] resize-y rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:ring-0"
                id="schema-schema"
                onChange={(event) => setSchemaInput(event.target.value)}
                placeholder='{"type": "object", "required": ["id"]}'
                spellCheck={false}
                value={schemaInput}
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <aside className="flex w-full flex-col gap-4 lg:w-80">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Result</CardTitle>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label="Copy validation result"
                      className="cursor-pointer"
                      onClick={handleCopyIssues}
                      size="icon-xs"
                      tabIndex={0}
                      variant="ghost"
                    />
                  }
                >
                  <HugeiconsIcon icon={Copy01Icon} size={14} />
                </TooltipTrigger>
                <TooltipContent>Copy result</TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4">
            <Badge variant={result.valid ? "default" : "destructive"}>
              {result.valid ? "Valid" : "Invalid"}
            </Badge>
            {result.error && (
              <p className="text-muted-foreground text-xs">{result.error}</p>
            )}
            {result.valid && (
              <div className="flex items-center gap-2 text-xs">
                <HugeiconsIcon icon={FileValidationIcon} size={16} />
                Schema matched
              </div>
            )}
            {result.issues.length > 0 && (
              <div className="flex flex-col gap-2">
                {result.issues.map((issue) => (
                  <div
                    className="border bg-muted/30 p-2 font-mono text-xs"
                    key={`${issue.schemaPath}-${issue.path}-${issue.keyword}`}
                  >
                    <div className="font-medium">{issue.path}</div>
                    <div className="text-muted-foreground">{issue.message}</div>
                    <div className="mt-1 text-muted-foreground">
                      {issue.keyword} · {issue.schemaPath}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};

export default JsonSchemaValidatorPage;
