import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  convertImageToAscii,
  copyAsciiToClipboard,
  downloadAsciiArt,
  imageDataToAscii,
  imageDataToColoredHtml,
  loadImageFromDataUrl,
  loadImageFromFile,
  scaleImageData,
  type ConversionOptions,
  DEFAULT_OPTIONS,
} from "@/lib/ascii-art";

class MockImage {
  static shouldError = false;
  static width = 2;
  static height = 1;

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = MockImage.width;
  height = MockImage.height;

  set src(_value: string) {
    queueMicrotask(() => {
      if (MockImage.shouldError) {
        this.onerror?.();
      } else {
        this.onload?.();
      }
    });
  }
}

class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
}

type CanvasContextMock = {
  drawImage?: ReturnType<typeof vi.fn>;
  getImageData?: ReturnType<typeof vi.fn>;
  putImageData?: ReturnType<typeof vi.fn>;
  imageSmoothingEnabled?: boolean;
  imageSmoothingQuality?: "low" | "medium" | "high";
};

const installCanvasMocks = (
  targetContext: CanvasContextMock | null,
  tempContext: CanvasContextMock | null
) => {
  const originalCreateElement = document.createElement.bind(document);
  let canvasCalls = 0;

  vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
    if (tagName !== "canvas") {
      return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
    }

    canvasCalls++;
    const context = canvasCalls % 2 === 1 ? targetContext : tempContext;
    return {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
    } as unknown as HTMLElement;
  });
};

const buildOptions = (
  overrides: Partial<ConversionOptions> = {}
): ConversionOptions => ({
  ...DEFAULT_OPTIONS,
  width: 2,
  ...overrides,
});

const restoreOwnProperty = (
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor | undefined
) => {
  if (descriptor) {
    Object.defineProperty(target, propertyKey, descriptor);
    return;
  }

  Reflect.deleteProperty(target, propertyKey);
};

describe("ascii-art image pipeline", () => {
  const OriginalImage = globalThis.Image;
  const OriginalImageData = globalThis.ImageData;
  const OriginalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  const OriginalExecCommandDescriptor = Object.getOwnPropertyDescriptor(
    document,
    "execCommand"
  );

  beforeEach(() => {
    MockImage.shouldError = false;
    MockImage.width = 2;
    MockImage.height = 1;
    (globalThis as unknown as { Image: typeof Image }).Image =
      MockImage as unknown as typeof Image;
    (
      globalThis as unknown as {
        ImageData: typeof ImageData;
      }
    ).ImageData = MockImageData as unknown as typeof ImageData;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreOwnProperty(navigator, "clipboard", OriginalClipboardDescriptor);
    restoreOwnProperty(document, "execCommand", OriginalExecCommandDescriptor);
    (globalThis as unknown as { Image: typeof Image }).Image = OriginalImage;
    (
      globalThis as unknown as {
        ImageData: typeof ImageData;
      }
    ).ImageData = OriginalImageData;
  });

  it("loads image data from a file", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:file");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(
        () =>
          new ImageData(
            new Uint8ClampedArray([
              255, 255, 255, 255,
              0, 0, 0, 255,
            ]),
            2,
            1
          )
      ),
    };
    installCanvasMocks(ctx, ctx);

    const file = new File(["x"], "image.png", { type: "image/png" });
    const result = await loadImageFromFile(file);

    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    expect(result.imageData.width).toBe(2);
    expect(revokeSpy).toHaveBeenCalledWith("blob:file");
  });

  it("fails loading file when canvas context is unavailable", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:file");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    installCanvasMocks(null, null);

    const file = new File(["x"], "image.png", { type: "image/png" });
    await expect(loadImageFromFile(file)).rejects.toThrow("Could not get canvas context");
  });

  it("fails loading file when image decode fails", async () => {
    MockImage.shouldError = true;
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:file");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    const file = new File(["x"], "image.png", { type: "image/png" });
    await expect(loadImageFromFile(file)).rejects.toThrow("Failed to load image");
  });

  it("loads image data from data URL", async () => {
    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(
        () => new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1)
      ),
    };
    installCanvasMocks(ctx, ctx);

    const result = await loadImageFromDataUrl("data:image/png;base64,test");
    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
  });

  it("fails loading data URL when image decode fails", async () => {
    MockImage.shouldError = true;
    await expect(loadImageFromDataUrl("data:image/png;base64,test")).rejects.toThrow(
      "Failed to load image"
    );
  });

  it("scales image data with preserved aspect ratio", () => {
    const targetCtx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(
        (_x: number, _y: number, width: number, height: number) =>
          new ImageData(new Uint8ClampedArray(width * height * 4).fill(255), width, height)
      ),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low" as const,
    };
    const tempCtx = { putImageData: vi.fn() };
    installCanvasMocks(targetCtx, tempCtx);

    const src = new ImageData(new Uint8ClampedArray(4 * 4 * 4).fill(255), 4, 4);
    const scaled = scaleImageData(src, 8, true);

    expect(scaled.width).toBe(8);
    expect(scaled.height).toBe(4);
    expect(targetCtx.drawImage).toHaveBeenCalledTimes(1);
    expect(tempCtx.putImageData).toHaveBeenCalledTimes(1);
  });

  it("throws when scaled canvas context cannot be created", () => {
    installCanvasMocks(null, null);
    const src = new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1);
    expect(() => scaleImageData(src, 4, true)).toThrow("Could not get canvas context");
  });

  it("throws when temporary canvas context cannot be created", () => {
    const targetCtx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(
        (_x: number, _y: number, width: number, height: number) =>
          new ImageData(new Uint8ClampedArray(width * height * 4).fill(255), width, height)
      ),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low" as const,
    };
    installCanvasMocks(targetCtx, null);

    const src = new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1);
    expect(() => scaleImageData(src, 4, true)).toThrow(
      "Could not get temp canvas context"
    );
  });

  it("renders plain ASCII output", () => {
    const targetCtx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(
        () =>
          new ImageData(
            new Uint8ClampedArray([
              255, 255, 255, 255, // white -> lightest char
              0, 0, 0, 255, // black -> darkest char
            ]),
            2,
            1
          )
      ),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low" as const,
    };
    const tempCtx = { putImageData: vi.fn() };
    installCanvasMocks(targetCtx, tempCtx);

    const src = new ImageData(new Uint8ClampedArray(2 * 4).fill(255), 2, 1);
    const output = imageDataToAscii(src, buildOptions({ characterSet: "minimal" }));

    expect(output).toHaveLength(2);
  });

  it("renders colored and grayscale HTML output", () => {
    const targetCtx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(
        () =>
          new ImageData(
            new Uint8ClampedArray([
              255, 0, 0, 255,
              0, 255, 0, 255,
            ]),
            2,
            1
          )
      ),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low" as const,
    };
    const tempCtx = { putImageData: vi.fn() };
    installCanvasMocks(targetCtx, tempCtx);

    const src = new ImageData(new Uint8ClampedArray(2 * 4).fill(255), 2, 1);
    const colorHtml = imageDataToColoredHtml(src, buildOptions({ colorMode: "color" }));
    expect(colorHtml).toContain('<span style="color:rgb(');
    expect(colorHtml).toContain("</span>");

    const grayHtml = imageDataToColoredHtml(
      src,
      buildOptions({ colorMode: "grayscale" })
    );
    expect(grayHtml).toContain('<span style="color:rgb(');

    const monoHtml = imageDataToColoredHtml(
      src,
      buildOptions({ colorMode: "monochrome" })
    );
    expect(monoHtml).not.toContain("<span");
  });

  it("converts file to full ASCII pipeline output", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:file");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(
        (_x?: number, _y?: number, width = 2, height = 1) =>
          new ImageData(
            new Uint8ClampedArray(width * height * 4).fill(255),
            width,
            height
          )
      ),
      putImageData: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low" as const,
    };
    installCanvasMocks(ctx, ctx);

    const file = new File(["x"], "image.png", { type: "image/png" });
    const monochrome = await convertImageToAscii(
      file,
      buildOptions({ colorMode: "monochrome", width: 10 })
    );
    expect(monochrome.html).toBe(monochrome.ascii);
    expect(monochrome.dimensions.width).toBe(10);

    const color = await convertImageToAscii(file, buildOptions({ colorMode: "color" }));
    expect(color.html).toContain("<span");
  });

  it("downloads ASCII output as a text file", () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        const anchor = originalCreateElement("a");
        Object.defineProperty(anchor, "click", { value: clickSpy });
        return anchor;
      }
      return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
    });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:ascii");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    downloadAsciiArt("hello", "out.txt");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).toHaveBeenCalledWith("blob:ascii");
  });

  it("copies using clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    await expect(copyAsciiToClipboard("hello")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to execCommand clipboard copy", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => true),
    });

    await expect(copyAsciiToClipboard("hello")).resolves.toBe(true);
  });

  it("returns false when fallback copy fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => {
        throw new Error("copy failed");
      }),
    });

    await expect(copyAsciiToClipboard("hello")).resolves.toBe(false);
  });
});
