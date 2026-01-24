import { describe, expect, it } from "vitest";
import {
  base64UrlDecode,
  base64UrlEncode,
  decodeJWT,
  encodeJWT,
  formatClaimValue,
  getExpirationInfo,
  isTokenExpired,
  STANDARD_CLAIMS,
  validateJSON,
  verifyJWT,
} from "@/lib/jwt";

describe("base64UrlEncode", () => {
  it("should encode empty string", () => {
    expect(base64UrlEncode("")).toBe("");
  });

  it("should encode simple text", () => {
    const result = base64UrlEncode('{"alg":"HS256","typ":"JWT"}');
    expect(result).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
  });

  it("should not contain + / or =", () => {
    const result = base64UrlEncode("test???test???test");
    expect(result).not.toContain("+");
    expect(result).not.toContain("/");
    expect(result).not.toContain("=");
  });

  it("should encode unicode characters", () => {
    const result = base64UrlEncode("你好世界");
    expect(result).toBeTruthy();
    expect(base64UrlDecode(result)).toBe("你好世界");
  });
});

describe("base64UrlDecode", () => {
  it("should decode empty string", () => {
    expect(base64UrlDecode("")).toBe("");
  });

  it("should decode JWT header", () => {
    const result = base64UrlDecode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    expect(result).toBe('{"alg":"HS256","typ":"JWT"}');
  });

  it("should handle missing padding", () => {
    // "A" encodes to "QQ" (no padding in URL-safe)
    const result = base64UrlDecode("QQ");
    expect(result).toBeTruthy();
  });

  it("should convert - and _ back to + and /", () => {
    const original = "test+/test";
    const encoded = base64UrlEncode(original);
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    const decoded = base64UrlDecode(encoded);
    expect(decoded).toBe(original);
  });
});

describe("decodeJWT", () => {
  const validToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  it("should decode a valid JWT", () => {
    const result = decodeJWT(validToken);
    expect(result.success).toBe(true);
    expect(result.data.header.alg).toBe("HS256");
    expect(result.data.header.typ).toBe("JWT");
    expect(result.data.payload.sub).toBe("1234567890");
    expect(result.data.payload.name).toBe("John Doe");
    expect(result.data.payload.iat).toBe(1_516_239_022);
  });

  it("should return error for empty token", () => {
    const result = decodeJWT("");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Token is required");
  });

  it("should return error for token with wrong number of parts", () => {
    const result = decodeJWT("header.payload");
    expect(result.success).toBe(false);
    expect(result.error).toContain("expected 3 parts");
  });

  it("should return error for token with 4 parts", () => {
    const result = decodeJWT("a.b.c.d");
    expect(result.success).toBe(false);
    expect(result.error).toContain("expected 3 parts");
  });

  it("should return error for invalid header JSON", () => {
    // "not-json" encoded
    const invalidHeader = base64UrlEncode("not-json");
    const result = decodeJWT(`${invalidHeader}.payload.signature`);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid header");
  });

  it("should return error for invalid payload JSON", () => {
    const validHeader = base64UrlEncode('{"alg":"HS256","typ":"JWT"}');
    const invalidPayload = base64UrlEncode("not-json");
    const result = decodeJWT(`${validHeader}.${invalidPayload}.signature`);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid payload");
  });

  it("should preserve raw parts", () => {
    const result = decodeJWT(validToken);
    expect(result.success).toBe(true);
    expect(result.data.rawParts.header).toBe(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    );
    expect(result.data.rawParts.signature).toBe(
      "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    );
  });

  it("should handle whitespace in token", () => {
    const result = decodeJWT(`  ${validToken}  `);
    expect(result.success).toBe(true);
  });
});

describe("encodeJWT", () => {
  it("should encode a valid JWT with HS256", async () => {
    const header = { alg: "HS256" as const, typ: "JWT" };
    const payload = { sub: "1234567890", name: "John Doe", iat: 1_516_239_022 };
    const secret = "your-256-bit-secret";

    const result = await encodeJWT(header, payload, secret);
    expect(result.success).toBe(true);
    expect(result.data).toContain(".");
    expect(result.data.split(".")).toHaveLength(3);

    // Verify it can be decoded back
    const decoded = decodeJWT(result.data);
    expect(decoded.success).toBe(true);
    expect(decoded.data.header.alg).toBe("HS256");
    expect(decoded.data.payload.sub).toBe("1234567890");
  });

  it("should return error without secret", async () => {
    const header = { alg: "HS256" as const, typ: "JWT" };
    const payload = { sub: "test" };

    const result = await encodeJWT(header, payload, "");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Secret is required");
  });

  it("should return error for unsupported algorithm", async () => {
    const header = { alg: "RS256" as unknown as "HS256", typ: "JWT" };
    const payload = { sub: "test" };

    const result = await encodeJWT(header, payload, "secret");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unsupported algorithm");
  });

  it("should support HS384", async () => {
    const header = { alg: "HS384" as const, typ: "JWT" };
    const payload = { sub: "test" };

    const result = await encodeJWT(header, payload, "secret");
    expect(result.success).toBe(true);

    const decoded = decodeJWT(result.data);
    expect(decoded.data.header.alg).toBe("HS384");
  });

  it("should support HS512", async () => {
    const header = { alg: "HS512" as const, typ: "JWT" };
    const payload = { sub: "test" };

    const result = await encodeJWT(header, payload, "secret");
    expect(result.success).toBe(true);

    const decoded = decodeJWT(result.data);
    expect(decoded.data.header.alg).toBe("HS512");
  });
});

describe("verifyJWT", () => {
  // Known valid token with known secret
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  const correctSecret = "your-256-bit-secret";

  it("should verify with correct secret", async () => {
    const result = await verifyJWT(token, correctSecret);
    expect(result.success).toBe(true);
    expect(result.data).toBe(true);
  });

  it("should fail with incorrect secret", async () => {
    const result = await verifyJWT(token, "wrong-secret");
    expect(result.success).toBe(true);
    expect(result.data).toBe(false);
  });

  it("should return error for invalid token", async () => {
    const result = await verifyJWT("invalid-token", correctSecret);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should return error without secret", async () => {
    const result = await verifyJWT(token, "");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Secret is required");
  });

  it("should return error for unsupported algorithm", async () => {
    // Create a token with RS256 algorithm
    const header = base64UrlEncode('{"alg":"RS256","typ":"JWT"}');
    const payload = base64UrlEncode('{"sub":"test"}');
    const fakeToken = `${header}.${payload}.signature`;

    const result = await verifyJWT(fakeToken, "secret");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unsupported algorithm");
  });
});

describe("validateJSON", () => {
  it("should validate correct JSON object", () => {
    const result = validateJSON('{"name": "John"}');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: "John" });
  });

  it("should reject empty input", () => {
    const result = validateJSON("");
    expect(result.success).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("should reject whitespace only", () => {
    const result = validateJSON("   ");
    expect(result.success).toBe(false);
  });

  it("should reject invalid JSON", () => {
    const result = validateJSON("{invalid}");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid JSON");
  });

  it("should reject arrays", () => {
    const result = validateJSON("[1, 2, 3]");
    expect(result.success).toBe(false);
    expect(result.error).toContain("must be an object");
  });

  it("should reject primitives", () => {
    expect(validateJSON('"string"').success).toBe(false);
    expect(validateJSON("123").success).toBe(false);
    expect(validateJSON("true").success).toBe(false);
    expect(validateJSON("null").success).toBe(false);
  });

  it("should accept nested objects", () => {
    const result = validateJSON(
      '{"user": {"name": "John", "roles": ["admin"]}}'
    );
    expect(result.success).toBe(true);
  });
});

describe("formatClaimValue", () => {
  it("should format timestamp claims", () => {
    const now = Math.floor(Date.now() / 1000);
    const result = formatClaimValue("iat", now);
    expect(result.isTimestamp).toBe(true);
    expect(result.formatted).toBeTruthy();
  });

  it("should mark expired tokens", () => {
    const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const result = formatClaimValue("exp", pastTime);
    expect(result.isTimestamp).toBe(true);
    expect(result.formatted).toContain("expired");
  });

  it("should not mark future exp as expired", () => {
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const result = formatClaimValue("exp", futureTime);
    expect(result.isTimestamp).toBe(true);
    expect(result.formatted).not.toContain("expired");
  });

  it("should stringify objects", () => {
    const result = formatClaimValue("data", { foo: "bar" });
    expect(result.isTimestamp).toBe(false);
    expect(result.formatted).toBe('{"foo":"bar"}');
  });

  it("should convert non-timestamp numbers to string", () => {
    const result = formatClaimValue("count", 42);
    expect(result.isTimestamp).toBe(false);
    expect(result.formatted).toBe("42");
  });

  it("should handle string values", () => {
    const result = formatClaimValue("sub", "user123");
    expect(result.isTimestamp).toBe(false);
    expect(result.formatted).toBe("user123");
  });
});

describe("isTokenExpired", () => {
  it("should return false if no exp claim", () => {
    expect(isTokenExpired({ sub: "test" })).toBe(false);
  });

  it("should return true for past exp", () => {
    const pastTime = Math.floor(Date.now() / 1000) - 3600;
    expect(isTokenExpired({ exp: pastTime })).toBe(true);
  });

  it("should return false for future exp", () => {
    const futureTime = Math.floor(Date.now() / 1000) + 3600;
    expect(isTokenExpired({ exp: futureTime })).toBe(false);
  });

  it("should return false for non-number exp", () => {
    expect(isTokenExpired({ exp: "not-a-number" })).toBe(false);
  });
});

describe("getExpirationInfo", () => {
  it("should return no expiration for missing exp", () => {
    const result = getExpirationInfo({ sub: "test" });
    expect(result.expired).toBe(false);
    expect(result.expiresAt).toBeNull();
    expect(result.timeRemaining).toBe("No expiration");
  });

  it("should calculate time remaining for future exp", () => {
    const futureTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours
    const result = getExpirationInfo({ exp: futureTime });
    expect(result.expired).toBe(false);
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.timeRemaining).toContain("remaining");
  });

  it("should calculate expired time", () => {
    const pastTime = Math.floor(Date.now() / 1000) - 7200; // 2 hours ago
    const result = getExpirationInfo({ exp: pastTime });
    expect(result.expired).toBe(true);
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.timeRemaining).toContain("Expired");
    expect(result.timeRemaining).toContain("ago");
  });
});

describe("STANDARD_CLAIMS", () => {
  it("should have all standard claims defined", () => {
    expect(STANDARD_CLAIMS.iss).toBe("Issuer");
    expect(STANDARD_CLAIMS.sub).toBe("Subject");
    expect(STANDARD_CLAIMS.aud).toBe("Audience");
    expect(STANDARD_CLAIMS.exp).toBe("Expiration Time");
    expect(STANDARD_CLAIMS.nbf).toBe("Not Before");
    expect(STANDARD_CLAIMS.iat).toBe("Issued At");
    expect(STANDARD_CLAIMS.jti).toBe("JWT ID");
  });
});

describe("encode/decode roundtrip", () => {
  const testCases = [
    { sub: "1234567890", name: "John Doe" },
    { sub: "user@example.com", roles: ["admin", "user"] },
    { data: { nested: { value: 123 } } },
    { unicode: "你好世界", emoji: "🚀" },
  ];

  testCases.forEach((payload, index) => {
    it(`should roundtrip payload ${index + 1}`, async () => {
      const header = { alg: "HS256" as const, typ: "JWT" };
      const secret = "test-secret";

      const encoded = await encodeJWT(header, payload, secret);
      expect(encoded.success).toBe(true);

      const decoded = decodeJWT(encoded.data);
      expect(decoded.success).toBe(true);

      // Check payload matches
      for (const [key, value] of Object.entries(payload)) {
        expect(decoded.data.payload[key]).toEqual(value);
      }

      // Verify signature
      const verified = await verifyJWT(encoded.data, secret);
      expect(verified.success).toBe(true);
      expect(verified.data).toBe(true);
    });
  });
});
