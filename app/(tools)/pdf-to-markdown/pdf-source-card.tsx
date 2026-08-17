"use client";

import {
  Alert02Icon,
  FileUploadIcon,
  Loading03Icon,
  Pdf01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ChangeEvent, DragEvent, RefObject } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPdfFileSize } from "@/lib/pdf-to-markdown";
import { cn } from "@/lib/utils";

interface PdfSourceCardProps {
  error: string | null;
  file: File | null;
  inputRef: RefObject<HTMLInputElement | null>;
  isDragging: boolean;
  isWorking: boolean;
  onDragLeave: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  stageLabel: string;
}

export const PdfSourceCard = ({
  error,
  file,
  inputRef,
  isDragging,
  isWorking,
  onDragLeave,
  onDragOver,
  onDrop,
  onInputChange,
  stageLabel,
}: PdfSourceCardProps) => (
  <Card>
    <CardHeader className="border-b">
      <CardTitle>Source PDF</CardTitle>
      <CardDescription>
        Text, tables, headings, lists, links, and reading order are
        reconstructed locally.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <button
        className={cn(
          "flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed p-6 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-foreground/20 hover:bg-muted/40"
        )}
        onClick={() => inputRef.current?.click()}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        type="button"
      >
        <HugeiconsIcon
          className="size-9 text-muted-foreground"
          icon={file ? Pdf01Icon : FileUploadIcon}
        />
        <div className="space-y-1">
          <p className="font-medium text-sm">
            {file ? file.name : "Drop a PDF here"}
          </p>
          <p className="text-muted-foreground text-xs">
            {file
              ? `${formatPdfFileSize(file.size)} · click to replace`
              : "or click to choose one from your Mac · up to 25 MB"}
          </p>
        </div>
      </button>
      <Input
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={onInputChange}
        ref={inputRef}
        type="file"
      />

      {isWorking ? (
        <div aria-live="polite" className="flex flex-col gap-2" role="status">
          <div className="flex items-center gap-2 text-xs">
            <HugeiconsIcon
              className="animate-spin text-primary"
              icon={Loading03Icon}
            />
            <span className="font-medium">{stageLabel}</span>
          </div>
          <div className="h-1 overflow-hidden bg-muted">
            <div className="h-full w-2/3 animate-pulse bg-primary" />
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          aria-live="assertive"
          className="flex gap-2 border border-destructive/30 bg-destructive/5 p-3 text-destructive text-xs"
          role="alert"
        >
          <HugeiconsIcon
            className="mt-0.5 size-4 shrink-0"
            icon={Alert02Icon}
          />
          <span>{error}</span>
        </div>
      ) : null}
    </CardContent>
  </Card>
);
