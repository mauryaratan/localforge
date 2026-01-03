/**
 * UUID and ULID generation utilities
 * Supports UUID v4, UUID v7, and ULID formats
 */

import { ulid, decodeTime } from "ulid";

export type IdFormat = "uuid-v4" | "uuid-v7" | "ulid";
export type UuidStyle = "lowercase" | "uppercase";

export interface GeneratedId {
  value: string;
  format: IdFormat;
  timestamp?: number;
  timestampReadable?: string;
}

export interface ParsedId {
  format: IdFormat | "unknown";
  value: string;
  isValid: boolean;
  timestamp?: number;
  timestampReadable?: string;
  version?: number;
  variant?: string;
}

/**
 * Generate a UUID v4 (random)
 * Uses crypto.randomUUID() for cryptographically secure random generation
 */
export const generateUUIDv4 = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generate a UUID v7 (time-ordered)
 * Unix timestamp in milliseconds + random data
 * Format: tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
 */
export const generateUUIDv7 = (): string => {
  const timestamp = Date.now();
  const timestampHex = timestamp.toString(16).padStart(12, "0");

  // Get random bytes
  const randomBytes = new Uint8Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 10; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Set version (7) in the 7th position
  const version = 0x70 | (randomBytes[0] & 0x0f);
  // Set variant (10xx) in the 9th position
  const variant = 0x80 | (randomBytes[2] & 0x3f);

  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Construct UUID v7
  // tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
  const uuid = [
    timestampHex.slice(0, 8), // time_high
    timestampHex.slice(8, 12), // time_mid
    version.toString(16).padStart(2, "0") + randomHex.slice(2, 4), // time_low + version
    variant.toString(16).padStart(2, "0") + randomHex.slice(6, 8), // variant + seq
    randomHex.slice(8, 20), // node
  ].join("-");

  return uuid;
};

/**
 * Generate a ULID
 * Universally Unique Lexicographically Sortable Identifier
 */
export const generateULID = (): string => {
  return ulid();
};

/**
 * Generate multiple IDs of the specified format
 */
export const generateIds = (
  format: IdFormat,
  count: number,
  style: UuidStyle = "lowercase"
): GeneratedId[] => {
  const ids: GeneratedId[] = [];

  for (let i = 0; i < count; i++) {
    let value: string;
    let timestamp: number | undefined;
    let timestampReadable: string | undefined;

    switch (format) {
      case "uuid-v4":
        value = generateUUIDv4();
        break;
      case "uuid-v7":
        value = generateUUIDv7();
        timestamp = extractUUIDv7Timestamp(value);
        timestampReadable = timestamp
          ? new Date(timestamp).toISOString()
          : undefined;
        break;
      case "ulid":
        value = generateULID();
        try {
          timestamp = decodeTime(value);
          timestampReadable = new Date(timestamp).toISOString();
        } catch {
          // ULID decode failed
        }
        break;
      default:
        value = generateUUIDv4();
    }

    // Apply style transformation
    if (format !== "ulid") {
      value = style === "uppercase" ? value.toUpperCase() : value.toLowerCase();
    }

    ids.push({
      value,
      format,
      timestamp,
      timestampReadable,
    });
  }

  return ids;
};

/**
 * Extract timestamp from UUID v7
 */
export const extractUUIDv7Timestamp = (uuid: string): number | undefined => {
  try {
    const hex = uuid.replace(/-/g, "");
    if (hex.length < 12 || !/^[0-9a-f]+$/i.test(hex)) {
      return undefined;
    }
    const timestampHex = hex.slice(0, 12);
    const timestamp = Number.parseInt(timestampHex, 16);
    return Number.isNaN(timestamp) ? undefined : timestamp;
  } catch {
    return undefined;
  }
};

/**
 * Parse and validate a UUID or ULID
 */
export const parseId = (input: string): ParsedId => {
  const trimmed = input.trim();

  // Check if it's a ULID (26 characters, Crockford's Base32)
  if (/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(trimmed)) {
    try {
      const timestamp = decodeTime(trimmed.toUpperCase());
      return {
        format: "ulid",
        value: trimmed.toUpperCase(),
        isValid: true,
        timestamp,
        timestampReadable: new Date(timestamp).toISOString(),
      };
    } catch {
      return {
        format: "ulid",
        value: trimmed,
        isValid: false,
      };
    }
  }

  // Check if it's a UUID
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f])[0-9a-f]{3}-([0-9a-f])[0-9a-f]{3}-[0-9a-f]{12}$/i;
  const match = trimmed.match(uuidPattern);

  if (match) {
    const version = Number.parseInt(match[1], 16);
    const variantChar = Number.parseInt(match[2], 16);

    let variant = "unknown";
    if ((variantChar & 0x8) === 0) {
      variant = "NCS (reserved)";
    } else if ((variantChar & 0xc) === 0x8) {
      variant = "RFC 4122";
    } else if ((variantChar & 0xe) === 0xc) {
      variant = "Microsoft (reserved)";
    } else {
      variant = "Future (reserved)";
    }

    if (version === 7) {
      const timestamp = extractUUIDv7Timestamp(trimmed);
      return {
        format: "uuid-v7",
        value: trimmed.toLowerCase(),
        isValid: true,
        version,
        variant,
        timestamp,
        timestampReadable: timestamp
          ? new Date(timestamp).toISOString()
          : undefined,
      };
    }

    if (version === 4) {
      return {
        format: "uuid-v4",
        value: trimmed.toLowerCase(),
        isValid: true,
        version,
        variant,
      };
    }

    // Other UUID versions
    return {
      format: "uuid-v4", // Generic UUID
      value: trimmed.toLowerCase(),
      isValid: true,
      version,
      variant,
    };
  }

  // Check UUID without hyphens
  const uuidNoHyphens = /^[0-9a-f]{32}$/i;
  if (uuidNoHyphens.test(trimmed)) {
    // Format it as a proper UUID
    const formatted = [
      trimmed.slice(0, 8),
      trimmed.slice(8, 12),
      trimmed.slice(12, 16),
      trimmed.slice(16, 20),
      trimmed.slice(20, 32),
    ]
      .join("-")
      .toLowerCase();
    return parseId(formatted);
  }

  return {
    format: "unknown",
    value: trimmed,
    isValid: false,
  };
};

/**
 * Format UUID with or without hyphens
 */
export const formatUuid = (uuid: string, withHyphens: boolean): string => {
  const clean = uuid.replace(/-/g, "");
  if (!withHyphens) {
    return clean;
  }
  return [
    clean.slice(0, 8),
    clean.slice(8, 12),
    clean.slice(12, 16),
    clean.slice(16, 20),
    clean.slice(20, 32),
  ].join("-");
};

/**
 * Get description for each format
 */
export const getFormatInfo = (
  format: IdFormat
): { name: string; description: string; length: number; sortable: boolean } => {
  switch (format) {
    case "uuid-v4":
      return {
        name: "UUID v4",
        description: "Random 128-bit identifier. Most common UUID format.",
        length: 36,
        sortable: false,
      };
    case "uuid-v7":
      return {
        name: "UUID v7",
        description:
          "Time-ordered UUID with Unix timestamp. Sortable by creation time.",
        length: 36,
        sortable: true,
      };
    case "ulid":
      return {
        name: "ULID",
        description:
          "Lexicographically sortable identifier with millisecond timestamp.",
        length: 26,
        sortable: true,
      };
  }
};

/**
 * Validate if a string is a valid UUID
 */
export const isValidUuid = (input: string): boolean => {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(input.trim());
};

/**
 * Validate if a string is a valid ULID
 */
export const isValidUlid = (input: string): boolean => {
  const ulidPattern = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
  if (!ulidPattern.test(input.trim())) {
    return false;
  }
  try {
    decodeTime(input.trim().toUpperCase());
    return true;
  } catch {
    return false;
  }
};
