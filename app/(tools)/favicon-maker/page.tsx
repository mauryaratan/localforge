"use client";

import {
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  Download01Icon,
  ImageUploadIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  cleanupFavicons,
  FAVICON_SIZES,
  type FaviconResult,
  formatBytes,
  type GeneratedFavicon,
  generateFavicons,
  generateManifest,
  isFileSupported,
} from "@/lib/favicon-maker";

type ProcessingStatus = "idle" | "processing" | "done" | "error";

export default function FaviconMakerPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>("");
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FaviconResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [appName, setAppName] = useState("My App");
  const [themeColor, setThemeColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#ffffff");
  const inputRef = useRef<HTMLInputElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (result) {
        cleanupFavicons(result.favicons);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!isFileSupported(file)) {
        setError(
          "Unsupported file type. Please upload PNG, JPG, SVG, WebP, or GIF."
        );
        return;
      }

      // Cleanup previous result
      if (result) {
        cleanupFavicons(result.favicons);
        setResult(null);
      }

      setStatus("processing");
      setError(null);
      setSourceImage(URL.createObjectURL(file));
      setSourceFileName(file.name);

      try {
        const faviconResult = await generateFavicons(file);
        setResult(faviconResult);
        setStatus("done");
      } catch (err) {
        console.error("Favicon generation error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate favicons"
        );
        setStatus("error");
      }
    },
    [result]
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
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Paste from clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0];
      if (file && isFileSupported(file)) {
        handleFile(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  const handleClear = useCallback(() => {
    if (result) {
      cleanupFavicons(result.favicons);
    }
    if (sourceImage) {
      URL.revokeObjectURL(sourceImage);
    }
    setSourceImage(null);
    setSourceFileName("");
    setResult(null);
    setStatus("idle");
    setError(null);
  }, [result, sourceImage]);

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleDownloadSingle = useCallback((favicon: GeneratedFavicon) => {
    const a = document.createElement("a");
    a.href = favicon.url;
    a.download = favicon.name;
    a.click();
  }, []);

  const handleDownloadManifest = useCallback(() => {
    const manifest = generateManifest(appName, appName, themeColor, bgColor);
    const blob = new Blob([manifest], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site.webmanifest";
    a.click();
    URL.revokeObjectURL(url);
  }, [appName, themeColor, bgColor]);

  const handleDownloadAll = useCallback(async () => {
    if (!result) {
      return;
    }

    // Dynamic import JSZip only when downloading
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    // Add all favicons
    for (const favicon of result.favicons) {
      zip.file(favicon.name, favicon.blob);
    }

    // Add manifest
    const manifest = generateManifest(appName, appName, themeColor, bgColor);
    zip.file("site.webmanifest", manifest);

    // Add readme with instructions
    const readme = `# Favicon Installation Instructions

## Files Included
${result.favicons.map((f) => `- ${f.name} (${f.width}x${f.height})`).join("\n")}
- site.webmanifest

## Installation

1. Place all files in the root directory of your website.

2. Add the following HTML to the <head> section of your pages:

${result.htmlCode}

## File Descriptions

- **favicon.ico**: Legacy favicon for older browsers (contains 16x16, 32x32, 48x48)
- **favicon-16x16.png**: Small favicon for browser tabs
- **favicon-32x32.png**: Standard favicon for browser tabs and bookmarks
- **apple-touch-icon.png**: Icon for iOS devices when adding to home screen (180x180)
- **android-chrome-192x192.png**: Icon for Android devices and PWAs (192x192)
- **android-chrome-512x512.png**: High-res icon for Android devices and PWAs (512x512)
- **site.webmanifest**: Web app manifest for PWA support

Generated with LocalForge Favicon Maker
`;
    zip.file("README.txt", readme);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicons.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [result, appName, themeColor, bgColor]);

  // Upload zone when no image
  if (!sourceImage) {
    return (
      <div
        aria-label="Upload image to create favicons"
        className={`absolute inset-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-foreground/20 hover:border-foreground/40"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          ref={inputRef}
          type="file"
        />
        <HugeiconsIcon
          className="mb-4 h-16 w-16 text-foreground/40"
          icon={ImageUploadIcon}
        />
        <p className="mb-2 text-foreground/80 text-lg">
          Drop your logo here or click to upload
        </p>
        <p className="text-foreground/50 text-sm">
          Supports PNG, JPG, SVG, WebP, GIF
        </p>
        <p className="mt-2 text-foreground/40 text-xs">
          Recommended: Square image for best results
        </p>
        <p className="mt-1 text-foreground/40 text-xs">
          You can also paste from clipboard
        </p>
      </div>
    );
  }

  const isProcessing = status === "processing";

  return (
    <div
      className="flex h-full flex-col gap-4 overflow-hidden p-4 lg:flex-row"
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        ref={inputRef}
        type="file"
      />

      {/* Main content area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        {/* Source image preview and clear button */}
        <div className="mb-4 flex items-center gap-4 border-border border-b pb-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {/* biome-ignore lint/nursery/noImgElement: simple preview */}
            <img
              alt="Source"
              className="h-full w-full object-contain"
              src={sourceImage}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{sourceFileName}</p>
            <p className="text-muted-foreground text-xs">
              {isProcessing ? "Generating favicons..." : "Source image"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              aria-label="Upload new image"
              className="cursor-pointer"
              onClick={() => inputRef.current?.click()}
              size="sm"
              variant="outline"
            >
              Replace
            </Button>
            <Button
              aria-label="Clear image"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={handleClear}
              size="icon"
              variant="ghost"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isProcessing && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <HugeiconsIcon
                className="mx-auto mb-4 h-12 w-12 animate-spin text-primary"
                icon={Loading03Icon}
              />
              <p className="text-muted-foreground text-sm">
                Generating favicons...
              </p>
            </div>
          </div>
        )}

        {/* Generated favicons grid */}
        {status === "done" && result && (
          <>
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-medium text-sm">Generated Favicons</h2>
                <Button
                  className="cursor-pointer gap-2"
                  onClick={handleDownloadAll}
                  size="sm"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Download01Icon} />
                  Download All (ZIP)
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                {result.favicons.map((favicon) => (
                  <div
                    className="group relative flex h-40 flex-col rounded-lg border border-border bg-muted/50 p-3 transition-colors hover:border-primary/50"
                    key={favicon.name}
                  >
                    {/* Image container - flex-1 to take remaining space, centers image */}
                    <div className="flex min-h-0 flex-1 items-center justify-center">
                      <div
                        className="relative overflow-hidden rounded"
                        style={{
                          width: Math.min(favicon.width, 96),
                          height: Math.min(favicon.height, 96),
                          backgroundImage:
                            "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                          backgroundSize: "8px 8px",
                          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                        }}
                      >
                        {/* biome-ignore lint/nursery/noImgElement: favicon preview */}
                        <img
                          alt={favicon.name}
                          className="relative z-10 h-full w-full object-contain"
                          src={favicon.url}
                          style={{
                            imageRendering:
                              favicon.width <= 32 ? "pixelated" : "auto",
                          }}
                        />
                      </div>
                    </div>

                    {/* Info at bottom */}
                    <div className="mt-2 shrink-0">
                      <p
                        className="truncate text-center font-medium text-xs"
                        title={favicon.name}
                      >
                        {favicon.name}
                      </p>
                      <p className="text-center text-[10px] text-muted-foreground">
                        {favicon.width}×{favicon.height} •{" "}
                        {formatBytes(favicon.blob.size)}
                      </p>
                    </div>

                    {/* Download button on hover */}
                    <button
                      aria-label={`Download ${favicon.name}`}
                      className="absolute top-2 right-2 cursor-pointer rounded-md bg-background/90 p-1.5 opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
                      onClick={() => handleDownloadSingle(favicon)}
                      type="button"
                    >
                      <HugeiconsIcon
                        className="h-3 w-3"
                        icon={Download01Icon}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser preview */}
            <div className="mb-4">
              <h3 className="mb-3 font-medium text-sm">Browser Tab Preview</h3>
              <div className="rounded-lg bg-muted p-4">
                <div className="flex max-w-xs items-center gap-2 rounded-t-lg border-border border-b bg-background px-3 py-2">
                  <div className="h-4 w-4 shrink-0 overflow-hidden rounded">
                    {/* biome-ignore lint/nursery/noImgElement: tab preview */}
                    <img
                      alt="Tab favicon"
                      className="h-full w-full"
                      src={
                        result.favicons.find(
                          (f) => f.name === "favicon-16x16.png"
                        )?.url || result.favicons[0]?.url
                      }
                    />
                  </div>
                  <span className="flex-1 truncate text-xs">
                    {appName || "My Website"}
                  </span>
                  <span className="text-muted-foreground text-xs">×</span>
                </div>
                <div className="flex h-24 items-center justify-center rounded-b-lg bg-background text-muted-foreground text-xs">
                  Page content
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sidebar with code snippets and settings */}
      {status === "done" && result && (
        <div className="w-full shrink-0 overflow-auto lg:sticky lg:top-0 lg:w-80 xl:w-96">
          <Tabs defaultValue="html">
            <TabsList className="w-full">
              <TabsTrigger className="flex-1 cursor-pointer" value="html">
                HTML
              </TabsTrigger>
              <TabsTrigger className="flex-1 cursor-pointer" value="manifest">
                Manifest
              </TabsTrigger>
              <TabsTrigger className="flex-1 cursor-pointer" value="settings">
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent className="mt-4" value="html">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">HTML Code</h3>
                  <Button
                    className="h-7 cursor-pointer gap-1.5 px-2"
                    onClick={() => handleCopy(result.htmlCode, "html")}
                    size="sm"
                    variant="ghost"
                  >
                    <HugeiconsIcon
                      className="h-3 w-3"
                      icon={
                        copiedField === "html"
                          ? CheckmarkCircle01Icon
                          : Copy01Icon
                      }
                    />
                    {copiedField === "html" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Add this to the &lt;head&gt; section of your HTML:
                </p>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-3 text-xs">
                  <code>{result.htmlCode}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent className="mt-4" value="manifest">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">site.webmanifest</h3>
                  <div className="flex gap-1">
                    <Button
                      className="h-7 cursor-pointer gap-1.5 px-2"
                      onClick={() =>
                        handleCopy(
                          generateManifest(
                            appName,
                            appName,
                            themeColor,
                            bgColor
                          ),
                          "manifest"
                        )
                      }
                      size="sm"
                      variant="ghost"
                    >
                      <HugeiconsIcon
                        className="h-3 w-3"
                        icon={
                          copiedField === "manifest"
                            ? CheckmarkCircle01Icon
                            : Copy01Icon
                        }
                      />
                      {copiedField === "manifest" ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      className="h-7 cursor-pointer gap-1.5 px-2"
                      onClick={handleDownloadManifest}
                      size="sm"
                      variant="ghost"
                    >
                      <HugeiconsIcon
                        className="h-3 w-3"
                        icon={Download01Icon}
                      />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs">
                  Web app manifest for PWA support:
                </p>
                <pre className="max-h-64 overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-3 text-xs">
                  <code>
                    {generateManifest(appName, appName, themeColor, bgColor)}
                  </code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent className="mt-4" value="settings">
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Manifest Settings</h3>
                <p className="text-muted-foreground text-xs">
                  Customize the manifest file for your PWA:
                </p>

                <div className="space-y-3">
                  <div>
                    <label
                      className="mb-1.5 block font-medium text-xs"
                      htmlFor="app-name"
                    >
                      App Name
                    </label>
                    <Input
                      className="h-8 text-sm"
                      id="app-name"
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="My App"
                      value={appName}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block font-medium text-xs"
                      htmlFor="theme-color"
                    >
                      Theme Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="h-8 w-10 cursor-pointer rounded border border-border"
                        id="theme-color"
                        onChange={(e) => setThemeColor(e.target.value)}
                        type="color"
                        value={themeColor}
                      />
                      <Input
                        className="h-8 flex-1 text-sm"
                        onChange={(e) => setThemeColor(e.target.value)}
                        placeholder="#ffffff"
                        value={themeColor}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block font-medium text-xs"
                      htmlFor="bg-color"
                    >
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="h-8 w-10 cursor-pointer rounded border border-border"
                        id="bg-color"
                        onChange={(e) => setBgColor(e.target.value)}
                        type="color"
                        value={bgColor}
                      />
                      <Input
                        className="h-8 flex-1 text-sm"
                        onChange={(e) => setBgColor(e.target.value)}
                        placeholder="#ffffff"
                        value={bgColor}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* File list */}
          <div className="mt-6 border-border border-t pt-4">
            <h3 className="mb-3 font-medium text-sm">Generated Files</h3>
            <div className="space-y-1.5">
              {FAVICON_SIZES.map((size) => (
                <div
                  className="flex items-center justify-between py-1 text-xs"
                  key={size.name}
                >
                  <span className="text-muted-foreground">{size.name}</span>
                  <span className="text-foreground/60">
                    {size.width}×{size.height}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-1 text-xs">
                <span className="text-muted-foreground">site.webmanifest</span>
                <span className="text-foreground/60">JSON</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm">
          <div className="rounded-lg bg-background p-8 text-center shadow-lg">
            <HugeiconsIcon
              className="mx-auto mb-4 h-16 w-16 text-primary"
              icon={ImageUploadIcon}
            />
            <p className="text-lg">Drop image to create favicons</p>
          </div>
        </div>
      )}
    </div>
  );
}
