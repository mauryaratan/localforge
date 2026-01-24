import { describe, expect, it } from "vitest";
import {
  generateAllHashes,
  generateHash,
  getAlgorithmInfo,
  isValidHashFormat,
} from "@/lib/hash-generator";

describe("generateHash - MD5", () => {
  it("should return empty string for empty input", async () => {
    const result = await generateHash("", "MD5");
    expect(result.success).toBe(true);
    expect(result.hash).toBe("");
  });

  it("should hash 'hello' correctly", async () => {
    const result = await generateHash("hello", "MD5");
    expect(result.success).toBe(true);
    expect(result.hash).toBe("5d41402abc4b2a76b9719d911017c592");
  });

  it("should hash 'Hello, World!' correctly", async () => {
    const result = await generateHash("Hello, World!", "MD5");
    expect(result.success).toBe(true);
    expect(result.hash).toBe("65a8e27d8879283831b664bd8b7f0ad4");
  });

  it("should hash unicode correctly", async () => {
    const result = await generateHash("café", "MD5");
    expect(result.success).toBe(true);
    expect(result.hash).toBe("07117fe4a1ebd544965dc19573183da2");
  });

  it("should produce 32-character hash", async () => {
    const result = await generateHash("test", "MD5");
    expect(result.hash.length).toBe(32);
  });
});

describe("generateHash - SHA-1", () => {
  it("should return empty string for empty input", async () => {
    const result = await generateHash("", "SHA-1");
    expect(result.success).toBe(true);
    expect(result.hash).toBe("");
  });

  it("should hash 'hello' correctly", async () => {
    const result = await generateHash("hello", "SHA-1");
    expect(result.success).toBe(true);
    expect(result.hash).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
  });

  it("should produce 40-character hash", async () => {
    const result = await generateHash("test", "SHA-1");
    expect(result.hash.length).toBe(40);
  });
});

describe("generateHash - SHA-256", () => {
  it("should return empty string for empty input", async () => {
    const result = await generateHash("", "SHA-256");
    expect(result.success).toBe(true);
    expect(result.hash).toBe("");
  });

  it("should hash 'hello' correctly", async () => {
    const result = await generateHash("hello", "SHA-256");
    expect(result.success).toBe(true);
    expect(result.hash).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
  });

  it("should produce 64-character hash", async () => {
    const result = await generateHash("test", "SHA-256");
    expect(result.hash.length).toBe(64);
  });
});

describe("generateHash - SHA-384", () => {
  it("should return empty string for empty input", async () => {
    const result = await generateHash("", "SHA-384");
    expect(result.success).toBe(true);
    expect(result.hash).toBe("");
  });

  it("should hash 'hello' correctly", async () => {
    const result = await generateHash("hello", "SHA-384");
    expect(result.success).toBe(true);
    expect(result.hash).toBe(
      "59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f"
    );
  });

  it("should produce 96-character hash", async () => {
    const result = await generateHash("test", "SHA-384");
    expect(result.hash.length).toBe(96);
  });
});

describe("generateHash - SHA-512", () => {
  it("should return empty string for empty input", async () => {
    const result = await generateHash("", "SHA-512");
    expect(result.success).toBe(true);
    expect(result.hash).toBe("");
  });

  it("should hash 'hello' correctly", async () => {
    const result = await generateHash("hello", "SHA-512");
    expect(result.success).toBe(true);
    expect(result.hash).toBe(
      "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
    );
  });

  it("should produce 128-character hash", async () => {
    const result = await generateHash("test", "SHA-512");
    expect(result.hash.length).toBe(128);
  });
});

describe("generateAllHashes", () => {
  it("should return all empty hashes for empty input", async () => {
    const result = await generateAllHashes("");
    expect(result.md5).toBe("");
    expect(result.sha1).toBe("");
    expect(result.sha256).toBe("");
    expect(result.sha384).toBe("");
    expect(result.sha512).toBe("");
  });

  it("should generate all hashes for 'hello'", async () => {
    const result = await generateAllHashes("hello");
    expect(result.md5).toBe("5d41402abc4b2a76b9719d911017c592");
    expect(result.sha1).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
    expect(result.sha256).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
    expect(result.sha384.length).toBe(96);
    expect(result.sha512.length).toBe(128);
  });

  it("should handle special characters", async () => {
    const result = await generateAllHashes("!@#$%^&*()");
    expect(result.md5.length).toBe(32);
    expect(result.sha256.length).toBe(64);
  });

  it("should handle unicode", async () => {
    const result = await generateAllHashes("你好世界");
    expect(result.md5.length).toBe(32);
    expect(result.sha256.length).toBe(64);
  });

  it("should handle emoji", async () => {
    const result = await generateAllHashes("👋🌍");
    expect(result.md5.length).toBe(32);
    expect(result.sha256.length).toBe(64);
  });
});

describe("getAlgorithmInfo", () => {
  it("should return correct info for MD5", () => {
    const info = getAlgorithmInfo("MD5");
    expect(info.bits).toBe(128);
    expect(info.description).toContain("broken");
  });

  it("should return correct info for SHA-1", () => {
    const info = getAlgorithmInfo("SHA-1");
    expect(info.bits).toBe(160);
    expect(info.description).toContain("Deprecated");
  });

  it("should return correct info for SHA-256", () => {
    const info = getAlgorithmInfo("SHA-256");
    expect(info.bits).toBe(256);
    expect(info.description).toContain("Recommended");
  });

  it("should return correct info for SHA-384", () => {
    const info = getAlgorithmInfo("SHA-384");
    expect(info.bits).toBe(384);
  });

  it("should return correct info for SHA-512", () => {
    const info = getAlgorithmInfo("SHA-512");
    expect(info.bits).toBe(512);
    expect(info.description).toContain("Highest security");
  });
});

describe("isValidHashFormat", () => {
  it("should return false for empty string", () => {
    expect(isValidHashFormat("", "MD5")).toBe(false);
  });

  it("should validate correct MD5 format", () => {
    expect(isValidHashFormat("5d41402abc4b2a76b9719d911017c592", "MD5")).toBe(
      true
    );
  });

  it("should reject incorrect MD5 length", () => {
    expect(isValidHashFormat("5d41402abc4b2a76b9719d911017c59", "MD5")).toBe(
      false
    );
  });

  it("should reject non-hex characters", () => {
    expect(isValidHashFormat("5d41402abc4b2a76b9719d911017c59g", "MD5")).toBe(
      false
    );
  });

  it("should validate correct SHA-256 format", () => {
    expect(
      isValidHashFormat(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
        "SHA-256"
      )
    ).toBe(true);
  });

  it("should validate uppercase hex", () => {
    expect(isValidHashFormat("5D41402ABC4B2A76B9719D911017C592", "MD5")).toBe(
      true
    );
  });
});

describe("hash consistency", () => {
  it("should produce same hash for same input", async () => {
    const input = "test input";
    const result1 = await generateHash(input, "SHA-256");
    const result2 = await generateHash(input, "SHA-256");
    expect(result1.hash).toBe(result2.hash);
  });

  it("should produce different hashes for different inputs", async () => {
    const result1 = await generateHash("input1", "SHA-256");
    const result2 = await generateHash("input2", "SHA-256");
    expect(result1.hash).not.toBe(result2.hash);
  });

  it("should be case sensitive", async () => {
    const result1 = await generateHash("Hello", "SHA-256");
    const result2 = await generateHash("hello", "SHA-256");
    expect(result1.hash).not.toBe(result2.hash);
  });
});
