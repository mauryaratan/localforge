"use client";

import {
  GridViewIcon,
  Search01Icon,
  TableIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  categories,
  filterByCategory,
  getCategoryCounts,
  getEntities,
  type HTMLSymbol,
  type SymbolCategory,
  searchSymbols,
} from "@/lib/html-symbols";

type ViewMode = "grid" | "table";
type CopiedState = Record<string, boolean>;

const STORAGE_KEY = "devtools:html-symbols:search";
const VIEW_MODE_KEY = "devtools:html-symbols:view";
const CATEGORY_KEY = "devtools:html-symbols:category";

// Grid configuration
const GRID_ITEM_HEIGHT = 120;
const TABLE_ROW_HEIGHT = 40;

const HTMLSymbolsPage = () => {
  const [symbols, setSymbols] = useState<HTMLSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<SymbolCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [copied, setCopied] = useState<CopiedState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedSearch = localStorage.getItem(STORAGE_KEY);
    const savedView = localStorage.getItem(VIEW_MODE_KEY) as ViewMode | null;
    const savedCategory = localStorage.getItem(
      CATEGORY_KEY
    ) as SymbolCategory | null;

    if (savedSearch) {
      setSearchQuery(savedSearch);
    }
    if (savedView && (savedView === "grid" || savedView === "table")) {
      setViewMode(savedView);
    }
    if (savedCategory) {
      setCategory(savedCategory);
    }
    setIsHydrated(true);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (searchQuery) {
      localStorage.setItem(STORAGE_KEY, searchQuery);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
    localStorage.setItem(CATEGORY_KEY, category);
  }, [searchQuery, viewMode, category, isHydrated]);

  // Fetch entities on mount
  useEffect(() => {
    const loadEntities = async () => {
      try {
        setIsLoading(true);
        const data = await getEntities();
        setSymbols(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load symbols");
      } finally {
        setIsLoading(false);
      }
    };

    loadEntities();
  }, []);

  // Filter and search symbols
  const filteredSymbols = useMemo(() => {
    let result = filterByCategory(symbols, category);
    result = searchSymbols(result, searchQuery);
    return result;
  }, [symbols, category, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => getCategoryCounts(symbols), [symbols]);

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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleCategoryChange = useCallback((cat: SymbolCategory) => {
    setCategory(cat);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col gap-4">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-1">
        <h1 className="font-medium text-lg">HTML Symbols</h1>
        <p className="text-muted-foreground text-xs">
          Browse and copy HTML entity codes, Unicode values, and CSS codes
        </p>
      </div>

      {/* Controls */}
      <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
        {/* Search & View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <HugeiconsIcon
              className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
              icon={Search01Icon}
              size={14}
            />
            <Input
              aria-label="Search symbols"
              className="pl-8 text-xs"
              onChange={handleSearchChange}
              placeholder="Search by name, entity, unicode..."
              type="search"
              value={searchQuery}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-md bg-muted p-1">
            <Button
              aria-label="Grid view"
              className={`cursor-pointer ${viewMode === "grid" ? "bg-background shadow-sm" : ""}`}
              onClick={() => handleViewModeChange("grid")}
              size="icon-xs"
              tabIndex={0}
              variant="ghost"
            >
              <HugeiconsIcon icon={GridViewIcon} size={14} />
            </Button>
            <Button
              aria-label="Table view"
              className={`cursor-pointer ${viewMode === "table" ? "bg-background shadow-sm" : ""}`}
              onClick={() => handleViewModeChange("table")}
              size="icon-xs"
              tabIndex={0}
              variant="ghost"
            >
              <HugeiconsIcon icon={TableIcon} size={14} />
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b px-4 py-3">
          <ScrollArea className="w-full">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  aria-label={`Filter by ${cat.label}`}
                  aria-pressed={category === cat.id}
                  className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors ${
                    category === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  tabIndex={0}
                  type="button"
                >
                  <span className="font-mono">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="opacity-60">({categoryCounts[cat.id]})</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-muted-foreground text-xs">
                  Loading symbols...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <p className="text-destructive text-xs">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!(isLoading || error) && filteredSymbols.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground text-xs">
                No symbols found matching your search.
              </p>
            </div>
          )}

          {/* Results */}
          {!(isLoading || error) && filteredSymbols.length > 0 && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <p className="shrink-0 px-4 pt-4 text-muted-foreground text-xs">
                {filteredSymbols.length} symbol
                {filteredSymbols.length !== 1 ? "s" : ""} found
              </p>

              {viewMode === "grid" ? (
                <VirtualizedGrid
                  copied={copied}
                  onCopy={handleCopy}
                  symbols={filteredSymbols}
                />
              ) : (
                <VirtualizedTable
                  copied={copied}
                  onCopy={handleCopy}
                  symbols={filteredSymbols}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface VirtualizedGridProps {
  symbols: HTMLSymbol[];
  copied: CopiedState;
  onCopy: (text: string, key: string) => void;
}

const VirtualizedGrid = ({ symbols, copied, onCopy }: VirtualizedGridProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnsCount, setColumnsCount] = useState(6);

  // Calculate columns based on container width
  useEffect(() => {
    const updateColumns = () => {
      if (!parentRef.current) {
        return;
      }
      const width = parentRef.current.offsetWidth;
      if (width < 400) {
        setColumnsCount(2);
      } else if (width < 600) {
        setColumnsCount(3);
      } else if (width < 800) {
        setColumnsCount(4);
      } else if (width < 1000) {
        setColumnsCount(5);
      } else {
        setColumnsCount(6);
      }
    };

    updateColumns();
    const resizeObserver = new ResizeObserver(updateColumns);
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate rows
  const rowCount = Math.ceil(symbols.length / columnsCount);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => GRID_ITEM_HEIGHT,
    overscan: 3,
  });

  return (
    <div className="flex-1 overflow-auto p-4" ref={parentRef}>
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnsCount;
          const rowSymbols = symbols.slice(
            startIndex,
            startIndex + columnsCount
          );

          return (
            <div
              className="absolute top-0 left-0 grid w-full gap-3"
              key={virtualRow.key}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
              }}
            >
              {rowSymbols.map((symbol) => (
                <SymbolCard
                  copied={copied}
                  key={symbol.entity}
                  onCopy={onCopy}
                  symbol={symbol}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SymbolCardProps {
  symbol: HTMLSymbol;
  copied: CopiedState;
  onCopy: (text: string, key: string) => void;
}

const SymbolCard = ({ symbol, copied, onCopy }: SymbolCardProps) => {
  const copyKey = `char-${symbol.entity}`;

  return (
    <Card className="group relative overflow-hidden transition-colors hover:border-primary/50">
      <CardContent className="flex flex-col items-center gap-2 p-3">
        {/* Character */}
        <button
          aria-label={`Copy ${symbol.name} character`}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-md bg-muted/50 text-2xl transition-colors hover:bg-primary/10"
          onClick={() => onCopy(symbol.character, copyKey)}
          tabIndex={0}
          title={`Click to copy: ${symbol.character}`}
          type="button"
        >
          {symbol.character}
        </button>

        {/* Name */}
        <p
          className="w-full truncate text-center text-[10px] text-muted-foreground"
          title={symbol.name}
        >
          {symbol.name}
        </p>

        {/* Copy indicator */}
        {copied[copyKey] && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/90 text-primary-foreground">
            <div className="flex items-center gap-1 text-xs">
              <HugeiconsIcon icon={Tick01Icon} size={14} />
              Copied!
            </div>
          </div>
        )}
      </CardContent>

      {/* Hover details */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-card/95 p-2 opacity-0 shadow-lg backdrop-blur-sm transition-all group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex flex-col gap-1 text-[10px]">
          <CopyRow
            copied={copied[`entity-${symbol.entity}`]}
            label="Entity"
            onCopy={() => onCopy(symbol.entity, `entity-${symbol.entity}`)}
            value={symbol.entity}
          />
          <CopyRow
            copied={copied[`unicode-${symbol.entity}`]}
            label="Unicode"
            onCopy={() => onCopy(symbol.unicode, `unicode-${symbol.entity}`)}
            value={symbol.unicode}
          />
          <CopyRow
            copied={copied[`hex-${symbol.entity}`]}
            label="Hex"
            onCopy={() => onCopy(symbol.hexCode, `hex-${symbol.entity}`)}
            value={symbol.hexCode}
          />
          <CopyRow
            copied={copied[`html-${symbol.entity}`]}
            label="HTML"
            onCopy={() => onCopy(symbol.htmlCode, `html-${symbol.entity}`)}
            value={symbol.htmlCode}
          />
          <CopyRow
            copied={copied[`css-${symbol.entity}`]}
            label="CSS"
            onCopy={() => onCopy(symbol.cssCode, `css-${symbol.entity}`)}
            value={symbol.cssCode}
          />
        </div>
      </div>
    </Card>
  );
};

interface CopyRowProps {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}

const CopyRow = ({ label, value, copied, onCopy }: CopyRowProps) => {
  return (
    <button
      aria-label={`Copy ${label}`}
      className="flex cursor-pointer items-center justify-between gap-2 rounded px-1.5 py-0.5 transition-colors hover:bg-muted"
      onClick={onCopy}
      tabIndex={0}
      type="button"
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 font-mono">
        {value}
        {copied && (
          <HugeiconsIcon className="text-primary" icon={Tick01Icon} size={10} />
        )}
      </span>
    </button>
  );
};

interface VirtualizedTableProps {
  symbols: HTMLSymbol[];
  copied: CopiedState;
  onCopy: (text: string, key: string) => void;
}

const VirtualizedTable = ({
  symbols,
  copied,
  onCopy,
}: VirtualizedTableProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: symbols.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => TABLE_ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex shrink-0 border-b bg-card px-4 py-2 font-medium text-muted-foreground text-xs">
        <div className="w-[60px] shrink-0">Symbol</div>
        <div className="w-[120px] shrink-0">Name</div>
        <div className="w-[80px] shrink-0">Unicode</div>
        <div className="w-[70px] shrink-0">Hex</div>
        <div className="w-[70px] shrink-0">HTML</div>
        <div className="w-[100px] shrink-0">Entity</div>
        <div className="flex-1">CSS</div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto px-4" ref={parentRef}>
        <div
          className="relative"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const symbol = symbols[virtualRow.index];
            return (
              <div
                className="absolute top-0 left-0 flex w-full items-center border-muted/50 border-b text-xs hover:bg-muted/30"
                key={virtualRow.key}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="w-[60px] shrink-0 py-2">
                  <CopyCell
                    copied={copied[`table-char-${symbol.entity}`]}
                    onCopy={() =>
                      onCopy(symbol.character, `table-char-${symbol.entity}`)
                    }
                    value={symbol.character}
                  >
                    <span className="text-lg">{symbol.character}</span>
                  </CopyCell>
                </div>
                <div
                  className="w-[120px] shrink-0 truncate py-2 pr-2"
                  title={symbol.name}
                >
                  {symbol.name}
                </div>
                <div className="w-[80px] shrink-0 py-2">
                  <CopyCell
                    copied={copied[`table-unicode-${symbol.entity}`]}
                    onCopy={() =>
                      onCopy(symbol.unicode, `table-unicode-${symbol.entity}`)
                    }
                    value={symbol.unicode}
                  />
                </div>
                <div className="w-[70px] shrink-0 py-2">
                  <CopyCell
                    copied={copied[`table-hex-${symbol.entity}`]}
                    onCopy={() =>
                      onCopy(symbol.hexCode, `table-hex-${symbol.entity}`)
                    }
                    value={symbol.hexCode}
                  />
                </div>
                <div className="w-[70px] shrink-0 py-2">
                  <CopyCell
                    copied={copied[`table-html-${symbol.entity}`]}
                    onCopy={() =>
                      onCopy(symbol.htmlCode, `table-html-${symbol.entity}`)
                    }
                    value={symbol.htmlCode}
                  />
                </div>
                <div className="w-[100px] shrink-0 py-2">
                  <CopyCell
                    copied={copied[`table-entity-${symbol.entity}`]}
                    onCopy={() =>
                      onCopy(symbol.entity, `table-entity-${symbol.entity}`)
                    }
                    value={symbol.entity}
                  />
                </div>
                <div className="flex-1 py-2">
                  <CopyCell
                    copied={copied[`table-css-${symbol.entity}`]}
                    onCopy={() =>
                      onCopy(symbol.cssCode, `table-css-${symbol.entity}`)
                    }
                    value={symbol.cssCode}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface CopyCellProps {
  value: string;
  copied: boolean;
  onCopy: () => void;
  children?: React.ReactNode;
}

const CopyCell = ({ value, copied, onCopy, children }: CopyCellProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            aria-label={`Copy ${value}`}
            className="flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 font-mono transition-colors hover:bg-muted"
            onClick={onCopy}
            tabIndex={0}
            type="button"
          />
        }
      >
        {children || value}
        {copied && (
          <HugeiconsIcon className="text-primary" icon={Tick01Icon} size={10} />
        )}
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied!" : `Copy ${value}`}</TooltipContent>
    </Tooltip>
  );
};

export default HTMLSymbolsPage;
