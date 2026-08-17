"use client";

import {
  Alert02Icon,
  Download01Icon,
  FileEditIcon,
  Loading03Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { MarkdownStats } from "@/lib/markdown-preview";
import type { PdfInspectionResult } from "@/lib/pdf-to-markdown";

const MarkdownRenderer = dynamic(
  () =>
    import("../markdown-preview/markdown-renderer").then(
      (module) => module.MarkdownRenderer
    ),
  {
    loading: () => (
      <div className="flex min-h-80 items-center justify-center gap-2 text-muted-foreground text-xs">
        <HugeiconsIcon className="animate-spin" icon={Loading03Icon} />
        Loading preview…
      </div>
    ),
    ssr: false,
  }
);

const formatPageList = (pages: number[]): string => {
  const visiblePages = pages.slice(0, 8).join(", ");
  const remainingPages = pages.length - 8;
  return remainingPages > 0
    ? `${visiblePages} and ${remainingPages} more`
    : visiblePages;
};

interface PdfOutputCardProps {
  activeTab: string;
  copied: boolean;
  markdown: string;
  markdownStats: MarkdownStats;
  onCopy: () => void;
  onDownload: () => void;
  onTabChange: (value: string) => void;
  result: PdfInspectionResult;
}

const PdfOutputWarnings = ({ result }: { result: PdfInspectionResult }) => (
  <>
    {result.pagesNeedingOcr.length > 0 ? (
      <div className="flex gap-2 border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <HugeiconsIcon
          className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
          icon={Alert02Icon}
        />
        <p>
          OCR is needed on page
          {result.pagesNeedingOcr.length === 1 ? "" : "s"}{" "}
          {formatPageList(result.pagesNeedingOcr)}. Text from those pages may be
          missing.
        </p>
      </div>
    ) : null}

    {result.hasEncodingIssues ? (
      <p className="border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        Some embedded fonts could not be decoded reliably. Review the output
        before using it.
      </p>
    ) : null}
  </>
);

const EmptyMarkdown = () => (
  <div className="flex min-h-64 flex-col items-center justify-center gap-2 border border-dashed p-6 text-center">
    <HugeiconsIcon
      className="size-8 text-muted-foreground"
      icon={FileEditIcon}
    />
    <p className="font-medium text-sm">No Markdown extracted</p>
    <p className="max-w-md text-muted-foreground text-xs">
      This usually means the document is scanned or image-based. Browser OCR is
      not included in this tool.
    </p>
  </div>
);

const OutputStats = ({
  markdownStats,
  result,
}: Pick<PdfOutputCardProps, "markdownStats" | "result">) => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge variant="secondary">
      {markdownStats.words.toLocaleString()} words
    </Badge>
    <Badge variant="secondary">
      {markdownStats.characters.toLocaleString()} characters
    </Badge>
    {result.layout.pagesWithTables.length > 0 ? (
      <Badge variant="outline">
        {result.layout.pagesWithTables.length} table page
        {result.layout.pagesWithTables.length === 1 ? "" : "s"}
      </Badge>
    ) : null}
    {result.layout.pagesWithColumns.length > 0 ? (
      <Badge variant="outline">
        {result.layout.pagesWithColumns.length} column page
        {result.layout.pagesWithColumns.length === 1 ? "" : "s"}
      </Badge>
    ) : null}
  </div>
);

export const PdfOutputCard = ({
  activeTab,
  copied,
  markdown,
  markdownStats,
  onCopy,
  onDownload,
  onTabChange,
  result,
}: PdfOutputCardProps) => (
  <Card>
    <Tabs onValueChange={onTabChange} value={activeTab}>
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList variant="line">
            <TabsTrigger value="markdown">
              <HugeiconsIcon className="mr-1" icon={FileEditIcon} />
              Markdown
            </TabsTrigger>
            <TabsTrigger disabled={!markdown} value="preview">
              <HugeiconsIcon className="mr-1" icon={ViewIcon} />
              Preview
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <Button
              aria-label="Download Markdown"
              className="cursor-pointer"
              disabled={!markdown}
              onClick={onDownload}
              size="icon-xs"
              variant="ghost"
            >
              <HugeiconsIcon icon={Download01Icon} />
            </Button>
            <CopyButton
              copied={copied}
              disabled={!markdown}
              label="Copy Markdown"
              onCopy={onCopy}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <PdfOutputWarnings result={result} />

        <TabsContent value="markdown">
          {markdown ? (
            <Textarea
              aria-label="Generated Markdown"
              className="!field-sizing-fixed h-[520px] resize-y font-mono text-xs leading-relaxed"
              readOnly
              spellCheck={false}
              value={markdown}
            />
          ) : (
            <EmptyMarkdown />
          )}
        </TabsContent>
        <TabsContent value="preview">
          <div className="min-h-[520px] overflow-auto border bg-card p-4">
            {activeTab === "preview" && markdown ? (
              <MarkdownRenderer content={markdown} />
            ) : null}
          </div>
        </TabsContent>

        <OutputStats markdownStats={markdownStats} result={result} />
      </CardContent>
    </Tabs>
  </Card>
);
