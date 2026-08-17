import init, { processPdf, version } from "@firecrawl/pdf-inspector-wasm";
import type {
  PdfInspectionResult,
  PdfWorkerRequest,
  PdfWorkerResponse,
} from "@/lib/pdf-to-markdown";

let enginePromise: ReturnType<typeof init> | null = null;

const postWorkerMessage = (message: PdfWorkerResponse) => {
  self.postMessage(message);
};

const loadEngine = () => {
  enginePromise ??= init();
  return enginePromise;
};

self.onmessage = async (event: MessageEvent<PdfWorkerRequest>) => {
  const { buffer, id, options } = event.data;

  try {
    postWorkerMessage({ id, stage: "loading-engine", type: "progress" });
    await loadEngine();
    postWorkerMessage({ id, stage: "converting", type: "progress" });

    const result = processPdf(
      new Uint8Array(buffer),
      options
    ) as PdfInspectionResult;

    postWorkerMessage({
      engineVersion: version(),
      id,
      result,
      type: "complete",
    });
  } catch (error) {
    postWorkerMessage({
      error: error instanceof Error ? error.message : String(error),
      id,
      type: "error",
    });
  }
};
