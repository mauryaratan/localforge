export type ConversionResult = {
  success: boolean;
  output: string;
  error?: string;
  rowCount?: number;
  columnCount?: number;
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
  parsed?: unknown;
};

export type CsvOptions = {
  delimiter: string;
  includeHeader: boolean;
  flattenNested: boolean;
};

export type JsonToCsvOptions = CsvOptions;

export type CsvToJsonOptions = {
  delimiter: string;
  hasHeader: boolean;
};

const DEFAULT_JSON_TO_CSV_OPTIONS: JsonToCsvOptions = {
  delimiter: ",",
  includeHeader: true,
  flattenNested: true,
};

const DEFAULT_CSV_TO_JSON_OPTIONS: CsvToJsonOptions = {
  delimiter: ",",
  hasHeader: true,
};

/**
 * Validates JSON string and returns parsed result
 */
export const validateJson = (jsonString: string): ValidationResult => {
  if (!jsonString.trim()) {
    return { isValid: false, error: "Please enter JSON" };
  }

  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, parsed };
  } catch (e) {
    const error = e instanceof SyntaxError ? e.message : "Invalid JSON";
    return { isValid: false, error };
  }
};

/**
 * Validates CSV string
 */
export const validateCsv = (csvString: string): ValidationResult => {
  if (!csvString.trim()) {
    return { isValid: false, error: "Please enter CSV" };
  }

  const lines = csvString.trim().split("\n");
  if (lines.length === 0) {
    return { isValid: false, error: "CSV is empty" };
  }

  return { isValid: true, parsed: csvString };
};

/**
 * Flattens a nested object into a single-level object with dot notation keys
 */
const flattenObject = (
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        result,
        flattenObject(value as Record<string, unknown>, newKey)
      );
    } else if (Array.isArray(value)) {
      // Convert arrays to JSON string
      result[newKey] = JSON.stringify(value);
    } else {
      result[newKey] = value;
    }
  }

  return result;
};

/**
 * Escapes a value for CSV format
 */
const escapeCsvValue = (value: unknown, delimiter: string): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  // Check if value needs quoting
  const needsQuoting =
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r");

  if (needsQuoting) {
    // Escape double quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Parses a CSV line respecting quoted values
 */
const parseCsvLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
        i++;
      } else {
        current += char;
        i++;
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true;
        i++;
      } else if (char === delimiter) {
        // End of field
        result.push(current);
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  // Don't forget the last field
  result.push(current);

  return result;
};

/**
 * Converts JSON array of objects to CSV
 */
export const jsonToCsv = (
  jsonString: string,
  options: Partial<JsonToCsvOptions> = {}
): ConversionResult => {
  const opts = { ...DEFAULT_JSON_TO_CSV_OPTIONS, ...options };
  const validation = validateJson(jsonString);

  if (!validation.isValid) {
    return { success: false, output: "", error: validation.error };
  }

  try {
    let data = validation.parsed;

    // Wrap single object in array
    if (!Array.isArray(data)) {
      if (typeof data === "object" && data !== null) {
        data = [data];
      } else {
        return {
          success: false,
          output: "",
          error: "JSON must be an object or array of objects",
        };
      }
    }

    if ((data as unknown[]).length === 0) {
      return { success: false, output: "", error: "JSON array is empty" };
    }

    // Ensure all items are objects
    const items = data as Record<string, unknown>[];
    for (const item of items) {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        return {
          success: false,
          output: "",
          error: "All items must be objects",
        };
      }
    }

    // Flatten objects if needed
    const flattenedItems = opts.flattenNested
      ? items.map((item) => flattenObject(item))
      : items;

    // Collect all unique keys
    const allKeys = new Set<string>();
    for (const item of flattenedItems) {
      for (const key of Object.keys(item)) {
        allKeys.add(key);
      }
    }
    const headers = Array.from(allKeys);

    // Build CSV rows
    const rows: string[] = [];

    // Add header row if requested
    if (opts.includeHeader) {
      rows.push(
        headers
          .map((h) => escapeCsvValue(h, opts.delimiter))
          .join(opts.delimiter)
      );
    }

    // Add data rows
    for (const item of flattenedItems) {
      const row = headers.map((header) =>
        escapeCsvValue(item[header], opts.delimiter)
      );
      rows.push(row.join(opts.delimiter));
    }

    return {
      success: true,
      output: rows.join("\n"),
      rowCount: flattenedItems.length,
      columnCount: headers.length,
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Conversion failed";
    return { success: false, output: "", error };
  }
};

/**
 * Converts CSV to JSON array of objects
 */
export const csvToJson = (
  csvString: string,
  options: Partial<CsvToJsonOptions> = {}
): ConversionResult => {
  const opts = { ...DEFAULT_CSV_TO_JSON_OPTIONS, ...options };
  const validation = validateCsv(csvString);

  if (!validation.isValid) {
    return { success: false, output: "", error: validation.error };
  }

  try {
    const lines = csvString.trim().split(/\r?\n/);

    if (lines.length === 0) {
      return { success: false, output: "", error: "CSV is empty" };
    }

    let headers: string[];
    let dataStartIndex: number;

    if (opts.hasHeader) {
      if (lines.length < 2) {
        return {
          success: false,
          output: "",
          error: "CSV must have at least a header row and one data row",
        };
      }
      headers = parseCsvLine(lines[0], opts.delimiter);
      dataStartIndex = 1;
    } else {
      // Generate column names
      const firstRow = parseCsvLine(lines[0], opts.delimiter);
      headers = firstRow.map((_, i) => `column${i + 1}`);
      dataStartIndex = 0;
    }

    const result: Record<string, unknown>[] = [];

    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue; // Skip empty lines

      const values = parseCsvLine(line, opts.delimiter);
      const obj: Record<string, unknown> = {};

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].trim();
        const value = values[j]?.trim() ?? "";

        // Try to parse as number or boolean
        obj[header] = parseValue(value);
      }

      result.push(obj);
    }

    return {
      success: true,
      output: JSON.stringify(result, null, 2),
      rowCount: result.length,
      columnCount: headers.length,
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Conversion failed";
    return { success: false, output: "", error };
  }
};

/**
 * Attempts to parse a string value into appropriate type
 */
const parseValue = (value: string): unknown => {
  if (value === "") return "";

  // Check for boolean
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;

  // Check for null
  if (value.toLowerCase() === "null") return null;

  // Check for number
  const num = Number(value);
  if (!Number.isNaN(num) && value.trim() !== "") {
    return num;
  }

  // Try to parse as JSON (for arrays or objects)
  if (
    (value.startsWith("[") && value.endsWith("]")) ||
    (value.startsWith("{") && value.endsWith("}"))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      // Not valid JSON, return as string
    }
  }

  return value;
};

/**
 * Detects the delimiter used in a CSV string
 */
export const detectDelimiter = (csvString: string): string => {
  const firstLine = csvString.split("\n")[0] || "";
  const delimiters = [",", ";", "\t", "|"];
  let maxCount = 0;
  let detected = ",";

  for (const delimiter of delimiters) {
    const count = (firstLine.match(new RegExp(`\\${delimiter}`, "g")) || [])
      .length;
    if (count > maxCount) {
      maxCount = count;
      detected = delimiter;
    }
  }

  return detected;
};

/**
 * Gets statistics about CSV data
 */
export const getCsvStats = (
  csvString: string,
  delimiter = ","
): { rows: number; columns: number } | null => {
  if (!csvString.trim()) return null;

  const lines = csvString.trim().split(/\r?\n/);
  const firstLine = parseCsvLine(lines[0], delimiter);

  return {
    rows: lines.length,
    columns: firstLine.length,
  };
};

/**
 * Gets statistics about JSON array
 */
export const getJsonArrayStats = (
  jsonString: string
): { items: number; keys: number } | null => {
  try {
    const parsed = JSON.parse(jsonString);
    const items = Array.isArray(parsed) ? parsed : [parsed];

    if (items.length === 0) return null;

    const allKeys = new Set<string>();
    for (const item of items) {
      if (typeof item === "object" && item !== null) {
        for (const key of Object.keys(item)) {
          allKeys.add(key);
        }
      }
    }

    return {
      items: items.length,
      keys: allKeys.size,
    };
  } catch {
    return null;
  }
};

export const exampleJson = {
  simple: `[
  {"id": 1, "name": "John Doe", "email": "john@example.com", "age": 30},
  {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "age": 25},
  {"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "age": 35}
]`,
  nested: `[
  {
    "id": 1,
    "user": {"name": "Alice", "role": "admin"},
    "settings": {"theme": "dark", "notifications": true}
  },
  {
    "id": 2,
    "user": {"name": "Bob", "role": "user"},
    "settings": {"theme": "light", "notifications": false}
  }
]`,
  products: `[
  {"sku": "PROD001", "name": "Laptop", "price": 999.99, "inStock": true, "tags": ["electronics", "computers"]},
  {"sku": "PROD002", "name": "Mouse", "price": 29.99, "inStock": true, "tags": ["electronics", "accessories"]},
  {"sku": "PROD003", "name": "Keyboard", "price": 79.99, "inStock": false, "tags": ["electronics", "accessories"]}
]`,
};

export const exampleCsv = {
  simple: `id,name,email,age
1,John Doe,john@example.com,30
2,Jane Smith,jane@example.com,25
3,Bob Johnson,bob@example.com,35`,
  semicolon: `id;name;email;age
1;John Doe;john@example.com;30
2;Jane Smith;jane@example.com;25
3;Bob Johnson;bob@example.com;35`,
  quoted: `id,name,description,price
1,"Widget, Standard","A basic widget with ""special"" features",19.99
2,"Gadget Pro","Multi-line
description here",49.99
3,"Tool Set","Complete kit",99.99`,
};

export const delimiterOptions = [
  { value: ",", label: "Comma (,)" },
  { value: ";", label: "Semicolon (;)" },
  { value: "\t", label: "Tab" },
  { value: "|", label: "Pipe (|)" },
];
