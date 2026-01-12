"use client";

import {
  Cancel01Icon,
  Download01Icon,
  GridIcon,
  Image01Icon,
  ImageUploadIcon,
  PaintBoardIcon,
  Settings02Icon,
  TextIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ALL_ICONS,
  type BackgroundConfig,
  COLOR_PRESETS,
  DEFAULT_LOGO_CONFIG,
  downloadPNG,
  downloadSVG,
  EXPORT_SIZES,
  GRADIENT_PRESETS,
  generateLogoSVG,
  ICON_PATHS,
  type IconConfig,
  imageToDataUrl,
  isValidHexColor,
  isValidImageFile,
  type LogoConfig,
  loadConfig,
  saveConfig,
} from "@/lib/logo-maker";

const LogoMakerPage = () => {
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_LOGO_CONFIG);
  const [isHydrated, setIsHydrated] = useState(false);
  const [exportSize, setExportSize] = useState(512);
  const [isExporting, setIsExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved config on mount
  useEffect(() => {
    const saved = loadConfig();
    if (saved) {
      setConfig(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save config when it changes
  useEffect(() => {
    if (!isHydrated) return;
    saveConfig(config);
  }, [config, isHydrated]);

  // Generate SVG preview
  const svgString = useMemo(() => {
    return generateLogoSVG(config);
  }, [config]);

  // Update icon config
  const updateIcon = useCallback(
    <K extends keyof IconConfig>(key: K, value: IconConfig[K]) => {
      setConfig((prev) => ({
        ...prev,
        icon: { ...prev.icon, [key]: value },
      }));
    },
    []
  );

  // Update background config
  const updateBackground = useCallback(
    <K extends keyof BackgroundConfig>(key: K, value: BackgroundConfig[K]) => {
      setConfig((prev) => ({
        ...prev,
        background: { ...prev.background, [key]: value },
      }));
    },
    []
  );

  // Handle icon selection
  const handleSelectIcon = useCallback((iconName: string) => {
    setConfig((prev) => ({
      ...prev,
      icon: { ...prev.icon, type: "icon", value: iconName },
    }));
  }, []);

  // Handle text input
  const handleTextInput = useCallback((text: string) => {
    setConfig((prev) => ({
      ...prev,
      icon: { ...prev.icon, type: "text", value: text.slice(0, 3) },
    }));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!isValidImageFile(file)) {
      toast.error(
        "Please upload a valid image file (PNG, JPG, SVG, GIF, WebP)"
      );
      return;
    }

    try {
      const dataUrl = await imageToDataUrl(file);
      setConfig((prev) => ({
        ...prev,
        icon: { ...prev.icon, type: "image", value: dataUrl },
      }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to load image");
    }
  }, []);

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  // Clear custom image
  const handleClearImage = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      icon: { ...prev.icon, type: "icon", value: "star" },
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Apply color preset
  const handleApplyColorPreset = useCallback(
    (preset: (typeof COLOR_PRESETS)[0]) => {
      setConfig((prev) => ({
        ...prev,
        icon: { ...prev.icon, fillColor: preset.icon },
        background: {
          ...prev.background,
          type: "solid",
          color: preset.background,
        },
      }));
    },
    []
  );

  // Apply gradient preset
  const handleApplyGradientPreset = useCallback(
    (preset: (typeof GRADIENT_PRESETS)[0]) => {
      setConfig((prev) => ({
        ...prev,
        background: {
          ...prev.background,
          type: "gradient",
          color: preset.start,
          gradientEndColor: preset.end,
          gradientAngle: preset.angle,
        },
      }));
    },
    []
  );

  // Export as SVG
  const handleExportSVG = useCallback(() => {
    downloadSVG(svgString, "logo.svg");
    toast.success("SVG downloaded");
  }, [svgString]);

  // Export as PNG
  const handleExportPNG = useCallback(async () => {
    setIsExporting(true);
    try {
      await downloadPNG(
        svgString,
        exportSize,
        `logo-${exportSize}x${exportSize}.png`
      );
      toast.success("PNG downloaded");
    } catch {
      toast.error("Failed to export PNG");
    }
    setIsExporting(false);
  }, [svgString, exportSize]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setConfig(DEFAULT_LOGO_CONFIG);
    toast.success("Reset to defaults");
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-medium text-lg">Logo Maker</h1>
        <p className="text-muted-foreground text-xs">
          Create customizable logos with icons, text, or images. Export as SVG
          or PNG.
        </p>
      </div>

      {/* Main Content - 3 columns */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        {/* Controls */}
        <div className="min-w-0 flex-1">
          <Tabs defaultValue="icon">
            <TabsList variant="line">
              <TabsTrigger className="cursor-pointer gap-1.5" value="icon">
                <HugeiconsIcon icon={GridIcon} size={14} />
                Icon
              </TabsTrigger>
              <TabsTrigger
                className="cursor-pointer gap-1.5"
                value="background"
              >
                <HugeiconsIcon icon={PaintBoardIcon} size={14} />
                Background
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer gap-1.5" value="style">
                <HugeiconsIcon icon={Settings02Icon} size={14} />
                Style
              </TabsTrigger>
            </TabsList>

            {/* Icon Tab */}
            <TabsContent className="mt-4" value="icon">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Icon Source</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4">
                  {/* Icon Type Selection */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                      Type
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        aria-pressed={config.icon.type === "icon"}
                        className="flex-1 cursor-pointer gap-1.5"
                        onClick={() => updateIcon("type", "icon")}
                        size="sm"
                        variant={
                          config.icon.type === "icon" ? "default" : "outline"
                        }
                      >
                        <HugeiconsIcon icon={GridIcon} size={14} />
                        Icon
                      </Button>
                      <Button
                        aria-pressed={config.icon.type === "text"}
                        className="flex-1 cursor-pointer gap-1.5"
                        onClick={() => updateIcon("type", "text")}
                        size="sm"
                        variant={
                          config.icon.type === "text" ? "default" : "outline"
                        }
                      >
                        <HugeiconsIcon icon={TextIcon} size={14} />
                        Text
                      </Button>
                      <Button
                        aria-label="Upload custom image"
                        className="flex-1 cursor-pointer gap-1.5"
                        onClick={() => fileInputRef.current?.click()}
                        size="sm"
                        variant={
                          config.icon.type === "image" ? "default" : "outline"
                        }
                      >
                        <HugeiconsIcon icon={ImageUploadIcon} size={14} />
                        Image
                      </Button>
                    </div>
                    <input
                      accept="image/*"
                      aria-label="Upload image file"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      type="file"
                    />
                  </div>

                  {/* Icon Selection */}
                  {config.icon.type === "icon" && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Select Icon
                      </Label>
                      <ScrollArea className="h-48 rounded border">
                        <div className="grid grid-cols-8 gap-1 p-2">
                          {ALL_ICONS.map((iconName) => (
                            <Tooltip key={iconName}>
                              <TooltipTrigger
                                render={
                                  <button
                                    aria-label={`Select ${iconName} icon`}
                                    aria-pressed={
                                      config.icon.value === iconName
                                    }
                                    className={`flex aspect-square cursor-pointer items-center justify-center rounded border transition-colors hover:bg-muted ${
                                      config.icon.value === iconName
                                        ? "border-primary bg-primary/10"
                                        : "border-transparent"
                                    }`}
                                    onClick={() => handleSelectIcon(iconName)}
                                    type="button"
                                  />
                                }
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  viewBox="0 0 24 24"
                                >
                                  <path d={ICON_PATHS[iconName]} />
                                </svg>
                              </TooltipTrigger>
                              <TooltipContent>{iconName}</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Text Input */}
                  {config.icon.type === "text" && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Text (max 3 chars)
                      </Label>
                      <Input
                        aria-label="Logo text"
                        className="font-mono text-lg uppercase"
                        maxLength={3}
                        onChange={(e) => handleTextInput(e.target.value)}
                        placeholder="ABC"
                        value={config.icon.value}
                      />
                    </div>
                  )}

                  {/* Image Preview */}
                  {config.icon.type === "image" && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Custom Image
                      </Label>
                      {config.icon.value.startsWith("data:") ? (
                        <div className="flex items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded border bg-muted">
                            <img
                              alt="Uploaded icon"
                              className="h-full w-full object-contain"
                              src={config.icon.value}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              className="cursor-pointer"
                              onClick={() => fileInputRef.current?.click()}
                              size="sm"
                              variant="outline"
                            >
                              Replace
                            </Button>
                            <Button
                              className="cursor-pointer"
                              onClick={handleClearImage}
                              size="sm"
                              variant="ghost"
                            >
                              <HugeiconsIcon
                                data-icon="inline-start"
                                icon={Cancel01Icon}
                                size={14}
                              />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          className="cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                          size="sm"
                          variant="outline"
                        >
                          <HugeiconsIcon
                            data-icon="inline-start"
                            icon={ImageUploadIcon}
                            size={14}
                          />
                          Upload Image
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Icon Color */}
                  <div className="flex flex-col gap-2 border-t pt-4">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                      Icon Color
                    </Label>
                    <div className="flex gap-2">
                      <input
                        aria-label="Icon fill color"
                        className="h-8 w-10 cursor-pointer rounded border"
                        onChange={(e) =>
                          updateIcon("fillColor", e.target.value)
                        }
                        type="color"
                        value={config.icon.fillColor}
                      />
                      <Input
                        className="flex-1 font-mono text-xs uppercase"
                        maxLength={7}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isValidHexColor(val) || val.length < 7) {
                            updateIcon("fillColor", val);
                          }
                        }}
                        placeholder="#ffffff"
                        value={config.icon.fillColor}
                      />
                    </div>
                  </div>

                  {/* Icon Opacity */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Opacity
                      </Label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {config.icon.fillOpacity}%
                      </span>
                    </div>
                    <Slider
                      aria-label="Icon opacity"
                      className="cursor-pointer"
                      max={100}
                      min={0}
                      onValueChange={(values) => {
                        const val = Array.isArray(values) ? values[0] : values;
                        updateIcon("fillOpacity", val);
                      }}
                      step={5}
                      value={[config.icon.fillOpacity]}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Background Tab */}
            <TabsContent className="mt-4" value="background">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Background</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4">
                  {/* Background Type */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                      Type
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        aria-pressed={config.background.type === "solid"}
                        className="flex-1 cursor-pointer"
                        onClick={() => updateBackground("type", "solid")}
                        size="sm"
                        variant={
                          config.background.type === "solid"
                            ? "default"
                            : "outline"
                        }
                      >
                        Solid
                      </Button>
                      <Button
                        aria-pressed={config.background.type === "gradient"}
                        className="flex-1 cursor-pointer"
                        onClick={() => updateBackground("type", "gradient")}
                        size="sm"
                        variant={
                          config.background.type === "gradient"
                            ? "default"
                            : "outline"
                        }
                      >
                        Gradient
                      </Button>
                    </div>
                  </div>

                  {/* Color Presets */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                      {config.background.type === "solid"
                        ? "Color Presets"
                        : "Gradient Presets"}
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {config.background.type === "solid"
                        ? COLOR_PRESETS.map((preset) => (
                            <Tooltip key={preset.name}>
                              <TooltipTrigger
                                render={
                                  <button
                                    aria-label={`Apply ${preset.name} preset`}
                                    className="h-7 w-7 cursor-pointer rounded border transition-transform hover:scale-110"
                                    onClick={() =>
                                      handleApplyColorPreset(preset)
                                    }
                                    style={{
                                      backgroundColor: preset.background,
                                    }}
                                    type="button"
                                  />
                                }
                              />
                              <TooltipContent>{preset.name}</TooltipContent>
                            </Tooltip>
                          ))
                        : GRADIENT_PRESETS.map((preset) => (
                            <Tooltip key={preset.name}>
                              <TooltipTrigger
                                render={
                                  <button
                                    aria-label={`Apply ${preset.name} gradient`}
                                    className="h-7 w-7 cursor-pointer rounded border transition-transform hover:scale-110"
                                    onClick={() =>
                                      handleApplyGradientPreset(preset)
                                    }
                                    style={{
                                      background: `linear-gradient(${preset.angle}deg, ${preset.start}, ${preset.end})`,
                                    }}
                                    type="button"
                                  />
                                }
                              />
                              <TooltipContent>{preset.name}</TooltipContent>
                            </Tooltip>
                          ))}
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                      {config.background.type === "gradient"
                        ? "Start Color"
                        : "Background Color"}
                    </Label>
                    <div className="flex gap-2">
                      <input
                        aria-label="Background color"
                        className="h-8 w-10 cursor-pointer rounded border"
                        onChange={(e) =>
                          updateBackground("color", e.target.value)
                        }
                        type="color"
                        value={config.background.color}
                      />
                      <Input
                        className="flex-1 font-mono text-xs uppercase"
                        maxLength={7}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isValidHexColor(val) || val.length < 7) {
                            updateBackground("color", val);
                          }
                        }}
                        value={config.background.color}
                      />
                    </div>
                  </div>

                  {/* Gradient End Color */}
                  {config.background.type === "gradient" && (
                    <>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                          End Color
                        </Label>
                        <div className="flex gap-2">
                          <input
                            aria-label="Gradient end color"
                            className="h-8 w-10 cursor-pointer rounded border"
                            onChange={(e) =>
                              updateBackground(
                                "gradientEndColor",
                                e.target.value
                              )
                            }
                            type="color"
                            value={
                              config.background.gradientEndColor || "#8b5cf6"
                            }
                          />
                          <Input
                            className="flex-1 font-mono text-xs uppercase"
                            maxLength={7}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (isValidHexColor(val) || val.length < 7) {
                                updateBackground("gradientEndColor", val);
                              }
                            }}
                            value={config.background.gradientEndColor || ""}
                          />
                        </div>
                      </div>

                      {/* Gradient Angle */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                            Angle
                          </Label>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {config.background.gradientAngle || 135}°
                          </span>
                        </div>
                        <Slider
                          aria-label="Gradient angle"
                          className="cursor-pointer"
                          max={360}
                          min={0}
                          onValueChange={(values) => {
                            const val = Array.isArray(values)
                              ? values[0]
                              : values;
                            updateBackground("gradientAngle", val);
                          }}
                          step={15}
                          value={[config.background.gradientAngle || 135]}
                        />
                      </div>
                    </>
                  )}

                  {/* Corner Radius */}
                  <div className="flex flex-col gap-2 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Corner Radius
                      </Label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {config.background.radius}%
                      </span>
                    </div>
                    <Slider
                      aria-label="Corner radius"
                      className="cursor-pointer"
                      max={50}
                      min={0}
                      onValueChange={(values) => {
                        const val = Array.isArray(values) ? values[0] : values;
                        updateBackground("radius", val);
                      }}
                      step={1}
                      value={[config.background.radius]}
                    />
                  </div>

                  {/* Padding */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Padding
                      </Label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {config.background.padding}%
                      </span>
                    </div>
                    <Slider
                      aria-label="Background padding"
                      className="cursor-pointer"
                      max={40}
                      min={0}
                      onValueChange={(values) => {
                        const val = Array.isArray(values) ? values[0] : values;
                        updateBackground("padding", val);
                      }}
                      step={1}
                      value={[config.background.padding]}
                    />
                  </div>

                  {/* Inner Shadow */}
                  <div className="flex flex-col gap-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Inner Shadow
                      </Label>
                      <Switch
                        aria-label="Toggle inner shadow"
                        checked={config.background.innerShadow}
                        className="cursor-pointer"
                        onCheckedChange={(checked) =>
                          updateBackground("innerShadow", checked)
                        }
                      />
                    </div>

                    {config.background.innerShadow && (
                      <>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-muted-foreground text-xs">
                              Intensity
                            </Label>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {config.background.innerShadowIntensity}%
                            </span>
                          </div>
                          <Slider
                            aria-label="Shadow intensity"
                            className="cursor-pointer"
                            max={100}
                            min={0}
                            onValueChange={(values) => {
                              const val = Array.isArray(values)
                                ? values[0]
                                : values;
                              updateBackground("innerShadowIntensity", val);
                            }}
                            step={5}
                            value={[config.background.innerShadowIntensity]}
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <Label className="text-muted-foreground text-xs">
                            Shadow Color
                          </Label>
                          <div className="flex gap-2">
                            <input
                              aria-label="Inner shadow color"
                              className="h-8 w-10 cursor-pointer rounded border"
                              onChange={(e) =>
                                updateBackground(
                                  "innerShadowColor",
                                  e.target.value
                                )
                              }
                              type="color"
                              value={config.background.innerShadowColor}
                            />
                            <Input
                              className="flex-1 font-mono text-xs uppercase"
                              maxLength={7}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (isValidHexColor(val) || val.length < 7) {
                                  updateBackground("innerShadowColor", val);
                                }
                              }}
                              value={config.background.innerShadowColor}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Style Tab */}
            <TabsContent className="mt-4" value="style">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Icon Style</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4">
                  {/* Icon Size */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Size
                      </Label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {config.icon.size}%
                      </span>
                    </div>
                    <Slider
                      aria-label="Icon size"
                      className="cursor-pointer"
                      max={100}
                      min={20}
                      onValueChange={(values) => {
                        const val = Array.isArray(values) ? values[0] : values;
                        updateIcon("size", val);
                      }}
                      step={5}
                      value={[config.icon.size]}
                    />
                  </div>

                  {/* Icon Rotation */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Rotation
                      </Label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {config.icon.rotation}°
                      </span>
                    </div>
                    <Slider
                      aria-label="Icon rotation"
                      className="cursor-pointer"
                      max={360}
                      min={0}
                      onValueChange={(values) => {
                        const val = Array.isArray(values) ? values[0] : values;
                        updateIcon("rotation", val);
                      }}
                      step={15}
                      value={[config.icon.rotation]}
                    />
                  </div>

                  {/* Border Width */}
                  <div className="flex flex-col gap-2 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Border Width
                      </Label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {config.icon.borderWidth}px
                      </span>
                    </div>
                    <Slider
                      aria-label="Border width"
                      className="cursor-pointer"
                      max={10}
                      min={0}
                      onValueChange={(values) => {
                        const val = Array.isArray(values) ? values[0] : values;
                        updateIcon("borderWidth", val);
                      }}
                      step={0.5}
                      value={[config.icon.borderWidth]}
                    />
                  </div>

                  {/* Border Color */}
                  {config.icon.borderWidth > 0 && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Border Color
                      </Label>
                      <div className="flex gap-2">
                        <input
                          aria-label="Border color"
                          className="h-8 w-10 cursor-pointer rounded border"
                          onChange={(e) =>
                            updateIcon("borderColor", e.target.value)
                          }
                          type="color"
                          value={config.icon.borderColor}
                        />
                        <Input
                          className="flex-1 font-mono text-xs uppercase"
                          maxLength={7}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (isValidHexColor(val) || val.length < 7) {
                              updateIcon("borderColor", val);
                            }
                          }}
                          value={config.icon.borderColor}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Section */}
        <Card className="relative w-full shrink-0 lg:top-14 lg:w-72">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Preview</CardTitle>
              <Button
                aria-label="Reset to defaults"
                className="cursor-pointer"
                onClick={handleReset}
                size="xs"
                variant="ghost"
              >
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-3">
            {/* Logo Preview */}
            <div
              className="mx-auto flex aspect-square w-full max-w-48 items-center justify-center overflow-hidden rounded-lg border p-1.5"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
                backgroundSize: "12px 12px",
                backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
              }}
            >
              <div
                className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG preview
                dangerouslySetInnerHTML={{ __html: svgString }}
              />
            </div>

            {/* Size Preview */}
            <div className="flex items-end justify-center gap-3 border-t pt-3">
              {[16, 32, 48, 64].map((size) => (
                <div className="flex flex-col items-center gap-0.5" key={size}>
                  <div
                    className="overflow-hidden rounded [&>svg]:h-full [&>svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: svgString }}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG preview
                    style={{ width: size, height: size }}
                  />
                  <span className="font-mono text-[8px] text-muted-foreground">
                    {size}
                  </span>
                </div>
              ))}
            </div>

            {/* Export Options */}
            <div className="flex flex-col gap-2 border-t pt-3">
              <div className="flex items-center gap-2">
                <Label className="shrink-0 text-[10px] text-muted-foreground uppercase tracking-wider">
                  PNG
                </Label>
                <Select
                  onValueChange={(v) => v && setExportSize(Number(v))}
                  value={String(exportSize)}
                >
                  <SelectTrigger className="h-8 cursor-pointer text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPORT_SIZES.map((size) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={size.value}
                        value={String(size.value)}
                      >
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  aria-label="Download SVG"
                  className="flex-1 cursor-pointer gap-1.5"
                  onClick={handleExportSVG}
                  size="sm"
                  variant="outline"
                >
                  <HugeiconsIcon icon={Download01Icon} size={14} />
                  SVG
                </Button>
                <Button
                  aria-label="Download PNG"
                  className="flex-1 cursor-pointer gap-1.5"
                  disabled={isExporting}
                  onClick={handleExportPNG}
                  size="sm"
                >
                  <HugeiconsIcon
                    icon={isExporting ? Image01Icon : Download01Icon}
                    size={14}
                  />
                  PNG
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Presets - Bottom */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-muted-foreground text-xs">Presets:</span>
        {[
          {
            icon: "star",
            bg: "#6366f1",
            iconColor: "#ffffff",
            radius: 20,
            name: "Modern",
          },
          {
            icon: "heart",
            bg: "#f43f5e",
            iconColor: "#ffffff",
            radius: 50,
            name: "Circle",
          },
          {
            icon: "code",
            bg: "#000000",
            iconColor: "#22c55e",
            radius: 10,
            name: "Terminal",
          },
          {
            icon: "sun",
            bg: "#fbbf24",
            iconColor: "#000000",
            radius: 0,
            name: "Square",
          },
          {
            icon: "cloud",
            bg: "#0ea5e9",
            iconColor: "#ffffff",
            radius: 30,
            name: "Soft",
          },
          {
            icon: "moon",
            bg: "#1e293b",
            iconColor: "#f8fafc",
            radius: 15,
            name: "Dark",
          },
          {
            icon: "leaf",
            bg: "#22c55e",
            iconColor: "#ffffff",
            radius: 25,
            name: "Nature",
          },
        ].map((preset) => (
          <button
            aria-label={`Apply ${preset.name} preset`}
            className="flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/30 px-2 py-1.5 text-left transition-colors hover:bg-muted/50"
            key={preset.name}
            onClick={() => {
              setConfig((prev) => ({
                ...prev,
                icon: {
                  ...prev.icon,
                  type: "icon",
                  value: preset.icon,
                  fillColor: preset.iconColor,
                },
                background: {
                  ...prev.background,
                  type: "solid",
                  color: preset.bg,
                  radius: preset.radius,
                },
              }));
            }}
            type="button"
          >
            <div
              className="flex h-6 w-6 items-center justify-center overflow-hidden"
              style={{
                borderRadius: `${(preset.radius / 50) * 50}%`,
                backgroundColor: preset.bg,
              }}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke={preset.iconColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path d={ICON_PATHS[preset.icon]} />
              </svg>
            </div>
            <span className="text-xs">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LogoMakerPage;
