export interface JsonValidationResult {
  isValid: boolean;
  error?: string;
  errorPosition?: {
    line: number;
    column: number;
  };
  parsed?: unknown;
}

export interface JsonFormatResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface JsonPathResult {
  success: boolean;
  result: unknown;
  matchCount: number;
  error?: string;
}

export interface TreeNode {
  key: string;
  value: unknown;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  path: string;
  children?: TreeNode[];
  isExpanded?: boolean;
}

// Top-level regex patterns for performance
const POSITION_REGEX = /position (\d+)/;
const PATH_SPLIT_REGEX = /[.[]/;
const FILTER_REGEX = /^\[\?\(([^)]+)\)\]/;
const WILDCARD_REGEX = /^\[\*\]/;
const BRACKET_REGEX = /^\[(\d+|"[^"]+"|'[^']+')\]/;
const KEY_REGEX = /^([^.[\]]+)/;
const FILTER_EXPRESSION_REGEX = /@\.(\w+)\s*(==|!=|<|>|<=|>=)\s*(.+)/;

/**
 * Helper to calculate match count without nested ternary
 */
const getMatchCount = (result: unknown): number => {
  if (Array.isArray(result)) {
    return result.length;
  }
  if (result !== undefined) {
    return 1;
  }
  return 0;
};

// Path segment type for JSONPath parsing
interface PathSegment {
  type: "key" | "index" | "wildcard" | "filter";
  value: string;
}

/**
 * Validates JSON string and returns detailed error info
 */
export const validateJson = (jsonString: string): JsonValidationResult => {
  if (!jsonString.trim()) {
    return { isValid: false, error: "Please enter JSON" };
  }

  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, parsed };
  } catch (e) {
    if (e instanceof SyntaxError) {
      const match = e.message.match(POSITION_REGEX);
      if (match) {
        const position = Number.parseInt(match[1], 10);
        const { line, column } = getLineColumn(jsonString, position);
        return {
          isValid: false,
          error: e.message,
          errorPosition: { line, column },
        };
      }
      return { isValid: false, error: e.message };
    }
    return { isValid: false, error: "Invalid JSON" };
  }
};

/**
 * Get line and column number from character position
 */
const getLineColumn = (
  text: string,
  position: number
): { line: number; column: number } => {
  const lines = text.substring(0, position).split("\n");
  return {
    line: lines.length,
    column: (lines.at(-1)?.length || 0) + 1,
  };
};

/**
 * Formats/prettifies JSON string with configurable indentation
 */
export const formatJson = (
  jsonString: string,
  indent = 2
): JsonFormatResult => {
  const validation = validateJson(jsonString);

  if (!validation.isValid) {
    return { success: false, output: "", error: validation.error };
  }

  try {
    const formatted = JSON.stringify(validation.parsed, null, indent);
    return { success: true, output: formatted };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Formatting failed";
    return { success: false, output: "", error };
  }
};

/**
 * Minifies JSON string (removes all whitespace)
 */
export const minifyJson = (jsonString: string): JsonFormatResult => {
  const validation = validateJson(jsonString);

  if (!validation.isValid) {
    return { success: false, output: "", error: validation.error };
  }

  try {
    const minified = JSON.stringify(validation.parsed);
    return { success: true, output: minified };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Minification failed";
    return { success: false, output: "", error };
  }
};

/**
 * Sorts JSON object keys alphabetically (recursive)
 */
export const sortJsonKeys = (jsonString: string): JsonFormatResult => {
  const validation = validateJson(jsonString);

  if (!validation.isValid) {
    return { success: false, output: "", error: validation.error };
  }

  const sortKeys = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
      return obj.map(sortKeys);
    }
    if (obj !== null && typeof obj === "object") {
      return Object.keys(obj as Record<string, unknown>)
        .sort()
        .reduce(
          (sorted, key) => {
            sorted[key] = sortKeys((obj as Record<string, unknown>)[key]);
            return sorted;
          },
          {} as Record<string, unknown>
        );
    }
    return obj;
  };

  try {
    const sorted = sortKeys(validation.parsed);
    const formatted = JSON.stringify(sorted, null, 2);
    return { success: true, output: formatted };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Sorting failed";
    return { success: false, output: "", error };
  }
};

/**
 * Simple JSONPath implementation supporting:
 * - $.key - Root object key
 * - $.key.nested - Nested key
 * - $[0] - Array index
 * - $.key[*] - All array elements
 * - $..key - Recursive descent (find all keys with name)
 * - $.key[?(@.price<10)] - Filter expressions
 */
export const queryJsonPath = (
  jsonString: string,
  path: string
): JsonPathResult => {
  const validation = validateJson(jsonString);

  if (!validation.isValid) {
    return {
      success: false,
      result: null,
      matchCount: 0,
      error: validation.error,
    };
  }

  if (!path.trim()) {
    return { success: true, result: validation.parsed, matchCount: 1 };
  }

  try {
    const result = evaluateJsonPath(validation.parsed, path.trim());
    const matchCount = getMatchCount(result);
    return { success: true, result, matchCount };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Invalid JSONPath";
    return { success: false, result: null, matchCount: 0, error };
  }
};

/**
 * Process a single path segment and return the result
 */
const processSegment = (
  current: unknown,
  segment: PathSegment
): { value: unknown; shouldReturn: boolean } => {
  if (current === null || current === undefined) {
    return { value: undefined, shouldReturn: true };
  }

  switch (segment.type) {
    case "key":
      if (
        typeof current === "object" &&
        current !== null &&
        !Array.isArray(current)
      ) {
        return {
          value: (current as Record<string, unknown>)[segment.value],
          shouldReturn: false,
        };
      }
      return { value: undefined, shouldReturn: true };

    case "index":
      if (Array.isArray(current)) {
        return {
          value: current[Number.parseInt(segment.value, 10)],
          shouldReturn: false,
        };
      }
      return { value: undefined, shouldReturn: true };

    case "wildcard":
      if (Array.isArray(current)) {
        return { value: current, shouldReturn: true };
      }
      if (typeof current === "object" && current !== null) {
        return {
          value: Object.values(current as Record<string, unknown>),
          shouldReturn: true,
        };
      }
      return { value: [], shouldReturn: true };

    case "filter":
      if (Array.isArray(current)) {
        return {
          value: current.filter((item) => evaluateFilter(item, segment.value)),
          shouldReturn: false,
        };
      }
      return { value: undefined, shouldReturn: true };

    default:
      return { value: current, shouldReturn: false };
  }
};

/**
 * Evaluates JSONPath expression
 */
const evaluateJsonPath = (data: unknown, path: string): unknown => {
  // Handle empty or root path
  if (path === "$" || path === "") {
    return data;
  }

  // Remove leading $
  let normalizedPath = path.startsWith("$") ? path.slice(1) : path;

  // Handle recursive descent (..)
  if (normalizedPath.startsWith("..")) {
    const key = normalizedPath.slice(2).split(PATH_SPLIT_REGEX, 1)[0];
    const results: unknown[] = [];
    findAllByKey(data, key, results);
    return results.length === 1 ? results[0] : results;
  }

  // Remove leading dot if present
  if (normalizedPath.startsWith(".")) {
    normalizedPath = normalizedPath.slice(1);
  }

  // Parse path segments
  const segments = parsePathSegments(normalizedPath);
  let current: unknown = data;

  for (const segment of segments) {
    const result = processSegment(current, segment);
    if (result.shouldReturn) {
      return result.value;
    }
    current = result.value;
  }

  return current;
};

/**
 * Parse path into segments
 */
const parsePathSegments = (path: string): PathSegment[] => {
  const segments: PathSegment[] = [];
  let remaining = path;

  while (remaining.length > 0) {
    // Match bracket notation with filter [?(...)]
    const filterMatch = remaining.match(FILTER_REGEX);
    if (filterMatch) {
      segments.push({ type: "filter", value: filterMatch[1] });
      remaining = remaining.slice(filterMatch[0].length);
      continue;
    }

    // Match bracket notation [*]
    const wildcardMatch = remaining.match(WILDCARD_REGEX);
    if (wildcardMatch) {
      segments.push({ type: "wildcard", value: "*" });
      remaining = remaining.slice(wildcardMatch[0].length);
      continue;
    }

    // Match bracket notation [0] or ["key"]
    const bracketMatch = remaining.match(BRACKET_REGEX);
    if (bracketMatch) {
      const value = bracketMatch[1];
      if (value.startsWith('"') || value.startsWith("'")) {
        segments.push({ type: "key", value: value.slice(1, -1) });
      } else {
        segments.push({ type: "index", value });
      }
      remaining = remaining.slice(bracketMatch[0].length);
      continue;
    }

    // Match dot notation
    if (remaining.startsWith(".")) {
      remaining = remaining.slice(1);
    }

    // Match key
    const keyMatch = remaining.match(KEY_REGEX);
    if (keyMatch) {
      segments.push({ type: "key", value: keyMatch[1] });
      remaining = remaining.slice(keyMatch[0].length);
      continue;
    }

    break;
  }

  return segments;
};

/**
 * Evaluate filter expression like @.price<10
 */
const evaluateFilter = (item: unknown, expression: string): boolean => {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  // Parse expression like @.price<10 or @.name=="test"
  const match = expression.match(FILTER_EXPRESSION_REGEX);
  if (!match) {
    return false;
  }

  const [, key, operator, valueStr] = match;
  const itemValue = (item as Record<string, unknown>)[key];

  // Parse the comparison value
  let compareValue: unknown;
  if (valueStr.startsWith('"') || valueStr.startsWith("'")) {
    compareValue = valueStr.slice(1, -1);
  } else if (valueStr === "true") {
    compareValue = true;
  } else if (valueStr === "false") {
    compareValue = false;
  } else if (valueStr === "null") {
    compareValue = null;
  } else {
    compareValue = Number.parseFloat(valueStr);
  }

  switch (operator) {
    case "==":
      return itemValue === compareValue;
    case "!=":
      return itemValue !== compareValue;
    case "<":
      return (
        typeof itemValue === "number" &&
        typeof compareValue === "number" &&
        itemValue < compareValue
      );
    case ">":
      return (
        typeof itemValue === "number" &&
        typeof compareValue === "number" &&
        itemValue > compareValue
      );
    case "<=":
      return (
        typeof itemValue === "number" &&
        typeof compareValue === "number" &&
        itemValue <= compareValue
      );
    case ">=":
      return (
        typeof itemValue === "number" &&
        typeof compareValue === "number" &&
        itemValue >= compareValue
      );
    default:
      return false;
  }
};

/**
 * Find all values with the given key recursively
 */
const findAllByKey = (obj: unknown, key: string, results: unknown[]): void => {
  if (obj === null || typeof obj !== "object") {
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      findAllByKey(item, key, results);
    }
  } else {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k === key) {
        results.push(v);
      }
      findAllByKey(v, key, results);
    }
  }
};

/**
 * Build tree structure from JSON for visualization
 */
export const buildJsonTree = (data: unknown, path = "$"): TreeNode[] => {
  const getType = (value: unknown): TreeNode["type"] => {
    if (value === null) {
      return "null";
    }
    if (Array.isArray(value)) {
      return "array";
    }
    if (typeof value === "object") {
      return "object";
    }
    if (typeof value === "string") {
      return "string";
    }
    if (typeof value === "number") {
      return "number";
    }
    if (typeof value === "boolean") {
      return "boolean";
    }
    return "string";
  };

  const buildNode = (
    key: string,
    value: unknown,
    currentPath: string
  ): TreeNode => {
    const type = getType(value);
    const node: TreeNode = {
      key,
      value,
      type,
      path: currentPath,
      isExpanded: true,
    };

    if (type === "object" && value !== null) {
      node.children = Object.entries(value as Record<string, unknown>).map(
        ([k, v]) => buildNode(k, v, `${currentPath}.${k}`)
      );
    } else if (type === "array") {
      node.children = (value as unknown[]).map((item, index) =>
        buildNode(`[${index}]`, item, `${currentPath}[${index}]`)
      );
    }

    return node;
  };

  if (data === null || data === undefined) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.map((item, index) =>
      buildNode(`[${index}]`, item, `${path}[${index}]`)
    );
  }

  if (typeof data === "object") {
    return Object.entries(data as Record<string, unknown>).map(([key, value]) =>
      buildNode(key, value, `${path}.${key}`)
    );
  }

  return [buildNode("value", data, path)];
};

/**
 * Get all keys/paths in JSON for autocomplete
 */
export const getAllPaths = (data: unknown, prefix = "$"): string[] => {
  const paths: string[] = [prefix];

  const traverse = (obj: unknown, currentPath: string): void => {
    if (obj === null || typeof obj !== "object") {
      return;
    }

    if (Array.isArray(obj)) {
      paths.push(`${currentPath}[*]`);
      obj.forEach((item, index) => {
        const arrayPath = `${currentPath}[${index}]`;
        paths.push(arrayPath);
        traverse(item, arrayPath);
      });
    } else {
      for (const [key, value] of Object.entries(
        obj as Record<string, unknown>
      )) {
        const keyPath = `${currentPath}.${key}`;
        paths.push(keyPath);
        traverse(value, keyPath);
      }
    }
  };

  traverse(data, prefix);
  return paths;
};

/**
 * Count keys and depth of JSON
 */
export const getJsonStats = (
  data: unknown
): {
  keyCount: number;
  maxDepth: number;
  arrayCount: number;
  objectCount: number;
} => {
  let keyCount = 0;
  let maxDepth = 0;
  let arrayCount = 0;
  let objectCount = 0;

  const traverse = (obj: unknown, depth: number): void => {
    if (depth > maxDepth) {
      maxDepth = depth;
    }

    if (obj === null || typeof obj !== "object") {
      return;
    }

    if (Array.isArray(obj)) {
      arrayCount++;
      for (const item of obj) {
        traverse(item, depth + 1);
      }
    } else {
      objectCount++;
      const entries = Object.entries(obj as Record<string, unknown>);
      keyCount += entries.length;
      for (const [, value] of entries) {
        traverse(value, depth + 1);
      }
    }
  };

  traverse(data, 0);
  return { keyCount, maxDepth, arrayCount, objectCount };
};

// Example JSON data
export const exampleJson = {
  simple: `{
  "name": "John Doe",
  "age": 30,
  "active": true,
  "email": "john@example.com"
}`,
  nested: `{
  "user": {
    "id": 1,
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    },
    "roles": ["admin", "editor"]
  },
  "settings": {
    "theme": "dark",
    "notifications": true
  }
}`,
  array: `{
  "products": [
    { "id": 1, "name": "Laptop", "price": 999.99 },
    { "id": 2, "name": "Mouse", "price": 29.99 },
    { "id": 3, "name": "Keyboard", "price": 79.99 }
  ],
  "total": 3
}`,
  complex: `{
  "apiVersion": "v1",
  "kind": "Pod",
  "metadata": {
    "name": "webapp",
    "labels": {
      "app": "frontend",
      "environment": "production"
    }
  },
  "spec": {
    "containers": [
      {
        "name": "web",
        "image": "nginx:latest",
        "ports": [{ "containerPort": 80 }],
        "resources": {
          "limits": { "cpu": "500m", "memory": "128Mi" }
        }
      }
    ]
  }
}`,
};

// Example JSONPath queries
export const examplePaths = [
  { path: "$.user.profile.firstName", description: "Get nested value" },
  { path: "$.products[0]", description: "First array element" },
  { path: "$.products[*].name", description: "All product names" },
  { path: "$..email", description: "All email fields (recursive)" },
  { path: "$.products[?(@.price<100)]", description: "Filter: price < 100" },
];
