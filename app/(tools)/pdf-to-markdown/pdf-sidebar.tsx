"use client";

import {
  Cancel01Icon,
  Loading03Icon,
  Refresh01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  getPdfTypeLabel,
  type MarkdownProfile,
  type PdfInspectionResult,
} from "@/lib/pdf-to-markdown";
import { cn } from "@/lib/utils";

interface ConversionSettingsCardProps {
  fileSelected: boolean;
  hasResult: boolean;
  includeImages: boolean;
  includePageMarkers: boolean;
  isWorking: boolean;
  onClear: () => void;
  onConvert: () => void;
  onIncludeImagesChange: (value: boolean) => void;
  onIncludePageMarkersChange: (value: boolean) => void;
  onPageSelectionChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onProfileChange: (value: MarkdownProfile) => void;
  pageSelection: string;
  pageSelectionError: string | null;
  password: string;
  profile: MarkdownProfile;
  stageLabel: string;
}

const getConvertButtonLabel = ({
  hasResult,
  isWorking,
  stageLabel,
}: Pick<
  ConversionSettingsCardProps,
  "hasResult" | "isWorking" | "stageLabel"
>): string => {
  if (isWorking) {
    return stageLabel;
  }
  if (hasResult) {
    return "Re-convert";
  }
  return "Convert PDF";
};

export const ConversionSettingsCard = ({
  fileSelected,
  hasResult,
  includeImages,
  includePageMarkers,
  isWorking,
  onClear,
  onConvert,
  onIncludeImagesChange,
  onIncludePageMarkersChange,
  onPageSelectionChange,
  onPasswordChange,
  onProfileChange,
  pageSelection,
  pageSelectionError,
  password,
  profile,
  stageLabel,
}: ConversionSettingsCardProps) => (
  <Card>
    <CardHeader className="border-b">
      <CardTitle>Conversion Settings</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="markdown-profile">Output style</FieldLabel>
        <Select
          onValueChange={(value) =>
            value && onProfileChange(value as MarkdownProfile)
          }
          value={profile}
        >
          <SelectTrigger
            className="w-full cursor-pointer"
            id="markdown-profile"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="cursor-pointer" value="fidelity">
              Fidelity
            </SelectItem>
            <SelectItem className="cursor-pointer" value="compact">
              Compact
            </SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>
          Compact mode removes source padding and dot leaders.
        </FieldDescription>
      </Field>

      <Field data-invalid={Boolean(pageSelectionError)}>
        <FieldLabel htmlFor="page-selection">Pages</FieldLabel>
        <Input
          aria-invalid={Boolean(pageSelectionError)}
          id="page-selection"
          onChange={(event) => onPageSelectionChange(event.target.value)}
          placeholder="All pages or 1, 3, 5-8"
          value={pageSelection}
        />
        <FieldDescription>
          {pageSelectionError ?? "Leave empty to convert the full PDF."}
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="pdf-password">Password</FieldLabel>
        <Input
          autoComplete="off"
          id="pdf-password"
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Only for encrypted PDFs"
          type="password"
          value={password}
        />
      </Field>

      <Field orientation="horizontal">
        <Switch
          aria-label="Include page markers"
          checked={includePageMarkers}
          id="page-markers"
          onCheckedChange={onIncludePageMarkersChange}
        />
        <div>
          <FieldLabel htmlFor="page-markers">Page markers</FieldLabel>
          <FieldDescription>
            Adds HTML comments between PDF pages.
          </FieldDescription>
        </div>
      </Field>

      <Field orientation="horizontal">
        <Switch
          aria-label="Include image placeholders"
          checked={includeImages}
          id="image-placeholders"
          onCheckedChange={onIncludeImagesChange}
        />
        <div>
          <FieldLabel htmlFor="image-placeholders">Images</FieldLabel>
          <FieldDescription>
            Keeps image placeholders in the Markdown.
          </FieldDescription>
        </div>
      </Field>

      <Button
        className="w-full"
        disabled={!fileSelected || isWorking}
        onClick={onConvert}
      >
        <HugeiconsIcon
          className={cn(isWorking && "animate-spin")}
          icon={isWorking ? Loading03Icon : Refresh01Icon}
        />
        {getConvertButtonLabel({ hasResult, isWorking, stageLabel })}
      </Button>
      <Button
        className="w-full"
        disabled={!fileSelected}
        onClick={onClear}
        variant="outline"
      >
        <HugeiconsIcon icon={Cancel01Icon} />
        Clear
      </Button>
    </CardContent>
  </Card>
);

interface DocumentCardProps {
  engineVersion: string;
  result: PdfInspectionResult;
}

export const DocumentCard = ({ engineVersion, result }: DocumentCardProps) => (
  <Card>
    <CardHeader className="border-b">
      <CardTitle>Document</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-x-3 gap-y-4 text-xs">
      <div>
        <p className="text-muted-foreground">Type</p>
        <p className="font-medium">{getPdfTypeLabel(result.pdfType)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Pages</p>
        <p className="font-medium">{result.pageCount.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Confidence</p>
        <p className="font-medium">{Math.round(result.confidence * 100)}%</p>
      </div>
      <div>
        <p className="text-muted-foreground">Processing</p>
        <p className="font-medium">
          {Math.max(1, Math.round(result.processingTimeMs)).toLocaleString()} ms
        </p>
      </div>
      {result.title ? (
        <div className="col-span-2 min-w-0">
          <p className="text-muted-foreground">Detected title</p>
          <p className="truncate font-medium" title={result.title}>
            {result.title}
          </p>
        </div>
      ) : null}
      {engineVersion ? (
        <div className="col-span-2 border-t pt-3 text-muted-foreground">
          pdf-inspector v{engineVersion}
        </div>
      ) : null}
    </CardContent>
  </Card>
);

export const PrivacyCard = () => (
  <Card>
    <CardHeader className="border-b">
      <div className="flex items-center gap-2">
        <HugeiconsIcon className="size-4 text-primary" icon={Shield01Icon} />
        <CardTitle>Private by default</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-xs">
        The PDF is processed in a local Web Worker. It is not uploaded or saved
        in browser storage. Scanned pages require OCR, which is not included.
      </p>
    </CardContent>
  </Card>
);
