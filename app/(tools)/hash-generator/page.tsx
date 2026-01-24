"use client";

import { Copy01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type AllHashesResult,
  generateAllHashes,
  getAlgorithmInfo,
  type HashAlgorithm,
} from "@/lib/hash-generator";
import { getStorageValue, setStorageValue } from "@/lib/utils";

const STORAGE_KEY = "devtools:hash-generator:input";

const ALGORITHMS: HashAlgorithm[] = [
  "MD5",
  "SHA-1",
  "SHA-256",
  "SHA-384",
  "SHA-512",
];

const EXAMPLE_STRINGS = [
  { label: "Hello World", value: "Hello, World!" },
  { label: "Password", value: "password123" },
  { label: "Lorem Ipsum", value: "Lorem ipsum dolor sit amet" },
  { label: "JSON Object", value: '{"name":"John","age":30}' },
  { label: "Empty String", value: "" },
];

const HashGeneratorPage = () => {
  const [input, setInput] = useState(() => getStorageValue(STORAGE_KEY));
  const [hashes, setHashes] = useState<AllHashesResult>({
    md5: "",
    sha1: "",
    sha256: "",
    sha384: "",
    sha512: "",
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    setStorageValue(STORAGE_KEY, input);
  }, [input, isHydrated]);

  const calculateHashes = useCallback(async (text: string) => {
    if (!text) {
      setHashes({
        md5: "",
        sha1: "",
        sha256: "",
        sha384: "",
        sha512: "",
      });
      return;
    }

    setIsCalculating(true);
    try {
      const result = await generateAllHashes(text);
      setHashes(result);
    } catch {
      toast.error("Failed to generate hashes");
    } finally {
      setIsCalculating(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    calculateHashes(input);
  }, [input, isHydrated, calculateHashes]);

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} hash copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleCopyAll = async () => {
    if (!input) return;

    const allHashes = `MD5: ${hashes.md5}
SHA-1: ${hashes.sha1}
SHA-256: ${hashes.sha256}
SHA-384: ${hashes.sha384}
SHA-512: ${hashes.sha512}`;

    try {
      await navigator.clipboard.writeText(allHashes);
      toast.success("All hashes copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleClear = () => {
    setInput("");
    setHashes({
      md5: "",
      sha1: "",
      sha256: "",
      sha384: "",
      sha512: "",
    });
  };

  const handleExampleClick = (value: string) => {
    setInput(value);
  };

  const getHashByAlgorithm = (algorithm: HashAlgorithm): string => {
    const map: Record<HashAlgorithm, string> = {
      MD5: hashes.md5,
      "SHA-1": hashes.sha1,
      "SHA-256": hashes.sha256,
      "SHA-384": hashes.sha384,
      "SHA-512": hashes.sha512,
    };
    return map[algorithm];
  };

  const inputByteSize = useMemo(() => {
    if (!input) return 0;
    return new TextEncoder().encode(input).length;
  }, [input]);

  return (
    <div className="flex max-w-7xl flex-col gap-6 xl:flex-row xl:items-start">
      {/* Main Section */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">Hash Generator</h1>
          <p className="text-muted-foreground text-xs">
            Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Input Text</CardTitle>
              <div className="flex items-center gap-2">
                {input && (
                  <Button
                    aria-label="Clear input"
                    className="cursor-pointer"
                    onClick={handleClear}
                    size="xs"
                    tabIndex={0}
                    variant="ghost"
                  >
                    <HugeiconsIcon
                      data-icon="inline-start"
                      icon={Delete02Icon}
                      size={14}
                    />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              <Textarea
                aria-label="Text to hash"
                className="min-h-[120px] resize-none font-mono text-xs"
                id="hash-input"
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter text to generate hashes..."
                value={input}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {inputByteSize} bytes
                </span>
                <span className="text-right text-[10px] text-muted-foreground">
                  {input.length} characters
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hashes Output Card */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Generated Hashes</CardTitle>
              {input && (
                <Button
                  aria-label="Copy all hashes"
                  className="cursor-pointer"
                  onClick={handleCopyAll}
                  size="xs"
                  tabIndex={0}
                  variant="ghost"
                >
                  <HugeiconsIcon
                    data-icon="inline-start"
                    icon={Copy01Icon}
                    size={14}
                  />
                  Copy All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4">
              {ALGORITHMS.map((algorithm) => {
                const hash = getHashByAlgorithm(algorithm);
                const info = getAlgorithmInfo(algorithm);

                return (
                  <div className="flex flex-col gap-2" key={algorithm}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium text-xs uppercase tracking-wider">
                          {algorithm}
                        </Label>
                        <span className="text-[10px] text-muted-foreground">
                          ({info.bits} bits)
                        </span>
                      </div>
                      <Button
                        aria-label={`Copy ${algorithm} hash`}
                        className="cursor-pointer"
                        disabled={!hash}
                        onClick={() => handleCopy(hash, algorithm)}
                        size="icon-xs"
                        tabIndex={0}
                        variant="ghost"
                      >
                        <HugeiconsIcon icon={Copy01Icon} size={14} />
                      </Button>
                    </div>
                    <div
                      className={`break-all rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs ${
                        isCalculating ? "opacity-50" : ""
                      }`}
                    >
                      {hash || (
                        <span className="text-muted-foreground">
                          Enter text to generate hash
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Algorithm Info Card */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Algorithm Reference</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-3">
              {ALGORITHMS.map((algorithm) => {
                const info = getAlgorithmInfo(algorithm);
                return (
                  <div className="flex flex-col gap-1" key={algorithm}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">{algorithm}</span>
                      <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
                        {info.bits} bits
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {info.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Examples */}
      <div className="w-full shrink-0 xl:sticky xl:top-4 xl:w-64">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Examples</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-4">
            {EXAMPLE_STRINGS.map((example) => (
              <button
                aria-label={`Use example: ${example.label}`}
                className="cursor-pointer rounded-md border bg-muted/30 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                key={example.label}
                onClick={() => handleExampleClick(example.value)}
                tabIndex={0}
                type="button"
              >
                <span className="font-medium">{example.label}</span>
                <span className="mt-1 block truncate text-muted-foreground">
                  {example.value || "(empty)"}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HashGeneratorPage;
