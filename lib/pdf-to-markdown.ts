export const MAX_PDF_FILE_SIZE = 25 * 1024 * 1024;

const PDF_EXTENSION_REGEX = /\.pdf$/i;
const PAGE_NUMBER_REGEX = /^\d+$/;
const PAGE_RANGE_REGEX = /^(\d+)\s*-\s*(\d+)$/;
const INVALID_PASSWORD_REGEX = /invalid password|incorrect password/i;
const ENCRYPTED_PDF_REGEX = /password|encrypted/i;
const MAX_SELECTED_PAGES = 10_000;

export type MarkdownProfile = "compact" | "fidelity";
export type PdfType = "ImageBased" | "Mixed" | "Scanned" | "TextBased";

export interface PdfConversionOptions {
  includeImages: boolean;
  includePageMarkers: boolean;
  pages?: number[];
  password?: string;
  profile: MarkdownProfile;
}

export interface PdfPageOcrReasons {
  page: number;
  reasons: string[];
}

export interface PdfInspectionResult {
  confidence: number;
  hasEncodingIssues: boolean;
  layout: {
    isComplex: boolean;
    pagesWithColumns: number[];
    pagesWithTables: number[];
  };
  markdown?: string;
  ocrReasonsByPage: PdfPageOcrReasons[];
  pageCount: number;
  pagesNeedingOcr: number[];
  pdfType: PdfType;
  processingTimeMs: number;
  title?: string;
}

export interface PdfWorkerRequest {
  buffer: ArrayBuffer;
  id: number;
  options: PdfConversionOptions;
}

export type PdfWorkerResponse =
  | {
      id: number;
      stage: "converting" | "loading-engine";
      type: "progress";
    }
  | {
      engineVersion: string;
      id: number;
      result: PdfInspectionResult;
      type: "complete";
    }
  | {
      error: string;
      id: number;
      type: "error";
    };

export interface PageSelectionResult {
  error: string | null;
  pages?: number[];
}

type ParsedPageSegment =
  | { endPage: number; startPage: number }
  | { error: string };

const parsePageSegment = (segment: string): ParsedPageSegment => {
  if (!segment) {
    return { error: "Use page numbers or ranges such as 1, 3, 5-8." };
  }

  if (PAGE_NUMBER_REGEX.test(segment)) {
    const page = Number(segment);
    return page < 1
      ? { error: "Page numbers must start at 1." }
      : { endPage: page, startPage: page };
  }

  const rangeMatch = PAGE_RANGE_REGEX.exec(segment);
  if (!rangeMatch) {
    return { error: "Use page numbers or ranges such as 1, 3, 5-8." };
  }

  const startPage = Number(rangeMatch[1]);
  const endPage = Number(rangeMatch[2]);

  if (startPage < 1 || endPage < 1) {
    return { error: "Page numbers must start at 1." };
  }

  if (endPage < startPage) {
    return { error: "Page ranges must run from lower to higher." };
  }

  return { endPage, startPage };
};

export const validatePdfFile = (
  file: Pick<File, "name" | "size" | "type">
): string | null => {
  const isPdf =
    file.type === "application/pdf" || PDF_EXTENSION_REGEX.test(file.name);

  if (!isPdf) {
    return "Choose a PDF file.";
  }

  if (file.size === 0) {
    return "This PDF is empty.";
  }

  if (file.size > MAX_PDF_FILE_SIZE) {
    return "Choose a PDF smaller than 25 MB.";
  }

  return null;
};

export const parsePageSelection = (input: string): PageSelectionResult => {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { error: null };
  }

  const selectedPages = new Set<number>();
  const segments = trimmedInput.split(",");

  for (const rawSegment of segments) {
    const parsedSegment = parsePageSegment(rawSegment.trim());
    if ("error" in parsedSegment) {
      return { error: parsedSegment.error };
    }

    if (
      parsedSegment.endPage - parsedSegment.startPage + 1 >
      MAX_SELECTED_PAGES
    ) {
      return { error: "Select 10,000 pages or fewer." };
    }

    for (
      let page = parsedSegment.startPage;
      page <= parsedSegment.endPage;
      page += 1
    ) {
      selectedPages.add(page);
      if (selectedPages.size > MAX_SELECTED_PAGES) {
        return { error: "Select 10,000 pages or fewer." };
      }
    }
  }

  return {
    error: null,
    pages: [...selectedPages].sort((first, second) => first - second),
  };
};

export const formatPdfFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = value >= 10 ? 1 : 2;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
};

export const getMarkdownFileName = (pdfFileName: string): string => {
  const baseName = pdfFileName.replace(PDF_EXTENSION_REGEX, "").trim();
  return `${baseName || "document"}.md`;
};

export const getPdfTypeLabel = (pdfType: PdfType): string => {
  const labels: Record<PdfType, string> = {
    ImageBased: "Image-based",
    Mixed: "Mixed",
    Scanned: "Scanned",
    TextBased: "Text-based",
  };

  return labels[pdfType];
};

export const getPdfErrorMessage = (error: string): string => {
  const normalizedError = error.trim();

  if (!normalizedError) {
    return "Could not convert this PDF.";
  }

  if (INVALID_PASSWORD_REGEX.test(normalizedError)) {
    return "The PDF password is incorrect.";
  }

  if (ENCRYPTED_PDF_REGEX.test(normalizedError)) {
    return "This PDF is encrypted. Enter its password and try again.";
  }

  return normalizedError;
};
