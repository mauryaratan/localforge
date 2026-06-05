import {
  type CsvSplitResult,
  splitCsvTextBySize,
} from "@/lib/csv-file-splitter";

interface SplitRequest {
  fileName: string;
  id: number;
  repeatHeader: boolean;
  targetBytes: number;
  text: string;
}

type SplitResponse =
  | {
      id: number;
      progress: number;
      stage: "splitting";
      type: "progress";
    }
  | {
      id: number;
      result: CsvSplitResult;
      type: "complete";
    }
  | {
      error: string;
      id: number;
      type: "error";
    };

const postWorkerMessage = (message: SplitResponse) => {
  self.postMessage(message);
};

self.onmessage = (event: MessageEvent<SplitRequest>) => {
  const { fileName, id, repeatHeader, targetBytes, text } = event.data;

  try {
    postWorkerMessage({
      id,
      progress: 0.46,
      stage: "splitting",
      type: "progress",
    });

    const result = splitCsvTextBySize(text, {
      baseName: fileName,
      onProgress: ({ processedRows, totalRows }) => {
        const rowProgress =
          totalRows > 0 ? Math.min(processedRows / totalRows, 1) : 1;
        postWorkerMessage({
          id,
          progress: 0.46 + rowProgress * 0.5,
          stage: "splitting",
          type: "progress",
        });
      },
      repeatHeader,
      targetBytes,
    });

    postWorkerMessage({
      id,
      result,
      type: "complete",
    });
  } catch (error) {
    postWorkerMessage({
      error: error instanceof Error ? error.message : "Could not split CSV.",
      id,
      type: "error",
    });
  }
};
