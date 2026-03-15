import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LOGO_CONFIG,
  downloadFile,
  downloadPNG,
  downloadSVG,
  imageToDataUrl,
  loadConfig,
  STORAGE_KEY,
  saveConfig,
  svgToPng,
} from "@/lib/logo-maker";

class MockImage {
  static shouldError = false;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

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

class MockFileReader {
  static shouldError = false;
  static result: string | ArrayBuffer | null = "data:image/png;base64,file";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsDataURL(_file: File): void {
    this.result = MockFileReader.result;
    queueMicrotask(() => {
      if (MockFileReader.shouldError) {
        this.onerror?.();
      } else {
        this.onload?.();
      }
    });
  }
}

describe("logo-maker browser helpers", () => {
  const OriginalImage = globalThis.Image;
  const OriginalFileReader = globalThis.FileReader;

  beforeEach(() => {
    MockImage.shouldError = false;
    MockFileReader.shouldError = false;
    MockFileReader.result = "data:image/png;base64,file";

    (globalThis as unknown as { Image: typeof Image }).Image =
      MockImage as unknown as typeof Image;
    (globalThis as unknown as { FileReader: typeof FileReader }).FileReader =
      MockFileReader as unknown as typeof FileReader;
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key);
      }),
      clear: vi.fn(() => {
        store.clear();
      }),
      key: vi.fn(),
      get length() {
        return store.size;
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (globalThis as unknown as { Image: typeof Image }).Image = OriginalImage;
    (globalThis as unknown as { FileReader: typeof FileReader }).FileReader =
      OriginalFileReader;
    vi.unstubAllGlobals();
  });

  it("converts SVG to PNG data URL", async () => {
    const ctx = { drawImage: vi.fn() } as unknown as CanvasRenderingContext2D;
    const originalCreateElement = document.createElement.bind(document);
    const canvas = originalCreateElement("canvas");
    Object.defineProperty(canvas, "getContext", {
      value: vi.fn(() => ctx),
    });
    Object.defineProperty(canvas, "toDataURL", {
      value: vi.fn(() => "data:image/png;base64,png"),
    });
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string) => {
        if (tagName === "canvas") {
          return canvas;
        }
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      }
    );

    const createObjectUrlSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:svg");
    const revokeSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);

    const png = await svgToPng("<svg/>", 128);
    expect(png).toBe("data:image/png;base64,png");
    expect(canvas.width).toBe(128);
    expect(canvas.height).toBe(128);
    expect(createObjectUrlSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith("blob:svg");
  });

  it("rejects when canvas context is unavailable", async () => {
    const originalCreateElement = document.createElement.bind(document);
    const canvas = originalCreateElement("canvas");
    Object.defineProperty(canvas, "getContext", {
      value: vi.fn(() => null),
    });
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string) => {
        if (tagName === "canvas") {
          return canvas;
        }
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      }
    );

    await expect(svgToPng("<svg/>", 64)).rejects.toThrow(
      "Could not get canvas context"
    );
  });

  it("rejects when SVG image loading fails", async () => {
    MockImage.shouldError = true;
    const ctx = { drawImage: vi.fn() } as unknown as CanvasRenderingContext2D;
    const originalCreateElement = document.createElement.bind(document);
    const canvas = originalCreateElement("canvas");
    Object.defineProperty(canvas, "getContext", {
      value: vi.fn(() => ctx),
    });
    Object.defineProperty(canvas, "toDataURL", {
      value: vi.fn(() => "data:image/png;base64,png"),
    });
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string) => {
        if (tagName === "canvas") {
          return canvas;
        }
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      }
    );
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:svg");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    await expect(svgToPng("<svg/>", 64)).rejects.toThrow("Failed to load SVG");
  });

  it("creates and clicks a download link", () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string) => {
        if (tagName === "a") {
          const anchor = originalCreateElement("a");
          Object.defineProperty(anchor, "click", { value: clickSpy });
          return anchor;
        }
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      }
    );

    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(document.body, "removeChild");

    downloadFile("data:text/plain,hello", "file.txt");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });

  it("downloads SVG via object URL and revokes it", () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string) => {
        if (tagName === "a") {
          const anchor = originalCreateElement("a");
          Object.defineProperty(anchor, "click", { value: clickSpy });
          return anchor;
        }
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      }
    );

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:svg");
    const revokeSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);

    downloadSVG("<svg/>", "logo.svg");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).toHaveBeenCalledWith("blob:svg");
  });

  it("downloads PNG by converting from SVG first", async () => {
    const clickSpy = vi.fn();
    const ctx = { drawImage: vi.fn() } as unknown as CanvasRenderingContext2D;

    const originalCreateElement = document.createElement.bind(document);
    const canvas = originalCreateElement("canvas");
    Object.defineProperty(canvas, "getContext", {
      value: vi.fn(() => ctx),
    });
    Object.defineProperty(canvas, "toDataURL", {
      value: vi.fn(() => "data:image/png;base64,png"),
    });
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string) => {
        if (tagName === "canvas") {
          return canvas;
        }
        if (tagName === "a") {
          const anchor = originalCreateElement("a");
          Object.defineProperty(anchor, "click", { value: clickSpy });
          return anchor;
        }
        return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
      }
    );

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:svg");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    await downloadPNG("<svg/>", 128, "logo.png");
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("reads image files as data URLs", async () => {
    const file = new File(["data"], "logo.png", { type: "image/png" });
    await expect(imageToDataUrl(file)).resolves.toBe(
      "data:image/png;base64,file"
    );
  });

  it("rejects when image file reading fails", async () => {
    MockFileReader.shouldError = true;
    const file = new File(["data"], "logo.png", { type: "image/png" });
    await expect(imageToDataUrl(file)).rejects.toBeUndefined();
  });

  it("saves config but strips large inline image payloads", () => {
    const setItemSpy = vi.spyOn(localStorage, "setItem");
    const config = {
      ...DEFAULT_LOGO_CONFIG,
      icon: {
        ...DEFAULT_LOGO_CONFIG.icon,
        type: "image" as const,
        value: "data:image/png;base64,very-large-inline-data",
      },
    };

    saveConfig(config);

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    const savedJson = setItemSpy.mock.calls[0][1];
    const parsed = JSON.parse(savedJson) as typeof config;
    expect(parsed.icon.type).toBe("icon");
    expect(parsed.icon.value).toBe("star");
  });

  it("ignores save errors when storage is unavailable", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(() => saveConfig(DEFAULT_LOGO_CONFIG)).not.toThrow();
  });

  it("loads valid config from storage", () => {
    const config = {
      ...DEFAULT_LOGO_CONFIG,
      canvasSize: 256,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    expect(loadConfig()).toEqual(config);
  });

  it("returns null when stored config is invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{ bad json");
    expect(loadConfig()).toBeNull();
  });

  it("returns null when storage read throws", () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(loadConfig()).toBeNull();
  });
});
