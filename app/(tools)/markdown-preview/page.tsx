"use client";

import {
  Copy01Icon,
  Delete02Icon,
  Download04Icon,
  FileEditIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Dynamic import MarkdownRenderer to reduce initial bundle size
// ReactMarkdown + remarkGfm add ~50KB gzipped to the bundle
const MarkdownRenderer = dynamic(
  () => import("./markdown-renderer").then((mod) => mod.MarkdownRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
        Loading preview...
      </div>
    ),
  }
);
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  exampleLabels,
  exampleMarkdown,
  extractTableOfContents,
  getMarkdownStats,
  type TocItem,
} from "@/lib/markdown-preview";
import { getStorageValue, setStorageValue } from "@/lib/utils";

const STORAGE_KEY_INPUT = "devtools:markdown-preview:input";

const MarkdownPreviewPage = () => {
  // Use lazy state initialization - function runs only once on initial render
  const [input, setInput] = useState(() => getStorageValue(STORAGE_KEY_INPUT));
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("split");

  // Mark as hydrated on mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input changes (after hydration)
  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    setStorageValue(STORAGE_KEY_INPUT, input);
  }, [input, isHydrated]);

  // Calculate stats
  const stats = useMemo(() => {
    return getMarkdownStats(input);
  }, [input]);

  // Extract table of contents
  const toc = useMemo(() => {
    return extractTableOfContents(input);
  }, [input]);

  const handleCopy = useCallback(async (text: string) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Markdown copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleClearInput = useCallback(() => {
    setInput("");
  }, []);

  const handleLoadExample = useCallback((key: keyof typeof exampleMarkdown) => {
    setInput(exampleMarkdown[key]);
  }, []);

  const handleDownload = useCallback(() => {
    if (!input) {
      return;
    }

    const blob = new Blob([input], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [input]);

  const handleScrollToHeading = useCallback((slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">Markdown Preview</h1>
          <p className="text-muted-foreground text-xs">
            Write and preview markdown with live rendering and GFM support
          </p>
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
                  <TabsTrigger value="preview">
                    <HugeiconsIcon className="mr-1" icon={ViewIcon} size={14} />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="split">Split</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          aria-label="Download markdown"
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
                    <TooltipContent>Download .md file</TooltipContent>
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
                    aria-label="Copy markdown"
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
            <CardContent className="pt-4">
              {/* Editor Only */}
              <TabsContent value="editor">
                <Textarea
                  aria-label="Markdown input"
                  className="!field-sizing-fixed h-[500px] max-h-[700px] min-h-[300px] resize-y font-mono text-xs leading-relaxed"
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="# Start typing your markdown here..."
                  spellCheck={false}
                  value={input}
                />
              </TabsContent>

              {/* Preview Only */}
              <TabsContent className="overflow-hidden" value="preview">
                <div className="prose-preview h-[500px] overflow-auto rounded-md border bg-card p-4">
                  {input.trim() ? (
                    <MarkdownRenderer content={input} />
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      Preview will appear here...
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Split View */}
              <TabsContent className="overflow-hidden" value="split">
                <ResizablePanelGroup
                  className="h-[500px] rounded-md"
                  orientation="horizontal"
                >
                  <ResizablePanel defaultSize={50} minSize={25}>
                    <Textarea
                      aria-label="Markdown input"
                      className="!field-sizing-fixed h-full resize-none rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:ring-0"
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="# Start typing your markdown here..."
                      spellCheck={false}
                      value={input}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={25}>
                    <ScrollArea className="h-full">
                      <div className="prose-preview h-full rounded-md border-0 bg-card p-4">
                        {input.trim() ? (
                          <MarkdownRenderer content={input} />
                        ) : (
                          <p className="text-muted-foreground text-sm italic">
                            Preview will appear here...
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>

              {/* Stats */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {stats.words} word{stats.words !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary">
                  {stats.characters} char{stats.characters !== 1 ? "s" : ""}
                </Badge>
                {stats.headings > 0 && (
                  <Badge variant="outline">
                    {stats.headings} heading{stats.headings !== 1 ? "s" : ""}
                  </Badge>
                )}
                {stats.codeBlocks > 0 && (
                  <Badge variant="outline">
                    {stats.codeBlocks} code block
                    {stats.codeBlocks !== 1 ? "s" : ""}
                  </Badge>
                )}
                {stats.links > 0 && (
                  <Badge variant="outline">
                    {stats.links} link{stats.links !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="shrink-0 lg:sticky lg:top-4 lg:h-fit lg:w-72">
        <div className="flex flex-col gap-4">
          {/* Examples */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={FileEditIcon} size={14} />
                Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-2">
                {(
                  Object.keys(exampleMarkdown) as Array<
                    keyof typeof exampleMarkdown
                  >
                ).map((key) => (
                  <ExampleButton
                    key={key}
                    label={exampleLabels[key]}
                    onClick={() => handleLoadExample(key)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Table of Contents */}
          {toc.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xs">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <nav className="flex flex-col gap-1">
                  {toc.map((item, index) => (
                    <TocLink
                      item={item}
                      key={`${item.slug}-${index}`}
                      onClick={handleScrollToHeading}
                    />
                  ))}
                </nav>
              </CardContent>
            </Card>
          )}

          {/* Syntax Help */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-xs">Markdown Syntax</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-1.5 text-muted-foreground text-xs">
                <SyntaxRow label="Bold" syntax="**text**" />
                <SyntaxRow label="Italic" syntax="*text*" />
                <SyntaxRow label="Strike" syntax="~~text~~" />
                <SyntaxRow label="H1-H6" syntax="# ## ###" />
                <SyntaxRow label="Link" syntax="[text](url)" />
                <SyntaxRow label="Image" syntax="![alt](url)" />
                <SyntaxRow label="Code" syntax="`code`" />
                <SyntaxRow label="Block" syntax="```lang" />
                <SyntaxRow label="Quote" syntax="> text" />
                <SyntaxRow label="List" syntax="- item" />
                <SyntaxRow label="Task" syntax="- [ ] task" />
                <SyntaxRow label="Table" syntax="| a | b |" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface ExampleButtonProps {
  label: string;
  onClick: () => void;
}

const ExampleButton = ({ label, onClick }: ExampleButtonProps) => {
  return (
    <Button
      aria-label={`Load ${label}`}
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

interface TocLinkProps {
  item: TocItem;
  onClick: (slug: string) => void;
}

const TocLink = ({ item, onClick }: TocLinkProps) => {
  const paddingLeft = (item.level - 1) * 12;

  return (
    <button
      aria-label={`Jump to ${item.text}`}
      className="cursor-pointer truncate rounded-sm px-2 py-1 text-left text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
      onClick={() => onClick(item.slug)}
      style={{ paddingLeft: `${paddingLeft + 8}px` }}
      tabIndex={0}
      type="button"
    >
      {item.text}
    </button>
  );
};

interface SyntaxRowProps {
  label: string;
  syntax: string;
}

const SyntaxRow = ({ label, syntax }: SyntaxRowProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0">{label}</span>
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
        {syntax}
      </code>
    </div>
  );
};

export default MarkdownPreviewPage;
