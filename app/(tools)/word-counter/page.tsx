"use client";

import {
  Copy01Icon,
  Delete02Icon,
  FileEditIcon,
  Time01Icon,
  TextIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  exampleTexts,
  formatTime,
  getTopWords,
  getWordCountStats,
  type WordCountStats,
} from "@/lib/word-counter";

const STORAGE_KEY = "devtools:word-counter:input";

const WordCounterPage = () => {
  const [input, setInput] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedInput = localStorage.getItem(STORAGE_KEY);
    if (savedInput) {
      setInput(savedInput);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    if (input) {
      localStorage.setItem(STORAGE_KEY, input);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [input, isHydrated]);

  // Calculate stats
  const stats = useMemo<WordCountStats>(() => {
    return getWordCountStats(input);
  }, [input]);

  // Get top words
  const topWords = useMemo(() => {
    return getTopWords(input, 8);
  }, [input]);

  const handleClearInput = useCallback(() => {
    setInput("");
  }, []);

  const handleCopyStats = useCallback(async () => {
    const statsText = `Words: ${stats.words}
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Pages: ${stats.pages}
Reading Time: ${formatTime(stats.readingTimeSeconds)}
Speaking Time: ${formatTime(stats.speakingTimeSeconds)}`;

    try {
      await navigator.clipboard.writeText(statsText);
      toast.success("Stats copied");
    } catch {
      toast.error("Failed to copy");
    }
  }, [stats]);

  const handleLoadExample = useCallback((example: string) => {
    setInput(example);
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">Word Counter</h1>
          <p className="text-muted-foreground text-xs">
            Count words, characters, sentences, and calculate reading time
          </p>
        </div>

        {/* Stats Cards - Primary Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Words"
            value={stats.words.toLocaleString()}
            highlight
          />
          <StatCard
            label="Characters"
            value={stats.characters.toLocaleString()}
            highlight
          />
          <StatCard
            label="Characters (no spaces)"
            value={stats.charactersNoSpaces.toLocaleString()}
          />
          <StatCard label="Pages" value={stats.pages.toLocaleString()} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Sentences"
            value={stats.sentences.toLocaleString()}
          />
          <StatCard
            label="Paragraphs"
            value={stats.paragraphs.toLocaleString()}
          />
          <StatCard
            label="Reading Time"
            value={formatTime(stats.readingTimeSeconds)}
            icon={Time01Icon}
          />
          <StatCard
            label="Speaking Time"
            value={formatTime(stats.speakingTimeSeconds)}
            icon={Time01Icon}
          />
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={TextIcon} size={14} />
                Text Input
              </CardTitle>
              <div className="flex items-center gap-1">
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
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Copy stats"
                        className="cursor-pointer"
                        disabled={!input}
                        onClick={handleCopyStats}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Copy stats</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              aria-label="Text input"
              className="h-[320px] max-h-[500px] min-h-[200px] resize-y !field-sizing-fixed text-sm leading-relaxed"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste your text here..."
              value={input}
            />
          </CardContent>
        </Card>

        {/* Additional Stats */}
        {input.trim() && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Detailed Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                <DetailRow label="Lines" value={stats.lines.toLocaleString()} />
                <DetailRow
                  label="Unique Words"
                  value={stats.uniqueWords.toLocaleString()}
                />
                <DetailRow
                  label="Avg. Word Length"
                  value={stats.avgWordLength.toFixed(1)}
                />
                <DetailRow
                  label="Avg. Sentence Length"
                  value={`${stats.avgSentenceLength.toFixed(1)} words`}
                />
                <DetailRow
                  label="Longest Sentence"
                  value={`${stats.longestSentenceWords} words`}
                />
                <DetailRow
                  label="Shortest Sentence"
                  value={`${stats.shortestSentenceWords} words`}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="shrink-0 lg:sticky lg:top-4 lg:h-fit lg:w-72">
        <div className="flex flex-col gap-4">
          {/* Top Words */}
          {topWords.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Top Words</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-2">
                  {topWords.map(({ word, count }, index) => (
                    <div
                      key={word}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-muted-foreground text-xs">
                          {index + 1}.
                        </span>
                        <span className="text-sm">{word}</span>
                      </div>
                      <span className="font-mono text-muted-foreground text-xs">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                <ExampleButton
                  label="Short paragraph"
                  onClick={() => handleLoadExample(exampleTexts.short)}
                />
                <ExampleButton
                  label="Medium text"
                  onClick={() => handleLoadExample(exampleTexts.medium)}
                />
                <ExampleButton
                  label="Long text"
                  onClick={() => handleLoadExample(exampleTexts.long)}
                />
              </div>

              {/* Info */}
              <div className="mt-6 border-t pt-4">
                <h4 className="mb-2 font-medium text-xs">Reading Speed Info</h4>
                <div className="flex flex-col gap-1.5 text-muted-foreground text-xs">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 text-foreground">📖</span>
                    <span>Reading: ~265 words/min</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 text-foreground">🎤</span>
                    <span>Speaking: ~150 words/min</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 text-foreground">📄</span>
                    <span>Page: ~275 words (double-spaced)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: typeof Time01Icon;
}

const StatCard = ({ label, value, highlight, icon }: StatCardProps) => {
  return (
    <Card
      className={
        highlight
          ? "border-primary/20 bg-primary/5 dark:bg-primary/10"
          : undefined
      }
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            {icon && <HugeiconsIcon icon={icon} size={12} />}
            {label}
          </span>
          <span
            className={`font-mono text-xl ${highlight ? "text-primary" : ""}`}
          >
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Detail Row Component
interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow = ({ label, value }: DetailRowProps) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
};

// Example Button Component
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

export default WordCounterPage;
