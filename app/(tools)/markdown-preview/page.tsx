"use client";

import {
  Copy01Icon,
  Delete02Icon,
  Download04Icon,
  FileEditIcon,
  Tick01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type CopiedState = Record<string, boolean>;

const STORAGE_KEY_INPUT = "devtools:markdown-preview:input";

const MarkdownPreviewPage = () => {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<CopiedState>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("split");

  // Load from localStorage on mount
  useEffect(() => {
    const savedInput = localStorage.getItem(STORAGE_KEY_INPUT);
    if (savedInput) {
      setInput(savedInput);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input changes (after hydration)
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (input) {
      localStorage.setItem(STORAGE_KEY_INPUT, input);
    } else {
      localStorage.removeItem(STORAGE_KEY_INPUT);
    }
  }, [input, isHydrated]);

  // Calculate stats
  const stats = useMemo(() => {
    return getMarkdownStats(input);
  }, [input]);

  // Extract table of contents
  const toc = useMemo(() => {
    return extractTableOfContents(input);
  }, [input]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    if (!text) {
      return;
    }

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
                  <CopyButton
                    copied={copied.input}
                    label="Copy markdown"
                    onCopy={() => handleCopy(input, "input")}
                    text={input}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Editor Only */}
              <TabsContent value="editor">
                <Textarea
                  aria-label="Markdown input"
                  className="h-[500px] max-h-[700px] min-h-[300px] resize-y !field-sizing-fixed font-mono text-xs leading-relaxed"
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
                <div className="grid h-[500px] gap-4 lg:grid-cols-2">
                  <Textarea
                    aria-label="Markdown input"
                    className="h-full resize-none !field-sizing-fixed font-mono text-xs leading-relaxed"
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="# Start typing your markdown here..."
                    spellCheck={false}
                    value={input}
                  />
                  <div className="prose-preview h-full overflow-auto rounded-md border bg-card p-4">
                    {input.trim() ? (
                      <MarkdownRenderer content={input} />
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        Preview will appear here...
                      </p>
                    )}
                  </div>
                </div>
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

// Markdown Renderer Component with custom styling
interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        components={{
          // Headings with IDs for TOC navigation
          h1: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h1
                className="mb-4 mt-6 border-b pb-2 font-semibold text-2xl first:mt-0"
                id={id}
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h2
                className="mb-3 mt-5 border-b pb-1.5 font-semibold text-xl"
                id={id}
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h3
                className="mb-2 mt-4 font-semibold text-lg"
                id={id}
                {...props}
              >
                {children}
              </h3>
            );
          },
          h4: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h4
                className="mb-2 mt-3 font-semibold text-base"
                id={id}
                {...props}
              >
                {children}
              </h4>
            );
          },
          h5: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h5
                className="mb-1 mt-2 font-semibold text-sm"
                id={id}
                {...props}
              >
                {children}
              </h5>
            );
          },
          h6: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h6
                className="mb-1 mt-2 font-semibold text-muted-foreground text-xs"
                id={id}
                {...props}
              >
                {children}
              </h6>
            );
          },
          // Paragraphs
          p: ({ children, ...props }) => (
            <p className="mb-3 text-sm leading-relaxed" {...props}>
              {children}
            </p>
          ),
          // Lists
          ul: ({ children, ...props }) => (
            <ul className="mb-3 list-disc pl-6 text-sm" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="mb-3 list-decimal pl-6 text-sm" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="mb-1" {...props}>
              {children}
            </li>
          ),
          // Blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="my-3 border-primary/50 border-l-4 pl-4 text-muted-foreground text-sm italic"
              {...props}
            >
              {children}
            </blockquote>
          ),
          // Code
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-primary text-xs"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            const language = className?.replace("language-", "") || "";
            return (
              <code className={`language-${language}`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre
              className="my-3 overflow-x-auto rounded-md bg-muted/50 p-4 font-mono text-xs"
              {...props}
            >
              {children}
            </pre>
          ),
          // Links
          a: ({ children, href, ...props }) => (
            <a
              className="text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
              {...props}
            >
              {children}
            </a>
          ),
          // Images
          img: ({ src, alt, ...props }) => (
            <img
              alt={alt || ""}
              className="my-3 max-w-full rounded-md"
              loading="lazy"
              src={src}
              {...props}
            />
          ),
          // Tables
          table: ({ children, ...props }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="border-b bg-muted/50" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-3 py-2 text-left font-medium" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border-t px-3 py-2" {...props}>
              {children}
            </td>
          ),
          // Horizontal rule
          hr: (props) => <hr className="my-6 border-border" {...props} />,
          // Strong and emphasis
          strong: ({ children, ...props }) => (
            <strong className="font-semibold" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),
          // Strikethrough
          del: ({ children, ...props }) => (
            <del className="text-muted-foreground line-through" {...props}>
              {children}
            </del>
          ),
          // Task list items
          input: ({ type, checked, ...props }) => {
            if (type === "checkbox") {
              return (
                <input
                  checked={checked}
                  className="mr-2 rounded"
                  disabled
                  type="checkbox"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Helper to extract text content from React children
const getTextContent = (children: React.ReactNode): string => {
  if (typeof children === "string") {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    const childElement = children as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    return getTextContent(childElement.props.children);
  }
  return "";
};

// Helper to create URL-friendly slug
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Reusable Components
interface CopyButtonProps {
  text: string;
  copied: boolean;
  onCopy: () => void;
  label: string;
  size?: "icon-xs" | "icon-sm" | "icon";
}

const CopyButton = ({
  text,
  copied,
  onCopy,
  label,
  size = "icon-xs",
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
