import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class WorkerMock {
  static instances: WorkerMock[] = [];

  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  posted: Array<Record<string, unknown>> = [];

  constructor(public url: string) {
    WorkerMock.instances.push(this);
  }

  postMessage(message: Record<string, unknown>, _transfer?: Transferable[]): void {
    this.posted.push(message);
  }

  emitMessage(data: Record<string, unknown>): void {
    this.onmessage?.({ data } as MessageEvent);
  }

  emitError(): void {
    this.onerror?.({} as ErrorEvent);
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

describe("image-compressor worker integration", () => {
  const OriginalImageData = globalThis.ImageData;

  beforeEach(() => {
    WorkerMock.instances = [];
    vi.resetModules();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("Worker", WorkerMock as unknown as typeof Worker);
    vi.stubGlobal("ImageData", MockImageData as unknown as typeof ImageData);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:worker");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    (
      globalThis as unknown as {
        ImageData: typeof ImageData;
      }
    ).ImageData = OriginalImageData;
  });

  it("compresses image data through worker messaging", async () => {
    const { compressImage } = await import("@/lib/image-compressor");
    const imageData = new ImageData(new Uint8ClampedArray([10, 20, 30, 255]), 1, 1);

    const promise = compressImage(imageData, { format: "png" });
    const worker = WorkerMock.instances[0];
    const posted = worker.posted[0];
    worker.emitMessage({
      id: posted.id as string,
      success: true,
      result: { blob: new Blob(["png"], { type: "image/png" }), elapsedMs: 7 },
    });

    await expect(promise).resolves.toEqual({
      blob: expect.any(Blob),
      elapsedMs: 7,
    });
    expect(posted.type).toBe("compress");
    expect(posted.width).toBe(1);
    expect(posted.height).toBe(1);
  });

  it("resizes image data through worker messaging", async () => {
    const { resizeImage } = await import("@/lib/image-compressor");
    const imageData = new ImageData(new Uint8ClampedArray([10, 20, 30, 255]), 1, 1);

    const promise = resizeImage(imageData, {
      width: 2,
      height: 1,
      maintainAspectRatio: false,
    });
    const worker = WorkerMock.instances[0];
    const posted = worker.posted[0];
    const outBuffer = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 0, 255, 255,
    ]).buffer;

    worker.emitMessage({
      id: posted.id as string,
      success: true,
      result: { width: 2, height: 1, data: outBuffer },
    });

    const resized = await promise;
    expect(resized.width).toBe(2);
    expect(resized.height).toBe(1);
    expect(Array.from(resized.data)).toEqual([255, 0, 0, 255, 0, 0, 255, 255]);
    expect(posted.type).toBe("resize");
  });

  it("rejects when worker reports operation error", async () => {
    const { compressImage } = await import("@/lib/image-compressor");
    const imageData = new ImageData(new Uint8ClampedArray([1, 2, 3, 255]), 1, 1);
    const promise = compressImage(imageData, { format: "jpeg", quality: 80 });

    const worker = WorkerMock.instances[0];
    const posted = worker.posted[0];
    worker.emitMessage({
      id: posted.id as string,
      success: false,
      error: "codec failed",
    });

    await expect(promise).rejects.toThrow("codec failed");
  });

  it("rejects pending jobs when worker crashes", async () => {
    const { resizeImage } = await import("@/lib/image-compressor");
    const imageData = new ImageData(new Uint8ClampedArray([1, 2, 3, 255]), 1, 1);
    const promise = resizeImage(imageData, { width: 1, height: 1 });

    const worker = WorkerMock.instances[0];
    worker.emitError();

    await expect(promise).rejects.toThrow("Worker crashed");
  });

  it("decodes file to image data with alpha metadata", async () => {
    const { decodeFile } = await import("@/lib/image-compressor");
    const bitmap = { width: 2, height: 1, close: vi.fn() };

    vi.stubGlobal("createImageBitmap", vi.fn(async () => bitmap));

    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(
        () =>
          new ImageData(
            new Uint8ClampedArray([
              0, 0, 0, 255, // opaque
              0, 0, 0, 128, // transparent
            ]),
            2,
            1
          )
      ),
    } as unknown as CanvasRenderingContext2D;

    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ctx),
    } as unknown as HTMLCanvasElement;

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return canvas as unknown as HTMLElement;
      }
      return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
    });

    const file = new File(["x"], "input.png", { type: "image/png" });
    const result = await decodeFile(file);

    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    expect(result.hasAlpha).toBe(true);
    expect(bitmap.close).toHaveBeenCalledTimes(1);
  });
});
