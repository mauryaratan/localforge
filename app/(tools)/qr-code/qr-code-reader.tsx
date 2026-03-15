// biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: reader UI keeps upload and decode flow together on purpose
"use client";

import {
  Copy01Icon,
  ImageUploadIcon,
  ScanIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CONTENT_TYPE_LABELS,
  parseWiFiData,
  type QRContentType,
  readQRCodeFromFile,
} from "@/lib/qr-code";

export const QRCodeReader = () => {
  const [decodedContent, setDecodedContent] = useState<string | null>(null);
  const [decodedType, setDecodedType] = useState<QRContentType | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyContent = useCallback(async () => {
    if (!decodedContent) {
      return;
    }

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
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsDragOver(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsDragOver(false);
    },
    []
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const wifiData =
    decodedType === "wifi" && decodedContent
      ? parseWiFiData(decodedContent)
      : null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <Card className="flex-1">
        <CardHeader className="border-b">
          <CardTitle>Upload QR Code Image</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <input
            accept="image/*"
            aria-label="Upload QR code image"
            className="hidden"
            onChange={handleFileInputChange}
            ref={fileInputRef}
            type="file"
          />
          <button
            aria-label="Drop zone for QR code image"
            className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            type="button"
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
                {isDragOver ? "Drop image here" : "Click or drag image"}
              </span>
              <span className="text-muted-foreground text-xs">
                Supports PNG, JPG, GIF, WebP
              </span>
            </div>
          </button>

          {isReading ? (
            <div className="mt-4 text-center text-muted-foreground text-sm">
              Reading QR code...
            </div>
          ) : null}

          {readError ? (
            <Badge className="mt-4" variant="destructive">
              {readError}
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      <Card className="w-full lg:w-80">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Decoded Content</CardTitle>
            {decodedContent ? (
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
                <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {decodedContent ? (
            <div className="flex flex-col gap-3">
              <Badge
                className="w-fit font-mono text-[10px]"
                variant="secondary"
              >
                {decodedType ? CONTENT_TYPE_LABELS[decodedType] : "Unknown"}
              </Badge>

              {wifiData ? (
                <div className="flex flex-col gap-2 rounded-md bg-muted/50 p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Network
                    </span>
                    <span className="font-mono text-xs">{wifiData.ssid}</span>
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

              {decodedType === "url" ? (
                <a
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-primary-foreground text-xs transition-colors hover:bg-primary/90"
                  href={decodedContent}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Open Link
                </a>
              ) : null}
              {decodedType === "email" ? (
                <a
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-primary-foreground text-xs transition-colors hover:bg-primary/90"
                  href={
                    decodedContent.startsWith("mailto:")
                      ? decodedContent
                      : `mailto:${decodedContent}`
                  }
                >
                  Send Email
                </a>
              ) : null}
              {decodedType === "phone" ? (
                <a
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-primary-foreground text-xs transition-colors hover:bg-primary/90"
                  href={
                    decodedContent.startsWith("tel:")
                      ? decodedContent
                      : `tel:${decodedContent}`
                  }
                >
                  Call Number
                </a>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <HugeiconsIcon icon={ScanIcon} size={32} strokeWidth={1} />
              <span className="text-xs">Upload an image to decode</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
