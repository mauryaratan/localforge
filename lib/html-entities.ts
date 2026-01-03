/**
 * HTML Entity Encoder/Decoder
 *
 * Handles encoding of special characters to HTML entities and decoding back.
 * Supports named entities, decimal, and hexadecimal formats.
 */

// Named HTML entities map (most common ones)
export const namedEntities: Record<string, string> = {
  // ASCII special characters
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
  // Whitespace
  " ": "&nbsp;",
  // Currency
  "¢": "&cent;",
  "£": "&pound;",
  "¥": "&yen;",
  "€": "&euro;",
  // Symbols
  "©": "&copy;",
  "®": "&reg;",
  "™": "&trade;",
  "§": "&sect;",
  "¶": "&para;",
  "†": "&dagger;",
  "‡": "&Dagger;",
  "•": "&bull;",
  "…": "&hellip;",
  "′": "&prime;",
  "″": "&Prime;",
  // Math
  "±": "&plusmn;",
  "×": "&times;",
  "÷": "&divide;",
  "−": "&minus;",
  "≠": "&ne;",
  "≤": "&le;",
  "≥": "&ge;",
  "∞": "&infin;",
  "√": "&radic;",
  "∑": "&sum;",
  "∏": "&prod;",
  "∫": "&int;",
  // Arrows
  "←": "&larr;",
  "→": "&rarr;",
  "↑": "&uarr;",
  "↓": "&darr;",
  "↔": "&harr;",
  // Greek letters (commonly used)
  α: "&alpha;",
  β: "&beta;",
  γ: "&gamma;",
  δ: "&delta;",
  ε: "&epsilon;",
  π: "&pi;",
  σ: "&sigma;",
  ω: "&omega;",
  // Quotes
  "\u2018": "&lsquo;",
  "\u2019": "&rsquo;",
  "\u201C": "&ldquo;",
  "\u201D": "&rdquo;",
  "«": "&laquo;",
  "»": "&raquo;",
  // Dashes
  "–": "&ndash;",
  "—": "&mdash;",
  // Accented characters (common)
  à: "&agrave;",
  á: "&aacute;",
  â: "&acirc;",
  ã: "&atilde;",
  ä: "&auml;",
  å: "&aring;",
  æ: "&aelig;",
  ç: "&ccedil;",
  è: "&egrave;",
  é: "&eacute;",
  ê: "&ecirc;",
  ë: "&euml;",
  ì: "&igrave;",
  í: "&iacute;",
  î: "&icirc;",
  ï: "&iuml;",
  ñ: "&ntilde;",
  ò: "&ograve;",
  ó: "&oacute;",
  ô: "&ocirc;",
  õ: "&otilde;",
  ö: "&ouml;",
  ù: "&ugrave;",
  ú: "&uacute;",
  û: "&ucirc;",
  ü: "&uuml;",
  ý: "&yacute;",
  ÿ: "&yuml;",
  // Uppercase accented
  À: "&Agrave;",
  Á: "&Aacute;",
  Â: "&Acirc;",
  Ã: "&Atilde;",
  Ä: "&Auml;",
  Å: "&Aring;",
  Æ: "&AElig;",
  Ç: "&Ccedil;",
  È: "&Egrave;",
  É: "&Eacute;",
  Ê: "&Ecirc;",
  Ë: "&Euml;",
  Ì: "&Igrave;",
  Í: "&Iacute;",
  Î: "&Icirc;",
  Ï: "&Iuml;",
  Ñ: "&Ntilde;",
  Ò: "&Ograve;",
  Ó: "&Oacute;",
  Ô: "&Ocirc;",
  Õ: "&Otilde;",
  Ö: "&Ouml;",
  Ù: "&Ugrave;",
  Ú: "&Uacute;",
  Û: "&Ucirc;",
  Ü: "&Uuml;",
  Ý: "&Yacute;",
  Ÿ: "&Yuml;",
  // Other common
  "¡": "&iexcl;",
  "¿": "&iquest;",
  "°": "&deg;",
  "¬": "&not;",
  "¦": "&brvbar;",
  µ: "&micro;",
};

// Create reverse mapping for decoding
export const namedEntitiesReverse: Record<string, string> = Object.fromEntries(
  Object.entries(namedEntities).map(([char, entity]) => [entity, char])
);

export type EncodingMode = "named" | "decimal" | "hexadecimal";

export interface EncodeOptions {
  mode: EncodingMode;
  encodeAll: boolean; // Encode all characters or just special ones
}

export interface DecodeResult {
  decoded: string;
  isValid: boolean;
  error?: string;
}

export interface EncodeResult {
  encoded: string;
  isValid: boolean;
  error?: string;
}

// Unicode max code point constant
const MAX_UNICODE_CODE_POINT = 0x10_ff_ff;

// Regex patterns for entity detection (defined at module level for performance)
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]$/;
const SPECIAL_CHARS_REGEX = /[^\x20-\x7E]|[&<>"']/;
const NAMED_ENTITY_REGEX = /&[a-zA-Z]+;/g;
const DECIMAL_ENTITY_REGEX = /&#(\d+);/g;
const HEX_ENTITY_REGEX = /&#[xX]([0-9a-fA-F]+);/g;
const NAMED_ENTITY_TEST_REGEX = /&[a-zA-Z]+;/;
const DECIMAL_ENTITY_TEST_REGEX = /&#\d+;/;
const HEX_ENTITY_TEST_REGEX = /&#[xX][0-9a-fA-F]+;/;

/**
 * Check if a character needs encoding (for minimal encoding)
 */
const needsEncoding = (char: string, encodeAll: boolean): boolean => {
  if (encodeAll) {
    // Encode everything except basic alphanumeric
    return !ALPHANUMERIC_REGEX.test(char);
  }
  // Only encode unsafe and non-ASCII characters
  return SPECIAL_CHARS_REGEX.test(char);
};

/**
 * Encode a single character to HTML entity
 */
const encodeChar = (char: string, mode: EncodingMode): string => {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) {
    return char;
  }

  switch (mode) {
    case "named": {
      const named = namedEntities[char];
      if (named) {
        return named;
      }
      // Fall back to hexadecimal for characters without named entities
      return `&#x${codePoint.toString(16).toUpperCase()};`;
    }
    case "decimal":
      return `&#${codePoint};`;
    case "hexadecimal":
      return `&#x${codePoint.toString(16).toUpperCase()};`;
    default:
      return char;
  }
};

/**
 * Encode text to HTML entities
 */
export const encodeHTMLEntities = (
  text: string,
  options: EncodeOptions = { mode: "named", encodeAll: false }
): EncodeResult => {
  if (!text) {
    return { encoded: "", isValid: true };
  }

  try {
    const { mode, encodeAll } = options;
    const chars = [...text]; // Handle Unicode properly

    const encoded = chars
      .map((char) => {
        if (needsEncoding(char, encodeAll)) {
          return encodeChar(char, mode);
        }
        return char;
      })
      .join("");

    return { encoded, isValid: true };
  } catch (error) {
    return {
      encoded: text,
      isValid: false,
      error: error instanceof Error ? error.message : "Encoding failed",
    };
  }
};

/**
 * Decode HTML entities to text
 */
export const decodeHTMLEntities = (text: string): DecodeResult => {
  if (!text) {
    return { decoded: "", isValid: true };
  }

  try {
    let decoded = text;

    // Decode named entities
    decoded = decoded.replace(NAMED_ENTITY_REGEX, (match) => {
      const char = namedEntitiesReverse[match];
      return char !== undefined ? char : match;
    });

    // Decode decimal entities (&#123;)
    decoded = decoded.replace(DECIMAL_ENTITY_REGEX, (_, dec) => {
      const codePoint = Number.parseInt(dec, 10);
      if (
        Number.isNaN(codePoint) ||
        codePoint < 0 ||
        codePoint > MAX_UNICODE_CODE_POINT
      ) {
        return `&#${dec};`; // Return original if invalid
      }
      return String.fromCodePoint(codePoint);
    });

    // Decode hexadecimal entities (&#x1F4A9; or &#X1F4A9;)
    decoded = decoded.replace(HEX_ENTITY_REGEX, (_, hex) => {
      const codePoint = Number.parseInt(hex, 16);
      if (
        Number.isNaN(codePoint) ||
        codePoint < 0 ||
        codePoint > MAX_UNICODE_CODE_POINT
      ) {
        return `&#x${hex};`; // Return original if invalid
      }
      return String.fromCodePoint(codePoint);
    });

    return { decoded, isValid: true };
  } catch (error) {
    return {
      decoded: text,
      isValid: false,
      error: error instanceof Error ? error.message : "Decoding failed",
    };
  }
};

/**
 * Detect if text contains HTML entities
 */
export const containsHTMLEntities = (text: string): boolean => {
  // Named entities
  if (NAMED_ENTITY_TEST_REGEX.test(text)) {
    return true;
  }
  // Decimal entities
  if (DECIMAL_ENTITY_TEST_REGEX.test(text)) {
    return true;
  }
  // Hexadecimal entities
  if (HEX_ENTITY_TEST_REGEX.test(text)) {
    return true;
  }
  return false;
};

/**
 * Get information about HTML entities in text
 */
export interface EntityInfo {
  entity: string;
  decoded: string;
  type: "named" | "decimal" | "hexadecimal";
  position: number;
}

export const findEntities = (text: string): EntityInfo[] => {
  const entities: EntityInfo[] = [];

  // Find named entities
  const namedRegex = /&[a-zA-Z]+;/g;
  let match: RegExpExecArray | null;

  namedRegex.lastIndex = 0;
  match = namedRegex.exec(text);
  while (match !== null) {
    const decoded = namedEntitiesReverse[match[0]];
    if (decoded) {
      entities.push({
        entity: match[0],
        decoded,
        type: "named",
        position: match.index,
      });
    }
    match = namedRegex.exec(text);
  }

  // Find decimal entities
  const decimalRegex = /&#(\d+);/g;
  decimalRegex.lastIndex = 0;
  match = decimalRegex.exec(text);
  while (match !== null) {
    const codePoint = Number.parseInt(match[1], 10);
    if (
      !Number.isNaN(codePoint) &&
      codePoint >= 0 &&
      codePoint <= MAX_UNICODE_CODE_POINT
    ) {
      entities.push({
        entity: match[0],
        decoded: String.fromCodePoint(codePoint),
        type: "decimal",
        position: match.index,
      });
    }
    match = decimalRegex.exec(text);
  }

  // Find hexadecimal entities
  const hexRegex = /&#[xX]([0-9a-fA-F]+);/g;
  hexRegex.lastIndex = 0;
  match = hexRegex.exec(text);
  while (match !== null) {
    const codePoint = Number.parseInt(match[1], 16);
    if (
      !Number.isNaN(codePoint) &&
      codePoint >= 0 &&
      codePoint <= MAX_UNICODE_CODE_POINT
    ) {
      entities.push({
        entity: match[0],
        decoded: String.fromCodePoint(codePoint),
        type: "hexadecimal",
        position: match.index,
      });
    }
    match = hexRegex.exec(text);
  }

  // Sort by position
  return entities.sort((a, b) => a.position - b.position);
};

/**
 * Common HTML entities for quick reference
 */
export const commonEntities = [
  { char: "&", entity: "&amp;", name: "Ampersand" },
  { char: "<", entity: "&lt;", name: "Less than" },
  { char: ">", entity: "&gt;", name: "Greater than" },
  { char: '"', entity: "&quot;", name: "Double quote" },
  { char: "'", entity: "&apos;", name: "Apostrophe" },
  { char: " ", entity: "&nbsp;", name: "Non-breaking space" },
  { char: "©", entity: "&copy;", name: "Copyright" },
  { char: "®", entity: "&reg;", name: "Registered" },
  { char: "™", entity: "&trade;", name: "Trademark" },
  { char: "€", entity: "&euro;", name: "Euro" },
  { char: "£", entity: "&pound;", name: "Pound" },
  { char: "¥", entity: "&yen;", name: "Yen" },
  { char: "→", entity: "&rarr;", name: "Right arrow" },
  { char: "←", entity: "&larr;", name: "Left arrow" },
  { char: "•", entity: "&bull;", name: "Bullet" },
  { char: "…", entity: "&hellip;", name: "Ellipsis" },
];
