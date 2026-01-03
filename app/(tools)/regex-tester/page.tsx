"use client";

import {
  Copy01Icon,
  Delete02Icon,
  InformationCircleIcon,
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
  EXAMPLE_PATTERNS,
  type ExamplePattern,
  QUICK_REFERENCE,
  REGEX_FLAGS,
  type RegexMatch,
  type RegexResult,
  substituteRegex,
  testRegex,
} from "@/lib/regex-tester";

interface CopiedState {
  [key: string]: boolean;
}

const STORAGE_KEY_PATTERN = "devtools:regex-tester:pattern";
const STORAGE_KEY_TEST = "devtools:regex-tester:test";
const STORAGE_KEY_FLAGS = "devtools:regex-tester:flags";

const RegexTesterPage = () => {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState("g");
  const [replacement, setReplacement] = useState("");
  const [mode, setMode] = useState<"match" | "replace">("match");
  const [copied, setCopied] = useState<CopiedState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPattern = localStorage.getItem(STORAGE_KEY_PATTERN);
    const savedTest = localStorage.getItem(STORAGE_KEY_TEST);
    const savedFlags = localStorage.getItem(STORAGE_KEY_FLAGS);

    if (savedPattern) {
      setPattern(savedPattern);
    }
    if (savedTest) {
      setTestString(savedTest);
    }
    if (savedFlags) {
      setFlags(savedFlags);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when values change (after hydration)
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (pattern) {
      localStorage.setItem(STORAGE_KEY_PATTERN, pattern);
    } else {
      localStorage.removeItem(STORAGE_KEY_PATTERN);
    }
  }, [pattern, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (testString) {
      localStorage.setItem(STORAGE_KEY_TEST, testString);
    } else {
      localStorage.removeItem(STORAGE_KEY_TEST);
    }
  }, [testString, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEY_FLAGS, flags);
  }, [flags, isHydrated]);

  // Compute regex result
  const result: RegexResult = useMemo(() => {
    return testRegex(pattern, testString, flags);
  }, [pattern, testString, flags]);

  // Compute substitution result
  const substitutionResult = useMemo(() => {
    if (mode !== "replace") {
      return null;
    }
    return substituteRegex(pattern, testString, replacement, flags);
  }, [pattern, testString, replacement, flags, mode]);

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

  const handleClearAll = useCallback(() => {
    setPattern("");
    setTestString("");
    setReplacement("");
  }, []);

  const handleToggleFlag = useCallback((flag: string) => {
    setFlags((prev) => {
      if (prev.includes(flag)) {
        return prev.replace(flag, "");
      }
      return prev + flag;
    });
  }, []);

  const handleLoadExample = useCallback((example: ExamplePattern) => {
    setPattern(example.pattern);
    setTestString(example.testString);
    if (example.flags) {
      setFlags(example.flags);
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main Content */}
      <div className="flex min-w-0 max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">Regex Tester</h1>
          <p className="text-muted-foreground text-xs">
            Test, debug, and build regular expressions with real-time matching
          </p>
        </div>

        {/* Pattern Input */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Pattern</CardTitle>
              <div className="flex items-center gap-1">
                {REGEX_FLAGS.map((flag) => (
                  <Tooltip key={flag.key}>
                    <TooltipTrigger
                      render={
                        <Button
                          aria-label={`Toggle ${flag.label} flag`}
                          aria-pressed={flags.includes(flag.key)}
                          className="cursor-pointer"
                          onClick={() => handleToggleFlag(flag.key)}
                          size="icon-xs"
                          tabIndex={0}
                          variant={
                            flags.includes(flag.key) ? "default" : "outline"
                          }
                        />
                      }
                    >
                      {flag.label}
                    </TooltipTrigger>
                    <TooltipContent>{flag.description}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <div className="relative flex-1">
                <Input
                  aria-invalid={!result.isValid}
                  aria-label="Regex pattern"
                  className="font-mono"
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter regex pattern..."
                  value={pattern}
                />
                {pattern && (
                  <Button
                    aria-label="Clear pattern"
                    className="absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer"
                    onClick={() => setPattern("")}
                    size="icon-xs"
                    tabIndex={0}
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </Button>
                )}
              </div>
              <span className="text-muted-foreground">/{flags}</span>
              <CopyButton
                copied={copied.pattern}
                label="Copy pattern"
                onCopy={() => handleCopy(`/${pattern}/${flags}`, "pattern")}
                text={pattern}
              />
            </div>

            {!result.isValid && result.error && (
              <Badge className="mt-3" variant="destructive">
                {result.error}
              </Badge>
            )}

            {result.isValid && pattern && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="default">
                  {result.matchCount} match{result.matchCount !== 1 ? "es" : ""}
                </Badge>
                {result.executionTime > 0 && (
                  <Badge variant="secondary">
                    {result.executionTime.toFixed(2)}ms
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mode Tabs */}
        <Tabs
          onValueChange={(v) => setMode(v as "match" | "replace")}
          value={mode}
        >
          <TabsList>
            <TabsTrigger className="cursor-pointer" tabIndex={0} value="match">
              Match
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer"
              tabIndex={0}
              value="replace"
            >
              Replace
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="match">
            {/* Test String */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Test String</CardTitle>
                  <div className="flex items-center gap-1">
                    <CopyButton
                      copied={copied.test}
                      label="Copy test string"
                      onCopy={() => handleCopy(testString, "test")}
                      text={testString}
                    />
                    <Button
                      aria-label="Clear all"
                      className="cursor-pointer"
                      onClick={handleClearAll}
                      size="icon-xs"
                      tabIndex={0}
                      variant="ghost"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  aria-label="Test string"
                  className="min-h-32 font-mono"
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="Enter text to test against the regex..."
                  value={testString}
                />
              </CardContent>
            </Card>

            {/* Highlighted Matches */}
            {result.isValid && pattern && testString && (
              <Card className="mt-4">
                <CardHeader className="border-b">
                  <CardTitle>Highlighted Matches</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <HighlightedText matches={result.matches} text={testString} />
                </CardContent>
              </Card>
            )}

            {/* Match Details */}
            {result.isValid && result.matches.length > 0 && (
              <Card className="mt-4">
                <CardHeader className="border-b">
                  <CardTitle>Match Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-3">
                    {result.matches.map((match, idx) => (
                      <MatchDetail
                        copied={copied}
                        index={idx}
                        key={`match-${match.index}-${match.endIndex}`}
                        match={match}
                        onCopy={handleCopy}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent className="mt-4" value="replace">
            {/* Test String for Replace */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Test String</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  aria-label="Test string"
                  className="min-h-24 font-mono"
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="Enter text to test against the regex..."
                  value={testString}
                />
              </CardContent>
            </Card>

            {/* Replacement Input */}
            <Card className="mt-4">
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <CardTitle>Replacement</CardTitle>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="cursor-help text-muted-foreground">
                          <HugeiconsIcon
                            icon={InformationCircleIcon}
                            size={14}
                          />
                        </span>
                      }
                    />
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Use $1, $2 for capture groups, $& for full match, $` for
                        text before, $' for text after
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Input
                  aria-label="Replacement string"
                  className="font-mono"
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="Enter replacement string..."
                  value={replacement}
                />
              </CardContent>
            </Card>

            {/* Substitution Result */}
            {substitutionResult && (
              <Card className="mt-4">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Result</CardTitle>
                    <div className="flex items-center gap-2">
                      {substitutionResult.isValid && (
                        <Badge variant="secondary">
                          {substitutionResult.replacementCount} replacement
                          {substitutionResult.replacementCount !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      <CopyButton
                        copied={copied.result}
                        label="Copy result"
                        onCopy={() =>
                          handleCopy(substitutionResult.result, "result")
                        }
                        text={substitutionResult.result}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {substitutionResult.error ? (
                    <Badge variant="destructive">
                      {substitutionResult.error}
                    </Badge>
                  ) : (
                    <pre className="whitespace-pre-wrap break-all rounded-sm bg-muted/50 p-3 font-mono text-xs">
                      {substitutionResult.result || "(empty)"}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-4 lg:h-fit lg:w-72 lg:shrink-0">
        {/* Examples */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Examples</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto pt-3">
            <div className="flex flex-col gap-1">
              {EXAMPLE_PATTERNS.map((example) => (
                <button
                  aria-label={`Load ${example.name} example`}
                  className="group cursor-pointer rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-muted"
                  key={example.name}
                  onClick={() => handleLoadExample(example)}
                  tabIndex={0}
                  type="button"
                >
                  <div className="font-medium text-xs">{example.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {example.description}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Quick Reference</CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto pt-3">
            <div className="flex flex-col gap-3">
              {QUICK_REFERENCE.map((category) => (
                <div key={category.name}>
                  <div className="mb-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                    {category.name}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {category.items.map((item) => (
                      <div
                        className="flex items-center gap-2 text-xs"
                        key={item.token}
                      >
                        <code className="min-w-12 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                          {item.token}
                        </code>
                        <span className="text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};

// Highlighted Text Component
interface HighlightedTextProps {
  text: string;
  matches: RegexMatch[];
}

const HighlightedText = ({ text, matches }: HighlightedTextProps) => {
  if (matches.length === 0) {
    return (
      <pre className="whitespace-pre-wrap break-all font-mono text-muted-foreground text-xs">
        {text || "(no matches)"}
      </pre>
    );
  }

  // Build highlighted segments
  const segments: { text: string; isMatch: boolean; id: string }[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isMatch: false,
        id: `text-${lastIndex}-${match.index}`,
      });
    }
    segments.push({
      text: match.fullMatch,
      isMatch: true,
      id: `match-${match.index}-${match.endIndex}`,
    });
    lastIndex = match.endIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isMatch: false,
      id: `text-${lastIndex}-end`,
    });
  }

  return (
    <pre className="whitespace-pre-wrap break-all font-mono text-xs">
      {segments.map((seg) =>
        seg.isMatch ? (
          <mark
            className="rounded-sm bg-primary/20 px-0.5 text-primary ring-1 ring-primary/30"
            key={seg.id}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={seg.id}>{seg.text}</span>
        )
      )}
    </pre>
  );
};

// Match Detail Component
interface MatchDetailProps {
  match: RegexMatch;
  index: number;
  copied: CopiedState;
  onCopy: (text: string, key: string) => void;
}

const MatchDetail = ({ match, index, copied, onCopy }: MatchDetailProps) => {
  const hasGroups = match.groups.length > 0;
  const hasNamedGroups = Object.keys(match.namedGroups).length > 0;

  return (
    <div className="rounded-sm bg-muted/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="outline">Match {index + 1}</Badge>
            <span className="text-[10px] text-muted-foreground">
              Index: {match.index}–{match.endIndex}
            </span>
          </div>
          <code className="font-mono text-xs">{match.fullMatch}</code>
        </div>
        <CopyButton
          copied={copied[`match-${index}`]}
          label="Copy match"
          onCopy={() => onCopy(match.fullMatch, `match-${index}`)}
          size="icon-xs"
          text={match.fullMatch}
        />
      </div>

      {hasGroups && (
        <div className="mt-2 border-border border-t pt-2">
          <div className="mb-1 text-[10px] text-muted-foreground uppercase tracking-wider">
            Capture Groups
          </div>
          <div className="flex flex-wrap gap-1">
            {match.groups.map((group) => (
              <Badge key={`group-${group.index}`} variant="secondary">
                ${group.index}: {group.value}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {hasNamedGroups && (
        <div className="mt-2 border-border border-t pt-2">
          <div className="mb-1 text-[10px] text-muted-foreground uppercase tracking-wider">
            Named Groups
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(match.namedGroups).map(([name, value]) => (
              <Badge key={name} variant="secondary">
                {name}: {value}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Copy Button Component
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
  size = "icon-sm",
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

export default RegexTesterPage;
