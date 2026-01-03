"use client";

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Copy01Icon,
  Delete02Icon,
  FileEditIcon,
  MinusSignIcon,
  Search01Icon,
  SortByDown02Icon,
  TextWrapIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  buildJsonTree,
  exampleJson,
  examplePaths,
  formatJson,
  getAllPaths,
  getJsonStats,
  minifyJson,
  queryJsonPath,
  sortJsonKeys,
  type TreeNode,
  validateJson,
} from "@/lib/json-formatter";

type CopiedState = Record<string, boolean>;

const STORAGE_KEY_INPUT = "devtools:json-formatter:input";
const STORAGE_KEY_PATH = "devtools:json-formatter:path";

const JsonFormatterPage = () => {
  const [input, setInput] = useState("");
  const [pathQuery, setPathQuery] = useState("");
  const [pathResult, setPathResult] = useState<string>("");
  const [pathError, setPathError] = useState<string | null>(null);
  const [copied, setCopied] = useState<CopiedState>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  const [activeTab, setActiveTab] = useState<string>("formatted");

  // Load from localStorage on mount
  useEffect(() => {
    const savedInput = localStorage.getItem(STORAGE_KEY_INPUT);
    const savedPath = localStorage.getItem(STORAGE_KEY_PATH);

    if (savedInput) {
      setInput(savedInput);
    }
    if (savedPath) {
      setPathQuery(savedPath);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input/path changes (after hydration)
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (input) {
      localStorage.setItem(STORAGE_KEY_INPUT, input);
    } else {
      localStorage.removeItem(STORAGE_KEY_INPUT);
    }

    if (pathQuery) {
      localStorage.setItem(STORAGE_KEY_PATH, pathQuery);
    } else {
      localStorage.removeItem(STORAGE_KEY_PATH);
    }
  }, [input, pathQuery, isHydrated]);

  // Validation result
  const validation = useMemo(() => {
    if (!input.trim()) {
      return { isValid: null, error: null, parsed: null };
    }
    const result = validateJson(input);
    return {
      isValid: result.isValid,
      error: result.error || null,
      parsed: result.parsed,
      errorPosition: result.errorPosition,
    };
  }, [input]);

  // Formatted output
  const formattedOutput = useMemo(() => {
    if (!(validation.isValid && validation.parsed)) {
      return "";
    }
    const result = formatJson(input, indentSize);
    return result.success ? result.output : "";
  }, [input, indentSize, validation.isValid, validation.parsed]);

  // JSON stats
  const stats = useMemo(() => {
    if (!(validation.isValid && validation.parsed)) {
      return null;
    }
    return getJsonStats(validation.parsed);
  }, [validation.isValid, validation.parsed]);

  // Tree nodes
  const treeNodes = useMemo(() => {
    if (!(validation.isValid && validation.parsed)) {
      return [];
    }
    return buildJsonTree(validation.parsed);
  }, [validation.isValid, validation.parsed]);

  // Available paths for suggestions
  const availablePaths = useMemo(() => {
    if (!(validation.isValid && validation.parsed)) {
      return [];
    }
    return getAllPaths(validation.parsed).slice(0, 50);
  }, [validation.isValid, validation.parsed]);

  // Evaluate JSONPath
  useEffect(() => {
    if (!(pathQuery.trim() && validation.isValid)) {
      setPathResult("");
      setPathError(null);
      return;
    }

    const result = queryJsonPath(input, pathQuery);
    if (result.success) {
      setPathResult(JSON.stringify(result.result, null, 2));
      setPathError(null);
    } else {
      setPathResult("");
      setPathError(result.error || "Invalid path");
    }
  }, [pathQuery, input, validation.isValid]);

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
    setPathQuery("");
    setPathResult("");
    setPathError(null);
  }, []);

  const handleFormat = useCallback(() => {
    const result = formatJson(input, indentSize);
    if (result.success) {
      setInput(result.output);
    }
  }, [input, indentSize]);

  const handleMinify = useCallback(() => {
    const result = minifyJson(input);
    if (result.success) {
      setInput(result.output);
    }
  }, [input]);

  const handleSortKeys = useCallback(() => {
    const result = sortJsonKeys(input);
    if (result.success) {
      setInput(result.output);
    }
  }, [input]);

  const handleLoadExample = useCallback((example: string) => {
    setInput(example);
  }, []);

  const handleLoadPath = useCallback((path: string) => {
    setPathQuery(path);
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">JSON Formatter & Validator</h1>
          <p className="text-muted-foreground text-xs">
            Format, validate, and query JSON with JSONPath
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>JSON Input</CardTitle>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Format JSON"
                        className="cursor-pointer"
                        disabled={!validation.isValid}
                        onClick={handleFormat}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={TextWrapIcon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Format (prettify)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Minify JSON"
                        className="cursor-pointer"
                        disabled={!validation.isValid}
                        onClick={handleMinify}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={MinusSignIcon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Minify</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Sort keys"
                        className="cursor-pointer"
                        disabled={!validation.isValid}
                        onClick={handleSortKeys}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={SortByDown02Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Sort keys A-Z</TooltipContent>
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
                  label="Copy JSON"
                  onCopy={() => handleCopy(input, "input")}
                  text={input}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              aria-label="JSON input"
              className="h-[280px] max-h-[400px] min-h-[200px] resize-y !field-sizing-fixed font-mono text-xs leading-relaxed"
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"key": "value"}'
              spellCheck={false}
              value={input}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {validation.isValid === true && (
                <>
                  <Badge variant="default">Valid JSON</Badge>
                  {stats && (
                    <span className="text-muted-foreground text-xs">
                      {stats.keyCount} keys · {stats.objectCount} objects ·{" "}
                      {stats.arrayCount} arrays · depth {stats.maxDepth}
                    </span>
                  )}
                </>
              )}
              {validation.isValid === false && validation.error && (
                <Badge variant="destructive">
                  {validation.errorPosition
                    ? `Line ${validation.errorPosition.line}, Col ${validation.errorPosition.column}: `
                    : ""}
                  {validation.error}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* JSONPath Filter */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Search01Icon} size={14} />
                JSONPath Filter
              </CardTitle>
              {pathQuery && pathResult && !pathError && (
                <CopyButton
                  copied={copied.pathResult}
                  label="Copy result"
                  onCopy={() => handleCopy(pathResult, "pathResult")}
                  text={pathResult}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input
                aria-label="JSONPath query"
                className="flex-1 font-mono"
                disabled={!validation.isValid}
                onChange={(e) => setPathQuery(e.target.value)}
                placeholder="$.user.name or $..email or $.items[?(@.price<100)]"
                value={pathQuery}
              />
            </div>
            {pathError && (
              <Badge className="mt-3" variant="destructive">
                {pathError}
              </Badge>
            )}
            {pathResult && !pathError && (
              <div className="mt-3">
                <Textarea
                  aria-label="JSONPath result"
                  className="h-[100px] max-h-[200px] min-h-[80px] resize-y !field-sizing-fixed bg-muted/30 font-mono text-xs"
                  readOnly
                  spellCheck={false}
                  value={pathResult}
                />
              </div>
            )}
            {validation.isValid && !pathQuery && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {examplePaths.slice(0, 4).map((item) => (
                  <Tooltip key={item.path}>
                    <TooltipTrigger
                      render={
                        <button
                          aria-label={`Use path: ${item.path}`}
                          className="cursor-pointer rounded-sm bg-muted/50 px-2 py-1 font-mono text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
                          onClick={() => handleLoadPath(item.path)}
                          tabIndex={0}
                          type="button"
                        />
                      }
                    >
                      {item.path}
                    </TooltipTrigger>
                    <TooltipContent>{item.description}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Tabs */}
        {validation.isValid && (
          <Card>
            <Tabs
              defaultValue="formatted"
              onValueChange={(v) => setActiveTab(v as string)}
              value={activeTab}
            >
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <TabsList variant="line">
                    <TabsTrigger value="formatted">Formatted</TabsTrigger>
                    <TabsTrigger value="tree">Tree View</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    {activeTab === "formatted" && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-xs">
                          Indent:
                        </span>
                        {[2, 4].map((size) => (
                          <button
                            aria-label={`${size} spaces`}
                            aria-pressed={indentSize === size}
                            className={`cursor-pointer rounded-sm px-1.5 py-0.5 text-xs transition-colors ${
                              indentSize === size
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                            key={size}
                            onClick={() => setIndentSize(size)}
                            tabIndex={0}
                            type="button"
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                    <CopyButton
                      copied={copied.output}
                      label="Copy formatted"
                      onCopy={() => handleCopy(formattedOutput, "output")}
                      text={formattedOutput}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <TabsContent value="formatted">
                  <Textarea
                    aria-label="Formatted JSON output"
                    className="h-[280px] max-h-[400px] min-h-[200px] resize-y !field-sizing-fixed bg-muted/30 font-mono text-xs leading-relaxed"
                    readOnly
                    spellCheck={false}
                    value={formattedOutput}
                  />
                </TabsContent>
                <TabsContent value="tree">
                  <div className="max-h-[400px] overflow-auto rounded-sm bg-muted/30 p-3">
                    {treeNodes.length > 0 ? (
                      <TreeView
                        copied={copied}
                        nodes={treeNodes}
                        onCopy={handleCopy}
                      />
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        No data to display
                      </p>
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="shrink-0 lg:sticky lg:top-4 lg:h-fit lg:w-72">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={FileEditIcon} size={14} />
              Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              <ExampleButton
                label="Simple Object"
                onClick={() => handleLoadExample(exampleJson.simple)}
              />
              <ExampleButton
                label="Nested Object"
                onClick={() => handleLoadExample(exampleJson.nested)}
              />
              <ExampleButton
                label="Array Data"
                onClick={() => handleLoadExample(exampleJson.array)}
              />
              <ExampleButton
                label="Kubernetes Pod"
                onClick={() => handleLoadExample(exampleJson.complex)}
              />
            </div>

            {/* JSONPath Help */}
            <div className="mt-6 border-t pt-4">
              <h4 className="mb-2 font-medium text-xs">JSONPath Syntax</h4>
              <div className="flex flex-col gap-1.5 text-muted-foreground text-xs">
                <div className="flex items-start gap-2">
                  <code className="shrink-0 rounded-sm bg-muted px-1">$</code>
                  <span>Root object</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="shrink-0 rounded-sm bg-muted px-1">
                    $.key
                  </code>
                  <span>Object property</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="shrink-0 rounded-sm bg-muted px-1">
                    $[0]
                  </code>
                  <span>Array index</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="shrink-0 rounded-sm bg-muted px-1">
                    $[*]
                  </code>
                  <span>All array items</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="shrink-0 rounded-sm bg-muted px-1">
                    $..key
                  </code>
                  <span>Recursive search</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="shrink-0 rounded-sm bg-muted px-1 text-[10px]">
                    [?(@.x&lt;5)]
                  </code>
                  <span>Filter expression</span>
                </div>
              </div>
            </div>

            {/* Quick paths from current JSON */}
            {validation.isValid && availablePaths.length > 1 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="mb-2 font-medium text-xs">Available Paths</h4>
                <div className="max-h-[200px] overflow-auto">
                  {availablePaths.slice(1, 15).map((path) => (
                    <button
                      aria-label={`Use path: ${path}`}
                      className="block w-full cursor-pointer rounded-sm px-1.5 py-1 text-left font-mono text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
                      key={path}
                      onClick={() => handleLoadPath(path)}
                      tabIndex={0}
                      title={path}
                      type="button"
                    >
                      {path}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Tree View Component
interface TreeViewProps {
  nodes: TreeNode[];
  depth?: number;
  onCopy: (text: string, key: string) => void;
  copied: CopiedState;
}

const TreeView = ({ nodes, depth = 0, onCopy, copied }: TreeViewProps) => {
  return (
    <div className="flex flex-col">
      {nodes.map((node, index) => (
        <TreeNodeItem
          copied={copied}
          depth={depth}
          key={`${node.path}-${index}`}
          node={node}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
};

interface TreeNodeItemProps {
  node: TreeNode;
  depth: number;
  onCopy: (text: string, key: string) => void;
  copied: CopiedState;
}

const TreeNodeItem = ({ node, depth, onCopy, copied }: TreeNodeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = useCallback(() => {
    if (hasChildren) {
      setIsExpanded((prev) => !prev);
    }
  }, [hasChildren]);

  const handleCopyPath = useCallback(() => {
    onCopy(node.path, `path-${node.path}`);
  }, [node.path, onCopy]);

  const getValueDisplay = () => {
    if (node.type === "object") {
      return (
        <span className="text-muted-foreground">
          {"{"}
          {node.children?.length || 0} keys
          {"}"}
        </span>
      );
    }
    if (node.type === "array") {
      return (
        <span className="text-muted-foreground">
          [{node.children?.length || 0} items]
        </span>
      );
    }
    if (node.type === "string") {
      return (
        <span className="text-green-600 dark:text-green-400">
          &quot;{String(node.value)}&quot;
        </span>
      );
    }
    if (node.type === "number") {
      return (
        <span className="text-blue-600 dark:text-blue-400">
          {String(node.value)}
        </span>
      );
    }
    if (node.type === "boolean") {
      return (
        <span className="text-amber-600 dark:text-amber-400">
          {String(node.value)}
        </span>
      );
    }
    if (node.type === "null") {
      return <span className="text-muted-foreground italic">null</span>;
    }
    return String(node.value);
  };

  return (
    <div className="flex flex-col">
      <div
        className="group flex items-center gap-1 rounded-sm px-1 py-0.5 hover:bg-muted/50"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        {hasChildren ? (
          <button
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
            onClick={handleToggle}
            tabIndex={0}
            type="button"
          >
            <HugeiconsIcon
              icon={isExpanded ? ArrowDown01Icon : ArrowUp01Icon}
              size={12}
            />
          </button>
        ) : (
          <span className="h-4 w-4" />
        )}
        <span className="font-medium text-xs">{node.key}:</span>
        <span className="text-xs">{getValueDisplay()}</span>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                aria-label="Copy path"
                className="ml-auto cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleCopyPath}
                tabIndex={0}
                type="button"
              />
            }
          >
            <HugeiconsIcon
              icon={copied[`path-${node.path}`] ? Tick01Icon : Copy01Icon}
              size={12}
            />
          </TooltipTrigger>
          <TooltipContent>
            {copied[`path-${node.path}`] ? "Copied!" : node.path}
          </TooltipContent>
        </Tooltip>
      </div>
      {hasChildren && isExpanded && node.children && (
        <TreeView
          copied={copied}
          depth={depth + 1}
          nodes={node.children}
          onCopy={onCopy}
        />
      )}
    </div>
  );
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
      aria-label={`Load ${label} example`}
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

export default JsonFormatterPage;
