"use client";

import { useState, useCallback, useRef, useEffect, DragEvent } from "react";
import {
  type ImageJob,
  type EncodeFormat,
  type PresetLevel,
  type ResizeAlgorithm,
  compressImage,
  resizeImage,
  decodeFile,
  formatBytes,
  isFileSupported,
} from "@/lib/image-compressor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Cancel01Icon,
  ImageUploadIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import JSZip from "jszip";

type GlobalOptions = {
  format: EncodeFormat;
  quality: number;
  lossless: boolean;
  resizeEnabled: boolean;
  resizeWidth: number;
  resizeHeight: number;
  resizeAlgorithm: ResizeAlgorithm;
  maintainAspectRatio: boolean;
};

const defaultOptions: GlobalOptions = {
  format: "png",
  quality: 50,
  lossless: false,
  resizeEnabled: false,
  resizeWidth: 1920,
  resizeHeight: 1080,
  resizeAlgorithm: "lanczos3",
  maintainAspectRatio: true,
};

const getId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default function ImageCompressorPage() {
  const [jobs, setJobs] = useState<ImageJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [globalOptions, setGlobalOptions] = useState<GlobalOptions>(defaultOptions);
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 4>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageAreaRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? jobs[0] ?? null;

  // Calculate display dimensions based on available space and zoom
  const calculateDisplaySize = useCallback((imgW: number, imgH: number, areaW: number, areaH: number, zoom: number) => {
    if (zoom > 1) {
      return { width: imgW * zoom, height: imgH * zoom };
    }
    const imgAspect = imgW / imgH;
    const areaAspect = areaW / areaH;
    let w, h;
    if (imgAspect > areaAspect) {
      w = Math.min(imgW, areaW);
      h = w / imgAspect;
    } else {
      h = Math.min(imgH, areaH);
      w = h * imgAspect;
    }
    return { width: Math.round(w), height: Math.round(h) };
  }, []);

  // Update container size when image or zoom changes
  useEffect(() => {
    const updateSize = () => {
      if (!selectedJob || !imageAreaRef.current) return;
      const area = imageAreaRef.current;
      const rect = area.getBoundingClientRect();
      const padding = 32;
      const availableW = rect.width - padding;
      const availableH = rect.height - padding;
      const size = calculateDisplaySize(selectedJob.width, selectedJob.height, availableW, availableH, zoomLevel);
      setContainerSize(size);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [selectedJob, zoomLevel, calculateDisplaySize]);

  // Handle resize width change with aspect ratio
  const handleResizeWidthChange = useCallback((newWidth: number) => {
    if (!selectedJob) return;
    const w = Math.max(1, newWidth || 1);
    if (globalOptions.maintainAspectRatio) {
      const aspect = selectedJob.width / selectedJob.height;
      const h = Math.max(1, Math.round(w / aspect));
      setGlobalOptions((o) => ({ ...o, resizeWidth: w, resizeHeight: h }));
    } else {
      setGlobalOptions((o) => ({ ...o, resizeWidth: w }));
    }
  }, [selectedJob, globalOptions.maintainAspectRatio]);

  // Handle resize height change with aspect ratio
  const handleResizeHeightChange = useCallback((newHeight: number) => {
    if (!selectedJob) return;
    const h = Math.max(1, newHeight || 1);
    if (globalOptions.maintainAspectRatio) {
      const aspect = selectedJob.width / selectedJob.height;
      const w = Math.max(1, Math.round(h * aspect));
      setGlobalOptions((o) => ({ ...o, resizeWidth: w, resizeHeight: h }));
    } else {
      setGlobalOptions((o) => ({ ...o, resizeHeight: h }));
    }
  }, [selectedJob, globalOptions.maintainAspectRatio]);

  const buildCompressOptions = useCallback(
    (job: ImageJob) => ({
      format: globalOptions.format,
      quality: globalOptions.quality,
      preset: (globalOptions.quality < 33 ? 0 : globalOptions.quality < 66 ? 1 : 2) as PresetLevel,
      subsampling420: true,
      hasAlpha: job.hasAlpha && globalOptions.format === "png",
      lossy: !globalOptions.lossless,
    }),
    [globalOptions]
  );

  const buildResizeOptions = useCallback(() => {
    if (!globalOptions.resizeEnabled) return null;
    return {
      width: globalOptions.resizeWidth,
      height: globalOptions.resizeHeight,
      algorithm: globalOptions.resizeAlgorithm,
      maintainAspectRatio: globalOptions.maintainAspectRatio,
    };
  }, [globalOptions]);

  const compressJob = useCallback(
    async (job: ImageJob) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "compressing", error: undefined } : j))
      );

      try {
        let imageData = job.imageData;
        let width = job.width;
        let height = job.height;

        const resizeOpts = buildResizeOptions();
        if (resizeOpts) {
          const resized = await resizeImage(imageData, resizeOpts);
          imageData = resized;
          width = resized.width;
          height = resized.height;
        }

        const compressOpts = buildCompressOptions(job);
        const result = await compressImage(imageData, compressOpts);
        const url = URL.createObjectURL(result.blob);
        const savings = ((job.size - result.blob.size) / job.size) * 100;

        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? {
                  ...j,
                  status: "done",
                  result: {
                    blob: result.blob,
                    url,
                    size: result.blob.size,
                    savings,
                    elapsedMs: result.elapsedMs,
                    width,
                    height,
                  },
                }
              : j
          )
        );
      } catch (e) {
        console.error("Compression error:", e);
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? { ...j, status: "error", error: e instanceof Error ? e.message : "Unknown error" }
              : j
          )
        );
      }
    },
    [buildCompressOptions, buildResizeOptions]
  );

  useEffect(() => {
    if (jobs.length === 0) return;
    const timeoutId = setTimeout(() => {
      jobs.forEach((job) => {
        if (job.status !== "compressing") {
          compressJob(job);
        }
      });
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalOptions.format, globalOptions.quality, globalOptions.lossless, globalOptions.resizeEnabled, globalOptions.resizeWidth, globalOptions.resizeHeight, globalOptions.resizeAlgorithm, globalOptions.maintainAspectRatio]);

  const handleAddFiles = useCallback(
    async (files: FileList | File[]) => {
      const supported = Array.from(files).filter(isFileSupported);
      if (supported.length === 0) return;

      const firstNewJobId = getId();
      let isFirst = true;

      for (const file of supported) {
        const id = isFirst ? firstNewJobId : getId();
        isFirst = false;

        await new Promise((r) => setTimeout(r, 0));

        try {
          const { imageData, width, height, hasAlpha } = await decodeFile(file);
          const originalUrl = URL.createObjectURL(file);

          const newJob: ImageJob = {
            id,
            name: file.name,
            type: file.type,
            size: file.size,
            width,
            height,
            hasAlpha,
            originalUrl,
            imageData,
            status: "idle",
          };

          setJobs((prev) => [...prev, newJob]);

          if (id === firstNewJobId) {
            setSelectedJobId(id);
          }

          compressJob(newJob);
        } catch (err) {
          console.error("Failed to decode file:", file.name, err);
        }
      }
    },
    [compressJob]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) {
        handleAddFiles(e.dataTransfer.files);
      }
    },
    [handleAddFiles]
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) handleAddFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleAddFiles]);

  const handleSliderDrag = useCallback((clientX: number) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(Math.round(pct));
  }, []);

  useEffect(() => {
    if (!isDraggingSlider) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      handleSliderDrag(x);
    };
    const onUp = () => setIsDraggingSlider(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDraggingSlider, handleSliderDrag]);

  const handleRemoveJob = useCallback((id: string) => {
    const current = jobsRef.current;
    const idx = current.findIndex((j) => j.id === id);
    const job = current[idx];
    if (job) {
      URL.revokeObjectURL(job.originalUrl);
      if (job.result) URL.revokeObjectURL(job.result.url);
    }
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setSelectedJobId((prev) => {
      if (prev !== id) return prev;
      if (current.length <= 1) return null;
      return current[idx === 0 ? 1 : idx - 1]?.id ?? null;
    });
  }, []);

  const handleDownload = useCallback(() => {
    if (!selectedJob?.result) return;
    const ext = globalOptions.format === "png" ? ".png" : ".jpg";
    const name = selectedJob.name.replace(/\.[^.]+$/, ext);
    const a = document.createElement("a");
    a.href = selectedJob.result.url;
    a.download = name;
    a.click();
  }, [selectedJob, globalOptions.format]);

  const handleDownloadAll = useCallback(async () => {
    const completed = jobs.filter((j) => j.result);
    if (completed.length === 0) return;
    if (completed.length === 1) {
      handleDownload();
      return;
    }
    const zip = new JSZip();
    const ext = globalOptions.format === "png" ? ".png" : ".jpg";
    for (const job of completed) {
      const name = job.name.replace(/\.[^.]+$/, ext);
      zip.file(name, job.result!.blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "compressed-images.zip";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [jobs, globalOptions.format, handleDownload]);

  // Drop zone when no images
  if (!selectedJob) {
    return (
      <div
        className={`absolute inset-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/20 hover:border-white/40"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="Upload images"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
        />
        <HugeiconsIcon icon={ImageUploadIcon} className="h-16 w-16 text-white/40 mb-4" />
        <p className="text-lg text-white/80 mb-2">Drop images here or click to upload</p>
        <p className="text-sm text-white/50">Supports PNG and JPEG</p>
        <p className="text-xs text-white/40 mt-2">You can also paste images from clipboard</p>
      </div>
    );
  }

  const job = selectedJob;
  const isCompressing = job.status === "compressing";
  const hasResult = !!job.result;

  return (
    <div
      className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
      />

      {/* Close button - top right */}
      <button
        onClick={() => handleRemoveJob(job.id)}
        className="absolute top-4 right-4 z-20 text-white/50 hover:text-white transition-colors cursor-pointer"
        aria-label="Close"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
      </button>

      {/* Main image area */}
      <div ref={imageAreaRef} className="flex-1 overflow-auto relative">
        <div className="min-h-full min-w-full flex items-center justify-center p-4">
          <div
            ref={imageContainerRef}
            className={`relative select-none shrink-0 ${hasResult ? "cursor-ew-resize" : ""}`}
            style={{
              width: containerSize.width || "auto",
              height: containerSize.height || "auto",
            }}
          onMouseDown={(e) => {
            if (!hasResult) return;
            setIsDraggingSlider(true);
            handleSliderDrag(e.clientX);
          }}
          onTouchStart={(e) => {
            if (!hasResult || !e.touches[0]) return;
            setIsDraggingSlider(true);
            handleSliderDrag(e.touches[0].clientX);
          }}
        >
          {/* Original image (shows on right side of slider) */}
          <img
            src={job.originalUrl}
            alt="Original"
            className="pointer-events-none block w-full h-full object-contain"
            draggable={false}
          />

          {/* Compressed image overlay (shows on left side of slider) */}
          {hasResult && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={job.result!.url}
                alt="Compressed"
                className="pointer-events-none block w-full h-full object-contain"
                draggable={false}
              />
            </div>
          )}

          {/* Vertical slider line */}
          {hasResult && (
            <div
              className="absolute inset-y-0 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="h-full w-px bg-white/90" />
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-medium px-1.5 py-0.5 rounded shadow">
                {sliderPosition}%
              </div>
            </div>
          )}

          {/* Loading spinner */}
          {isCompressing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
        </div>

        {/* Fixed overlays - positioned relative to scroll container */}
        {/* File info overlay - bottom left */}
        <div className="absolute bottom-6 left-4 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs text-white/80 pointer-events-none z-10">
          <span className="font-medium">{job.name}</span>
          <span className="ml-2 text-white/60">{job.width} × {job.height}</span>
        </div>

        {/* Horizontal comparison slider overlay - bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs px-4 z-10">
          <Slider
            min={0}
            max={100}
            step={1}
            value={[sliderPosition]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setSliderPosition(val);
            }}
            className="w-full"
          />
        </div>
      </div>

      {/* Controls row */}
      <div className="px-4 py-2.5 border-t border-white/10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        {/* Format toggle */}
        <div className="flex items-center gap-2">
          <span className="text-white/50">Format</span>
          <div className="flex rounded overflow-hidden border border-white/20">
            <button
              onClick={() => setGlobalOptions((o) => ({ ...o, format: "jpeg" }))}
              className={`px-2.5 py-1 text-xs cursor-pointer transition-colors ${
                globalOptions.format === "jpeg"
                  ? "bg-white/20 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              JPG
            </button>
            <button
              onClick={() => setGlobalOptions((o) => ({ ...o, format: "png" }))}
              className={`px-2.5 py-1 text-xs cursor-pointer transition-colors border-l border-white/20 ${
                globalOptions.format === "png"
                  ? "bg-white/20 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              PNG
            </button>
          </div>
        </div>

        {/* Quality: Smaller <-> Faster */}
        <div className="flex items-center gap-2">
          <span className="text-white/50">Smaller</span>
          <Slider
            min={1}
            max={100}
            step={1}
            value={[globalOptions.quality]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setGlobalOptions((o) => ({ ...o, quality: val }));
            }}
            className="w-20"
          />
          <span className="text-white/50">Faster</span>
        </div>

        {/* Lossless (PNG) */}
        {globalOptions.format === "png" && (
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Switch
              checked={globalOptions.lossless}
              onCheckedChange={(c) => setGlobalOptions((o) => ({ ...o, lossless: c === true }))}
              size="sm"
            />
            <span className="text-white/50">Lossless</span>
          </label>
        )}

        {/* Resize */}
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch
            checked={globalOptions.resizeEnabled}
            onCheckedChange={(c) => setGlobalOptions((o) => ({ ...o, resizeEnabled: c === true }))}
            size="sm"
          />
          <span className="text-white/50">Resize</span>
        </label>

        {globalOptions.resizeEnabled && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-white/50">Size</span>
              <Input
                type="number"
                min={1}
                value={globalOptions.resizeWidth}
                onChange={(e) => handleResizeWidthChange(parseInt(e.target.value))}
                className="w-14 h-6 text-xs bg-transparent border-white/20 px-1.5"
              />
              <span className="text-white/30">×</span>
              <Input
                type="number"
                min={1}
                value={globalOptions.resizeHeight}
                onChange={(e) => handleResizeHeightChange(parseInt(e.target.value))}
                className="w-14 h-6 text-xs bg-transparent border-white/20 px-1.5"
              />
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <Switch
                checked={globalOptions.maintainAspectRatio}
                onCheckedChange={(c) => setGlobalOptions((o) => ({ ...o, maintainAspectRatio: c === true }))}
                size="sm"
              />
              <span className="text-white/50">Keep aspect</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-white/50">Quality</span>
              <Select
                value={globalOptions.resizeAlgorithm}
                onValueChange={(v) => setGlobalOptions((o) => ({ ...o, resizeAlgorithm: v as ResizeAlgorithm }))}
              >
                <SelectTrigger className="h-7 w-[120px] text-xs bg-transparent border-white/20 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest" className="cursor-pointer">Nearest</SelectItem>
                  <SelectItem value="bilinear" className="cursor-pointer">Bilinear</SelectItem>
                  <SelectItem value="lanczos3" className="cursor-pointer">Lanczos3 (best)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Zoom - pushed to right */}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-white/50 mr-1">Zoom</span>
          {([1, 2, 4] as const).map((z) => (
            <button
              key={z}
              onClick={() => setZoomLevel(z)}
              className={`px-2 py-0.5 text-xs rounded cursor-pointer transition-colors ${
                zoomLevel === z ? "bg-white/20 text-white" : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {z}x
            </button>
          ))}
        </div>
      </div>

      {/* Footer: stats + download */}
      <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-white/50">Original</span>{" "}
          <span className="text-white font-medium">{formatBytes(job.size)}</span>
          {hasResult && (
            <>
              <span className="text-white/30 mx-2">→</span>
              <span className="text-white/50">Compressed</span>{" "}
              <span className="text-white font-medium">{formatBytes(job.result!.size)}</span>
              <span className={`ml-2 font-medium ${job.result!.savings > 0 ? "text-green-400" : "text-red-400"}`}>
                {job.result!.savings > 0 ? "-" : "+"}
                {Math.abs(job.result!.savings).toFixed(1)}%
              </span>
            </>
          )}
          {isCompressing && <span className="text-white/50 ml-2">Compressing...</span>}
        </div>

        <div className="flex items-center gap-2">
          {jobs.length > 1 && jobs.filter((j) => j.result).length > 0 && (
            <Button
              onClick={handleDownloadAll}
              disabled={isCompressing}
              variant="outline"
              className="cursor-pointer border-white/20 hover:bg-white/10 disabled:opacity-50"
            >
              Download All ({jobs.filter((j) => j.result).length})
            </Button>
          )}
          <Button
            onClick={handleDownload}
            disabled={!hasResult || isCompressing}
            className="cursor-pointer bg-white text-black hover:bg-white/90 disabled:opacity-50"
          >
            Download
          </Button>
        </div>
      </div>

      {/* Multiple images thumbnail strip */}
      {jobs.length > 1 && (
        <div className="px-4 py-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
          {jobs.map((j) => (
            <button
              key={j.id}
              onClick={() => setSelectedJobId(j.id)}
              className={`relative shrink-0 w-12 h-12 rounded overflow-hidden border-2 cursor-pointer transition-colors ${
                j.id === selectedJobId ? "border-white" : "border-transparent hover:border-white/50"
              }`}
            >
              <img src={j.originalUrl} alt={j.name} className="w-full h-full object-cover" />
              {j.status === "compressing" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin text-white" />
                </div>
              )}
              {j.result && (
                <div
                  className={`absolute bottom-0 inset-x-0 text-[9px] font-medium text-center py-0.5 ${
                    j.result.savings > 0 ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
                  }`}
                >
                  {j.result.savings > 0 ? "-" : "+"}
                  {Math.abs(j.result.savings).toFixed(0)}%
                </div>
              )}
            </button>
          ))}
          <button
            onClick={() => inputRef.current?.click()}
            className="shrink-0 w-12 h-12 rounded border-2 border-dashed border-white/20 hover:border-white/40 flex items-center justify-center text-white/40 hover:text-white/60 cursor-pointer transition-colors text-lg"
          >
            +
          </button>
        </div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 rounded-lg p-8 text-center">
            <HugeiconsIcon icon={ImageUploadIcon} className="h-16 w-16 mx-auto text-blue-400 mb-4" />
            <p className="text-lg">Drop images to compress</p>
          </div>
        </div>
      )}
    </div>
  );
}
