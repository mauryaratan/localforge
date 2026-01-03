/**
 * HTML Symbols Browser
 *
 * Fetches and caches the official WHATWG HTML entity list.
 * Provides search, filtering, and categorization based on Unicode blocks.
 * Uses IndexedDB for caching with background revalidation.
 */

const ENTITIES_URL = "https://html.spec.whatwg.org/entities.json";
const DB_NAME = "devtools-html-symbols";
const DB_VERSION = 1;
const STORE_NAME = "entities";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const REVALIDATE_AFTER = 24 * 60 * 60 * 1000; // 1 day

// Top-level regex for entityToName function
const FIRST_CHAR_REGEX = /^./;

interface CachedData {
  id: string;
  symbols: HTMLSymbol[];
  timestamp: number;
}

/**
 * Open IndexedDB database
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

/**
 * Get cached data from IndexedDB
 */
const getFromCache = async (): Promise<CachedData | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get("html-entities");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);

      transaction.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
};

/**
 * Save data to IndexedDB cache
 */
const saveToCache = async (symbols: HTMLSymbol[]): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const data: CachedData = {
        id: "html-entities",
        symbols,
        timestamp: Date.now(),
      };
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  } catch {
    // Cache write failed silently
  }
};

export interface HTMLSymbol {
  entity: string; // e.g., "&amp;"
  character: string; // e.g., "&"
  codepoints: number[];
  name: string; // e.g., "Ampersand"
  unicode: string; // e.g., "U+0026"
  hexCode: string; // e.g., "&#x26;"
  htmlCode: string; // e.g., "&#38;"
  cssCode: string; // e.g., "\0026"
  category: SymbolCategory;
}

export type SymbolCategory =
  | "all"
  | "arrows"
  | "currency"
  | "letters"
  | "math"
  | "numbers"
  | "punctuation"
  | "symbols"
  | "greek";

export interface CategoryInfo {
  id: SymbolCategory;
  label: string;
  icon: string;
}

export const categories: CategoryInfo[] = [
  { id: "all", label: "All", icon: "★" },
  { id: "arrows", label: "Arrows", icon: "→" },
  { id: "currency", label: "Currency", icon: "$" },
  { id: "letters", label: "Letters", icon: "Aö" },
  { id: "math", label: "Math", icon: "±" },
  { id: "numbers", label: "Numbers", icon: "½" },
  { id: "punctuation", label: "Punctuation", icon: "&" },
  { id: "greek", label: "Greek", icon: "Ω" },
  { id: "symbols", label: "Symbols", icon: "©" },
];

// Category detection helper functions to reduce cognitive complexity
// Note: We use exact entity name matches for currency to avoid false positives
// like "centerdot" matching "cent"
const CURRENCY_ENTITY_NAMES = [
  "dollar",
  "cent",
  "pound",
  "euro",
  "yen",
  "curren", // &curren; is the currency sign ¤
];
const ARROW_KEYWORDS = ["arr", "arrow"];
const GREEK_KEYWORDS = [
  "alpha",
  "beta",
  "gamma",
  "delta",
  "epsilon",
  "zeta",
  "theta",
  "lambda",
  "sigma",
  "omega",
  "phi",
  "psi",
  "chi",
];
const MATH_KEYWORDS = [
  "plus",
  "minus",
  "times",
  "divide",
  "equal",
  "sum",
  "prod",
  "sqrt",
  "int",
  "infin",
  "angle",
  "perp",
];
const NUMBER_KEYWORDS = ["frac", "half", "third", "quarter", "eighth"];
const PUNCTUATION_KEYWORDS = [
  "quot",
  "apos",
  "amp",
  "dash",
  "hellip",
  "comma",
  "period",
  "colon",
  "excl",
  "quest",
];
const LETTER_KEYWORDS = [
  "acute",
  "grave",
  "circ",
  "tilde",
  "uml",
  "cedil",
  "ring",
  "slash",
  "caron",
];

const hasKeyword = (entity: string, keywords: string[]): boolean =>
  keywords.some((kw) => entity.includes(kw));

// For currency, we match exact entity names (without & and ;) to avoid false positives
const isCurrencyEntity = (entity: string): boolean => {
  // Extract the entity name between & and ;
  const name = entity.replace(/^&|;$/g, "").toLowerCase();
  return CURRENCY_ENTITY_NAMES.includes(name);
};

const isCurrency = (cp: number, entity: string): boolean =>
  cp === 0x24 || // $
  (cp >= 0xa2 && cp <= 0xa5) || // ¢ £ ¤ ¥
  (cp >= 0x20_a0 && cp <= 0x20_cf) || // Currency symbols Unicode block
  isCurrencyEntity(entity);

const isArrow = (cp: number, entity: string): boolean =>
  (cp >= 0x21_90 && cp <= 0x21_ff) ||
  (cp >= 0x27_f0 && cp <= 0x27_ff) ||
  (cp >= 0x29_00 && cp <= 0x29_7f) ||
  hasKeyword(entity, ARROW_KEYWORDS);

const isGreek = (cp: number, entity: string): boolean =>
  (cp >= 0x3_70 && cp <= 0x3_ff) || hasKeyword(entity, GREEK_KEYWORDS);

const isMath = (cp: number, entity: string): boolean =>
  (cp >= 0x22_00 && cp <= 0x22_ff) ||
  (cp >= 0x2a_00 && cp <= 0x2a_ff) ||
  [0xd7, 0xf7, 0xb1, 0xb2, 0xb3, 0xb9].includes(cp) ||
  hasKeyword(entity, MATH_KEYWORDS);

const isNumber = (cp: number, entity: string): boolean =>
  (cp >= 0x21_50 && cp <= 0x21_8f) ||
  (cp >= 0xbc && cp <= 0xbe) ||
  hasKeyword(entity, NUMBER_KEYWORDS);

const isPunctuation = (cp: number, entity: string): boolean =>
  (cp >= 0x20_00 && cp <= 0x20_6f) ||
  (cp >= 0x20 && cp <= 0x2f) ||
  (cp >= 0x3a && cp <= 0x40) ||
  (cp >= 0x5b && cp <= 0x60) ||
  (cp >= 0x7b && cp <= 0x7e) ||
  [0xa1, 0xab, 0xbb, 0xbf].includes(cp) ||
  hasKeyword(entity, PUNCTUATION_KEYWORDS);

const isLetter = (cp: number, entity: string): boolean =>
  (cp >= 0xc0 && cp <= 0xff) ||
  (cp >= 0x1_00 && cp <= 0x1_7f) ||
  (cp >= 0x1_80 && cp <= 0x2_4f) ||
  (cp >= 0x41 && cp <= 0x5a) ||
  (cp >= 0x61 && cp <= 0x7a) ||
  hasKeyword(entity, LETTER_KEYWORDS);

/**
 * Categorize a symbol based on its Unicode codepoint(s) and entity name
 */
const categorizeSymbol = (
  codepoint: number,
  entity: string
): SymbolCategory => {
  const entityLower = entity.toLowerCase();

  if (isCurrency(codepoint, entityLower)) {
    return "currency";
  }
  if (isArrow(codepoint, entityLower)) {
    return "arrows";
  }
  if (isGreek(codepoint, entityLower)) {
    return "greek";
  }
  if (isMath(codepoint, entityLower)) {
    return "math";
  }
  if (isNumber(codepoint, entityLower)) {
    return "numbers";
  }
  if (isPunctuation(codepoint, entityLower)) {
    return "punctuation";
  }
  if (isLetter(codepoint, entityLower)) {
    return "letters";
  }

  return "symbols";
};

/**
 * Convert entity name to human-readable name
 */
const entityToName = (entity: string): string => {
  // Remove & and ; from entity
  const raw = entity.replace(/^&|;$/g, "");

  // Handle common abbreviations
  const abbreviations: Record<string, string> = {
    amp: "Ampersand",
    lt: "Less Than",
    gt: "Greater Than",
    quot: "Quotation Mark",
    apos: "Apostrophe",
    nbsp: "Non-Breaking Space",
    copy: "Copyright",
    reg: "Registered",
    trade: "Trademark",
    euro: "Euro Sign",
    pound: "Pound Sign",
    yen: "Yen Sign",
    cent: "Cent Sign",
    deg: "Degree",
    plusmn: "Plus-Minus",
    times: "Multiplication",
    divide: "Division",
    ne: "Not Equal",
    le: "Less or Equal",
    ge: "Greater or Equal",
    infin: "Infinity",
    larr: "Left Arrow",
    rarr: "Right Arrow",
    uarr: "Up Arrow",
    darr: "Down Arrow",
    harr: "Left Right Arrow",
    crarr: "Carriage Return Arrow",
    lArr: "Left Double Arrow",
    rArr: "Right Double Arrow",
    uArr: "Up Double Arrow",
    dArr: "Down Double Arrow",
    hArr: "Left Right Double Arrow",
    bull: "Bullet",
    hellip: "Horizontal Ellipsis",
    prime: "Prime",
    Prime: "Double Prime",
    oline: "Overline",
    frasl: "Fraction Slash",
    ndash: "En Dash",
    mdash: "Em Dash",
    lsquo: "Left Single Quote",
    rsquo: "Right Single Quote",
    ldquo: "Left Double Quote",
    rdquo: "Right Double Quote",
    laquo: "Left Double Angle Quote",
    raquo: "Right Double Angle Quote",
    para: "Paragraph",
    sect: "Section",
    dagger: "Dagger",
    Dagger: "Double Dagger",
    permil: "Per Mille",
    spades: "Spade Suit",
    clubs: "Club Suit",
    hearts: "Heart Suit",
    diams: "Diamond Suit",
    alpha: "Greek Alpha",
    beta: "Greek Beta",
    gamma: "Greek Gamma",
    delta: "Greek Delta",
    epsilon: "Greek Epsilon",
    zeta: "Greek Zeta",
    eta: "Greek Eta",
    theta: "Greek Theta",
    iota: "Greek Iota",
    kappa: "Greek Kappa",
    lambda: "Greek Lambda",
    mu: "Greek Mu",
    nu: "Greek Nu",
    xi: "Greek Xi",
    omicron: "Greek Omicron",
    pi: "Greek Pi",
    rho: "Greek Rho",
    sigma: "Greek Sigma",
    tau: "Greek Tau",
    upsilon: "Greek Upsilon",
    phi: "Greek Phi",
    chi: "Greek Chi",
    psi: "Greek Psi",
    omega: "Greek Omega",
  };

  if (abbreviations[raw]) {
    return abbreviations[raw];
  }

  // Split camelCase and add spaces
  return raw
    .replace(/([A-Z])/g, " $1")
    .replace(FIRST_CHAR_REGEX, (str) => str.toUpperCase())
    .trim();
};

/**
 * Format codepoint to Unicode notation
 */
const formatUnicode = (codepoint: number): string => {
  const hex = codepoint.toString(16).toUpperCase().padStart(4, "0");
  return `U+${hex}`;
};

/**
 * Format codepoint to hex HTML entity
 */
const formatHexCode = (codepoint: number): string => {
  const hex = codepoint.toString(16).toLowerCase();
  return `&#x${hex};`;
};

/**
 * Format codepoint to decimal HTML entity
 */
const formatHtmlCode = (codepoint: number): string => {
  return `&#${codepoint};`;
};

/**
 * Format codepoint to CSS code
 */
const formatCssCode = (codepoint: number): string => {
  const hex = codepoint.toString(16).toUpperCase();
  return `\\${hex}`;
};

interface RawEntityData {
  codepoints: number[];
  characters: string;
}

/**
 * Additional currency symbols not in WHATWG entities.json
 * These are from the Unicode Currency Symbols block (U+20A0-U+20CF)
 * and other common currency characters
 */
const SUPPLEMENTARY_CURRENCY_SYMBOLS: Array<{
  codepoint: number;
  name: string;
}> = [
  { codepoint: 0x20_a0, name: "Euro-Currency Sign" },
  { codepoint: 0x20_a1, name: "Colon Sign" },
  { codepoint: 0x20_a2, name: "Cruzeiro Sign" },
  { codepoint: 0x20_a3, name: "French Franc Sign" },
  { codepoint: 0x20_a4, name: "Lira Sign" },
  { codepoint: 0x20_a5, name: "Mill Sign" },
  { codepoint: 0x20_a6, name: "Naira Sign" },
  { codepoint: 0x20_a7, name: "Peseta Sign" },
  { codepoint: 0x20_a8, name: "Rupee Sign" },
  { codepoint: 0x20_a9, name: "Won Sign" },
  { codepoint: 0x20_aa, name: "New Sheqel Sign" },
  { codepoint: 0x20_ab, name: "Dong Sign" },
  // 0x20AC is Euro, already in entities.json
  { codepoint: 0x20_ad, name: "Kip Sign" },
  { codepoint: 0x20_ae, name: "Tugrik Sign" },
  { codepoint: 0x20_af, name: "Drachma Sign" },
  { codepoint: 0x20_b0, name: "German Penny Sign" },
  { codepoint: 0x20_b1, name: "Peso Sign" },
  { codepoint: 0x20_b2, name: "Guarani Sign" },
  { codepoint: 0x20_b3, name: "Austral Sign" },
  { codepoint: 0x20_b4, name: "Hryvnia Sign" },
  { codepoint: 0x20_b5, name: "Cedi Sign" },
  { codepoint: 0x20_b6, name: "Livre Tournois Sign" },
  { codepoint: 0x20_b7, name: "Spesmilo Sign" },
  { codepoint: 0x20_b8, name: "Tenge Sign" },
  { codepoint: 0x20_b9, name: "Indian Rupee Sign" },
  { codepoint: 0x20_ba, name: "Turkish Lira Sign" },
  { codepoint: 0x20_bb, name: "Nordic Mark Sign" },
  { codepoint: 0x20_bc, name: "Manat Sign" },
  { codepoint: 0x20_bd, name: "Ruble Sign" },
  { codepoint: 0x20_be, name: "Lari Sign" },
  { codepoint: 0x20_bf, name: "Bitcoin Sign" },
  { codepoint: 0x20_c0, name: "Som Sign" },
];

/**
 * Create a symbol entry from a codepoint
 */
const createSymbolFromCodepoint = (
  codepoint: number,
  name: string,
  category: SymbolCategory
): HTMLSymbol => {
  const hexCode = formatHexCode(codepoint);
  return {
    entity: hexCode, // Use hex code as entity since there's no named entity
    character: String.fromCodePoint(codepoint),
    codepoints: [codepoint],
    name,
    unicode: formatUnicode(codepoint),
    hexCode,
    htmlCode: formatHtmlCode(codepoint),
    cssCode: formatCssCode(codepoint),
    category,
  };
};

/**
 * Parse the raw entities JSON into structured symbols
 */
export const parseEntitiesJson = (
  data: Record<string, RawEntityData>
): HTMLSymbol[] => {
  const symbols: HTMLSymbol[] = [];
  const seenCodepoints = new Set<number>();

  for (const [entity, info] of Object.entries(data)) {
    // Only process entities that end with semicolon (proper form)
    if (!entity.endsWith(";")) {
      continue;
    }

    const { codepoints, characters } = info;
    const primaryCodepoint = codepoints[0];

    // Skip duplicates by codepoint
    if (seenCodepoints.has(primaryCodepoint)) {
      continue;
    }
    seenCodepoints.add(primaryCodepoint);

    // Skip entities with multiple codepoints (combining characters, etc.)
    // These are harder to display correctly
    if (codepoints.length > 1) {
      continue;
    }

    // Skip control characters and non-printable
    if (
      primaryCodepoint < 32 &&
      primaryCodepoint !== 9 &&
      primaryCodepoint !== 10
    ) {
      continue;
    }

    const symbol: HTMLSymbol = {
      entity,
      character: characters,
      codepoints,
      name: entityToName(entity),
      unicode: formatUnicode(primaryCodepoint),
      hexCode: formatHexCode(primaryCodepoint),
      htmlCode: formatHtmlCode(primaryCodepoint),
      cssCode: formatCssCode(primaryCodepoint),
      category: categorizeSymbol(primaryCodepoint, entity),
    };

    symbols.push(symbol);
  }

  // Add supplementary currency symbols not in WHATWG entities
  for (const { codepoint, name } of SUPPLEMENTARY_CURRENCY_SYMBOLS) {
    if (!seenCodepoints.has(codepoint)) {
      seenCodepoints.add(codepoint);
      symbols.push(createSymbolFromCodepoint(codepoint, name, "currency"));
    }
  }

  // Sort by codepoint
  return symbols.sort((a, b) => a.codepoints[0] - b.codepoints[0]);
};

/**
 * Fetch entities from the official WHATWG source
 */
export const fetchEntities = async (): Promise<HTMLSymbol[]> => {
  const response = await fetch(ENTITIES_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch entities: ${response.status}`);
  }
  const data = await response.json();
  return parseEntitiesJson(data);
};

/**
 * Get entities from cache or fetch if needed
 */
export const getEntities = async (): Promise<HTMLSymbol[]> => {
  // Try to get from IndexedDB first
  const cached = await getFromCache();

  if (cached) {
    const cacheAge = Date.now() - cached.timestamp;

    // If cache is fresh enough, use it
    if (cacheAge < CACHE_DURATION) {
      // Schedule background revalidation if cache is older than 1 day
      if (cacheAge > REVALIDATE_AFTER) {
        revalidateInBackground();
      }
      return cached.symbols;
    }
  }

  // Fetch fresh data
  const symbols = await fetchEntities();

  // Cache the result
  await saveToCache(symbols);

  return symbols;
};

/**
 * Background revalidation
 */
const revalidateInBackground = (): void => {
  // Use requestIdleCallback if available, otherwise setTimeout
  const scheduleWork =
    typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 1000);

  scheduleWork(async () => {
    try {
      const symbols = await fetchEntities();
      await saveToCache(symbols);
    } catch {
      // Background revalidation failed silently
    }
  });
};

/**
 * Filter symbols by category
 */
export const filterByCategory = (
  symbols: HTMLSymbol[],
  category: SymbolCategory
): HTMLSymbol[] => {
  if (category === "all") {
    return symbols;
  }
  return symbols.filter((s) => s.category === category);
};

/**
 * Search symbols by query
 */
export const searchSymbols = (
  symbols: HTMLSymbol[],
  query: string
): HTMLSymbol[] => {
  if (!query.trim()) {
    return symbols;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return symbols.filter((s) => {
    // Search in character
    if (s.character === query) {
      return true;
    }
    // Search in entity name
    if (s.entity.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    // Search in human-readable name
    if (s.name.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    // Search in unicode
    if (s.unicode.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    // Search in hex code
    if (s.hexCode.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    // Search in html code
    if (s.htmlCode.includes(normalizedQuery)) {
      return true;
    }
    return false;
  });
};

/**
 * Get count of symbols per category
 */
export const getCategoryCounts = (
  symbols: HTMLSymbol[]
): Record<SymbolCategory, number> => {
  const counts: Record<SymbolCategory, number> = {
    all: symbols.length,
    arrows: 0,
    currency: 0,
    letters: 0,
    math: 0,
    numbers: 0,
    punctuation: 0,
    symbols: 0,
    greek: 0,
  };

  for (const symbol of symbols) {
    counts[symbol.category]++;
  }

  return counts;
};

/**
 * Clear the entities cache from IndexedDB
 */
export const clearCache = async (): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete("html-entities");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  } catch {
    // Cache clear failed silently
  }
};
