"use client";

import {
  Copy01Icon,
  Download01Icon,
  Image01Icon,
  ImageUploadIcon,
  RefreshIcon,
  TextIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CHARACTER_SET_LABELS,
  type CharacterSet,
  type ConversionOptions,
  convertImageToAscii,
  copyAsciiToClipboard,
  DEFAULT_OPTIONS,
  DEFAULT_TEXT_OPTIONS,
  downloadAsciiArt,
  getAvailableFonts,
  isImageSupported,
  TEXT_FONT_LABELS,
  type TextFont,
  type TextOptions,
  textToAscii,
  WIDTH_PRESETS,
} from "@/lib/ascii-art";

const IMAGE_STORAGE_KEY = "devtools:ascii-art:image-options";
const TEXT_STORAGE_KEY = "devtools:ascii-art:text";
const TAB_STORAGE_KEY = "devtools:ascii-art:tab";

const EXAMPLE_IMAGES = [
  {
    label: "Landscape",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  },
  {
    label: "Portrait",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  },
  {
    label: "Object",
    url: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&q=80",
  },
];

const EXAMPLE_TEXT = [
  { label: "Hello", value: "Hello" },
  { label: "ASCII", value: "ASCII" },
  { label: "Multiline", value: "HELLO\nWORLD" },
  { label: "Welcome", value: "WELCOME" },
  { label: "Code Block", value: "DEV\nTOOLS" },
];

const AsciiArtPage = () => {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");

  // Text mode state
  const [textInput, setTextInput] = useState("HELLO");
  const [textOptions, setTextOptions] =
    useState<TextOptions>(DEFAULT_TEXT_OPTIONS);
  const [textOutput, setTextOutput] = useState("");

  // Image mode state
  const [imageOptions, setImageOptions] =
    useState<ConversionOptions>(DEFAULT_OPTIONS);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageOutput, setImageOutput] = useState<string>("");
  const [htmlOutput, setHtmlOutput] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  // Load from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
    if (savedTab === "text" || savedTab === "image") {
      setActiveTab(savedTab);
    }

    const savedText = localStorage.getItem(TEXT_STORAGE_KEY);
    if (savedText) {
      setTextInput(savedText);
    }

    const savedImageOptions = localStorage.getItem(IMAGE_STORAGE_KEY);
    if (savedImageOptions) {
      try {
        const parsed = JSON.parse(savedImageOptions);
        setImageOptions((prev) => ({ ...prev, ...parsed }));
      } catch {
        // Invalid JSON, ignore
      }
    }

    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(TAB_STORAGE_KEY, activeTab);
  }, [activeTab, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(TEXT_STORAGE_KEY, textInput);
  }, [textInput, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(imageOptions));
  }, [imageOptions, isHydrated]);

  // Generate text ASCII art
  useEffect(() => {
    if (!textInput.trim()) {
      setTextOutput("");
      return;
    }

    const output = textToAscii(textInput, textOptions);
    setTextOutput(output);
  }, [textInput, textOptions]);

  // Convert image when file or options change
  useEffect(() => {
    if (!imageFile) {
      setImageOutput("");
      setHtmlOutput("");
      setDimensions(null);
      return;
    }

    const convert = async () => {
      setIsConverting(true);
      try {
        const result = await convertImageToAscii(imageFile, imageOptions);
        setImageOutput(result.ascii);
        setHtmlOutput(result.html);
        setDimensions(result.dimensions);
      } catch (err) {
        console.error("Conversion error:", err);
        toast.error("Failed to convert image");
      } finally {
        setIsConverting(false);
      }
    };

    const debounce = setTimeout(convert, 150);
    return () => clearTimeout(debounce);
  }, [imageFile, imageOptions]);

  const currentOutput = activeTab === "text" ? textOutput : imageOutput;

  const handleFileSelect = useCallback((file: File) => {
    if (!isImageSupported(file)) {
      toast.error("Unsupported image format");
      return;
    }

    setImageFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeTab !== "image") return;
      const files = Array.from(e.clipboardData?.files ?? []);
      const imgFile = files.find((f) => f.type.startsWith("image/"));
      if (imgFile) {
        handleFileSelect(imgFile);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFileSelect, activeTab]);

  const handleCopy = useCallback(async () => {
    if (!currentOutput) return;

    const success = await copyAsciiToClipboard(currentOutput);
    if (success) {
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy");
    }
  }, [currentOutput]);

  const handleDownload = useCallback(() => {
    if (!currentOutput) return;
    const filename =
      activeTab === "text"
        ? "ascii-text.txt"
        : imageFile?.name.replace(/\.[^.]+$/, "-ascii.txt") || "ascii-art.txt";
    downloadAsciiArt(currentOutput, filename);
    toast.success("Downloaded");
  }, [currentOutput, activeTab, imageFile]);

  const handleClearImage = useCallback(() => {
    setImageFile(null);
    setImageOutput("");
    setHtmlOutput("");
    setDimensions(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imagePreview]);

  const handleExampleImage = useCallback(
    async (url: string) => {
      try {
        setIsConverting(true);
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], "example.jpg", { type: blob.type });
        handleFileSelect(file);
      } catch (err) {
        console.error("Failed to load example:", err);
        toast.error("Failed to load example image");
      } finally {
        setIsConverting(false);
      }
    },
    [handleFileSelect]
  );

  const updateImageOption = useCallback(
    <K extends keyof ConversionOptions>(
      key: K,
      value: ConversionOptions[K]
    ) => {
      setImageOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Memoize stats
  const lineCount = useMemo(() => {
    if (!currentOutput) return 0;
    return currentOutput.split("\n").length;
  }, [currentOutput]);

  const charCount = useMemo(() => {
    if (!currentOutput) return 0;
    return currentOutput.replace(/\n/g, "").length;
  }, [currentOutput]);

  const availableFonts = getAvailableFonts();

  return (
    <div className="flex max-w-7xl flex-col gap-6 xl:flex-row xl:items-start">
      {/* Main Section */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">ASCII Art Generator</h1>
          <p className="text-muted-foreground text-xs">
            Convert text or images to ASCII art with customizable styles.
          </p>
        </div>

        <Tabs
          defaultValue={activeTab}
          onValueChange={(v) => setActiveTab(v as "text" | "image")}
          value={activeTab}
        >
          <TabsList variant="line">
            <TabsTrigger
              aria-label="Text to ASCII tab"
              className="cursor-pointer gap-1.5"
              value="text"
            >
              <HugeiconsIcon icon={TextIcon} size={14} />
              Text
            </TabsTrigger>
            <TabsTrigger
              aria-label="Image to ASCII tab"
              className="cursor-pointer gap-1.5"
              value="image"
            >
              <HugeiconsIcon icon={Image01Icon} size={14} />
              Image
            </TabsTrigger>
          </TabsList>

          {/* Text Tab */}
          <TabsContent className="mt-4" value="text">
            <div className="flex flex-col gap-4">
              {/* Text Input */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Enter Text</CardTitle>
                    {textInput && (
                      <Button
                        aria-label="Clear text"
                        className="cursor-pointer"
                        onClick={() => setTextInput("")}
                        size="xs"
                        variant="ghost"
                      >
                        <HugeiconsIcon
                          data-icon="inline-start"
                          icon={RefreshIcon}
                          size={14}
                        />
                        Clear
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4">
                  <Textarea
                    aria-label="Text input"
                    className="min-h-[80px] resize-none font-mono"
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text to convert..."
                    value={textInput}
                  />

                  {/* Font Selection */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-xs">
                      Font
                    </Label>
                    <Select
                      onValueChange={(v) =>
                        setTextOptions((prev) => ({
                          ...prev,
                          font: v as TextFont,
                        }))
                      }
                      value={textOptions.font}
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFonts.map((font) => (
                          <SelectItem
                            className="cursor-pointer"
                            key={font}
                            value={font}
                          >
                            {TEXT_FONT_LABELS[font]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Image Tab */}
          <TabsContent className="mt-4" value="image">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Upload Image</CardTitle>
                  {imageFile && (
                    <Button
                      aria-label="Clear image"
                      className="cursor-pointer"
                      onClick={handleClearImage}
                      size="xs"
                      variant="ghost"
                    >
                      <HugeiconsIcon
                        data-icon="inline-start"
                        icon={RefreshIcon}
                        size={14}
                      />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <input
                  accept="image/*"
                  aria-label="Upload image"
                  className="hidden"
                  onChange={handleFileInputChange}
                  ref={fileInputRef}
                  type="file"
                />

                {imageFile ? (
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* Image Preview */}
                    <div className="relative w-full shrink-0 overflow-hidden rounded-lg border bg-muted/30 sm:w-48">
                      {imagePreview && (
                        <img
                          alt="Preview"
                          className="h-full w-full object-contain"
                          src={imagePreview}
                        />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex flex-1 flex-col justify-center gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase">
                          File
                        </span>
                        <span className="truncate font-mono text-xs">
                          {imageFile.name}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase">
                          Size
                        </span>
                        <span className="font-mono text-xs">
                          {(imageFile.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      {dimensions && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Output
                          </span>
                          <span className="font-mono text-xs">
                            {dimensions.width} × {dimensions.height} chars
                          </span>
                        </div>
                      )}
                      <Button
                        aria-label="Change image"
                        className="mt-2 w-fit cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        size="sm"
                        variant="outline"
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    aria-label="Drop zone for image"
                    className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        fileInputRef.current?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="rounded-full bg-muted p-4">
                      <HugeiconsIcon
                        className="text-muted-foreground"
                        icon={ImageUploadIcon}
                        size={32}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="font-medium text-sm">
                        {isDragging ? "Drop image here" : "Click or drag image"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Supports PNG, JPG, GIF, WebP, BMP
                      </span>
                      <span className="mt-1 text-muted-foreground/70 text-xs">
                        You can also paste from clipboard
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ASCII Output */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>
                ASCII Output
                {currentOutput && (
                  <span className="ml-2 font-normal text-muted-foreground text-xs">
                    {lineCount} lines, {charCount.toLocaleString()} chars
                  </span>
                )}
              </CardTitle>
              {currentOutput && (
                <div className="flex items-center gap-2">
                  <Button
                    aria-label="Copy ASCII art"
                    className="cursor-pointer"
                    onClick={handleCopy}
                    size="xs"
                    variant="outline"
                  >
                    <HugeiconsIcon
                      data-icon="inline-start"
                      icon={copied ? Tick01Icon : Copy01Icon}
                      size={14}
                    />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    aria-label="Download ASCII art"
                    className="cursor-pointer"
                    onClick={handleDownload}
                    size="xs"
                    variant="outline"
                  >
                    <HugeiconsIcon
                      data-icon="inline-start"
                      icon={Download01Icon}
                      size={14}
                    />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {activeTab === "image" && isConverting ? (
              <div className="flex min-h-[300px] items-center justify-center text-muted-foreground text-sm">
                Converting...
              </div>
            ) : currentOutput ? (
              <div className="relative">
                <pre
                  className="max-h-[500px] overflow-auto rounded-lg bg-[#0a0a0a] p-4 font-mono text-[#e0e0e0] text-[8px] leading-[1.15] sm:text-[10px]"
                  ref={outputRef}
                  style={{
                    whiteSpace: "pre",
                    fontFamily:
                      "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
                  }}
                >
                  {activeTab === "text" ||
                  imageOptions.colorMode === "monochrome" ? (
                    currentOutput
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: htmlOutput }} />
                  )}
                </pre>
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
                <HugeiconsIcon
                  icon={activeTab === "text" ? TextIcon : ImageUploadIcon}
                  size={48}
                  strokeWidth={1}
                />
                <span className="text-xs">
                  {activeTab === "text"
                    ? "Enter text to generate ASCII art"
                    : "Upload an image to see ASCII art"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settings Sidebar */}
      <div className="w-full shrink-0 xl:sticky xl:top-4 xl:w-72">
        {/* Image Settings - Only show when Image tab is active */}
        {activeTab === "image" && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Image Settings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 pt-4">
              {/* Output Width */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground text-xs">
                    Output Width
                  </Label>
                  <span className="font-mono text-muted-foreground text-xs">
                    {imageOptions.width} chars
                  </span>
                </div>
                <Slider
                  aria-label="Output width"
                  className="cursor-pointer"
                  max={200}
                  min={30}
                  onValueChange={(values) => {
                    const newValue = Array.isArray(values) ? values[0] : values;
                    updateImageOption("width", newValue);
                  }}
                  step={5}
                  value={[imageOptions.width]}
                />
                <div className="flex flex-wrap gap-1">
                  {WIDTH_PRESETS.map((preset) => (
                    <button
                      aria-label={`Set width to ${preset.value}`}
                      className={`cursor-pointer rounded px-2 py-0.5 text-[10px] transition-colors ${
                        imageOptions.width === preset.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      key={preset.value}
                      onClick={() => updateImageOption("width", preset.value)}
                      type="button"
                    >
                      {preset.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Set */}
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs">
                  Character Set
                </Label>
                <Select
                  onValueChange={(v) =>
                    updateImageOption("characterSet", v as CharacterSet)
                  }
                  value={imageOptions.characterSet}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CHARACTER_SET_LABELS).map(
                      ([key, label]) => (
                        <SelectItem
                          className="cursor-pointer"
                          key={key}
                          value={key}
                        >
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Characters */}
              {imageOptions.characterSet === "custom" && (
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground text-xs">
                    Custom Characters (dark to light)
                  </Label>
                  <Input
                    aria-label="Custom character set"
                    className="font-mono text-xs"
                    onChange={(e) =>
                      updateImageOption("customCharacters", e.target.value)
                    }
                    placeholder="@#=-. "
                    value={imageOptions.customCharacters || ""}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Enter characters from darkest to lightest (end with space)
                  </p>
                </div>
              )}

              {/* Color Mode */}
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs">
                  Color Mode
                </Label>
                <Select
                  onValueChange={(v) =>
                    updateImageOption(
                      "colorMode",
                      v as ConversionOptions["colorMode"]
                    )
                  }
                  value={imageOptions.colorMode}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="monochrome">
                      Monochrome (fastest)
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="grayscale">
                      Grayscale
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="color">
                      Full Color
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Invert Option */}
              <div className="flex items-center justify-between">
                <Label
                  className="text-muted-foreground text-xs"
                  htmlFor="invert"
                >
                  Invert Colors
                </Label>
                <Switch
                  aria-label="Invert colors"
                  checked={imageOptions.invert}
                  id="invert"
                  onCheckedChange={(checked) =>
                    updateImageOption("invert", checked === true)
                  }
                />
              </div>

              {/* Preserve Aspect Ratio */}
              <div className="flex items-center justify-between">
                <Label
                  className="text-muted-foreground text-xs"
                  htmlFor="aspect"
                >
                  Preserve Aspect Ratio
                </Label>
                <Switch
                  aria-label="Preserve aspect ratio"
                  checked={imageOptions.preserveAspectRatio}
                  id="aspect"
                  onCheckedChange={(checked) =>
                    updateImageOption("preserveAspectRatio", checked === true)
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Examples */}
        <Card className={activeTab === "image" ? "mt-4" : ""}>
          <CardHeader className="border-b">
            <CardTitle>
              {activeTab === "text" ? "Try Examples" : "Example Images"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-4">
            {activeTab === "text"
              ? EXAMPLE_TEXT.map((example) => (
                  <button
                    aria-label={`Use example: ${example.label}`}
                    className="cursor-pointer rounded-md border bg-muted/30 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                    key={example.label}
                    onClick={() => setTextInput(example.value)}
                    type="button"
                  >
                    <span className="font-medium">{example.label}</span>
                  </button>
                ))
              : EXAMPLE_IMAGES.map((example) => (
                  <button
                    aria-label={`Load ${example.label} example`}
                    className="cursor-pointer rounded-md border bg-muted/30 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                    key={example.label}
                    onClick={() => handleExampleImage(example.url)}
                    type="button"
                  >
                    <span className="font-medium">{example.label}</span>
                  </button>
                ))}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-4">
          <CardHeader className="border-b">
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {activeTab === "text" ? (
              <div className="flex flex-col gap-2 text-[10px] text-muted-foreground">
                <p>
                  <strong className="text-foreground">Fonts</strong> - Try
                  different fonts for unique styles
                </p>
                <p>
                  <strong className="text-foreground">Uppercase</strong> - Text
                  is automatically converted to uppercase
                </p>
                <p>
                  <strong className="text-foreground">Length</strong> - Shorter
                  text works best for ASCII banners
                </p>
                <p>
                  <strong className="text-foreground">Special chars</strong> -
                  Some fonts support limited punctuation
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 text-[10px] text-muted-foreground">
                <p>
                  <strong className="text-foreground">Width</strong> - Lower
                  values for small previews, higher for detail
                </p>
                <p>
                  <strong className="text-foreground">Characters</strong> -
                  "Detailed" gives best gradation, "Blocks" for bold look
                </p>
                <p>
                  <strong className="text-foreground">Invert</strong> - Toggle
                  for light or dark backgrounds
                </p>
                <p>
                  <strong className="text-foreground">Performance</strong> -
                  Monochrome mode is fastest for large images
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AsciiArtPage;
