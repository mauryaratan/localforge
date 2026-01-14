export type JWTAlgorithm = "HS256" | "HS384" | "HS512";

export type JWTHeader = {
  alg: JWTAlgorithm;
  typ: string;
  [key: string]: unknown;
};

export type JWTPayload = {
  [key: string]: unknown;
};

export type JWTDecoded = {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  rawParts: {
    header: string;
    payload: string;
    signature: string;
  };
};

export type JWTResult<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export const STANDARD_CLAIMS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expiration Time",
  nbf: "Not Before",
  iat: "Issued At",
  jti: "JWT ID",
};

export const base64UrlEncode = (input: string): string => {
  const utf8Bytes = new TextEncoder().encode(input);
  const binaryString = Array.from(utf8Bytes, (byte) =>
    String.fromCharCode(byte)
  ).join("");
  return btoa(binaryString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const base64UrlDecode = (input: string): string => {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }
  const binaryString = atob(base64);
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
};

export const decodeJWT = (token: string): JWTResult<JWTDecoded> => {
  if (!token || !token.trim()) {
    return {
      success: false,
      data: {} as JWTDecoded,
      error: "Token is required",
    };
  }

  const parts = token.trim().split(".");

  if (parts.length !== 3) {
    return {
      success: false,
      data: {} as JWTDecoded,
      error: "Invalid JWT format: expected 3 parts separated by dots",
    };
  }

  try {
    const headerJson = base64UrlDecode(parts[0]);
    const payloadJson = base64UrlDecode(parts[1]);

    let header: JWTHeader;
    let payload: JWTPayload;

    try {
      header = JSON.parse(headerJson);
    } catch {
      return {
        success: false,
        data: {} as JWTDecoded,
        error: "Invalid header: not valid JSON",
      };
    }

    try {
      payload = JSON.parse(payloadJson);
    } catch {
      return {
        success: false,
        data: {} as JWTDecoded,
        error: "Invalid payload: not valid JSON",
      };
    }

    return {
      success: true,
      data: {
        header,
        payload,
        signature: parts[2],
        rawParts: {
          header: parts[0],
          payload: parts[1],
          signature: parts[2],
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {} as JWTDecoded,
      error:
        error instanceof Error ? error.message : "Failed to decode JWT token",
    };
  }
};

const getHashAlgorithm = (
  alg: JWTAlgorithm
): "SHA-256" | "SHA-384" | "SHA-512" => {
  switch (alg) {
    case "HS256":
      return "SHA-256";
    case "HS384":
      return "SHA-384";
    case "HS512":
      return "SHA-512";
    default:
      return "SHA-256";
  }
};

export const createSignature = async (
  data: string,
  secret: string,
  algorithm: JWTAlgorithm
): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataToSign = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: getHashAlgorithm(algorithm) },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, dataToSign);
  const signatureArray = new Uint8Array(signature);
  const binaryString = Array.from(signatureArray, (byte) =>
    String.fromCharCode(byte)
  ).join("");

  return btoa(binaryString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const verifyJWT = async (
  token: string,
  secret: string
): Promise<JWTResult<boolean>> => {
  const decoded = decodeJWT(token);

  if (!decoded.success) {
    return {
      success: false,
      data: false,
      error: decoded.error,
    };
  }

  if (!secret) {
    return {
      success: false,
      data: false,
      error: "Secret is required for verification",
    };
  }

  try {
    const { header, rawParts } = decoded.data;
    const algorithm = header.alg as JWTAlgorithm;

    if (!["HS256", "HS384", "HS512"].includes(algorithm)) {
      return {
        success: false,
        data: false,
        error: `Unsupported algorithm: ${algorithm}. Only HS256, HS384, HS512 are supported.`,
      };
    }

    const signatureInput = `${rawParts.header}.${rawParts.payload}`;
    const expectedSignature = await createSignature(
      signatureInput,
      secret,
      algorithm
    );

    const isValid = expectedSignature === rawParts.signature;

    return {
      success: true,
      data: isValid,
    };
  } catch (error) {
    return {
      success: false,
      data: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
};

export const encodeJWT = async (
  header: JWTHeader,
  payload: JWTPayload,
  secret: string
): Promise<JWTResult<string>> => {
  if (!secret) {
    return {
      success: false,
      data: "",
      error: "Secret is required for encoding",
    };
  }

  try {
    const headerBase64 = base64UrlEncode(JSON.stringify(header));
    const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${headerBase64}.${payloadBase64}`;

    const algorithm = header.alg || "HS256";
    if (!["HS256", "HS384", "HS512"].includes(algorithm)) {
      return {
        success: false,
        data: "",
        error: `Unsupported algorithm: ${algorithm}. Only HS256, HS384, HS512 are supported.`,
      };
    }

    const signature = await createSignature(
      signatureInput,
      secret,
      algorithm as JWTAlgorithm
    );

    return {
      success: true,
      data: `${headerBase64}.${payloadBase64}.${signature}`,
    };
  } catch (error) {
    return {
      success: false,
      data: "",
      error: error instanceof Error ? error.message : "Failed to encode JWT",
    };
  }
};

export const validateJSON = (input: string): JWTResult<object> => {
  if (!input.trim()) {
    return {
      success: false,
      data: {},
      error: "Input is empty",
    };
  }

  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {
        success: false,
        data: {},
        error: "JSON must be an object",
      };
    }
    return {
      success: true,
      data: parsed,
    };
  } catch {
    return {
      success: false,
      data: {},
      error: "Invalid JSON syntax",
    };
  }
};

export const formatClaimValue = (
  key: string,
  value: unknown
): { formatted: string; isTimestamp: boolean } => {
  const timestampClaims = ["exp", "nbf", "iat"];

  if (timestampClaims.includes(key) && typeof value === "number") {
    const date = new Date(value * 1000);
    const isExpired = key === "exp" && date.getTime() < Date.now();
    const formatted = date.toLocaleString();
    return {
      formatted: isExpired ? `${formatted} (expired)` : formatted,
      isTimestamp: true,
    };
  }

  if (typeof value === "object") {
    return {
      formatted: JSON.stringify(value),
      isTimestamp: false,
    };
  }

  return {
    formatted: String(value),
    isTimestamp: false,
  };
};

export const isTokenExpired = (payload: JWTPayload): boolean => {
  if (typeof payload.exp !== "number") {
    return false;
  }
  return payload.exp * 1000 < Date.now();
};

export const getExpirationInfo = (
  payload: JWTPayload
): { expired: boolean; expiresAt: Date | null; timeRemaining: string } => {
  if (typeof payload.exp !== "number") {
    return { expired: false, expiresAt: null, timeRemaining: "No expiration" };
  }

  const expiresAt = new Date(payload.exp * 1000);
  const now = Date.now();
  const expired = expiresAt.getTime() < now;

  if (expired) {
    const diff = now - expiresAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let timeRemaining = "Expired ";
    if (days > 0) {
      timeRemaining += `${days}d ago`;
    } else if (hours > 0) {
      timeRemaining += `${hours}h ago`;
    } else if (minutes > 0) {
      timeRemaining += `${minutes}m ago`;
    } else {
      timeRemaining += "just now";
    }

    return { expired, expiresAt, timeRemaining };
  }

  const diff = expiresAt.getTime() - now;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let timeRemaining = "";
  if (days > 0) {
    timeRemaining = `${days}d ${hours % 24}h remaining`;
  } else if (hours > 0) {
    timeRemaining = `${hours}h ${minutes % 60}m remaining`;
  } else if (minutes > 0) {
    timeRemaining = `${minutes}m remaining`;
  } else {
    timeRemaining = "< 1m remaining";
  }

  return { expired, expiresAt, timeRemaining };
};

export const EXAMPLE_TOKENS = [
  {
    label: "Basic Token",
    description: "Simple JWT with name claim",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    secret: "your-256-bit-secret",
  },
  {
    label: "Admin Token",
    description: "JWT with admin role",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
    secret: "a-string-secret-at-least-256-bits-long",
  },
  {
    label: "With Expiration",
    description: "JWT with exp claim",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxODkzNDU2MDAwLCJpYXQiOjE1MTYyMzkwMjJ9.cPPW8wFAJYjk1sPmKr0G0Y6UxkVB5Fj4P0Ja8wF9_Qw",
    secret: "secret-key",
  },
];

export const DEFAULT_HEADER: JWTHeader = {
  alg: "HS256",
  typ: "JWT",
};

export const DEFAULT_PAYLOAD: JWTPayload = {
  sub: "1234567890",
  name: "John Doe",
  iat: Math.floor(Date.now() / 1000),
};
