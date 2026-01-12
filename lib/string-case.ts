export type CaseType =
  | "camelCase"
  | "PascalCase"
  | "snake_case"
  | "kebab-case"
  | "SCREAMING-KEBAB"
  | "CONSTANT_CASE"
  | "UPPER CASE"
  | "lower case"
  | "Capitalized Case"
  | "Sentence case"
  | "Title Case"
  | "slug-case"
  | "dot.case"
  | "path/case"
  | "Train-Case"
  | "flatcase"
  | "UPPERFLATCASE"
  | "sWAP cASE";

export type CaseInfo = {
  type: CaseType;
  label: string;
  description: string;
  example: string;
};

export const CASE_INFO: CaseInfo[] = [
  {
    type: "camelCase",
    label: "camelCase",
    description: "First word lowercase, subsequent words capitalized",
    example: "helloWorld",
  },
  {
    type: "PascalCase",
    label: "PascalCase",
    description: "Every word capitalized, no separators",
    example: "HelloWorld",
  },
  {
    type: "snake_case",
    label: "snake_case",
    description: "Lowercase words separated by underscores",
    example: "hello_world",
  },
  {
    type: "kebab-case",
    label: "kebab-case",
    description: "Lowercase words separated by hyphens",
    example: "hello-world",
  },
  {
    type: "SCREAMING-KEBAB",
    label: "SCREAMING-KEBAB",
    description: "Uppercase words separated by hyphens",
    example: "HELLO-WORLD",
  },
  {
    type: "CONSTANT_CASE",
    label: "CONSTANT_CASE",
    description: "Uppercase words separated by underscores",
    example: "HELLO_WORLD",
  },
  {
    type: "UPPER CASE",
    label: "UPPER CASE",
    description: "All uppercase with spaces preserved",
    example: "HELLO WORLD",
  },
  {
    type: "lower case",
    label: "lower case",
    description: "All lowercase with spaces preserved",
    example: "hello world",
  },
  {
    type: "Capitalized Case",
    label: "Capitalized Case",
    description: "First letter of each word capitalized",
    example: "Hello World",
  },
  {
    type: "Sentence case",
    label: "Sentence case",
    description: "Only first letter of sentence capitalized",
    example: "Hello world",
  },
  {
    type: "Title Case",
    label: "Title Case (APA)",
    description: "Smart capitalization following APA rules",
    example: "The Quick Brown Fox",
  },
  {
    type: "slug-case",
    label: "URL Slug",
    description: "URL-friendly lowercase with hyphens",
    example: "hello-world",
  },
  {
    type: "dot.case",
    label: "dot.case",
    description: "Lowercase words separated by dots",
    example: "hello.world",
  },
  {
    type: "path/case",
    label: "path/case",
    description: "Lowercase words separated by slashes",
    example: "hello/world",
  },
  {
    type: "Train-Case",
    label: "Train-Case",
    description: "Capitalized words separated by hyphens",
    example: "Hello-World",
  },
  {
    type: "flatcase",
    label: "flatcase",
    description: "All lowercase, no separators",
    example: "helloworld",
  },
  {
    type: "UPPERFLATCASE",
    label: "UPPERFLATCASE",
    description: "All uppercase, no separators",
    example: "HELLOWORLD",
  },
  {
    type: "sWAP cASE",
    label: "sWAP cASE",
    description: "Inverts the case of each character",
    example: "hELLO wORLD",
  },
];

// Minor words that should remain lowercase in Title Case (APA convention)
const TITLE_CASE_MINOR_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "so",
  "the",
  "to",
  "up",
  "yet",
  "is",
  "be",
  "if",
  "vs",
  "via",
]);

/**
 * Splits a string into words, handling various case formats
 */
export const splitIntoWords = (input: string): string[] => {
  if (!input.trim()) return [];

  // Handle camelCase and PascalCase by inserting spaces before capitals
  const normalized = input
    // Insert space before uppercase letters that follow lowercase letters
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // Insert space before uppercase letters that are followed by lowercase letters (for acronyms)
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    // Replace common separators with spaces
    .replace(/[_\-./\\]+/g, " ")
    // Remove extra spaces
    .replace(/\s+/g, " ")
    .trim();

  return normalized.split(" ").filter((word) => word.length > 0);
};

/**
 * Capitalizes the first letter of a word
 */
const capitalize = (word: string): string => {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

/**
 * Converts input to camelCase
 */
export const toCamelCase = (input: string): string => {
  const words = splitIntoWords(input);
  if (words.length === 0) return "";

  return words
    .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
    .join("");
};

/**
 * Converts input to PascalCase
 */
export const toPascalCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map(capitalize).join("");
};

/**
 * Converts input to snake_case
 */
export const toSnakeCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map((word) => word.toLowerCase()).join("_");
};

/**
 * Converts input to kebab-case
 */
export const toKebabCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map((word) => word.toLowerCase()).join("-");
};

/**
 * Converts input to SCREAMING-KEBAB
 */
export const toScreamingKebab = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map((word) => word.toUpperCase()).join("-");
};

/**
 * Converts input to CONSTANT_CASE
 */
export const toConstantCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map((word) => word.toUpperCase()).join("_");
};

/**
 * Converts input to UPPER CASE
 */
export const toUpperCase = (input: string): string => {
  return input.toUpperCase();
};

/**
 * Converts input to lower case
 */
export const toLowerCase = (input: string): string => {
  return input.toLowerCase();
};

/**
 * Converts input to Capitalized Case
 */
export const toCapitalizedCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map(capitalize).join(" ");
};

/**
 * Converts input to Sentence case
 */
export const toSentenceCase = (input: string): string => {
  const words = splitIntoWords(input);
  if (words.length === 0) return "";

  return words
    .map((word, index) => (index === 0 ? capitalize(word) : word.toLowerCase()))
    .join(" ");
};

/**
 * Converts input to Title Case (APA Convention)
 */
export const toTitleCase = (input: string): string => {
  const words = splitIntoWords(input);
  if (words.length === 0) return "";

  return words
    .map((word, index) => {
      const lowerWord = word.toLowerCase();
      // Always capitalize first and last words
      if (index === 0 || index === words.length - 1) {
        return capitalize(word);
      }
      // Check if it's a minor word
      if (TITLE_CASE_MINOR_WORDS.has(lowerWord)) {
        return lowerWord;
      }
      return capitalize(word);
    })
    .join(" ");
};

/**
 * Converts input to URL slug (url-friendly-slug-case)
 */
export const toSlugCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words
    .map((word) =>
      word
        .toLowerCase()
        // Remove non-alphanumeric characters except hyphens
        .replace(/[^a-z0-9-]/g, "")
    )
    .filter((word) => word.length > 0)
    .join("-");
};

/**
 * Converts input to dot.case
 */
export const toDotCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map((word) => word.toLowerCase()).join(".");
};

/**
 * Converts input to path/case
 */
export const toPathCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map((word) => word.toLowerCase()).join("/");
};

/**
 * Converts input to Train-Case
 */
export const toTrainCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map(capitalize).join("-");
};

/**
 * Converts input to flatcase
 */
export const toFlatCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map((word) => word.toLowerCase()).join("");
};

/**
 * Converts input to UPPERFLATCASE
 */
export const toUpperFlatCase = (input: string): string => {
  const words = splitIntoWords(input);
  return words.map((word) => word.toUpperCase()).join("");
};

/**
 * Converts input to sWAP cASE (inverts each character's case)
 */
export const toSwapCase = (input: string): string => {
  return input
    .split("")
    .map((char) => {
      if (char === char.toUpperCase()) {
        return char.toLowerCase();
      }
      return char.toUpperCase();
    })
    .join("");
};

/**
 * Converts input to the specified case type
 */
export const convertCase = (input: string, caseType: CaseType): string => {
  switch (caseType) {
    case "camelCase":
      return toCamelCase(input);
    case "PascalCase":
      return toPascalCase(input);
    case "snake_case":
      return toSnakeCase(input);
    case "kebab-case":
      return toKebabCase(input);
    case "SCREAMING-KEBAB":
      return toScreamingKebab(input);
    case "CONSTANT_CASE":
      return toConstantCase(input);
    case "UPPER CASE":
      return toUpperCase(input);
    case "lower case":
      return toLowerCase(input);
    case "Capitalized Case":
      return toCapitalizedCase(input);
    case "Sentence case":
      return toSentenceCase(input);
    case "Title Case":
      return toTitleCase(input);
    case "slug-case":
      return toSlugCase(input);
    case "dot.case":
      return toDotCase(input);
    case "path/case":
      return toPathCase(input);
    case "Train-Case":
      return toTrainCase(input);
    case "flatcase":
      return toFlatCase(input);
    case "UPPERFLATCASE":
      return toUpperFlatCase(input);
    case "sWAP cASE":
      return toSwapCase(input);
    default:
      return input;
  }
};

/**
 * Detects the most likely case format of the input string
 */
export const detectCase = (input: string): CaseType | null => {
  if (!input.trim()) return null;

  // Check for snake_case
  if (/^[a-z]+(_[a-z]+)+$/.test(input)) return "snake_case";

  // Check for CONSTANT_CASE
  if (/^[A-Z]+(_[A-Z]+)+$/.test(input)) return "CONSTANT_CASE";

  // Check for kebab-case
  if (/^[a-z]+(-[a-z]+)+$/.test(input)) return "kebab-case";

  // Check for SCREAMING-KEBAB
  if (/^[A-Z]+(-[A-Z]+)+$/.test(input)) return "SCREAMING-KEBAB";

  // Check for Train-Case
  if (/^[A-Z][a-z]*(-[A-Z][a-z]*)+$/.test(input)) return "Train-Case";

  // Check for dot.case
  if (/^[a-z]+(\.[a-z]+)+$/.test(input)) return "dot.case";

  // Check for path/case
  if (/^[a-z]+(\/[a-z]+)+$/.test(input)) return "path/case";

  // Check for PascalCase
  if (/^[A-Z][a-z]+([A-Z][a-z]+)+$/.test(input)) return "PascalCase";

  // Check for camelCase
  if (/^[a-z]+([A-Z][a-z]+)+$/.test(input)) return "camelCase";

  // Check for all uppercase
  if (/^[A-Z\s]+$/.test(input) && input.includes(" ")) return "UPPER CASE";

  // Check for all lowercase
  if (/^[a-z\s]+$/.test(input) && input.includes(" ")) return "lower case";

  // Check for Capitalized Case
  if (/^([A-Z][a-z]*\s)+[A-Z][a-z]*$/.test(input)) return "Capitalized Case";

  return null;
};

/**
 * Gets character count (excluding whitespace option)
 */
export const getCharacterCount = (
  input: string,
  excludeWhitespace = false
): number => {
  if (excludeWhitespace) {
    return input.replace(/\s/g, "").length;
  }
  return input.length;
};

/**
 * Gets word count
 */
export const getWordCount = (input: string): number => {
  const words = input
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  return words.length;
};
