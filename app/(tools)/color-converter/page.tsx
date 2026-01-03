"use client";

import { useState, useCallback, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  parseColor,
  formatRgb,
  formatRgba,
  formatHsl,
  formatHsla,
  formatHsv,
  formatCmyk,
  hslToRgb,
  rgbToHex,
  getContrastRatio,
  getWcagLevel,
  getComplementary,
  getTriadic,
  getAnalogous,
  getSplitComplementary,
  exampleColors,
  type ParsedColor,
  type HSL,
} from "@/lib/color-converter";

type CopiedState = Record<string, boolean>;

const STORAGE_KEY = "devtools:color-converter:input";

const ColorConverterPage = () => {
  const [colorInput, setColorInput] = useState("");
  const [parsed, setParsed] = useState<ParsedColor | null>(null);
  const [copied, setCopied] = useState<CopiedState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setColorInput(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    if (colorInput) {
      localStorage.setItem(STORAGE_KEY, colorInput);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [colorInput, isHydrated]);

  // Parse color when input changes
  useEffect(() => {
    if (colorInput) {
      const result = parseColor(colorInput);
      setParsed(result);
    } else {
      setParsed(null);
    }
  }, [colorInput]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    if (!text) return;

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
    setColorInput("");
    setParsed(null);
  }, []);

  const handleExampleClick = useCallback((value: string) => {
    setColorInput(value);
  }, []);

  const handleColorPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setColorInput(e.target.value);
    },
    []
  );

  const formats = parsed?.isValid ? parsed.formats : null;

  const formatsList = formats
    ? [
        { label: "HEX", value: formats.hex, key: "hex" },
        { label: "HEX8", value: formats.hex8, key: "hex8" },
        { label: "RGB", value: formatRgb(formats.rgb), key: "rgb" },
        { label: "RGBA", value: formatRgba(formats.rgba), key: "rgba" },
        { label: "HSL", value: formatHsl(formats.hsl), key: "hsl" },
        { label: "HSLA", value: formatHsla(formats.hsla), key: "hsla" },
        { label: "HSV", value: formatHsv(formats.hsv), key: "hsv" },
        { label: "CMYK", value: formatCmyk(formats.cmyk), key: "cmyk" },
      ]
    : [];

  // Calculate contrast with white and black
  const contrastWithWhite = formats
    ? getContrastRatio(formats.rgb, { r: 255, g: 255, b: 255 })
    : 0;
  const contrastWithBlack = formats
    ? getContrastRatio(formats.rgb, { r: 0, g: 0, b: 0 })
    : 0;
  const wcagWhite = getWcagLevel(contrastWithWhite);
  const wcagBlack = getWcagLevel(contrastWithBlack);

  // Color harmonies
  const harmonies = formats
    ? {
        complementary: getComplementary(formats.hsl),
        triadic: getTriadic(formats.hsl),
        analogous: getAnalogous(formats.hsl),
        splitComplementary: getSplitComplementary(formats.hsl),
      }
    : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main content */}
      <div className="flex flex-col gap-6 flex-1 max-w-4xl">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium">Color Converter</h1>
          <p className="text-muted-foreground text-xs">
            Convert colors between HEX, RGB, HSL, HSV, and CMYK formats
          </p>
        </div>

        {/* Color Input */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Color Input</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <input
                type="color"
                value={formats?.hex || "#000000"}
                onChange={handleColorPickerChange}
                className="h-9 w-12 cursor-pointer rounded border border-input bg-transparent p-0.5"
                aria-label="Color picker"
              />
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="#ff5500, rgb(255, 85, 0), hsl(20, 100%, 50%)"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  aria-label="Color input"
                  className="pr-8"
                />
                {colorInput && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={handleClearInput}
                    aria-label="Clear input"
                    tabIndex={0}
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </Button>
                )}
              </div>
            </div>

            {parsed && !parsed.isValid && parsed.error && (
              <Badge variant="destructive" className="mt-3">
                {parsed.error}
              </Badge>
            )}

            {parsed?.isValid && formats && (
              <div className="flex items-center gap-3 mt-3">
                <div
                  className="w-10 h-10 rounded border border-border shadow-sm"
                  style={{ backgroundColor: formats.hex }}
                  aria-label={`Color preview: ${formats.hex}`}
                />
                <Badge variant="default">Valid Color</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Color Formats */}
        {parsed?.isValid && formats && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Color Formats</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formatsList.map(({ label, value, key }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-sm"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                        {label}
                      </span>
                      <span
                        className="text-xs truncate font-mono"
                        title={value}
                      >
                        {value}
                      </span>
                    </div>
                    <CopyButton
                      text={value}
                      copied={copied[key]}
                      onCopy={() => handleCopy(value, key)}
                      label={`Copy ${label}`}
                      size="icon-xs"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contrast Checker */}
        {parsed?.isValid && formats && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Contrast Checker (WCAG)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* With White */}
                <div className="flex flex-col gap-2">
                  <div
                    className="p-4 rounded border"
                    style={{ backgroundColor: formats.hex }}
                  >
                    <span className="text-white font-medium text-sm">
                      Text on Color
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">vs White</span>
                    <span className="font-mono">{contrastWithWhite}:1</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <WcagBadge label="AA" passed={wcagWhite.aa} />
                    <WcagBadge label="AA Large" passed={wcagWhite.aaLarge} />
                    <WcagBadge label="AAA" passed={wcagWhite.aaa} />
                    <WcagBadge label="AAA Large" passed={wcagWhite.aaaLarge} />
                  </div>
                </div>

                {/* With Black */}
                <div className="flex flex-col gap-2">
                  <div
                    className="p-4 rounded border"
                    style={{ backgroundColor: formats.hex }}
                  >
                    <span className="text-black font-medium text-sm">
                      Text on Color
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">vs Black</span>
                    <span className="font-mono">{contrastWithBlack}:1</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <WcagBadge label="AA" passed={wcagBlack.aa} />
                    <WcagBadge label="AA Large" passed={wcagBlack.aaLarge} />
                    <WcagBadge label="AAA" passed={wcagBlack.aaa} />
                    <WcagBadge label="AAA Large" passed={wcagBlack.aaaLarge} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Color Harmonies */}
        {parsed?.isValid && formats && harmonies && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Color Harmonies</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <HarmonyPalette
                  name="Complementary"
                  colors={[formats.hsl, harmonies.complementary]}
                  onColorClick={handleExampleClick}
                />
                <HarmonyPalette
                  name="Triadic"
                  colors={[formats.hsl, ...harmonies.triadic]}
                  onColorClick={handleExampleClick}
                />
                <HarmonyPalette
                  name="Analogous"
                  colors={[harmonies.analogous[1], formats.hsl, harmonies.analogous[0]]}
                  onColorClick={handleExampleClick}
                />
                <HarmonyPalette
                  name="Split Complementary"
                  colors={[formats.hsl, ...harmonies.splitComplementary]}
                  onColorClick={handleExampleClick}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar with examples */}
      <div className="lg:w-64 shrink-0 lg:sticky lg:top-4 lg:self-start">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Example Colors</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
              {exampleColors.map((color) => (
                <Tooltip key={color.name}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => handleExampleClick(color.value)}
                        className="w-full aspect-square rounded border border-border cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-1 transition-all"
                        style={{ backgroundColor: color.value }}
                        aria-label={`Use ${color.name} (${color.value})`}
                        tabIndex={0}
                      />
                    }
                  />
                  <TooltipContent>
                    {color.name}
                    <br />
                    <span className="font-mono text-[10px]">{color.value}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

type CopyButtonProps = {
  text: string;
  copied: boolean;
  onCopy: () => void;
  label: string;
  size?: "icon-xs" | "icon-sm" | "icon";
};

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
            variant="ghost"
            size={size}
            onClick={onCopy}
            disabled={!text}
            aria-label={label}
            tabIndex={0}
            className="cursor-pointer"
          />
        }
      >
        <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={14} />
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied!" : label}</TooltipContent>
    </Tooltip>
  );
};

type WcagBadgeProps = {
  label: string;
  passed: boolean;
};

const WcagBadge = ({ label, passed }: WcagBadgeProps) => (
  <Badge variant={passed ? "default" : "secondary"} className="text-[10px]">
    {label}: {passed ? "Pass" : "Fail"}
  </Badge>
);

type HarmonyPaletteProps = {
  name: string;
  colors: HSL[];
  onColorClick: (hex: string) => void;
};

const HarmonyPalette = ({ name, colors, onColorClick }: HarmonyPaletteProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">{name}</span>
      <div className="flex gap-1">
        {colors.map((hsl, index) => {
          const hex = rgbToHex(hslToRgb(hsl));
          return (
            <Tooltip key={index}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => onColorClick(hex)}
                    className="flex-1 h-10 rounded border border-border cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-1 transition-all"
                    style={{ backgroundColor: hex }}
                    aria-label={`Use color ${hex}`}
                    tabIndex={0}
                  />
                }
              />
              <TooltipContent>
                <span className="font-mono text-xs">{hex}</span>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default ColorConverterPage;
