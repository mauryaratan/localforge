export type DiffType = "added" | "removed" | "changed" | "unchanged";

export interface DiffLine {
  type: DiffType;
  path: string;
  key: string;
  oldValue?: unknown;
  newValue?: unknown;
  depth: number;
}

export interface DiffResult {
  success: boolean;
  diffs: DiffLine[];
  summary: {
    added: number;
    removed: number;
    changed: number;
    unchanged: number;
  };
  error?: string;
}

export interface JsonValidation {
  isValid: boolean;
  error?: string;
  parsed?: unknown;
}

/**
 * Validate JSON string
 */
export function validateJson(input: string): JsonValidation {
  if (!input.trim()) {
    return { isValid: false, error: "Input is empty" };
  }
  try {
    const parsed = JSON.parse(input);
    return { isValid: true, parsed };
  } catch (e) {
    return {
      isValid: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}

/**
 * Get the type of a value for display
 */
function getValueType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * Format a value for display
 */
export function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return `Array[${value.length}]`;
    }
    return `Object{${Object.keys(value).length}}`;
  }
  return String(value);
}

/**
 * Check if two values are deeply equal
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;

  if (typeof a === "object" && typeof b === "object") {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;

    if (Array.isArray(a) !== Array.isArray(b)) return false;

    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
  }

  return false;
}

/**
 * Compare two JSON values and return differences
 */
function compareValues(
  oldVal: unknown,
  newVal: unknown,
  path: string,
  key: string,
  depth: number,
  diffs: DiffLine[]
): void {
  const oldType = getValueType(oldVal);
  const newType = getValueType(newVal);

  // Different types or primitives
  if (oldType !== newType) {
    diffs.push({
      type: "changed",
      path,
      key,
      oldValue: oldVal,
      newValue: newVal,
      depth,
    });
    return;
  }

  // Both are objects
  if (
    oldType === "object" &&
    !Array.isArray(oldVal) &&
    !Array.isArray(newVal)
  ) {
    const oldObj = oldVal as Record<string, unknown>;
    const newObj = newVal as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    allKeys.forEach((k) => {
      const childPath = path ? `${path}.${k}` : k;
      const hasOld = k in oldObj;
      const hasNew = k in newObj;

      if (hasOld && hasNew) {
        compareValues(oldObj[k], newObj[k], childPath, k, depth + 1, diffs);
      } else if (hasOld && !hasNew) {
        diffs.push({
          type: "removed",
          path: childPath,
          key: k,
          oldValue: oldObj[k],
          depth: depth + 1,
        });
      } else if (!hasOld && hasNew) {
        diffs.push({
          type: "added",
          path: childPath,
          key: k,
          newValue: newObj[k],
          depth: depth + 1,
        });
      }
    });
    return;
  }

  // Both are arrays
  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    const maxLen = Math.max(oldVal.length, newVal.length);

    for (let i = 0; i < maxLen; i++) {
      const childPath = `${path}[${i}]`;
      const hasOld = i < oldVal.length;
      const hasNew = i < newVal.length;

      if (hasOld && hasNew) {
        compareValues(
          oldVal[i],
          newVal[i],
          childPath,
          `[${i}]`,
          depth + 1,
          diffs
        );
      } else if (hasOld && !hasNew) {
        diffs.push({
          type: "removed",
          path: childPath,
          key: `[${i}]`,
          oldValue: oldVal[i],
          depth: depth + 1,
        });
      } else if (!hasOld && hasNew) {
        diffs.push({
          type: "added",
          path: childPath,
          key: `[${i}]`,
          newValue: newVal[i],
          depth: depth + 1,
        });
      }
    }
    return;
  }

  // Primitives
  if (deepEqual(oldVal, newVal)) {
    diffs.push({
      type: "unchanged",
      path,
      key,
      oldValue: oldVal,
      newValue: newVal,
      depth,
    });
  } else {
    diffs.push({
      type: "changed",
      path,
      key,
      oldValue: oldVal,
      newValue: newVal,
      depth,
    });
  }
}

/**
 * Compare two JSON strings and return detailed diff
 */
export function compareJson(original: string, modified: string): DiffResult {
  const originalValidation = validateJson(original);
  const modifiedValidation = validateJson(modified);

  if (!originalValidation.isValid) {
    return {
      success: false,
      diffs: [],
      summary: { added: 0, removed: 0, changed: 0, unchanged: 0 },
      error: `Original JSON: ${originalValidation.error}`,
    };
  }

  if (!modifiedValidation.isValid) {
    return {
      success: false,
      diffs: [],
      summary: { added: 0, removed: 0, changed: 0, unchanged: 0 },
      error: `Modified JSON: ${modifiedValidation.error}`,
    };
  }

  const diffs: DiffLine[] = [];

  compareValues(
    originalValidation.parsed,
    modifiedValidation.parsed,
    "$",
    "$",
    0,
    diffs
  );

  const summary = {
    added: diffs.filter((d) => d.type === "added").length,
    removed: diffs.filter((d) => d.type === "removed").length,
    changed: diffs.filter((d) => d.type === "changed").length,
    unchanged: diffs.filter((d) => d.type === "unchanged").length,
  };

  return {
    success: true,
    diffs,
    summary,
  };
}

/**
 * Generate a unified diff string representation
 */
export function generateUnifiedDiff(diffs: DiffLine[]): string {
  const lines: string[] = [];

  for (const diff of diffs) {
    const indent = "  ".repeat(diff.depth);
    const prefix =
      diff.type === "added"
        ? "+ "
        : diff.type === "removed"
          ? "- "
          : diff.type === "changed"
            ? "~ "
            : "  ";

    if (diff.type === "changed") {
      lines.push(
        `${prefix}${indent}${diff.path}: ${formatValue(diff.oldValue)} → ${formatValue(diff.newValue)}`
      );
    } else if (diff.type === "added") {
      lines.push(
        `${prefix}${indent}${diff.path}: ${formatValue(diff.newValue)}`
      );
    } else if (diff.type === "removed") {
      lines.push(
        `${prefix}${indent}${diff.path}: ${formatValue(diff.oldValue)}`
      );
    }
  }

  return lines.join("\n");
}

// Example JSON pairs for demonstration
export const examplePairs = {
  simple: {
    original: JSON.stringify({ name: "John", age: 30, city: "NYC" }, null, 2),
    modified: JSON.stringify(
      { name: "John", age: 31, country: "USA" },
      null,
      2
    ),
    label: "Simple Object",
  },
  nested: {
    original: JSON.stringify(
      {
        user: {
          name: "Alice",
          settings: {
            theme: "dark",
            notifications: true,
          },
        },
        version: "1.0",
      },
      null,
      2
    ),
    modified: JSON.stringify(
      {
        user: {
          name: "Alice",
          settings: {
            theme: "light",
            notifications: true,
            language: "en",
          },
        },
        version: "1.1",
      },
      null,
      2
    ),
    label: "Nested Object",
  },
  array: {
    original: JSON.stringify(
      {
        items: [
          { id: 1, name: "Apple" },
          { id: 2, name: "Banana" },
          { id: 3, name: "Cherry" },
        ],
      },
      null,
      2
    ),
    modified: JSON.stringify(
      {
        items: [
          { id: 1, name: "Apple", price: 1.5 },
          { id: 2, name: "Blueberry" },
          { id: 4, name: "Date" },
        ],
      },
      null,
      2
    ),
    label: "Array Data",
  },
  api: {
    original: JSON.stringify(
      {
        status: "success",
        data: {
          users: [
            { id: 1, email: "user1@example.com", role: "admin" },
            { id: 2, email: "user2@example.com", role: "user" },
          ],
          pagination: { page: 1, total: 2 },
        },
      },
      null,
      2
    ),
    modified: JSON.stringify(
      {
        status: "success",
        data: {
          users: [
            { id: 1, email: "user1@example.com", role: "superadmin" },
            { id: 2, email: "user2@new.com", role: "user" },
            { id: 3, email: "user3@example.com", role: "user" },
          ],
          pagination: { page: 1, total: 3 },
        },
        meta: { version: "2.0" },
      },
      null,
      2
    ),
    label: "API Response",
  },
};
