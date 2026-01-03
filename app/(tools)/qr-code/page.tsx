"use client";

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  Image01Icon,
  ImageUploadIcon,
  QrCodeIcon,
  ScanIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  COLOR_PRESETS,
  CONTENT_TYPE_LABELS,
  DEFAULT_OPTIONS,
  DOT_SCALE_OPTIONS,
  downloadQRCodeFromElement,
  ERROR_CORRECTION_LABELS,
  fileToDataUrl,
  formatQRContent,
  generateQRCodeToElement,
  isValidHexColor,
  parseWiFiData,
  readQRCodeFromFile,
  type DotScale,
  type ErrorCorrectionLevel,
  type QRContentType,
  type QRGenerateOptions,
} from "@/lib/qr-code";

const STORAGE_KEY = "devtools:qr-code:input";

const EXAMPLE_CONTENT = [
  { label: "Website URL", value: "https://example.com", type: "url" as const },
  { label: "Email", value: "hello@example.com", type: "email" as const },
  { label: "Phone", value: "+1-555-123-4567", type: "phone" as const },
  { label: "WiFi Network", value: "MyNetwork", type: "wifi" as const },
  { label: "Plain Text", value: "Hello, World!", type: "text" as const },
];

const QRCodePage = () => {
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<QRContentType>("text");
  const [options, setOptions] = useState<QRGenerateOptions>(DEFAULT_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // WiFi-specific fields
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<
    "WPA" | "WEP" | "nopass"
  >("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // Logo state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // QR code container ref
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // Reader state
  const [decodedContent, setDecodedContent] = useState<string | null>(null);
  const [decodedType, setDecodedType] = useState<QRContentType | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContent(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when content changes
  useEffect(() => {
    if (!isHydrated) return;

    if (content) {
      localStorage.setItem(STORAGE_KEY, content);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [content, isHydrated]);

  // Generate QR code when inputs change
  useEffect(() => {
    if (!isHydrated || !content.trim() || !qrContainerRef.current) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = "";
      }
      setError(null);
      return;
    }

    const generateQR = async () => {
      if (!qrContainerRef.current) return;

      setIsGenerating(true);
      setError(null);

      const formattedContent = formatQRContent(content, contentType, {
        ssid: content,
        password: wifiPassword,
        encryption: wifiEncryption,
        hidden: wifiHidden,
      });

      const result = await generateQRCodeToElement(
        qrContainerRef.current,
        formattedContent,
        options
      );

      if (!result.success) {
        setError(result.error || "Failed to generate QR code");
      }

      setIsGenerating(false);
    };

    const debounce = setTimeout(generateQR, 250);
    return () => clearTimeout(debounce);
  }, [
    content,
    contentType,
    options,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    isHydrated,
  ]);

  const handleDownload = useCallback(async () => {
    if (!qrContainerRef.current) return;

    const success = await downloadQRCodeFromElement(
      qrContainerRef.current,
      "qrcode"
    );
    if (success) {
      toast.success("QR code downloaded");
    } else {
      toast.error("Failed to download QR code");
    }
  }, []);

  const handleClear = useCallback(() => {
    setContent("");
    setError(null);
    setWifiPassword("");
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = "";
    }
  }, []);

  const handleCopyContent = useCallback(async () => {
    if (!decodedContent) return;

    try {
      await navigator.clipboard.writeText(decodedContent);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  }, [decodedContent]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setReadError("Please select an image file");
      return;
    }

    setIsReading(true);
    setReadError(null);
    setDecodedContent(null);
    setDecodedType(null);

    const result = await readQRCodeFromFile(file);

    if (result.success && result.data) {
      setDecodedContent(result.data);
      setDecodedType(result.contentType || "text");
    } else {
      setReadError(result.error || "Failed to read QR code");
    }

    setIsReading(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      try {
        const dataUrl = await fileToDataUrl(file);
        setLogoPreview(dataUrl);
        setOptions((prev) => ({
          ...prev,
          logoUrl: dataUrl,
          // Auto-switch to high error correction when adding logo
          errorCorrectionLevel:
            prev.errorCorrectionLevel === "L" ? "H" : prev.errorCorrectionLevel,
        }));
        toast.success("Logo added");
      } catch {
        toast.error("Failed to load logo");
      }
    },
    []
  );

  const handleRemoveLogo = useCallback(() => {
    setLogoPreview(null);
    setOptions((prev) => ({ ...prev, logoUrl: null }));
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }, []);

  const handleExampleClick = useCallback(
    (value: string, type: QRContentType) => {
      setContent(value);
      setContentType(type);
    },
    []
  );

  const updateOption = useCallback(
    <K extends keyof QRGenerateOptions>(
      key: K,
      value: QRGenerateOptions[K]
    ) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const applyColorPreset = useCallback((preset: (typeof COLOR_PRESETS)[0]) => {
    setOptions((prev) => ({
      ...prev,
      foreground: preset.foreground,
      background: preset.background,
      positionOuterColor: preset.positionOuterColor,
      positionInnerColor: preset.positionInnerColor,
    }));
  }, []);

  const wifiData =
    decodedType === "wifi" && decodedContent
      ? parseWiFiData(decodedContent)
      : null;

  return (
    <div className="flex max-w-7xl flex-col gap-6 xl:flex-row xl:items-start">
      {/* Main Section */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">QR Code Generator & Reader</h1>
          <p className="text-muted-foreground text-xs">
            Generate customizable QR codes with logos and styles, or decode
            existing QR codes.
          </p>
        </div>

        <Tabs defaultValue="generate">
          <TabsList variant="line">
            <TabsTrigger
              value="generate"
              className="cursor-pointer gap-1.5"
              aria-label="Generate QR Code tab"
            >
              <HugeiconsIcon icon={QrCodeIcon} size={14} />
              Generate
            </TabsTrigger>
            <TabsTrigger
              value="read"
              className="cursor-pointer gap-1.5"
              aria-label="Read QR Code tab"
            >
              <HugeiconsIcon icon={ScanIcon} size={14} />
              Read
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="mt-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              {/* Input & Options Section */}
              <div className="flex flex-1 flex-col gap-4">
                {/* Content Card */}
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle>Content</CardTitle>
                      {content && (
                        <Button
                          aria-label="Clear content"
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
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 pt-4">
                    {/* Content Type */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                        Type
                      </Label>
                      <Select
                        value={contentType}
                        onValueChange={(v) =>
                          setContentType(v as QRContentType)
                        }
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CONTENT_TYPE_LABELS).map(
                            ([key, label]) => (
                              <SelectItem
                                key={key}
                                value={key}
                                className="cursor-pointer"
                              >
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Content Input */}
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="content-input"
                        className="text-muted-foreground text-xs uppercase tracking-wider"
                      >
                        {contentType === "wifi"
                          ? "Network Name (SSID)"
                          : "Content"}
                      </Label>
                      {contentType === "text" ? (
                        <Textarea
                          id="content-input"
                          aria-label="QR code content"
                          className="min-h-[80px] resize-none font-mono text-xs"
                          placeholder="Enter text to encode..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                      ) : (
                        <Input
                          id="content-input"
                          aria-label="QR code content"
                          placeholder={
                            contentType === "url"
                              ? "https://example.com"
                              : contentType === "email"
                                ? "email@example.com"
                                : contentType === "phone"
                                  ? "+1-555-123-4567"
                                  : contentType === "sms"
                                    ? "+1-555-123-4567"
                                    : contentType === "wifi"
                                      ? "MyWiFiNetwork"
                                      : "Enter content..."
                          }
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                      )}
                    </div>

                    {/* WiFi-specific fields */}
                    {contentType === "wifi" && (
                      <>
                        <div className="flex flex-col gap-2">
                          <Label
                            htmlFor="wifi-password"
                            className="text-muted-foreground text-xs uppercase tracking-wider"
                          >
                            Password
                          </Label>
                          <Input
                            id="wifi-password"
                            type="password"
                            aria-label="WiFi password"
                            placeholder="Enter password (leave empty for open network)"
                            value={wifiPassword}
                            onChange={(e) => setWifiPassword(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-1 flex-col gap-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                              Encryption
                            </Label>
                            <Select
                              value={wifiEncryption}
                              onValueChange={(v) =>
                                setWifiEncryption(v as typeof wifiEncryption)
                              }
                            >
                              <SelectTrigger className="cursor-pointer">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="WPA"
                                  className="cursor-pointer"
                                >
                                  WPA/WPA2
                                </SelectItem>
                                <SelectItem
                                  value="WEP"
                                  className="cursor-pointer"
                                >
                                  WEP
                                </SelectItem>
                                <SelectItem
                                  value="nopass"
                                  className="cursor-pointer"
                                >
                                  None (Open)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                              Hidden
                            </Label>
                            <Button
                              variant={wifiHidden ? "default" : "outline"}
                              size="sm"
                              className="cursor-pointer"
                              onClick={() => setWifiHidden(!wifiHidden)}
                              aria-pressed={wifiHidden}
                            >
                              {wifiHidden ? "Yes" : "No"}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Style Card */}
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Style</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 pt-4">
                    {/* Color Presets */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-[10px] text-muted-foreground">
                        Color Presets
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => applyColorPreset(preset)}
                            className="group relative flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded border transition-transform hover:scale-110"
                            style={{ backgroundColor: preset.background }}
                            aria-label={`Apply ${preset.name} color preset`}
                            title={preset.name}
                          >
                            <div
                              className="h-3 w-3 rounded-sm"
                              style={{ backgroundColor: preset.foreground }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Basic Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label
                          htmlFor="fg-color"
                          className="text-[10px] text-muted-foreground"
                        >
                          Foreground
                        </Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            id="fg-color"
                            value={options.foreground}
                            onChange={(e) =>
                              updateOption("foreground", e.target.value)
                            }
                            className="h-8 w-8 cursor-pointer rounded border"
                            aria-label="Foreground color"
                          />
                          <Input
                            value={options.foreground}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (isValidHexColor(val) || val.length < 7) {
                                updateOption("foreground", val);
                              }
                            }}
                            className="flex-1 font-mono text-xs uppercase"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label
                          htmlFor="bg-color"
                          className="text-[10px] text-muted-foreground"
                        >
                          Background
                        </Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            id="bg-color"
                            value={options.background}
                            onChange={(e) =>
                              updateOption("background", e.target.value)
                            }
                            className="h-8 w-8 cursor-pointer rounded border"
                            aria-label="Background color"
                          />
                          <Input
                            value={options.background}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (isValidHexColor(val) || val.length < 7) {
                                updateOption("background", val);
                              }
                            }}
                            className="flex-1 font-mono text-xs uppercase"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dot Style */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-[10px] text-muted-foreground">
                        Dot Style
                      </Label>
                      <Select
                        value={String(options.dotScale)}
                        onValueChange={(v) => {
                          if (v)
                            updateOption(
                              "dotScale",
                              Number.parseFloat(v) as DotScale
                            );
                        }}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOT_SCALE_OPTIONS.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={String(opt.value)}
                              className="cursor-pointer"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Size & Error Correction */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] text-muted-foreground">
                            Size
                          </Label>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {options.width}px
                          </span>
                        </div>
                        <Slider
                          value={[options.width]}
                          onValueChange={(values) => {
                            const newValue = Array.isArray(values)
                              ? values[0]
                              : values;
                            updateOption("width", newValue);
                          }}
                          min={128}
                          max={512}
                          step={32}
                          className="cursor-pointer"
                          aria-label="QR code size"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-[10px] text-muted-foreground">
                          Error Correction
                        </Label>
                        <Select
                          value={options.errorCorrectionLevel}
                          onValueChange={(v) =>
                            updateOption(
                              "errorCorrectionLevel",
                              v as ErrorCorrectionLevel
                            )
                          }
                        >
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ERROR_CORRECTION_LABELS).map(
                              ([key, label]) => (
                                <SelectItem
                                  key={key}
                                  value={key}
                                  className="cursor-pointer"
                                >
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="flex flex-col gap-2 border-t pt-4">
                      <Label className="text-[10px] text-muted-foreground">
                        Logo / Icon
                      </Label>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        aria-label="Upload logo"
                      />
                      {logoPreview ? (
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded border bg-muted">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] text-muted-foreground">
                                Logo Size: {options.logoWidth}px
                              </Label>
                            </div>
                            <Slider
                              value={[options.logoWidth]}
                              onValueChange={(values) => {
                                const newValue = Array.isArray(values)
                                  ? values[0]
                                  : values;
                                updateOption("logoWidth", newValue);
                                updateOption("logoHeight", newValue);
                              }}
                              min={30}
                              max={100}
                              step={5}
                              className="cursor-pointer"
                              aria-label="Logo size"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={handleRemoveLogo}
                            className="cursor-pointer"
                            aria-label="Remove logo"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={14} />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => logoInputRef.current?.click()}
                          className="cursor-pointer"
                        >
                          <HugeiconsIcon
                            data-icon="inline-start"
                            icon={Image01Icon}
                            size={14}
                          />
                          Add Logo
                        </Button>
                      )}
                      {logoPreview && (
                        <p className="text-[10px] text-muted-foreground">
                          Tip: Use High error correction (H) for best results
                          with logos
                        </p>
                      )}
                    </div>

                    {/* Advanced Options Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex cursor-pointer items-center gap-2 border-t pt-4 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
                      aria-expanded={showAdvanced}
                    >
                      <HugeiconsIcon
                        icon={showAdvanced ? ArrowUp01Icon : ArrowDown01Icon}
                        size={14}
                      />
                      Advanced Options
                    </button>

                    {/* Advanced Options */}
                    {showAdvanced && (
                      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Corner Colors */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <Label className="text-[10px] text-muted-foreground">
                              Corner Outer Color
                            </Label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={
                                  options.positionOuterColor ||
                                  options.foreground
                                }
                                onChange={(e) =>
                                  updateOption(
                                    "positionOuterColor",
                                    e.target.value
                                  )
                                }
                                className="h-8 w-8 cursor-pointer rounded border"
                                aria-label="Corner outer color"
                              />
                              <Input
                                value={options.positionOuterColor || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (
                                    isValidHexColor(val) ||
                                    val.length < 7 ||
                                    val === ""
                                  ) {
                                    updateOption("positionOuterColor", val);
                                  }
                                }}
                                placeholder="Same as FG"
                                className="flex-1 font-mono text-xs uppercase"
                                maxLength={7}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="text-[10px] text-muted-foreground">
                              Corner Inner Color
                            </Label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={
                                  options.positionInnerColor ||
                                  options.foreground
                                }
                                onChange={(e) =>
                                  updateOption(
                                    "positionInnerColor",
                                    e.target.value
                                  )
                                }
                                className="h-8 w-8 cursor-pointer rounded border"
                                aria-label="Corner inner color"
                              />
                              <Input
                                value={options.positionInnerColor || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (
                                    isValidHexColor(val) ||
                                    val.length < 7 ||
                                    val === ""
                                  ) {
                                    updateOption("positionInnerColor", val);
                                  }
                                }}
                                placeholder="Same as FG"
                                className="flex-1 font-mono text-xs uppercase"
                                maxLength={7}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Quiet Zone */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] text-muted-foreground">
                              Quiet Zone (Margin)
                            </Label>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {options.quietZone}px
                            </span>
                          </div>
                          <Slider
                            value={[options.quietZone]}
                            onValueChange={(values) => {
                              const newValue = Array.isArray(values)
                                ? values[0]
                                : values;
                              updateOption("quietZone", newValue);
                            }}
                            min={0}
                            max={50}
                            step={5}
                            className="cursor-pointer"
                            aria-label="Quiet zone size"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preview Section */}
              <Card className="w-full lg:sticky lg:top-4 lg:w-80">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Preview</CardTitle>
                    {content && (
                      <Button
                        aria-label="Download QR code"
                        className="cursor-pointer"
                        onClick={handleDownload}
                        size="xs"
                        tabIndex={0}
                        variant="outline"
                      >
                        <HugeiconsIcon
                          data-icon="inline-start"
                          icon={Download01Icon}
                          size={14}
                        />
                        Download
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 pt-4">
                  <div
                    className="flex aspect-square w-full max-w-64 items-center justify-center rounded-lg border p-2"
                    style={{ backgroundColor: options.background }}
                  >
                    {isGenerating ? (
                      <div className="text-muted-foreground text-xs">
                        Generating...
                      </div>
                    ) : error ? (
                      <div className="text-center text-destructive text-xs">
                        {error}
                      </div>
                    ) : !content ? (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <HugeiconsIcon
                          icon={QrCodeIcon}
                          size={48}
                          strokeWidth={1}
                        />
                        <span className="text-xs">
                          Enter content to generate
                        </span>
                      </div>
                    ) : null}
                    {/* QR Code renders here */}
                    <div
                      ref={qrContainerRef}
                      className={`flex items-center justify-center ${!content || error ? "hidden" : ""}`}
                    />
                  </div>
                  {content && !error && (
                    <div className="flex w-full flex-wrap items-center justify-center gap-2">
                      <Badge
                        variant="secondary"
                        className="font-mono text-[10px]"
                      >
                        {CONTENT_TYPE_LABELS[contentType]}
                      </Badge>
                      {options.dotScale < 1 && (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {Math.round(options.dotScale * 100)}% dots
                        </Badge>
                      )}
                      {logoPreview && (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          +logo
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Read Tab */}
          <TabsContent value="read" className="mt-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              {/* Upload Section */}
              <Card className="flex-1">
                <CardHeader className="border-b">
                  <CardTitle>Upload QR Code Image</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-label="Upload QR code image"
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors ${
                      isDragOver
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        fileInputRef.current?.click();
                      }
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    aria-label="Drop zone for QR code image"
                  >
                    <div className="rounded-full bg-muted p-4">
                      <HugeiconsIcon
                        icon={ImageUploadIcon}
                        size={32}
                        className="text-muted-foreground"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="font-medium text-sm">
                        {isDragOver ? "Drop image here" : "Click or drag image"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Supports PNG, JPG, GIF, WebP
                      </span>
                    </div>
                  </div>

                  {isReading && (
                    <div className="mt-4 text-center text-muted-foreground text-sm">
                      Reading QR code...
                    </div>
                  )}

                  {readError && (
                    <Badge variant="destructive" className="mt-4">
                      {readError}
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Result Section */}
              <Card className="w-full lg:w-80">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Decoded Content</CardTitle>
                    {decodedContent && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              aria-label="Copy decoded content"
                              className="cursor-pointer"
                              onClick={handleCopyContent}
                              size="icon-xs"
                              tabIndex={0}
                              variant="ghost"
                            />
                          }
                        >
                          <HugeiconsIcon
                            icon={copied ? Tick01Icon : Copy01Icon}
                            size={14}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {copied ? "Copied!" : "Copy"}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {decodedContent ? (
                    <div className="flex flex-col gap-3">
                      <Badge
                        variant="secondary"
                        className="w-fit font-mono text-[10px]"
                      >
                        {decodedType
                          ? CONTENT_TYPE_LABELS[decodedType]
                          : "Unknown"}
                      </Badge>

                      {/* WiFi parsed data */}
                      {wifiData ? (
                        <div className="flex flex-col gap-2 rounded-md bg-muted/50 p-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-muted-foreground uppercase">
                              Network
                            </span>
                            <span className="font-mono text-xs">
                              {wifiData.ssid}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-muted-foreground uppercase">
                              Password
                            </span>
                            <span className="font-mono text-xs">
                              {wifiData.password || "(none)"}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-muted-foreground uppercase">
                              Security
                            </span>
                            <span className="font-mono text-xs">
                              {wifiData.encryption === "nopass"
                                ? "Open"
                                : wifiData.encryption}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="break-all rounded-md bg-muted/50 p-3 font-mono text-xs">
                          {decodedContent}
                        </div>
                      )}

                      {/* Action buttons based on type */}
                      {decodedType === "url" && (
                        <a
                          href={decodedContent}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-primary-foreground text-xs transition-colors hover:bg-primary/90"
                        >
                          Open Link
                        </a>
                      )}
                      {decodedType === "email" && (
                        <a
                          href={
                            decodedContent.startsWith("mailto:")
                              ? decodedContent
                              : `mailto:${decodedContent}`
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-primary-foreground text-xs transition-colors hover:bg-primary/90"
                        >
                          Send Email
                        </a>
                      )}
                      {decodedType === "phone" && (
                        <a
                          href={
                            decodedContent.startsWith("tel:")
                              ? decodedContent
                              : `tel:${decodedContent}`
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-primary-foreground text-xs transition-colors hover:bg-primary/90"
                        >
                          Call Number
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                      <HugeiconsIcon
                        icon={ScanIcon}
                        size={32}
                        strokeWidth={1}
                      />
                      <span className="text-xs">Upload an image to decode</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar - Examples */}
      <div className="w-full shrink-0 xl:sticky xl:top-4 xl:w-64">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Examples</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-4">
            {EXAMPLE_CONTENT.map((example) => (
              <button
                key={example.label}
                type="button"
                aria-label={`Use example: ${example.label}`}
                className="cursor-pointer rounded-md border bg-muted/30 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                onClick={() => handleExampleClick(example.value, example.type)}
                tabIndex={0}
              >
                <span className="font-medium">{example.label}</span>
                <span className="mt-1 block truncate text-muted-foreground">
                  {example.value}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Style Tips */}
        <Card className="mt-4">
          <CardHeader className="border-b">
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2 text-[10px] text-muted-foreground">
              <p>
                <strong className="text-foreground">Logo</strong> - Use High
                error correction for best results with logos
              </p>
              <p>
                <strong className="text-foreground">Colors</strong> - Ensure
                good contrast between foreground and background
              </p>
              <p>
                <strong className="text-foreground">Size</strong> - Larger QR
                codes are easier to scan from distance
              </p>
              <p>
                <strong className="text-foreground">Test</strong> - Always test
                your QR code before printing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRCodePage;
