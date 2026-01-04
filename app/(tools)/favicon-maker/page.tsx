"use client";

import { useState, useCallback, useRef, useEffect, type DragEvent } from "react";
import {
  generateFavicons,
  cleanupFavicons,
  isFileSupported,
  formatBytes,
  generateManifest,
  FAVICON_SIZES,
  type GeneratedFavicon,
  type FaviconResult,
} from "@/lib/favicon-maker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Cancel01Icon,
  ImageUploadIcon,
  Loading03Icon,
  Download01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JSZip from "jszip";

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

  const handleFile = useCallback(async (file: File) => {
    if (!isFileSupported(file)) {
      setError("Unsupported file type. Please upload PNG, JPG, SVG, WebP, or GIF.");
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
      setError(err instanceof Error ? err.message : "Failed to generate favicons");
      setStatus("error");
    }
  }, [result]);

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
    if (!result) return;

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
        className={`absolute inset-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          isDragging ? "border-primary bg-primary/10" : "border-foreground/20 hover:border-foreground/40"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="Upload image to create favicons"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <HugeiconsIcon icon={ImageUploadIcon} className="h-16 w-16 text-foreground/40 mb-4" />
        <p className="text-lg text-foreground/80 mb-2">Drop your logo here or click to upload</p>
        <p className="text-sm text-foreground/50">Supports PNG, JPG, SVG, WebP, GIF</p>
        <p className="text-xs text-foreground/40 mt-2">Recommended: Square image for best results</p>
        <p className="text-xs text-foreground/40 mt-1">You can also paste from clipboard</p>
      </div>
    );
  }

  const isProcessing = status === "processing";

  return (
    <div
      className="h-full flex flex-col lg:flex-row gap-4 p-4 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-auto">
        {/* Source image preview and clear button */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
          <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
            {/* biome-ignore lint/nursery/noImgElement: simple preview */}
            <img
              src={sourceImage}
              alt="Source"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{sourceFileName}</p>
            <p className="text-xs text-muted-foreground">
              {isProcessing ? "Generating favicons..." : "Source image"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer"
              aria-label="Upload new image"
            >
              Replace
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              aria-label="Clear image"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isProcessing && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <HugeiconsIcon icon={Loading03Icon} className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Generating favicons...</p>
            </div>
          </div>
        )}

        {/* Generated favicons grid */}
        {status === "done" && result && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium">Generated Favicons</h2>
                <Button
                  onClick={handleDownloadAll}
                  className="cursor-pointer gap-2"
                  size="sm"
                >
                  <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                  Download All (ZIP)
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {result.favicons.map((favicon) => (
                  <div
                    key={favicon.name}
                    className="group relative bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors flex flex-col h-40"
                  >
                    {/* Image container - flex-1 to take remaining space, centers image */}
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <div
                        className="relative rounded overflow-hidden"
                        style={{
                          width: Math.min(favicon.width, 96),
                          height: Math.min(favicon.height, 96),
                          backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                          backgroundSize: "8px 8px",
                          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                        }}
                      >
                        {/* biome-ignore lint/nursery/noImgElement: favicon preview */}
                        <img
                          src={favicon.url}
                          alt={favicon.name}
                          className="w-full h-full object-contain relative z-10"
                          style={{
                            imageRendering: favicon.width <= 32 ? "pixelated" : "auto",
                          }}
                        />
                      </div>
                    </div>

                    {/* Info at bottom */}
                    <div className="mt-2 shrink-0">
                      <p className="text-xs font-medium text-center truncate" title={favicon.name}>
                        {favicon.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground text-center">
                        {favicon.width}×{favicon.height} • {formatBytes(favicon.blob.size)}
                      </p>
                    </div>

                    {/* Download button on hover */}
                    <button
                      onClick={() => handleDownloadSingle(favicon)}
                      className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-background"
                      aria-label={`Download ${favicon.name}`}
                      type="button"
                    >
                      <HugeiconsIcon icon={Download01Icon} className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser preview */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-3">Browser Tab Preview</h3>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 bg-background rounded-t-lg px-3 py-2 border-b border-border max-w-xs">
                  <div className="w-4 h-4 rounded overflow-hidden shrink-0">
                    {/* biome-ignore lint/nursery/noImgElement: tab preview */}
                    <img
                      src={result.favicons.find((f) => f.name === "favicon-16x16.png")?.url || result.favicons[0]?.url}
                      alt="Tab favicon"
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-xs truncate flex-1">{appName || "My Website"}</span>
                  <span className="text-xs text-muted-foreground">×</span>
                </div>
                <div className="bg-background rounded-b-lg h-24 flex items-center justify-center text-xs text-muted-foreground">
                  Page content
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sidebar with code snippets and settings */}
      {status === "done" && result && (
        <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-0 overflow-auto">
          <Tabs defaultValue="html">
            <TabsList className="w-full">
              <TabsTrigger value="html" className="flex-1 cursor-pointer">HTML</TabsTrigger>
              <TabsTrigger value="manifest" className="flex-1 cursor-pointer">Manifest</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 cursor-pointer">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">HTML Code</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.htmlCode, "html")}
                    className="cursor-pointer gap-1.5 h-7 px-2"
                  >
                    <HugeiconsIcon
                      icon={copiedField === "html" ? CheckmarkCircle01Icon : Copy01Icon}
                      className="h-3 w-3"
                    />
                    {copiedField === "html" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add this to the &lt;head&gt; section of your HTML:
                </p>
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap break-all">
                  <code>{result.htmlCode}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="manifest" className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">site.webmanifest</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(generateManifest(appName, appName, themeColor, bgColor), "manifest")}
                      className="cursor-pointer gap-1.5 h-7 px-2"
                    >
                      <HugeiconsIcon
                        icon={copiedField === "manifest" ? CheckmarkCircle01Icon : Copy01Icon}
                        className="h-3 w-3"
                      />
                      {copiedField === "manifest" ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadManifest}
                      className="cursor-pointer gap-1.5 h-7 px-2"
                    >
                      <HugeiconsIcon icon={Download01Icon} className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Web app manifest for PWA support:
                </p>
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap break-all max-h-64">
                  <code>{generateManifest(appName, appName, themeColor, bgColor)}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Manifest Settings</h3>
                <p className="text-xs text-muted-foreground">
                  Customize the manifest file for your PWA:
                </p>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="app-name" className="text-xs font-medium block mb-1.5">
                      App Name
                    </label>
                    <Input
                      id="app-name"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="My App"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="theme-color" className="text-xs font-medium block mb-1.5">
                      Theme Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="theme-color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="h-8 w-10 rounded cursor-pointer border border-border"
                      />
                      <Input
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        placeholder="#ffffff"
                        className="h-8 text-sm flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bg-color" className="text-xs font-medium block mb-1.5">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="bg-color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-8 w-10 rounded cursor-pointer border border-border"
                      />
                      <Input
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        placeholder="#ffffff"
                        className="h-8 text-sm flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* File list */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Generated Files</h3>
            <div className="space-y-1.5">
              {FAVICON_SIZES.map((size) => (
                <div key={size.name} className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground">{size.name}</span>
                  <span className="text-foreground/60">{size.width}×{size.height}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-muted-foreground">site.webmanifest</span>
                <span className="text-foreground/60">JSON</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-background rounded-lg p-8 text-center shadow-lg">
            <HugeiconsIcon icon={ImageUploadIcon} className="h-16 w-16 mx-auto text-primary mb-4" />
            <p className="text-lg">Drop image to create favicons</p>
          </div>
        </div>
      )}
    </div>
  );
}
