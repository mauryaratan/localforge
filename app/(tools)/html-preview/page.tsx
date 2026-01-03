"use client";

import {
  ArrowExpand01Icon,
  Copy01Icon,
  Delete02Icon,
  Download04Icon,
  FileEditIcon,
  LaptopIcon,
  MinusSignIcon,
  SmartPhone01Icon,
  Tablet01Icon,
  TextWrapIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  createPreviewDocument,
  exampleHtml,
  exampleLabels,
  formatHtml,
  getHtmlStats,
  minifyHtml,
  validateHtml,
  type ViewportPreset,
  viewportPresets,
} from "@/lib/html-preview";

const STORAGE_KEY_INPUT = "devtools:html-preview:input";
const STORAGE_KEY_VIEWPORT = "devtools:html-preview:viewport";

const HtmlPreviewPage = () => {
  const [input, setInput] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("split");
  const [viewport, setViewport] = useState<ViewportPreset>("desktop");
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedInput = localStorage.getItem(STORAGE_KEY_INPUT);
    const savedViewport = localStorage.getItem(STORAGE_KEY_VIEWPORT);

    if (savedInput) {
      setInput(savedInput);
    }
    if (savedViewport) {
      setViewport(savedViewport as ViewportPreset);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input/viewport changes (after hydration)
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (input) {
      localStorage.setItem(STORAGE_KEY_INPUT, input);
    } else {
      localStorage.removeItem(STORAGE_KEY_INPUT);
    }

    localStorage.setItem(STORAGE_KEY_VIEWPORT, viewport);
  }, [input, viewport, isHydrated]);

  // Calculate stats
  const stats = useMemo(() => {
    return getHtmlStats(input);
  }, [input]);

  // Validate HTML
  const validation = useMemo(() => {
    return validateHtml(input);
  }, [input]);

  // Generate preview HTML - always use light mode
  const previewHtml = useMemo(() => {
    if (!input.trim()) {
      return "";
    }
    return createPreviewDocument(input, false);
  }, [input]);

  // Trigger manual preview update
  const handleRunPreview = useCallback(() => {
    setPreviewKey((prev) => prev + 1);
  }, []);

  // Update iframe content
  useEffect(() => {
    if (!iframeRef.current || !previewHtml) {
      return;
    }

    if (!autoUpdate && previewKey === 0) {
      return;
    }

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(previewHtml);
      doc.close();
    }
  }, [previewHtml, autoUpdate, previewKey]);

  const handleCopy = useCallback(async (text: string) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success("HTML copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleClearInput = useCallback(() => {
    setInput("");
    setPreviewKey(0);
  }, []);

  const handleLoadExample = useCallback((key: keyof typeof exampleHtml) => {
    setInput(exampleHtml[key]);
    setPreviewKey((prev) => prev + 1);
  }, []);

  const handleFormat = useCallback(() => {
    const formatted = formatHtml(input);
    if (formatted) {
      setInput(formatted);
    }
  }, [input]);

  const handleMinify = useCallback(() => {
    const minified = minifyHtml(input);
    if (minified) {
      setInput(minified);
    }
  }, [input]);

  const handleDownload = useCallback(() => {
    if (!input) {
      return;
    }

    const blob = new Blob([input], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "preview.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [input]);

  const handleFullscreen = useCallback(() => {
    if (!fullscreenRef.current) {
      return;
    }

    if (!isFullscreen) {
      fullscreenRef.current.requestFullscreen?.().catch(() => {
        setIsFullscreen(true);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {
        setIsFullscreen(false);
      });
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const currentViewport = viewportPresets[viewport];

  // Preview component
  const PreviewPane = useCallback(
    ({
      showViewportControls = true,
      height = "500px",
    }: {
      showViewportControls?: boolean;
      height?: string;
    }) => (
      <div className="flex h-full flex-col">
        {showViewportControls && (
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="flex items-center gap-2">
              <ToggleGroup variant="outline" size="sm">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <ToggleGroupItem
                        aria-label="Mobile view"
                        aria-pressed={viewport === "mobile"}
                        className="cursor-pointer px-2"
                        onClick={() => setViewport("mobile")}
                        pressed={viewport === "mobile"}
                        value="mobile"
                      />
                    }
                  >
                    <HugeiconsIcon icon={SmartPhone01Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>
                    {viewportPresets.mobile.label}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <ToggleGroupItem
                        aria-label="Tablet view"
                        aria-pressed={viewport === "tablet"}
                        className="cursor-pointer px-2"
                        onClick={() => setViewport("tablet")}
                        pressed={viewport === "tablet"}
                        value="tablet"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Tablet01Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>
                    {viewportPresets.tablet.label}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <ToggleGroupItem
                        aria-label="Desktop view"
                        aria-pressed={viewport === "desktop"}
                        className="cursor-pointer px-2"
                        onClick={() => setViewport("desktop")}
                        pressed={viewport === "desktop"}
                        value="desktop"
                      />
                    }
                  >
                    <HugeiconsIcon icon={LaptopIcon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>
                    {viewportPresets.desktop.label}
                  </TooltipContent>
                </Tooltip>
              </ToggleGroup>
              <span className="text-muted-foreground text-xs">
                {currentViewport.width}×{currentViewport.height}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label="Fullscreen"
                    className="cursor-pointer"
                    onClick={handleFullscreen}
                    size="icon-xs"
                    tabIndex={0}
                    variant="ghost"
                  />
                }
              >
                <HugeiconsIcon icon={ArrowExpand01Icon} size={14} />
              </TooltipTrigger>
              <TooltipContent>Toggle fullscreen</TooltipContent>
            </Tooltip>
          </div>
        )}
        <div
          className="flex flex-1 items-center justify-center overflow-auto bg-[repeating-conic-gradient(#8882_0_25%,transparent_0_50%)] bg-size-[16px_16px] p-4 dark:bg-[repeating-conic-gradient(#fff1_0_25%,transparent_0_50%)]"
          ref={fullscreenRef}
          style={{ minHeight: height }}
        >
          {input.trim() ? (
            <div
              className="overflow-hidden rounded-md border bg-white shadow-lg transition-all duration-300"
              style={{
                width:
                  viewport === "desktop"
                    ? "100%"
                    : `${currentViewport.width}px`,
                maxWidth: "100%",
                height:
                  viewport === "desktop"
                    ? "100%"
                    : `${currentViewport.height}px`,
                maxHeight: "100%",
              }}
            >
              <iframe
                className="h-full w-full border-0"
                key={previewKey}
                ref={iframeRef}
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                title="HTML Preview"
              />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Enter HTML code to see preview...
            </p>
          )}
        </div>
      </div>
    ),
    [viewport, currentViewport, input, previewKey, handleFullscreen]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">HTML Preview</h1>
          <p className="text-muted-foreground text-xs">
            Live preview HTML, CSS, and JavaScript with responsive viewport
            testing
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-update toggle */}
          <div className="flex items-center gap-2">
            <label
              className="text-muted-foreground text-xs"
              htmlFor="auto-update"
            >
              Auto-update
            </label>
            <Switch
              checked={autoUpdate}
              id="auto-update"
              onCheckedChange={setAutoUpdate}
            />
          </div>
          {/* Examples dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label="Load example"
                  className="cursor-pointer"
                  size="sm"
                  tabIndex={0}
                  variant="outline"
                >
                  <HugeiconsIcon
                    className="mr-1.5"
                    icon={FileEditIcon}
                    size={14}
                  />
                  Examples
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {(
                Object.keys(exampleHtml) as Array<keyof typeof exampleHtml>
              ).map((key) => (
                <DropdownMenuItem
                  className="cursor-pointer"
                  key={key}
                  onClick={() => handleLoadExample(key)}
                >
                  {exampleLabels[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor / Preview Tabs */}
      <Card>
        <Tabs
          defaultValue="split"
          onValueChange={(v) => setActiveTab(v as string)}
          value={activeTab}
        >
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <TabsList variant="line">
                <TabsTrigger value="editor">
                  <HugeiconsIcon
                    className="mr-1"
                    icon={FileEditIcon}
                    size={14}
                  />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="split">Split</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-1">
                {!autoUpdate && (
                  <Button
                    aria-label="Run preview"
                    className="cursor-pointer text-xs"
                    onClick={handleRunPreview}
                    size="sm"
                    tabIndex={0}
                    variant="default"
                  >
                    Run
                  </Button>
                )}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Format HTML"
                        className="cursor-pointer"
                        disabled={!input}
                        onClick={handleFormat}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={TextWrapIcon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Format HTML</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Minify HTML"
                        className="cursor-pointer"
                        disabled={!input}
                        onClick={handleMinify}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={MinusSignIcon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Minify HTML</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Download HTML"
                        className="cursor-pointer"
                        disabled={!input}
                        onClick={handleDownload}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Download04Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Download .html file</TooltipContent>
                </Tooltip>
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
                <Button
                  aria-label="Copy HTML"
                  className="cursor-pointer"
                  disabled={!input}
                  onClick={() => handleCopy(input)}
                  size="icon-xs"
                  tabIndex={0}
                  variant="ghost"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Editor Only */}
            <TabsContent className="m-0" value="editor">
              <div className="p-4">
                <Textarea
                  aria-label="HTML input"
                  className="h-[500px] max-h-[700px] min-h-[300px] resize-y field-sizing-fixed! font-mono text-xs leading-relaxed"
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>"
                  spellCheck={false}
                  value={input}
                />
              </div>
            </TabsContent>

            {/* Preview Only */}
            <TabsContent className="m-0" value="preview">
              <PreviewPane height="500px" showViewportControls />
            </TabsContent>

            {/* Split View */}
            <TabsContent className="m-0 overflow-hidden" value="split">
              <ResizablePanelGroup
                className="min-h-[500px]"
                orientation="horizontal"
              >
                <ResizablePanel defaultSize={50} minSize={25}>
                  <Textarea
                    aria-label="HTML input"
                    className="h-full min-h-[500px] resize-none rounded-none border-0 field-sizing-fixed! font-mono text-xs leading-relaxed focus-visible:ring-0"
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>"
                    spellCheck={false}
                    value={input}
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={25}>
                  <PreviewPane height="500px" showViewportControls />
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>

            {/* Stats & Validation */}
            <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
              {input.trim() && (
                <>
                  <Badge variant="secondary">
                    {stats.elements} element{stats.elements !== 1 ? "s" : ""}
                  </Badge>
                  <Badge variant="secondary">
                    {stats.characters} char{stats.characters !== 1 ? "s" : ""}
                  </Badge>
                  <Badge variant="secondary">
                    {stats.lines} line{stats.lines !== 1 ? "s" : ""}
                  </Badge>
                  {stats.hasStyles && <Badge variant="outline">CSS</Badge>}
                  {stats.hasScripts && (
                    <Badge variant="outline">JavaScript</Badge>
                  )}
                  {validation.warnings.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Badge className="cursor-help" variant="secondary">
                            {validation.warnings.length} warning
                            {validation.warnings.length !== 1 ? "s" : ""}
                          </Badge>
                        }
                      />
                      <TooltipContent className="max-w-xs">
                        <ul className="list-disc pl-4 text-xs">
                          {validation.warnings.slice(0, 5).map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {validation.errors.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Badge className="cursor-help" variant="destructive">
                            {validation.errors.length} error
                            {validation.errors.length !== 1 ? "s" : ""}
                          </Badge>
                        }
                      />
                      <TooltipContent className="max-w-xs">
                        <ul className="list-disc pl-4 text-xs">
                          {validation.errors.slice(0, 5).map((e, i) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default HtmlPreviewPage;
