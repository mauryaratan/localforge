/**
 * Hash generation utilities
 * Supports MD5, SHA-1, SHA-256, SHA-384, SHA-512
 */

export type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export interface HashResult {
  success: boolean;
  hash: string;
  error?: string;
}

export interface AllHashesResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha384: string;
  sha512: string;
}

/**
 * MD5 implementation (RFC 1321)
 * Pure JavaScript implementation for client-side use
 */
const md5 = (input: string): string => {
  const utf8Encode = (str: string): number[] => {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      let charCode = str.charCodeAt(i);
      if (charCode < 0x80) {
        bytes.push(charCode);
      } else if (charCode < 0x800) {
        bytes.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
      } else if (charCode < 0xd800 || charCode >= 0xe000) {
        bytes.push(
          0xe0 | (charCode >> 12),
          0x80 | ((charCode >> 6) & 0x3f),
          0x80 | (charCode & 0x3f)
        );
      } else {
        i++;
        charCode =
          0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        bytes.push(
          0xf0 | (charCode >> 18),
          0x80 | ((charCode >> 12) & 0x3f),
          0x80 | ((charCode >> 6) & 0x3f),
          0x80 | (charCode & 0x3f)
        );
      }
    }
    return bytes;
  };

  const bytes = utf8Encode(input);
  const len = bytes.length;

  // Initialize hash values
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  // Pre-processing: adding padding bits
  const paddedLen = ((len + 8) >>> 6) + 1;
  const words = new Uint32Array(paddedLen * 16);

  for (let i = 0; i < len; i++) {
    words[i >>> 2] |= bytes[i] << ((i & 3) << 3);
  }
  words[len >>> 2] |= 0x80 << ((len & 3) << 3);
  words[paddedLen * 16 - 2] = len << 3;

  // Per-round shift amounts
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
    9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
    16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
    15, 21,
  ];

  // Pre-computed constants
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000);
  }

  // Process each 512-bit block
  for (let i = 0; i < paddedLen * 16; i += 16) {
    let aa = a;
    let bb = b;
    let cc = c;
    let dd = d;

    for (let j = 0; j < 64; j++) {
      let f: number;
      let g: number;

      if (j < 16) {
        f = (bb & cc) | (~bb & dd);
        g = j;
      } else if (j < 32) {
        f = (dd & bb) | (~dd & cc);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = bb ^ cc ^ dd;
        g = (3 * j + 5) % 16;
      } else {
        f = cc ^ (bb | ~dd);
        g = (7 * j) % 16;
      }

      const temp = dd;
      dd = cc;
      cc = bb;
      const rotateAmount = s[j];
      const sum = (aa + f + K[j] + words[i + g]) >>> 0;
      bb = (bb + (((sum << rotateAmount) | (sum >>> (32 - rotateAmount))) >>> 0)) >>> 0;
      aa = temp;
    }

    a = (a + aa) >>> 0;
    b = (b + bb) >>> 0;
    c = (c + cc) >>> 0;
    d = (d + dd) >>> 0;
  }

  // Convert to hex string (little-endian)
  const toHex = (n: number): string => {
    let hex = "";
    for (let i = 0; i < 4; i++) {
      hex += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    }
    return hex;
  };

  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
};

/**
 * Generate hash using Web Crypto API (for SHA algorithms)
 */
const cryptoHash = async (
  input: string,
  algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * Generate a hash from input text
 */
export const generateHash = async (
  input: string,
  algorithm: HashAlgorithm
): Promise<HashResult> => {
  if (!input) {
    return { success: true, hash: "" };
  }

  try {
    let hash: string;

    if (algorithm === "MD5") {
      hash = md5(input);
    } else {
      hash = await cryptoHash(input, algorithm);
    }

    return { success: true, hash };
  } catch (error) {
    return {
      success: false,
      hash: "",
      error: error instanceof Error ? error.message : "Hash generation failed",
    };
  }
};

/**
 * Generate all supported hashes for input text
 */
export const generateAllHashes = async (
  input: string
): Promise<AllHashesResult> => {
  if (!input) {
    return {
      md5: "",
      sha1: "",
      sha256: "",
      sha384: "",
      sha512: "",
    };
  }

  const [sha1, sha256, sha384, sha512] = await Promise.all([
    cryptoHash(input, "SHA-1"),
    cryptoHash(input, "SHA-256"),
    cryptoHash(input, "SHA-384"),
    cryptoHash(input, "SHA-512"),
  ]);

  return {
    md5: md5(input),
    sha1,
    sha256,
    sha384,
    sha512,
  };
};

/**
 * Get information about a hash algorithm
 */
export const getAlgorithmInfo = (
  algorithm: HashAlgorithm
): { bits: number; description: string } => {
  const info: Record<HashAlgorithm, { bits: number; description: string }> = {
    MD5: {
      bits: 128,
      description: "Fast but cryptographically broken. Use for checksums only.",
    },
    "SHA-1": {
      bits: 160,
      description: "Deprecated for security. Use SHA-256 or higher.",
    },
    "SHA-256": {
      bits: 256,
      description: "Recommended. Part of SHA-2 family, widely used.",
    },
    "SHA-384": {
      bits: 384,
      description: "Truncated SHA-512. Higher security than SHA-256.",
    },
    "SHA-512": {
      bits: 512,
      description: "Highest security in SHA-2 family. Best for sensitive data.",
    },
  };
  return info[algorithm];
};

/**
 * Validate if a string could be a valid hash for a given algorithm
 */
export const isValidHashFormat = (
  hash: string,
  algorithm: HashAlgorithm
): boolean => {
  if (!hash) return false;

  const expectedLength: Record<HashAlgorithm, number> = {
    MD5: 32,
    "SHA-1": 40,
    "SHA-256": 64,
    "SHA-384": 96,
    "SHA-512": 128,
  };

  const hexPattern = /^[a-f0-9]+$/i;
  return (
    hash.length === expectedLength[algorithm] && hexPattern.test(hash)
  );
};
