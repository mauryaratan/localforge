const textEncoder = new TextEncoder();
const FILE_EXTENSION_REGEX = /\.[^.]+$/;
const SAFE_FILE_NAME_REGEX = /[^a-zA-Z0-9._-]+/g;
const TRIM_DASHES_REGEX = /^-+|-+$/g;

export interface CsvSplitOptions {
  baseName?: string;
  onProgress?: (progress: CsvSplitProgress) => void;
  repeatHeader: boolean;
  targetBytes: number;
}

export interface CsvSplitChunk {
  byteSize: number;
  content: string;
  fileName: string;
  rowCount: number;
}

export interface CsvSplitResult {
  chunks: CsvSplitChunk[];
  delimiter: "\n" | "\r\n" | "\r";
  headerIncluded: boolean;
  oversizedRows: number;
  totalRows: number;
}

export interface CsvSplitProgress {
  processedRows: number;
  totalRows: number;
}

export const bytesInText = (value: string): number =>
  textEncoder.encode(value).byteLength;

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"] as const;
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
};

export const getCsvLineDelimiter = (input: string): "\n" | "\r\n" | "\r" => {
  const crlfIndex = input.indexOf("\r\n");
  const lfIndex = input.indexOf("\n");
  const crIndex = input.indexOf("\r");

  if (crlfIndex !== -1) {
    return "\r\n";
  }
  if (lfIndex !== -1) {
    return "\n";
  }
  if (crIndex !== -1) {
    return "\r";
  }
  return "\n";
};

export const splitCsvRecords = (input: string): string[] => {
  const records: string[] = [];
  let current = "";
  let inQuotes = false;
  let endedWithDelimiter = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (char === '"') {
      if (inQuotes && input[index + 1] === '"') {
        current += '""';
        index += 1;
        endedWithDelimiter = false;
        continue;
      }
      inQuotes = !inQuotes;
      current += char;
      endedWithDelimiter = false;
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      records.push(current);
      current = "";
      endedWithDelimiter = true;

      if (char === "\r" && input[index + 1] === "\n") {
        index += 1;
      }
      continue;
    }

    current += char;
    endedWithDelimiter = false;
  }

  if (current || !endedWithDelimiter) {
    records.push(current);
  }

  return records;
};

const sanitizeBaseName = (baseName: string | undefined): string => {
  const sanitized = (baseName ?? "split")
    .replace(FILE_EXTENSION_REGEX, "")
    .replace(SAFE_FILE_NAME_REGEX, "-")
    .replace(TRIM_DASHES_REGEX, "");

  return sanitized || "split";
};

const buildChunkFileName = (
  baseName: string,
  partNumber: number,
  totalParts: number
): string => {
  const width = Math.max(2, String(totalParts).length);
  return `${baseName}-part-${String(partNumber).padStart(width, "0")}.csv`;
};

export const splitCsvTextBySize = (
  input: string,
  options: CsvSplitOptions
): CsvSplitResult => {
  if (options.targetBytes <= 0) {
    throw new Error("Target size must be greater than 0 bytes.");
  }

  const delimiter = getCsvLineDelimiter(input);
  const delimiterBytes = bytesInText(delimiter);
  const records = splitCsvRecords(input).filter(
    (record, index, allRecords) =>
      record !== "" || index < allRecords.length - 1
  );

  if (records.length === 0) {
    return {
      chunks: [],
      delimiter,
      headerIncluded: false,
      oversizedRows: 0,
      totalRows: 0,
    };
  }

  const header = options.repeatHeader ? records[0] : null;
  const dataRows = header ? records.slice(1) : records;
  const baseName = sanitizeBaseName(options.baseName);
  const headerBytes = header ? bytesInText(header) + delimiterBytes : 0;
  const chunks: Array<{ bytes: number; rows: string[]; rowCount: number }> = [];
  let currentRows: string[] = header ? [header] : [];
  let currentBytes = headerBytes;
  let currentDataRowCount = 0;
  let oversizedRows = 0;
  let lastProgressRow = 0;

  const reportProgress = (processedRows: number) => {
    if (!options.onProgress) {
      return;
    }
    if (
      processedRows === dataRows.length ||
      processedRows - lastProgressRow >= 4096
    ) {
      lastProgressRow = processedRows;
      options.onProgress({
        processedRows,
        totalRows: dataRows.length,
      });
    }
  };

  const flushChunk = () => {
    if (currentDataRowCount === 0 && dataRows.length > 0) {
      return;
    }
    chunks.push({
      bytes: currentBytes,
      rows: currentRows,
      rowCount: currentDataRowCount,
    });
    currentRows = header ? [header] : [];
    currentBytes = headerBytes;
    currentDataRowCount = 0;
  };

  dataRows.forEach((row, index) => {
    const rowBytes = bytesInText(row) + delimiterBytes;
    const wouldExceedTarget =
      currentDataRowCount > 0 && currentBytes + rowBytes > options.targetBytes;

    if (wouldExceedTarget) {
      flushChunk();
    }

    currentRows.push(row);
    currentBytes += rowBytes;
    currentDataRowCount += 1;

    if (currentBytes > options.targetBytes) {
      oversizedRows += 1;
    }
    reportProgress(index + 1);
  });

  if (currentDataRowCount > 0 || dataRows.length === 0) {
    flushChunk();
  }

  const totalParts = chunks.length;
  return {
    chunks: chunks.map((chunk, index) => ({
      byteSize: chunk.bytes,
      content: `${chunk.rows.join(delimiter)}${delimiter}`,
      fileName: buildChunkFileName(baseName, index + 1, totalParts),
      rowCount: chunk.rowCount,
    })),
    delimiter,
    headerIncluded: Boolean(header),
    oversizedRows,
    totalRows: dataRows.length,
  };
};
