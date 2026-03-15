import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  downloadQRCodeFromElement,
  fileToDataUrl,
  generateQRCodeToElement,
  readQRCodeFromFile,
} from "@/lib/qr-code";

const { easyQrCtorMock, jsQrMock } = vi.hoisted(() => ({
  easyQrCtorMock: vi.fn(),
  jsQrMock: vi.fn(),
}));

vi.mock("easyqrcodejs", () => ({
  default: class EasyQrMock {
    constructor(element: HTMLElement, options: Record<string, unknown>) {
      easyQrCtorMock(element, options);
    }
  },
}));

vi.mock("jsqr", () => ({
  default: jsQrMock,
}));

class MockFileReader {
  static shouldError = false;
  static mockResult: string | ArrayBuffer | null = "data:image/png;base64,mock";

  onload: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsDataURL(_file: File): void {
    this.result = MockFileReader.mockResult;
    queueMicrotask(() => {
      if (MockFileReader.shouldError) {
        this.onerror?.(new Event("error"));
      } else {
        this.onload?.(new Event("load"));
      }
    });
  }
}

class MockImage {
  static shouldError = false;
  static width = 2;
  static height = 2;

  onload: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  width = MockImage.width;
  height = MockImage.height;

  set src(_value: string) {
    queueMicrotask(() => {
      if (MockImage.shouldError) {
        this.onerror?.(new Event("error"));
      } else {
        this.onload?.(new Event("load"));
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

describe("qr-code integration", () => {
  const OriginalFileReader = globalThis.FileReader;
  const OriginalImage = globalThis.Image;
  const OriginalImageData = globalThis.ImageData;

  beforeEach(() => {
    easyQrCtorMock.mockReset();
    jsQrMock.mockReset();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      () => undefined
    );
    MockFileReader.shouldError = false;
    MockImage.shouldError = false;
    MockFileReader.mockResult = "data:image/png;base64,mock";
    (globalThis as unknown as { FileReader: typeof FileReader }).FileReader =
      MockFileReader as unknown as typeof FileReader;
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
    (globalThis as unknown as { FileReader: typeof FileReader }).FileReader =
      OriginalFileReader;
    (globalThis as unknown as { Image: typeof Image }).Image = OriginalImage;
    (
      globalThis as unknown as {
        ImageData: typeof ImageData;
      }
    ).ImageData = OriginalImageData;
  });

  describe("generateQRCodeToElement", () => {
    it("returns validation error for empty content", async () => {
      const element = document.createElement("div");
      const result = await generateQRCodeToElement(element, "   ");
      expect(result).toEqual({ success: false, error: "Content is required" });
      expect(easyQrCtorMock).not.toHaveBeenCalled();
    });

    it("generates QR and maps advanced options", async () => {
      easyQrCtorMock.mockImplementation((_element, options) => {
        options.onRenderingEnd?.(options, "data:image/png;base64,ok");
      });

      const element = document.createElement("div");
      element.innerHTML = "<span>old</span>";

      const result = await generateQRCodeToElement(element, "hello", {
        errorCorrectionLevel: "H",
        width: 320,
        quietZone: 4,
        foreground: "#111111",
        background: "#eeeeee",
        dotScale: 0.7,
        positionOuterColor: "#ff0000",
        positionInnerColor: "#00ff00",
        logoUrl: "https://example.com/logo.png",
        logoWidth: 32,
        logoHeight: 28,
        logoBackgroundTransparent: false,
      });

      expect(result).toEqual({
        success: true,
        dataUrl: "data:image/png;base64,ok",
      });
      expect(element.innerHTML).toBe("");
      expect(easyQrCtorMock).toHaveBeenCalledTimes(1);

      const options = easyQrCtorMock.mock.calls[0][1] as Record<
        string,
        unknown
      >;
      expect(options.text).toBe("hello");
      expect(options.width).toBe(320);
      expect(options.height).toBe(320);
      expect(options.correctLevel).toBe(2);
      expect(options.quietZone).toBe(4);
      expect(options.colorDark).toBe("#111111");
      expect(options.colorLight).toBe("#eeeeee");
      expect(options.dotScale).toBe(0.7);
      expect(options.PO).toBe("#ff0000");
      expect(options.PI).toBe("#00ff00");
      expect(options.logo).toBe("https://example.com/logo.png");
      expect(options.logoWidth).toBe(32);
      expect(options.logoHeight).toBe(28);
      expect(options.logoBackgroundTransparent).toBe(false);
      expect(typeof options.onRenderingEnd).toBe("function");
    });

    it("returns error when renderer callback has no data URL", async () => {
      easyQrCtorMock.mockImplementation((_element, options) => {
        options.onRenderingEnd?.(options, null);
      });
      const element = document.createElement("div");

      const result = await generateQRCodeToElement(element, "hello");
      expect(result).toEqual({
        success: false,
        error: "Failed to generate QR code",
      });
    });

    it("returns error when QR constructor throws", async () => {
      easyQrCtorMock.mockImplementation(() => {
        throw new Error("boom");
      });
      const element = document.createElement("div");

      const result = await generateQRCodeToElement(element, "hello");
      expect(result).toEqual({ success: false, error: "boom" });
    });
  });

  describe("downloadQRCodeFromElement", () => {
    it("returns false when canvas is missing", async () => {
      const element = document.createElement("div");
      const success = await downloadQRCodeFromElement(element);
      expect(success).toBe(false);
    });

    it("downloads png from canvas element", async () => {
      const element = document.createElement("div");
      const canvas = document.createElement("canvas");
      const toDataUrlMock = vi.fn(() => "data:image/png;base64,qr");
      Object.defineProperty(canvas, "toDataURL", { value: toDataUrlMock });
      element.appendChild(canvas);

      const appendSpy = vi.spyOn(document.body, "appendChild");
      const removeSpy = vi.spyOn(document.body, "removeChild");

      const success = await downloadQRCodeFromElement(element, "custom-name");

      expect(success).toBe(true);
      expect(toDataUrlMock).toHaveBeenCalledWith("image/png");
      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
    });

    it("returns false when canvas serialization throws", async () => {
      const element = document.createElement("div");
      const canvas = document.createElement("canvas");
      Object.defineProperty(canvas, "toDataURL", {
        value: vi.fn(() => {
          throw new Error("canvas fail");
        }),
      });
      element.appendChild(canvas);

      const success = await downloadQRCodeFromElement(element);
      expect(success).toBe(false);
    });
  });

  describe("readQRCodeFromFile", () => {
    it("reads QR data and detects content type", async () => {
      jsQrMock.mockReturnValue({ data: "https://example.com" });
      vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
        drawImage: vi.fn(),
        getImageData: vi.fn(
          () => new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1)
        ),
      } as unknown as CanvasRenderingContext2D);

      const file = new File(["x"], "qr.png", { type: "image/png" });
      const result = await readQRCodeFromFile(file);

      expect(result).toEqual({
        success: true,
        data: "https://example.com",
        contentType: "url",
      });
      expect(jsQrMock).toHaveBeenCalledTimes(1);
    });

    it("returns error when no QR is detected", async () => {
      jsQrMock.mockReturnValue(null);
      vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
        drawImage: vi.fn(),
        getImageData: vi.fn(
          () => new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1)
        ),
      } as unknown as CanvasRenderingContext2D);

      const file = new File(["x"], "qr.png", { type: "image/png" });
      const result = await readQRCodeFromFile(file);

      expect(result).toEqual({
        success: false,
        error: "No QR code found in image",
      });
    });

    it("returns error when canvas context cannot be created", async () => {
      vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

      const file = new File(["x"], "qr.png", { type: "image/png" });
      const result = await readQRCodeFromFile(file);

      expect(result).toEqual({
        success: false,
        error: "Failed to create canvas context",
      });
    });

    it("returns error when image loading fails", async () => {
      MockImage.shouldError = true;

      const file = new File(["x"], "qr.png", { type: "image/png" });
      const result = await readQRCodeFromFile(file);

      expect(result).toEqual({ success: false, error: "Failed to load image" });
    });

    it("returns error when file reading fails", async () => {
      MockFileReader.shouldError = true;

      const file = new File(["x"], "qr.png", { type: "image/png" });
      const result = await readQRCodeFromFile(file);

      expect(result).toEqual({ success: false, error: "Failed to read file" });
    });
  });

  describe("fileToDataUrl", () => {
    it("resolves with file reader result", async () => {
      MockFileReader.mockResult = "data:image/png;base64,xyz";
      const file = new File(["x"], "logo.png", { type: "image/png" });
      await expect(fileToDataUrl(file)).resolves.toBe(
        "data:image/png;base64,xyz"
      );
    });

    it("rejects on reader error", async () => {
      MockFileReader.shouldError = true;
      const file = new File(["x"], "logo.png", { type: "image/png" });
      await expect(fileToDataUrl(file)).rejects.toBeDefined();
    });
  });
});
