import { describe, expect, it } from "vitest";
import {
  formatPdfFileSize,
  getMarkdownFileName,
  getPdfErrorMessage,
  getPdfTypeLabel,
  MAX_PDF_FILE_SIZE,
  parsePageSelection,
  validatePdfFile,
} from "@/lib/pdf-to-markdown";

describe("validatePdfFile", () => {
  it("accepts PDF MIME types and case-insensitive extensions", () => {
    expect(
      validatePdfFile({
        name: "report.bin",
        size: 100,
        type: "application/pdf",
      })
    ).toBeNull();
    expect(
      validatePdfFile({ name: "report.PDF", size: 100, type: "" })
    ).toBeNull();
  });

  it("rejects non-PDF, empty, and oversized files", () => {
    expect(
      validatePdfFile({ name: "notes.txt", size: 100, type: "text/plain" })
    ).toBe("Choose a PDF file.");
    expect(
      validatePdfFile({ name: "empty.pdf", size: 0, type: "application/pdf" })
    ).toBe("This PDF is empty.");
    expect(
      validatePdfFile({
        name: "large.pdf",
        size: MAX_PDF_FILE_SIZE + 1,
        type: "application/pdf",
      })
    ).toBe("Choose a PDF smaller than 25 MB.");
  });
});

describe("parsePageSelection", () => {
  it("uses every page for empty input", () => {
    expect(parsePageSelection("  ")).toEqual({ error: null });
  });

  it("parses, sorts, and de-duplicates page numbers and ranges", () => {
    expect(parsePageSelection("5-7, 1, 3, 6")).toEqual({
      error: null,
      pages: [1, 3, 5, 6, 7],
    });
  });

  it("rejects malformed and descending ranges", () => {
    expect(parsePageSelection("1,,3").error).toBe(
      "Use page numbers or ranges such as 1, 3, 5-8."
    );
    expect(parsePageSelection("8-3").error).toBe(
      "Page ranges must run from lower to higher."
    );
    expect(parsePageSelection("0, 2").error).toBe(
      "Page numbers must start at 1."
    );
  });

  it("caps expanded selections", () => {
    expect(parsePageSelection("1-10001").error).toBe(
      "Select 10,000 pages or fewer."
    );
  });
});

describe("PDF presentation helpers", () => {
  it("formats file sizes", () => {
    expect(formatPdfFileSize(500)).toBe("500 B");
    expect(formatPdfFileSize(1536)).toBe("1.50 KB");
    expect(formatPdfFileSize(10 * 1024 * 1024)).toBe("10.0 MB");
  });

  it("builds Markdown file names", () => {
    expect(getMarkdownFileName("Annual Report.PDF")).toBe("Annual Report.md");
    expect(getMarkdownFileName(".pdf")).toBe("document.md");
  });

  it("formats document types", () => {
    expect(getPdfTypeLabel("TextBased")).toBe("Text-based");
    expect(getPdfTypeLabel("ImageBased")).toBe("Image-based");
  });

  it("turns encryption failures into actionable messages", () => {
    expect(getPdfErrorMessage("invalid password for document")).toBe(
      "The PDF password is incorrect."
    );
    expect(getPdfErrorMessage("document is encrypted")).toBe(
      "This PDF is encrypted. Enter its password and try again."
    );
    expect(getPdfErrorMessage(" ")).toBe("Could not convert this PDF.");
  });
});
