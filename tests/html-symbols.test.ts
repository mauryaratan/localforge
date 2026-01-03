import { beforeAll, describe, expect, it } from "vitest";
import {
  categories,
  filterByCategory,
  getCategoryCounts,
  type HTMLSymbol,
  parseEntitiesJson,
  type SymbolCategory,
  searchSymbols,
} from "@/lib/html-symbols";

// Sample entities JSON for testing
const sampleEntitiesJson = {
  "&amp;": { codepoints: [38], characters: "&" },
  "&amp": { codepoints: [38], characters: "&" }, // Without semicolon (should be skipped)
  "&lt;": { codepoints: [60], characters: "<" },
  "&gt;": { codepoints: [62], characters: ">" },
  "&copy;": { codepoints: [169], characters: "©" },
  "&euro;": { codepoints: [8364], characters: "€" },
  "&rarr;": { codepoints: [8594], characters: "→" },
  "&larr;": { codepoints: [8592], characters: "←" },
  "&frac12;": { codepoints: [189], characters: "½" },
  "&alpha;": { codepoints: [945], characters: "α" },
  "&beta;": { codepoints: [946], characters: "β" },
  "&plusmn;": { codepoints: [177], characters: "±" },
  "&times;": { codepoints: [215], characters: "×" },
  "&Aacute;": { codepoints: [193], characters: "Á" },
  "&eacute;": { codepoints: [233], characters: "é" },
};

describe("parseEntitiesJson", () => {
  it("should parse entities JSON and return structured symbols", () => {
    const symbols = parseEntitiesJson(sampleEntitiesJson);

    expect(symbols.length).toBeGreaterThan(0);
    // Should skip entities without semicolon
    expect(symbols.find((s) => s.entity === "&amp")).toBeUndefined();
    // Should include entities with semicolon
    expect(symbols.find((s) => s.entity === "&amp;")).toBeDefined();
  });

  it("should generate correct Unicode format", () => {
    const symbols = parseEntitiesJson(sampleEntitiesJson);
    const ampersand = symbols.find((s) => s.entity === "&amp;");

    expect(ampersand?.unicode).toBe("U+0026");
  });

  it("should generate correct hex code format", () => {
    const symbols = parseEntitiesJson(sampleEntitiesJson);
    const ampersand = symbols.find((s) => s.entity === "&amp;");

    expect(ampersand?.hexCode).toBe("&#x26;");
  });

  it("should generate correct HTML code format", () => {
    const symbols = parseEntitiesJson(sampleEntitiesJson);
    const ampersand = symbols.find((s) => s.entity === "&amp;");

    expect(ampersand?.htmlCode).toBe("&#38;");
  });

  it("should generate correct CSS code format", () => {
    const symbols = parseEntitiesJson(sampleEntitiesJson);
    const ampersand = symbols.find((s) => s.entity === "&amp;");

    expect(ampersand?.cssCode).toBe("\\26");
  });

  it("should sort symbols by codepoint", () => {
    const symbols = parseEntitiesJson(sampleEntitiesJson);

    for (let i = 1; i < symbols.length; i++) {
      expect(symbols[i].codepoints[0]).toBeGreaterThanOrEqual(
        symbols[i - 1].codepoints[0]
      );
    }
  });
});

describe("categorization", () => {
  let symbols: HTMLSymbol[];

  beforeAll(() => {
    symbols = parseEntitiesJson(sampleEntitiesJson);
  });

  it("should categorize currency symbols correctly", () => {
    const euro = symbols.find((s) => s.entity === "&euro;");
    expect(euro?.category).toBe("currency");
  });

  it("should categorize arrows correctly", () => {
    const rightArrow = symbols.find((s) => s.entity === "&rarr;");
    const leftArrow = symbols.find((s) => s.entity === "&larr;");

    expect(rightArrow?.category).toBe("arrows");
    expect(leftArrow?.category).toBe("arrows");
  });

  it("should categorize Greek letters correctly", () => {
    const alpha = symbols.find((s) => s.entity === "&alpha;");
    const beta = symbols.find((s) => s.entity === "&beta;");

    expect(alpha?.category).toBe("greek");
    expect(beta?.category).toBe("greek");
  });

  it("should categorize math symbols correctly", () => {
    const plusmn = symbols.find((s) => s.entity === "&plusmn;");
    const times = symbols.find((s) => s.entity === "&times;");

    expect(plusmn?.category).toBe("math");
    expect(times?.category).toBe("math");
  });

  it("should categorize fractions as numbers", () => {
    const fraction = symbols.find((s) => s.entity === "&frac12;");
    expect(fraction?.category).toBe("numbers");
  });

  it("should categorize accented letters correctly", () => {
    const aAcute = symbols.find((s) => s.entity === "&Aacute;");
    const eAcute = symbols.find((s) => s.entity === "&eacute;");

    expect(aAcute?.category).toBe("letters");
    expect(eAcute?.category).toBe("letters");
  });

  it("should categorize punctuation correctly", () => {
    const ampersand = symbols.find((s) => s.entity === "&amp;");
    const lessThan = symbols.find((s) => s.entity === "&lt;");
    const greaterThan = symbols.find((s) => s.entity === "&gt;");

    expect(ampersand?.category).toBe("punctuation");
    expect(lessThan?.category).toBe("punctuation");
    expect(greaterThan?.category).toBe("punctuation");
  });

  it("should categorize symbols correctly", () => {
    const copyright = symbols.find((s) => s.entity === "&copy;");
    expect(copyright?.category).toBe("symbols");
  });
});

describe("filterByCategory", () => {
  let symbols: HTMLSymbol[];

  beforeAll(() => {
    symbols = parseEntitiesJson(sampleEntitiesJson);
  });

  it("should return all symbols when category is 'all'", () => {
    const filtered = filterByCategory(symbols, "all");
    expect(filtered.length).toBe(symbols.length);
  });

  it("should filter by arrows category", () => {
    const filtered = filterByCategory(symbols, "arrows");
    expect(filtered.every((s) => s.category === "arrows")).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it("should filter by currency category", () => {
    const filtered = filterByCategory(symbols, "currency");
    expect(filtered.every((s) => s.category === "currency")).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it("should filter by greek category", () => {
    const filtered = filterByCategory(symbols, "greek");
    expect(filtered.every((s) => s.category === "greek")).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it("should filter by math category", () => {
    const filtered = filterByCategory(symbols, "math");
    expect(filtered.every((s) => s.category === "math")).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });
});

describe("searchSymbols", () => {
  let symbols: HTMLSymbol[];

  beforeAll(() => {
    symbols = parseEntitiesJson(sampleEntitiesJson);
  });

  it("should return all symbols when query is empty", () => {
    const results = searchSymbols(symbols, "");
    expect(results.length).toBe(symbols.length);
  });

  it("should return all symbols when query is only whitespace", () => {
    const results = searchSymbols(symbols, "   ");
    expect(results.length).toBe(symbols.length);
  });

  it("should find symbols by exact character match", () => {
    const results = searchSymbols(symbols, "&");
    expect(results.some((s) => s.character === "&")).toBe(true);
  });

  it("should find symbols by entity name", () => {
    const results = searchSymbols(symbols, "amp");
    expect(results.some((s) => s.entity === "&amp;")).toBe(true);
  });

  it("should find symbols by human-readable name", () => {
    const results = searchSymbols(symbols, "ampersand");
    expect(results.some((s) => s.entity === "&amp;")).toBe(true);
  });

  it("should find symbols by unicode", () => {
    const results = searchSymbols(symbols, "U+0026");
    expect(results.some((s) => s.entity === "&amp;")).toBe(true);
  });

  it("should find symbols by hex code", () => {
    const results = searchSymbols(symbols, "&#x26");
    expect(results.some((s) => s.entity === "&amp;")).toBe(true);
  });

  it("should find symbols by html code", () => {
    const results = searchSymbols(symbols, "&#38");
    expect(results.some((s) => s.entity === "&amp;")).toBe(true);
  });

  it("should be case-insensitive for entity names", () => {
    const results = searchSymbols(symbols, "EURO");
    expect(results.some((s) => s.entity === "&euro;")).toBe(true);
  });

  it("should be case-insensitive for human-readable names", () => {
    const results = searchSymbols(symbols, "COPYRIGHT");
    expect(
      results.some((s) => s.name.toLowerCase().includes("copyright"))
    ).toBe(true);
  });
});

describe("getCategoryCounts", () => {
  let symbols: HTMLSymbol[];

  beforeAll(() => {
    symbols = parseEntitiesJson(sampleEntitiesJson);
  });

  it("should return counts for all categories", () => {
    const counts = getCategoryCounts(symbols);

    expect(counts.all).toBe(symbols.length);
    expect(typeof counts.arrows).toBe("number");
    expect(typeof counts.currency).toBe("number");
    expect(typeof counts.letters).toBe("number");
    expect(typeof counts.math).toBe("number");
    expect(typeof counts.numbers).toBe("number");
    expect(typeof counts.punctuation).toBe("number");
    expect(typeof counts.symbols).toBe("number");
    expect(typeof counts.greek).toBe("number");
  });

  it("should have category counts that sum to total", () => {
    const counts = getCategoryCounts(symbols);
    const sumOfCategories =
      counts.arrows +
      counts.currency +
      counts.letters +
      counts.math +
      counts.numbers +
      counts.punctuation +
      counts.symbols +
      counts.greek;

    expect(sumOfCategories).toBe(counts.all);
  });
});

describe("categories constant", () => {
  it("should have all expected categories", () => {
    const categoryIds = categories.map((c) => c.id);

    expect(categoryIds).toContain("all");
    expect(categoryIds).toContain("arrows");
    expect(categoryIds).toContain("currency");
    expect(categoryIds).toContain("letters");
    expect(categoryIds).toContain("math");
    expect(categoryIds).toContain("numbers");
    expect(categoryIds).toContain("punctuation");
    expect(categoryIds).toContain("symbols");
    expect(categoryIds).toContain("greek");
  });

  it("should have labels and icons for all categories", () => {
    for (const category of categories) {
      expect(category.label).toBeTruthy();
      expect(category.icon).toBeTruthy();
    }
  });
});

describe("HTMLSymbol structure", () => {
  it("should have all required properties", () => {
    const symbols = parseEntitiesJson(sampleEntitiesJson);
    const symbol = symbols[0];

    expect(symbol).toHaveProperty("entity");
    expect(symbol).toHaveProperty("character");
    expect(symbol).toHaveProperty("codepoints");
    expect(symbol).toHaveProperty("name");
    expect(symbol).toHaveProperty("unicode");
    expect(symbol).toHaveProperty("hexCode");
    expect(symbol).toHaveProperty("htmlCode");
    expect(symbol).toHaveProperty("cssCode");
    expect(symbol).toHaveProperty("category");
  });

  it("should have valid category values", () => {
    const symbols = parseEntitiesJson(sampleEntitiesJson);
    const validCategories: SymbolCategory[] = [
      "all",
      "arrows",
      "currency",
      "letters",
      "math",
      "numbers",
      "punctuation",
      "symbols",
      "greek",
    ];

    for (const symbol of symbols) {
      expect(validCategories).toContain(symbol.category);
    }
  });
});
