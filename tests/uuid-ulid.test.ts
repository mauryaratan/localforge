import { describe, expect, it } from "vitest";
import {
  extractUUIDv7Timestamp,
  formatUuid,
  generateIds,
  generateULID,
  generateUUIDv4,
  generateUUIDv7,
  getFormatInfo,
  isValidUlid,
  isValidUuid,
  parseId,
} from "@/lib/uuid-ulid";

describe("generateUUIDv4", () => {
  it("should generate a valid UUID v4", () => {
    const uuid = generateUUIDv4();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("should generate unique UUIDs", () => {
    const uuid1 = generateUUIDv4();
    const uuid2 = generateUUIDv4();
    expect(uuid1).not.toBe(uuid2);
  });

  it("should have version 4 in the correct position", () => {
    const uuid = generateUUIDv4();
    expect(uuid[14]).toBe("4");
  });

  it("should have valid variant bits", () => {
    const uuid = generateUUIDv4();
    const variantChar = uuid[19];
    expect(["8", "9", "a", "b"]).toContain(variantChar.toLowerCase());
  });
});

describe("generateUUIDv7", () => {
  it("should generate a valid UUID v7", () => {
    const uuid = generateUUIDv7();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("should have version 7 in the correct position", () => {
    const uuid = generateUUIDv7();
    expect(uuid[14]).toBe("7");
  });

  it("should generate unique UUIDs", () => {
    const uuid1 = generateUUIDv7();
    const uuid2 = generateUUIDv7();
    expect(uuid1).not.toBe(uuid2);
  });

  it("should contain a valid timestamp", () => {
    const before = Date.now();
    const uuid = generateUUIDv7();
    const after = Date.now();
    const timestamp = extractUUIDv7Timestamp(uuid);

    expect(timestamp).toBeDefined();
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  it("should be roughly sortable by time", () => {
    const uuid1 = generateUUIDv7();
    // Small delay to ensure different timestamp
    const uuid2 = generateUUIDv7();

    const time1 = extractUUIDv7Timestamp(uuid1);
    const time2 = extractUUIDv7Timestamp(uuid2);

    expect(time1).toBeDefined();
    expect(time2).toBeDefined();
    expect(time2).toBeGreaterThanOrEqual(time1!);
  });
});

describe("generateULID", () => {
  it("should generate a valid ULID", () => {
    const ulid = generateULID();
    expect(ulid).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it("should generate 26-character strings", () => {
    const ulid = generateULID();
    expect(ulid).toHaveLength(26);
  });

  it("should generate unique ULIDs", () => {
    const ulid1 = generateULID();
    const ulid2 = generateULID();
    expect(ulid1).not.toBe(ulid2);
  });

  it("should have consistent timestamp prefix within same millisecond", () => {
    // ULIDs generated in the same millisecond share the same timestamp prefix (first 10 chars)
    const ulid1 = generateULID();
    const ulid2 = generateULID();
    // The first 10 characters represent the timestamp
    // Within the same millisecond, they should be the same
    expect(ulid1.slice(0, 10)).toBe(ulid2.slice(0, 10));
  });
});

describe("generateIds", () => {
  it("should generate the requested number of UUIDs v4", () => {
    const ids = generateIds("uuid-v4", 5);
    expect(ids).toHaveLength(5);
    ids.forEach((id) => {
      expect(id.format).toBe("uuid-v4");
      expect(id.value).toMatch(/^[0-9a-f-]{36}$/i);
    });
  });

  it("should generate the requested number of UUIDs v7", () => {
    const ids = generateIds("uuid-v7", 3);
    expect(ids).toHaveLength(3);
    ids.forEach((id) => {
      expect(id.format).toBe("uuid-v7");
      expect(id.timestamp).toBeDefined();
      expect(id.timestampReadable).toBeDefined();
    });
  });

  it("should generate the requested number of ULIDs", () => {
    const ids = generateIds("ulid", 4);
    expect(ids).toHaveLength(4);
    ids.forEach((id) => {
      expect(id.format).toBe("ulid");
      expect(id.value).toHaveLength(26);
      expect(id.timestamp).toBeDefined();
    });
  });

  it("should apply uppercase style to UUIDs", () => {
    const ids = generateIds("uuid-v4", 2, "uppercase");
    ids.forEach((id) => {
      expect(id.value).toBe(id.value.toUpperCase());
    });
  });

  it("should apply lowercase style to UUIDs", () => {
    const ids = generateIds("uuid-v4", 2, "lowercase");
    ids.forEach((id) => {
      expect(id.value).toBe(id.value.toLowerCase());
    });
  });

  it("should not affect ULID case (always uppercase)", () => {
    const ids = generateIds("ulid", 2, "lowercase");
    ids.forEach((id) => {
      // ULID should maintain its original case
      expect(id.value).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    });
  });
});

describe("extractUUIDv7Timestamp", () => {
  it("should extract timestamp from UUID v7", () => {
    const uuid = generateUUIDv7();
    const timestamp = extractUUIDv7Timestamp(uuid);
    const now = Date.now();

    expect(timestamp).toBeDefined();
    // Should be within 1 second of now
    expect(Math.abs(now - timestamp!)).toBeLessThan(1000);
  });

  it("should return undefined for invalid input", () => {
    const timestamp = extractUUIDv7Timestamp("invalid");
    expect(timestamp).toBeUndefined();
  });
});

describe("parseId", () => {
  describe("UUID parsing", () => {
    it("should parse a valid UUID v4", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = parseId(uuid);

      expect(result.isValid).toBe(true);
      expect(result.format).toBe("uuid-v4");
      expect(result.version).toBe(4);
      expect(result.variant).toBeDefined();
    });

    it("should parse a generated UUID v4", () => {
      const uuid = generateUUIDv4();
      const result = parseId(uuid);

      expect(result.isValid).toBe(true);
      expect(result.version).toBe(4);
    });

    it("should parse a generated UUID v7", () => {
      const uuid = generateUUIDv7();
      const result = parseId(uuid);

      expect(result.isValid).toBe(true);
      expect(result.format).toBe("uuid-v7");
      expect(result.version).toBe(7);
      expect(result.timestamp).toBeDefined();
      expect(result.timestampReadable).toBeDefined();
    });

    it("should parse UUID without hyphens", () => {
      const uuid = "550e8400e29b41d4a716446655440000";
      const result = parseId(uuid);

      expect(result.isValid).toBe(true);
      expect(result.value).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("should handle uppercase UUIDs", () => {
      const uuid = "550E8400-E29B-41D4-A716-446655440000";
      const result = parseId(uuid);

      expect(result.isValid).toBe(true);
      expect(result.value).toBe(uuid.toLowerCase());
    });
  });

  describe("ULID parsing", () => {
    it("should parse a valid ULID", () => {
      const ulid = generateULID();
      const result = parseId(ulid);

      expect(result.isValid).toBe(true);
      expect(result.format).toBe("ulid");
      expect(result.timestamp).toBeDefined();
      expect(result.timestampReadable).toBeDefined();
    });

    it("should parse a known ULID", () => {
      const ulid = "01ARZ3NDEKTSV4RRFFQ69G5FAV";
      const result = parseId(ulid);

      expect(result.isValid).toBe(true);
      expect(result.format).toBe("ulid");
    });

    it("should handle lowercase ULID", () => {
      const ulid = generateULID().toLowerCase();
      const result = parseId(ulid);

      expect(result.isValid).toBe(true);
      expect(result.format).toBe("ulid");
      expect(result.value).toBe(ulid.toUpperCase());
    });
  });

  describe("invalid input", () => {
    it("should return invalid for empty string", () => {
      const result = parseId("");
      expect(result.isValid).toBe(false);
      expect(result.format).toBe("unknown");
    });

    it("should return invalid for random string", () => {
      const result = parseId("not-a-valid-id");
      expect(result.isValid).toBe(false);
      expect(result.format).toBe("unknown");
    });

    it("should return invalid for malformed UUID", () => {
      const result = parseId("550e8400-e29b-41d4-a716");
      expect(result.isValid).toBe(false);
    });
  });
});

describe("formatUuid", () => {
  it("should add hyphens to UUID without hyphens", () => {
    const uuid = "550e8400e29b41d4a716446655440000";
    const result = formatUuid(uuid, true);
    expect(result).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("should remove hyphens from UUID with hyphens", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const result = formatUuid(uuid, false);
    expect(result).toBe("550e8400e29b41d4a716446655440000");
  });

  it("should handle UUID already in desired format", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const result = formatUuid(uuid, true);
    expect(result).toBe(uuid);
  });
});

describe("getFormatInfo", () => {
  it("should return correct info for UUID v4", () => {
    const info = getFormatInfo("uuid-v4");
    expect(info.name).toBe("UUID v4");
    expect(info.length).toBe(36);
    expect(info.sortable).toBe(false);
    expect(info.description).toBeDefined();
  });

  it("should return correct info for UUID v7", () => {
    const info = getFormatInfo("uuid-v7");
    expect(info.name).toBe("UUID v7");
    expect(info.length).toBe(36);
    expect(info.sortable).toBe(true);
    expect(info.description).toBeDefined();
  });

  it("should return correct info for ULID", () => {
    const info = getFormatInfo("ulid");
    expect(info.name).toBe("ULID");
    expect(info.length).toBe(26);
    expect(info.sortable).toBe(true);
    expect(info.description).toBeDefined();
  });
});

describe("isValidUuid", () => {
  it("should return true for valid UUID v4", () => {
    const uuid = generateUUIDv4();
    expect(isValidUuid(uuid)).toBe(true);
  });

  it("should return true for valid UUID v7", () => {
    const uuid = generateUUIDv7();
    expect(isValidUuid(uuid)).toBe(true);
  });

  it("should return false for invalid UUID", () => {
    expect(isValidUuid("not-a-uuid")).toBe(false);
  });

  it("should return false for ULID", () => {
    const ulid = generateULID();
    expect(isValidUuid(ulid)).toBe(false);
  });

  it("should handle UUID with spaces", () => {
    const uuid = "  550e8400-e29b-41d4-a716-446655440000  ";
    expect(isValidUuid(uuid)).toBe(true);
  });
});

describe("isValidUlid", () => {
  it("should return true for valid ULID", () => {
    const ulid = generateULID();
    expect(isValidUlid(ulid)).toBe(true);
  });

  it("should return false for UUID", () => {
    const uuid = generateUUIDv4();
    expect(isValidUlid(uuid)).toBe(false);
  });

  it("should return false for invalid ULID", () => {
    expect(isValidUlid("not-a-ulid")).toBe(false);
  });

  it("should handle ULID with spaces", () => {
    const ulid = `  ${generateULID()}  `;
    expect(isValidUlid(ulid)).toBe(true);
  });

  it("should return false for ULID with invalid characters", () => {
    // ULIDs use Crockford Base32 which excludes I, L, O, U
    expect(isValidUlid("01ARZINDEKTSV4RRFFQ69G5FAV")).toBe(false); // Contains I
    expect(isValidUlid("01ARZLNDEKTSV4RRFFQ69G5FAV")).toBe(false); // Contains L
    expect(isValidUlid("01ARZONDEKTSV4RRFFQ69G5FAV")).toBe(false); // Contains O
    expect(isValidUlid("01ARZUNDEKTSV4RRFFQ69G5FAV")).toBe(false); // Contains U
  });
});

describe("edge cases", () => {
  it("should handle generating 0 IDs", () => {
    const ids = generateIds("uuid-v4", 0);
    expect(ids).toHaveLength(0);
  });

  it("should handle generating many IDs", () => {
    const ids = generateIds("uuid-v4", 100);
    expect(ids).toHaveLength(100);
    // All should be unique
    const unique = new Set(ids.map((id) => id.value));
    expect(unique.size).toBe(100);
  });

  it("should maintain uniqueness across formats", () => {
    const v4 = generateIds("uuid-v4", 10);
    const v7 = generateIds("uuid-v7", 10);
    const ulids = generateIds("ulid", 10);

    const all = [...v4, ...v7, ...ulids].map((id) => id.value);
    const unique = new Set(all);
    expect(unique.size).toBe(30);
  });
});
