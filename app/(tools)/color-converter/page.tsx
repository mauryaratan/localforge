"use client";

import { Copy01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  exampleColors,
  formatCmyk,
  formatHsl,
  formatHsla,
  formatHsv,
  formatRgb,
  formatRgba,
  getAnalogous,
  getComplementary,
  getContrastRatio,
  getSplitComplementary,
  getTriadic,
  getWcagLevel,
  type HSL,
  hslToRgb,
  type ParsedColor,
  parseColor,
  rgbToHex,
} from "@/lib/color-converter";
import { getStorageValue, setStorageValue } from "@/lib/utils";

const STORAGE_KEY = "devtools:color-converter:input";

const ColorConverterPage = () => {
  // Use lazy state initialization - function runs only once on initial render
  const [colorInput, setColorInput] = useState(() => getStorageValue(STORAGE_KEY));
  const [parsed, setParsed] = useState<ParsedColor | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark as hydrated on mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Save to localStorage when input changes (after hydration)
  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    setStorageValue(STORAGE_KEY, colorInput);
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

  const handleCopy = useCallback(async (text: string, label: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Failed to copy");
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
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">Color Converter</h1>
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
                aria-label="Color picker"
                className="h-9 w-12 cursor-pointer rounded border border-input bg-transparent p-0.5"
                onChange={handleColorPickerChange}
                type="color"
                value={formats?.hex || "#000000"}
              />
              <div className="relative flex-1">
                <Input
                  aria-label="Color input"
                  className="pr-8"
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="#ff5500, rgb(255, 85, 0), hsl(20, 100%, 50%)"
                  type="text"
                  value={colorInput}
                />
                {colorInput && (
                  <Button
                    aria-label="Clear input"
                    className="absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer"
                    onClick={handleClearInput}
                    size="icon-xs"
                    tabIndex={0}
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </Button>
                )}
              </div>
            </div>

            {parsed && !parsed.isValid && parsed.error && (
              <Badge className="mt-3" variant="destructive">
                {parsed.error}
              </Badge>
            )}

            {parsed?.isValid && formats && (
              <div className="mt-3 flex items-center gap-3">
                <div
                  aria-label={`Color preview: ${formats.hex}`}
                  className="h-10 w-10 rounded border border-border shadow-sm"
                  style={{ backgroundColor: formats.hex }}
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
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {formatsList.map(({ label, value, key }) => (
                  <div
                    className="flex items-center justify-between gap-2 rounded-sm bg-muted/50 p-2"
                    key={key}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {label}
                      </span>
                      <span
                        className="truncate font-mono text-xs"
                        title={value}
                      >
                        {value}
                      </span>
                    </div>
                    <Button
                      aria-label={`Copy ${label}`}
                      className="cursor-pointer"
                      disabled={!value}
                      onClick={() => handleCopy(value, label)}
                      size="icon-xs"
                      tabIndex={0}
                      variant="ghost"
                    >
                      <HugeiconsIcon icon={Copy01Icon} size={14} />
                    </Button>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* With White */}
                <div className="flex flex-col gap-2">
                  <div
                    className="rounded border p-4"
                    style={{ backgroundColor: formats.hex }}
                  >
                    <span className="font-medium text-sm text-white">
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
                    className="rounded border p-4"
                    style={{ backgroundColor: formats.hex }}
                  >
                    <span className="font-medium text-black text-sm">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <HarmonyPalette
                  colors={[formats.hsl, harmonies.complementary]}
                  name="Complementary"
                  onColorClick={handleExampleClick}
                />
                <HarmonyPalette
                  colors={[formats.hsl, ...harmonies.triadic]}
                  name="Triadic"
                  onColorClick={handleExampleClick}
                />
                <HarmonyPalette
                  colors={[
                    harmonies.analogous[1],
                    formats.hsl,
                    harmonies.analogous[0],
                  ]}
                  name="Analogous"
                  onColorClick={handleExampleClick}
                />
                <HarmonyPalette
                  colors={[formats.hsl, ...harmonies.splitComplementary]}
                  name="Split Complementary"
                  onColorClick={handleExampleClick}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar with examples */}
      <div className="shrink-0 lg:sticky lg:top-4 lg:w-64 lg:self-start">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Example Colors</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-4 gap-2 lg:grid-cols-3">
              {exampleColors.map((color) => (
                <Tooltip key={color.name}>
                  <TooltipTrigger
                    render={
                      <button
                        aria-label={`Use ${color.name} (${color.value})`}
                        className="aspect-square w-full cursor-pointer rounded border border-border transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1"
                        onClick={() => handleExampleClick(color.value)}
                        style={{ backgroundColor: color.value }}
                        tabIndex={0}
                        type="button"
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

type WcagBadgeProps = {
  label: string;
  passed: boolean;
};

const WcagBadge = ({ label, passed }: WcagBadgeProps) => (
  <Badge className="text-[10px]" variant={passed ? "default" : "secondary"}>
    {label}: {passed ? "Pass" : "Fail"}
  </Badge>
);

type HarmonyPaletteProps = {
  name: string;
  colors: HSL[];
  onColorClick: (hex: string) => void;
};

const HarmonyPalette = ({
  name,
  colors,
  onColorClick,
}: HarmonyPaletteProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-xs">{name}</span>
      <div className="flex gap-1">
        {colors.map((hsl, index) => {
          const hex = rgbToHex(hslToRgb(hsl));
          return (
            <Tooltip key={index}>
              <TooltipTrigger
                render={
                  <button
                    aria-label={`Use color ${hex}`}
                    className="h-10 flex-1 cursor-pointer rounded border border-border transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1"
                    onClick={() => onColorClick(hex)}
                    style={{ backgroundColor: hex }}
                    tabIndex={0}
                    type="button"
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
