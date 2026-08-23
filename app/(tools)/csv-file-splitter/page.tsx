"use client";

import {
  Cancel01Icon,
  Download01Icon,
  FileUploadIcon,
  ScissorIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { StatusRegion } from "@/components/status-region";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToolStorage } from "@/hooks/use-tool-storage";
import { type CsvSplitResult, formatFileSize } from "@/lib/csv-file-splitter";
import { cn, getStorageValue, scheduleStorageValue } from "@/lib/utils";

const STORAGE_KEY_TARGET_MB = "devtools:csv-file-splitter:target-mb";
const STORAGE_KEY_REPEAT_HEADER = "devtools:csv-file-splitter:repeat-header";
const DEFAULT_TARGET_MB = "2";
const BYTES_PER_MB = 1024 * 1024;
const FILE_EXTENSION_REGEX = /\.[^.]+$/;

type ProgressStage = "idle" | "reading" | "splitting" | "zipping" | "ready";

interface ProgressState {
  label: string;
  stage: ProgressStage;
  value: number;
}

type SplitWorkerMessage =
  | {
      id: number;
      progress: number;
      stage: "splitting";
      type: "progress";
    }
  | {
      id: number;
      result: CsvSplitResult;
      type: "complete";
    }
  | {
      error: string;
      id: number;
      type: "error";
    };

const parseTargetBytes = (value: string): number => {
  const sizeInMb = Number(value);
  if (!Number.isFinite(sizeInMb) || sizeInMb <= 0) {
    return 0;
  }
  return Math.round(sizeInMb * BYTES_PER_MB);
};

const CsvFileSplitterPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const readRequestIdRef = useRef(0);
  const splitRequestIdRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileText, setFileText] = useState("");
  const [splitResult, setSplitResult] = useState<CsvSplitResult | null>(null);
  const [targetMb, setTargetMb] = useToolStorage(
    STORAGE_KEY_TARGET_MB,
    DEFAULT_TARGET_MB
  );
  const [repeatHeader, setRepeatHeader] = useState(
    () => getStorageValue(STORAGE_KEY_REPEAT_HEADER, "true") !== "false"
  );
  const repeatHeaderHydratedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({
    label: "",
    stage: "idle",
    value: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repeatHeaderHydratedRef.current) {
      repeatHeaderHydratedRef.current = true;
      return;
    }
    scheduleStorageValue(STORAGE_KEY_REPEAT_HEADER, String(repeatHeader));
  }, [repeatHeader]);

  const targetBytes = useMemo(() => parseTargetBytes(targetMb), [targetMb]);

  const stopWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  useEffect(() => stopWorker, [stopWorker]);

  const runSplitWorker = useCallback(
    (
      text: string,
      fileName: string,
      bytesPerChunk: number,
      header: boolean
    ) => {
      if (bytesPerChunk <= 0) {
        setSplitResult(null);
        setProgress({ label: "", stage: "idle", value: 0 });
        return;
      }

      stopWorker();
      const id = splitRequestIdRef.current + 1;
      splitRequestIdRef.current = id;

      const worker = new Worker(
        new URL("./csv-splitter.worker.ts", import.meta.url),
        { type: "module" }
      );
      workerRef.current = worker;
      setSplitResult(null);
      setError(null);
      setProgress({
        label: "Splitting CSV",
        stage: "splitting",
        value: 0.46,
      });

      worker.onmessage = (event: MessageEvent<SplitWorkerMessage>) => {
        const message = event.data;
        if (message.id !== splitRequestIdRef.current) {
          return;
        }

        if (message.type === "progress") {
          setProgress({
            label: "Splitting CSV",
            stage: message.stage,
            value: message.progress,
          });
          return;
        }

        if (message.type === "complete") {
          setSplitResult(message.result);
          setProgress({ label: "Ready", stage: "ready", value: 1 });
          stopWorker();
          return;
        }

        setError(message.error);
        setSplitResult(null);
        setProgress({ label: "", stage: "idle", value: 0 });
        stopWorker();
      };

      worker.onerror = () => {
        if (id !== splitRequestIdRef.current) {
          return;
        }
        setError("Could not split CSV.");
        setSplitResult(null);
        setProgress({ label: "", stage: "idle", value: 0 });
        stopWorker();
      };

      worker.postMessage({
        fileName,
        id,
        repeatHeader: header,
        targetBytes: bytesPerChunk,
        text,
      });
    },
    [stopWorker]
  );

  useEffect(() => {
    if (!fileText) {
      return;
    }
    runSplitWorker(
      fileText,
      file?.name ?? "split.csv",
      targetBytes,
      repeatHeader
    );
  }, [file?.name, fileText, repeatHeader, runSplitWorker, targetBytes]);

  const readFileText = useCallback((selectedFile: File) => {
    const reader = new FileReader();

    return new Promise<string>((resolve, reject) => {
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.onprogress = (event) => {
        if (!event.lengthComputable) {
          setProgress({
            label: "Reading file",
            stage: "reading",
            value: 0.12,
          });
          return;
        }
        setProgress({
          label: "Reading file",
          stage: "reading",
          value: Math.min((event.loaded / event.total) * 0.45, 0.45),
        });
      };
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.readAsText(selectedFile);
    });
  }, []);

  const handleFile = useCallback(
    async (selectedFile: File | null) => {
      if (!selectedFile) {
        return;
      }

      stopWorker();
      const readId = readRequestIdRef.current + 1;
      readRequestIdRef.current = readId;
      setError(
        targetBytes > 0 ? null : "Enter a target size greater than 0 MB."
      );
      setFile(selectedFile);
      setSplitResult(null);
      setFileText("");
      setProgress({
        label: "Reading file",
        stage: "reading",
        value: 0.02,
      });

      try {
        const text = await readFileText(selectedFile);
        if (readId !== readRequestIdRef.current) {
          return;
        }
        setFileText(text);
        setProgress({
          label: "Splitting CSV",
          stage: "splitting",
          value: 0.46,
        });
      } catch {
        if (readId !== readRequestIdRef.current) {
          return;
        }
        setError("Could not read that file.");
        setFile(null);
        setFileText("");
        setSplitResult(null);
        setProgress({ label: "", stage: "idle", value: 0 });
      }
    },
    [readFileText, stopWorker, targetBytes]
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleFile(event.target.files?.[0] ?? null);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFile(event.dataTransfer.files.item(0));
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    readRequestIdRef.current += 1;
    stopWorker();
    setFile(null);
    setFileText("");
    setSplitResult(null);
    setProgress({ label: "", stage: "idle", value: 0 });
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [stopWorker]);

  const handleDownloadZip = useCallback(async () => {
    if (!(splitResult && file)) {
      return;
    }

    setProgress({
      label: "Creating ZIP",
      stage: "zipping",
      value: 0.04,
    });
    setError(null);

    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const chunk of splitResult.chunks) {
        zip.file(chunk.fileName, chunk.content);
      }
      const blob = await zip.generateAsync({ type: "blob" }, (metadata) => {
        setProgress({
          label: "Creating ZIP",
          stage: "zipping",
          value: Math.min(metadata.percent / 100, 0.98),
        });
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${
        file.name.replace(FILE_EXTENSION_REGEX, "") || "csv-parts"
      }.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setProgress({ label: "Ready", stage: "ready", value: 1 });
      toast.success("ZIP downloaded");
    } catch {
      setProgress({ label: "Ready", stage: "ready", value: 1 });
      setError("Could not create the ZIP file.");
    }
  }, [file, splitResult]);

  const hasValidTarget = targetBytes > 0;
  const isWorking =
    progress.stage === "reading" ||
    progress.stage === "splitting" ||
    progress.stage === "zipping";
  const canDownload =
    Boolean(file && splitResult && splitResult.chunks.length > 0) &&
    !isWorking &&
    hasValidTarget;
  const progressPercent = Math.max(
    0,
    Math.min(Math.round(progress.value * 100), 100)
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <section className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-medium text-lg">CSV File Splitter</h1>
            <Badge variant="secondary">Client-side</Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Split one large CSV into size-based parts, keep rows intact, and
            download every part together as a ZIP.
          </p>
        </section>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Source CSV</CardTitle>
            <CardDescription>
              Files stay in this browser. Quoted multiline rows are kept
              together.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <button
              className={cn(
                "flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed p-6 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-foreground/20 hover:bg-muted/40"
              )}
              onClick={() => inputRef.current?.click()}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              type="button"
            >
              <HugeiconsIcon
                className="size-8 text-muted-foreground"
                icon={file ? ScissorIcon : FileUploadIcon}
              />
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  {file ? file.name : "Drop a CSV file here"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {file
                    ? `${formatFileSize(file.size)} loaded`
                    : "or click to choose one from your Mac"}
                </p>
              </div>
            </button>
            <Input
              accept=".csv,text/csv"
              className="sr-only"
              onChange={handleInputChange}
              ref={inputRef}
              type="file"
            />

            {progress.stage === "idle" ? null : (
              <div
                aria-label={progress.label}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={progressPercent}
                className="flex flex-col gap-2"
                role="progressbar"
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium">{progress.label}</span>
                  <span className="text-muted-foreground">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden border bg-muted">
                  <div
                    className="h-full bg-primary transition-[width] duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {file ? (
              <div className="grid gap-2 text-xs sm:grid-cols-3">
                <div className="border p-3">
                  <p className="text-muted-foreground">Original size</p>
                  <p className="font-medium">{formatFileSize(file.size)}</p>
                </div>
                <div className="border p-3">
                  <p className="text-muted-foreground">Output files</p>
                  <p className="font-medium">
                    {splitResult?.chunks.length ?? 0}
                  </p>
                </div>
                <div className="border p-3">
                  <p className="text-muted-foreground">CSV rows</p>
                  <p className="font-medium">
                    {splitResult?.totalRows.toLocaleString() ?? 0}
                  </p>
                </div>
              </div>
            ) : null}

            <StatusRegion tone="assertive">
              {error ? (
                <p className="border border-destructive/30 bg-destructive/5 p-3 text-destructive text-xs">
                  {error}
                </p>
              ) : null}
            </StatusRegion>
          </CardContent>
        </Card>
      </div>

      <aside className="flex w-full flex-col gap-4 lg:w-72">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Split Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="target-size">Target size per CSV</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="target-size"
                  inputMode="decimal"
                  min="0.1"
                  onChange={(event) => setTargetMb(event.target.value)}
                  step="0.1"
                  type="number"
                  value={targetMb}
                />
                <span className="text-muted-foreground text-xs">MB</span>
              </div>
              <FieldDescription>
                Try 1 or 2 MB for import limits. Large single rows may exceed
                the target.
              </FieldDescription>
            </Field>

            <Field orientation="horizontal">
              <Switch
                aria-label="Repeat header row in every file"
                checked={repeatHeader}
                onCheckedChange={setRepeatHeader}
              />
              <div>
                <FieldLabel>Repeat first row</FieldLabel>
                <FieldDescription>
                  Adds the CSV header to each part.
                </FieldDescription>
              </div>
            </Field>

            <Button
              className="w-full"
              disabled={!canDownload}
              onClick={handleDownloadZip}
            >
              <HugeiconsIcon icon={Download01Icon} />
              {progress.stage === "zipping"
                ? "Creating ZIP..."
                : "Download ZIP"}
            </Button>

            <Button
              className="w-full"
              disabled={!file}
              onClick={handleClear}
              variant="outline"
            >
              <HugeiconsIcon icon={Cancel01Icon} />
              Clear
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {splitResult && splitResult.chunks.length > 0 ? (
              <div className="max-h-72 space-y-2 overflow-auto pr-1">
                {splitResult.chunks.map((chunk) => (
                  <div
                    className="flex items-center justify-between gap-3 border p-2"
                    key={chunk.fileName}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs">
                        {chunk.fileName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {chunk.rowCount.toLocaleString()} rows
                      </p>
                    </div>
                    <Badge variant="outline">
                      {formatFileSize(chunk.byteSize)}
                    </Badge>
                  </div>
                ))}
                {splitResult.oversizedRows > 0 ? (
                  <p className="text-muted-foreground text-xs">
                    {splitResult.oversizedRows} part exceeds the target because
                    a row cannot be split safely.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                Choose a CSV and target size to see the generated files.
              </p>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};

export default CsvFileSplitterPage;
