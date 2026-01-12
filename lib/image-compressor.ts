// Image compression library using pixo WASM via Web Worker
// Based on https://github.com/leerob/pixo/tree/main/web/src/lib

export type EncodeFormat = "png" | "jpeg";
export type PresetLevel = 0 | 1 | 2;
export type ResizeAlgorithm = "nearest" | "bilinear" | "lanczos3";

export type ResizeOptions = {
  width: number;
  height: number;
  algorithm?: ResizeAlgorithm;
  maintainAspectRatio?: boolean;
};

export type CompressOptions = {
  format: EncodeFormat;
  quality?: number;
  subsampling420?: boolean;
  hasAlpha?: boolean;
  preset?: PresetLevel;
  lossy?: boolean;
};

export type CompressResult = {
  blob: Blob;
  elapsedMs: number;
};

export type ImageJob = {
  id: string;
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  hasAlpha: boolean;
  originalUrl: string;
  imageData: ImageData;
  status: "idle" | "compressing" | "done" | "error";
  error?: string;
  result?: {
    blob: Blob;
    url: string;
    size: number;
    savings: number;
    elapsedMs: number;
    width: number;
    height: number;
  };
};

// Worker code as string - WASM_URL placeholder will be replaced
const createWorkerCode = (wasmUrl: string) => `
const WASM_URL = "${wasmUrl}";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const rgbaToRgb = (data) => {
  const rgb = new Uint8Array((data.length / 4) * 3);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    rgb[j] = data[i];
    rgb[j + 1] = data[i + 1];
    rgb[j + 2] = data[i + 2];
  }
  return rgb;
};

const algorithmToNumber = (alg) => {
  if (alg === "nearest") return 0;
  if (alg === "bilinear") return 1;
  return 2; // lanczos3
};

let wasm = null;
let wasmHelpers = null;

async function initWasm() {
  if (wasm) return;
  
  const response = await fetch(WASM_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch WASM: " + response.status);
  }
  const bytes = await response.arrayBuffer();
  
  // WASM memory management
  let heap = new Array(128).fill(undefined);
  heap.push(undefined, null, true, false);
  let heap_next = heap.length;
  let WASM_VECTOR_LEN = 0;
  let cachedUint8ArrayMemory = null;
  let cachedDataViewMemory = null;
  
  function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
  }
  
  function getObject(idx) { return heap[idx]; }
  
  function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
  }
  
  function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
  }
  
  function getUint8ArrayMemory() {
    if (cachedUint8ArrayMemory === null || cachedUint8ArrayMemory.byteLength === 0) {
      cachedUint8ArrayMemory = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory;
  }
  
  function getDataViewMemory() {
    if (cachedDataViewMemory === null || cachedDataViewMemory.buffer.detached === true || 
        (cachedDataViewMemory.buffer.detached === undefined && cachedDataViewMemory.buffer !== wasm.memory.buffer)) {
      cachedDataViewMemory = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory;
  }
  
  function passArray8ToWasm(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
  }
  
  function getArrayU8FromWasm(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory().subarray(ptr / 1, ptr / 1 + len);
  }
  
  const textDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
  textDecoder.decode();
  
  function getStringFromWasm(ptr, len) {
    ptr = ptr >>> 0;
    return textDecoder.decode(getUint8ArrayMemory().subarray(ptr, ptr + len));
  }
  
  const imports = {
    wbg: {
      __wbg_Error_52673b7de5a0ca89: function(arg0, arg1) {
        const ret = Error(getStringFromWasm(arg0, arg1));
        return addHeapObject(ret);
      }
    }
  };
  
  const { instance } = await WebAssembly.instantiate(bytes, imports);
  wasm = instance.exports;
  
  // Store helpers separately
  wasmHelpers = {
    passArray8ToWasm,
    getArrayU8FromWasm,
    getDataViewMemory,
    takeObject,
    getWasmVectorLen: () => WASM_VECTOR_LEN
  };
}

function encodePng(data, width, height, colorType, preset, lossy) {
  const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
  const ptr0 = wasmHelpers.passArray8ToWasm(data, wasm.__wbindgen_export);
  const len0 = wasmHelpers.getWasmVectorLen();
  wasm.encodePng(retptr, ptr0, len0, width, height, colorType, preset, lossy);
  const r0 = wasmHelpers.getDataViewMemory().getInt32(retptr + 0, true);
  const r1 = wasmHelpers.getDataViewMemory().getInt32(retptr + 4, true);
  const r2 = wasmHelpers.getDataViewMemory().getInt32(retptr + 8, true);
  const r3 = wasmHelpers.getDataViewMemory().getInt32(retptr + 12, true);
  wasm.__wbindgen_add_to_stack_pointer(16);
  if (r3) throw wasmHelpers.takeObject(r2);
  const result = wasmHelpers.getArrayU8FromWasm(r0, r1).slice();
  wasm.__wbindgen_export2(r0, r1 * 1, 1);
  return result;
}

function encodeJpeg(data, width, height, colorType, quality, preset, subsampling420) {
  const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
  const ptr0 = wasmHelpers.passArray8ToWasm(data, wasm.__wbindgen_export);
  const len0 = wasmHelpers.getWasmVectorLen();
  wasm.encodeJpeg(retptr, ptr0, len0, width, height, colorType, quality, preset, subsampling420);
  const r0 = wasmHelpers.getDataViewMemory().getInt32(retptr + 0, true);
  const r1 = wasmHelpers.getDataViewMemory().getInt32(retptr + 4, true);
  const r2 = wasmHelpers.getDataViewMemory().getInt32(retptr + 8, true);
  const r3 = wasmHelpers.getDataViewMemory().getInt32(retptr + 12, true);
  wasm.__wbindgen_add_to_stack_pointer(16);
  if (r3) throw wasmHelpers.takeObject(r2);
  const result = wasmHelpers.getArrayU8FromWasm(r0, r1).slice();
  wasm.__wbindgen_export2(r0, r1 * 1, 1);
  return result;
}

function resizeImageWasm(data, srcW, srcH, dstW, dstH, colorType, algorithm) {
  const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
  const ptr0 = wasmHelpers.passArray8ToWasm(data, wasm.__wbindgen_export);
  const len0 = wasmHelpers.getWasmVectorLen();
  wasm.resizeImage(retptr, ptr0, len0, srcW, srcH, dstW, dstH, colorType, algorithm);
  const r0 = wasmHelpers.getDataViewMemory().getInt32(retptr + 0, true);
  const r1 = wasmHelpers.getDataViewMemory().getInt32(retptr + 4, true);
  const r2 = wasmHelpers.getDataViewMemory().getInt32(retptr + 8, true);
  const r3 = wasmHelpers.getDataViewMemory().getInt32(retptr + 12, true);
  wasm.__wbindgen_add_to_stack_pointer(16);
  if (r3) throw wasmHelpers.takeObject(r2);
  const result = wasmHelpers.getArrayU8FromWasm(r0, r1).slice();
  wasm.__wbindgen_export2(r0, r1 * 1, 1);
  return result;
}

self.onmessage = async (e) => {
  const { id, type, width, height, data, options } = e.data;
  
  try {
    await initWasm();
    
    if (type === "compress") {
      const imageData = new Uint8ClampedArray(data);
      const t0 = performance.now();
      let bytes, mime;
      
      if (options.format === "png") {
        const useRgb = options.hasAlpha === false;
        const colorType = useRgb ? 2 : 3;
        const pixelData = useRgb ? rgbaToRgb(imageData) : new Uint8Array(imageData);
        bytes = encodePng(pixelData, width, height, colorType, options.preset ?? 1, options.lossy ?? true);
        mime = "image/png";
      } else {
        const quality = clamp(options.quality ?? 85, 1, 100);
        const rgb = rgbaToRgb(imageData);
        bytes = encodeJpeg(rgb, width, height, 2, quality, options.preset ?? 1, options.subsampling420 ?? true);
        mime = "image/jpeg";
      }
      
      const blob = new Blob([bytes], { type: mime });
      const elapsedMs = performance.now() - t0;
      
      self.postMessage({ id, success: true, result: { blob, elapsedMs } });
    } else if (type === "resize") {
      let targetW = options.width;
      let targetH = options.height;
      
      if (options.maintainAspectRatio) {
        const ar = width / height;
        const tar = targetW / targetH;
        if (ar > tar) targetH = Math.round(targetW / ar);
        else targetW = Math.round(targetH * ar);
      }
      
      targetW = Math.max(1, targetW);
      targetH = Math.max(1, targetH);
      
      const resizedData = resizeImageWasm(
        new Uint8Array(data), width, height, targetW, targetH, 3, algorithmToNumber(options.algorithm)
      );
      
      self.postMessage(
        { id, success: true, result: { width: targetW, height: targetH, data: resizedData.buffer } },
        [resizedData.buffer]
      );
    }
  } catch (error) {
    self.postMessage({ id, success: false, error: error.message || String(error) });
  }
};
`;

// Worker instance and message handling
let worker: Worker | null = null;
let msgId = 0;
const pending = new Map<
  string,
  { resolve: (v: unknown) => void; reject: (e: Error) => void }
>();

function getWorker(): Worker {
  if (!worker && typeof window !== "undefined") {
    // Build absolute URL for WASM file
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const wasmUrl = new URL(
      `${basePath}/pixo-wasm/pixo_bg.wasm`,
      window.location.origin
    ).href;
    const code = createWorkerCode(wasmUrl);
    const blob = new Blob([code], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    worker = new Worker(url);

    worker.onmessage = (e) => {
      const { id, success, result, error } = e.data;
      const p = pending.get(id);
      if (p) {
        pending.delete(id);
        if (success) {
          if (result.data instanceof ArrayBuffer) {
            // Resize result
            p.resolve(
              new ImageData(
                new Uint8ClampedArray(result.data),
                result.width,
                result.height
              )
            );
          } else {
            p.resolve(result);
          }
        } else {
          p.reject(new Error(error));
        }
      }
    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      pending.forEach(({ reject }) => reject(new Error("Worker crashed")));
      pending.clear();
      worker = null;
    };
  }
  return worker!;
}

export const compressImage = (
  imageData: ImageData,
  options: CompressOptions
): Promise<CompressResult> => {
  return new Promise((resolve, reject) => {
    const id = `c${++msgId}`;
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    const buffer = imageData.data.buffer.slice(0);
    getWorker().postMessage(
      {
        id,
        type: "compress",
        width: imageData.width,
        height: imageData.height,
        data: buffer,
        options,
      },
      [buffer]
    );
  });
};

export const resizeImage = (
  imageData: ImageData,
  options: ResizeOptions
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const id = `r${++msgId}`;
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    const buffer = imageData.data.buffer.slice(0);
    getWorker().postMessage(
      {
        id,
        type: "resize",
        width: imageData.width,
        height: imageData.height,
        data: buffer,
        options,
      },
      [buffer]
    );
  });
};

export const detectAlpha = (data: Uint8ClampedArray): boolean => {
  const len = data.length;
  const step = len > 400_000 ? Math.floor(len / 40_000) * 4 : 4;
  for (let i = 3; i < len; i += step) {
    if (data[i] !== 255) return true;
  }
  return false;
};

export const decodeFile = async (
  file: File
): Promise<{
  imageData: ImageData;
  width: number;
  height: number;
  hasAlpha: boolean;
}> => {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const imageData = ctx.getImageData(0, 0, width, height);
  return { imageData, width, height, hasAlpha: detectAlpha(imageData.data) };
};

export const formatBytes = (b: number): string => {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const e = Math.min(Math.floor(Math.log(b) / Math.log(1024)), u.length - 1);
  const v = b / 1024 ** e;
  return `${v.toFixed(v >= 10 || v % 1 === 0 ? 0 : 1)} ${u[e]}`;
};

export const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg"];
export const isFileSupported = (f: File): boolean =>
  ACCEPTED_MIME_TYPES.includes(f.type);
