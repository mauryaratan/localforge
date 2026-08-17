"use client";

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
import { Badge } from "@/components/ui/badge";
import { getMarkdownStats } from "@/lib/markdown-preview";
import {
  getMarkdownFileName,
  getPdfErrorMessage,
  type MarkdownProfile,
  type PdfConversionOptions,
  type PdfInspectionResult,
  type PdfWorkerResponse,
  parsePageSelection,
  validatePdfFile,
} from "@/lib/pdf-to-markdown";
import { PdfOutputCard } from "./pdf-output-card";
import {
  ConversionSettingsCard,
  DocumentCard,
  PrivacyCard,
} from "./pdf-sidebar";
import { PdfSourceCard } from "./pdf-source-card";

type ConversionStage = "converting" | "idle" | "loading-engine" | "reading";

const getStageLabel = (stage: ConversionStage): string => {
  if (stage === "reading") {
    return "Reading PDF";
  }
  if (stage === "loading-engine") {
    return "Loading local conversion engine";
  }
  if (stage === "converting") {
    return "Reconstructing Markdown";
  }
  return "";
};

const showResultToast = (result: PdfInspectionResult) => {
  if (result.markdown?.trim()) {
    toast.success("PDF converted to Markdown");
    return;
  }
  if (result.pagesNeedingOcr.length > 0) {
    toast.warning("This PDF needs OCR for usable text");
    return;
  }
  toast.warning("No Markdown could be extracted");
};

const PdfToMarkdownPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PdfInspectionResult | null>(null);
  const [engineVersion, setEngineVersion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<ConversionStage>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [profile, setProfile] = useState<MarkdownProfile>("fidelity");
  const [pageSelection, setPageSelection] = useState("");
  const [pageSelectionError, setPageSelectionError] = useState<string | null>(
    null
  );
  const [includePageMarkers, setIncludePageMarkers] = useState(false);
  const [includeImages, setIncludeImages] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("markdown");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const copyResetTimeoutRef = useRef<number | null>(null);

  const markdown = result?.markdown ?? "";
  const markdownStats = useMemo(() => getMarkdownStats(markdown), [markdown]);
  const isWorking = stage !== "idle";
  const stageLabel = getStageLabel(stage);

  const stopWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  const createWorker = useCallback(() => {
    if (workerRef.current) {
      return workerRef.current;
    }

    const worker = new Worker(
      new URL("./pdf-converter.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event: MessageEvent<PdfWorkerResponse>) => {
      const message = event.data;
      if (message.id !== requestIdRef.current) {
        return;
      }

      if (message.type === "progress") {
        setStage(message.stage);
        return;
      }

      if (message.type === "error") {
        setError(getPdfErrorMessage(message.error));
        setResult(null);
        setStage("idle");
        return;
      }

      setResult(message.result);
      setEngineVersion(message.engineVersion);
      setError(null);
      setStage("idle");
      setCopied(false);
      setActiveTab("markdown");
      showResultToast(message.result);
    };

    worker.onerror = () => {
      setError("The local conversion engine could not start.");
      setResult(null);
      setStage("idle");
      stopWorker();
    };

    workerRef.current = worker;
    return worker;
  }, [stopWorker]);

  useEffect(
    () => () => {
      stopWorker();
      if (copyResetTimeoutRef.current !== null) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    },
    [stopWorker]
  );

  const handleConvert = useCallback(
    async (sourceFile: File) => {
      const selection = parsePageSelection(pageSelection);
      setPageSelectionError(selection.error);
      if (selection.error) {
        setStage("idle");
        return;
      }

      const id = requestIdRef.current + 1;
      requestIdRef.current = id;
      setResult(null);
      setError(null);
      setCopied(false);
      setStage("reading");

      const options: PdfConversionOptions = {
        includeImages,
        includePageMarkers,
        pages: selection.pages,
        password: password.trim() || undefined,
        profile,
      };

      try {
        const buffer = await sourceFile.arrayBuffer();
        if (id !== requestIdRef.current) {
          return;
        }

        const worker = createWorker();
        worker.postMessage({ buffer, id, options }, [buffer]);
      } catch {
        if (id !== requestIdRef.current) {
          return;
        }
        setError("Could not read this PDF.");
        setStage("idle");
      }
    },
    [
      createWorker,
      includeImages,
      includePageMarkers,
      pageSelection,
      password,
      profile,
    ]
  );

  const startConversion = useCallback(
    (sourceFile: File) => {
      handleConvert(sourceFile).catch(() => {
        setError("Could not convert this PDF.");
        setResult(null);
        setStage("idle");
      });
    },
    [handleConvert]
  );

  const handleFile = useCallback(
    (selectedFile: File | null) => {
      if (!selectedFile) {
        return;
      }

      const validationError = validatePdfFile(selectedFile);
      if (validationError) {
        setError(validationError);
        toast.error(validationError);
        return;
      }

      requestIdRef.current += 1;
      stopWorker();
      setFile(selectedFile);
      setResult(null);
      setEngineVersion("");
      setError(null);
      setStage("idle");
      setPageSelectionError(null);
      startConversion(selectedFile);
    },
    [startConversion, stopWorker]
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleFile(event.target.files?.item(0) ?? null);
      event.target.value = "";
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

  const handlePageSelectionChange = useCallback((value: string) => {
    setPageSelection(value);
    setPageSelectionError(null);
  }, []);

  const handleReconvert = useCallback(() => {
    if (!file) {
      return;
    }
    startConversion(file);
  }, [file, startConversion]);

  const handleClear = useCallback(() => {
    requestIdRef.current += 1;
    stopWorker();
    setFile(null);
    setResult(null);
    setEngineVersion("");
    setError(null);
    setStage("idle");
    setPassword("");
    setCopied(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [stopWorker]);

  const handleCopy = useCallback(async () => {
    if (!markdown) {
      return;
    }

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast.success("Markdown copied to clipboard");

      if (copyResetTimeoutRef.current !== null) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
      copyResetTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      toast.error("Could not copy Markdown");
    }
  }, [markdown]);

  const handleDownload = useCallback(() => {
    if (!(markdown && file)) {
      return;
    }

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getMarkdownFileName(file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Markdown downloaded");
  }, [file, markdown]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <section className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-medium text-lg">PDF to Markdown</h1>
            <Badge variant="secondary">Client-side WASM</Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Extract structured Markdown from text-based PDFs without uploading
            the document.
          </p>
        </section>

        <PdfSourceCard
          error={error}
          file={file}
          inputRef={inputRef}
          isDragging={isDragging}
          isWorking={isWorking}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onInputChange={handleInputChange}
          stageLabel={stageLabel}
        />

        {result ? (
          <PdfOutputCard
            activeTab={activeTab}
            copied={copied}
            markdown={markdown}
            markdownStats={markdownStats}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onTabChange={setActiveTab}
            result={result}
          />
        ) : null}
      </div>

      <aside className="flex w-full flex-col gap-4 lg:w-72">
        <ConversionSettingsCard
          fileSelected={Boolean(file)}
          hasResult={Boolean(result)}
          includeImages={includeImages}
          includePageMarkers={includePageMarkers}
          isWorking={isWorking}
          onClear={handleClear}
          onConvert={handleReconvert}
          onIncludeImagesChange={setIncludeImages}
          onIncludePageMarkersChange={setIncludePageMarkers}
          onPageSelectionChange={handlePageSelectionChange}
          onPasswordChange={setPassword}
          onProfileChange={setProfile}
          pageSelection={pageSelection}
          pageSelectionError={pageSelectionError}
          password={password}
          profile={profile}
          stageLabel={stageLabel}
        />

        {result ? (
          <DocumentCard engineVersion={engineVersion} result={result} />
        ) : null}
        <PrivacyCard />
      </aside>
    </div>
  );
};

export default PdfToMarkdownPage;
