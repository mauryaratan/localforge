export interface RegexFlag {
  key: string;
  label: string;
  description: string;
}

export const REGEX_FLAGS: RegexFlag[] = [
  { key: "g", label: "g", description: "Global - find all matches" },
  { key: "i", label: "i", description: "Case insensitive" },
  {
    key: "m",
    label: "m",
    description: "Multiline - ^ and $ match line start/end",
  },
  { key: "s", label: "s", description: "Dotall - . matches newlines" },
  { key: "u", label: "u", description: "Unicode - enable unicode support" },
];

export interface MatchGroup {
  value: string;
  index: number;
  name?: string;
}

export interface RegexMatch {
  fullMatch: string;
  index: number;
  endIndex: number;
  groups: MatchGroup[];
  namedGroups: Record<string, string>;
}

export interface RegexResult {
  isValid: boolean;
  error?: string;
  matches: RegexMatch[];
  matchCount: number;
  executionTime: number;
}

export interface SubstitutionResult {
  isValid: boolean;
  error?: string;
  result: string;
  replacementCount: number;
}

/**
 * Extracts capture groups from a regex match
 */
const extractGroups = (match: RegExpExecArray): MatchGroup[] => {
  const groups: MatchGroup[] = [];
  for (let i = 1; i < match.length; i++) {
    if (match[i] !== undefined) {
      groups.push({
        value: match[i],
        index: i,
      });
    }
  }
  return groups;
};

/**
 * Validates and creates a RegExp from pattern and flags
 */
export const createRegex = (
  pattern: string,
  flags: string
): { regex: RegExp | null; error: string | null } => {
  if (!pattern) {
    return { regex: null, error: null };
  }

  try {
    const regex = new RegExp(pattern, flags);
    return { regex, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Invalid regex pattern";
    return { regex: null, error };
  }
};

/**
 * Tests a regex pattern against a test string and returns all matches
 */
export const testRegex = (
  pattern: string,
  testString: string,
  flags: string
): RegexResult => {
  const startTime = performance.now();

  if (!pattern) {
    return {
      isValid: true,
      matches: [],
      matchCount: 0,
      executionTime: 0,
    };
  }

  const { regex, error } = createRegex(pattern, flags);

  if (error || !regex) {
    return {
      isValid: false,
      error: error || "Invalid pattern",
      matches: [],
      matchCount: 0,
      executionTime: performance.now() - startTime,
    };
  }

  const matches: RegexMatch[] = [];

  // For global regex, find all matches
  if (flags.includes("g")) {
    let iterations = 0;
    const maxIterations = 10_000; // Prevent infinite loops
    let match = regex.exec(testString);

    while (match !== null && iterations < maxIterations) {
      const groups = extractGroups(match);

      matches.push({
        fullMatch: match[0],
        index: match.index,
        endIndex: match.index + match[0].length,
        groups,
        namedGroups: match.groups ? { ...match.groups } : {},
      });

      // Prevent infinite loop for zero-length matches
      if (match[0].length === 0) {
        regex.lastIndex++;
      }

      iterations++;
      match = regex.exec(testString);
    }
  } else {
    // For non-global regex, only find first match
    const match = regex.exec(testString);
    if (match) {
      const groups = extractGroups(match);

      matches.push({
        fullMatch: match[0],
        index: match.index,
        endIndex: match.index + match[0].length,
        groups,
        namedGroups: match.groups ? { ...match.groups } : {},
      });
    }
  }

  return {
    isValid: true,
    matches,
    matchCount: matches.length,
    executionTime: performance.now() - startTime,
  };
};

/**
 * Performs substitution/replacement on the test string
 */
export const substituteRegex = (
  pattern: string,
  testString: string,
  replacement: string,
  flags: string
): SubstitutionResult => {
  if (!pattern) {
    return {
      isValid: true,
      result: testString,
      replacementCount: 0,
    };
  }

  const { regex, error } = createRegex(pattern, flags);

  if (error || !regex) {
    return {
      isValid: false,
      error: error || "Invalid pattern",
      result: testString,
      replacementCount: 0,
    };
  }

  // Count replacements before applying
  const matchResult = testRegex(pattern, testString, flags);
  const replacementCount = matchResult.matchCount;

  try {
    const result = testString.replace(regex, replacement);
    return {
      isValid: true,
      result,
      replacementCount,
    };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Replacement error";
    return {
      isValid: false,
      error: errMsg,
      result: testString,
      replacementCount: 0,
    };
  }
};

/**
 * Escapes special regex characters in a string
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export interface ExamplePattern {
  name: string;
  pattern: string;
  description: string;
  testString: string;
  flags?: string;
}

export const EXAMPLE_PATTERNS: ExamplePattern[] = [
  {
    name: "Email",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    description: "Match email addresses",
    testString: "Contact us at hello@example.com or support@test.org",
    flags: "gi",
  },
  {
    name: "URL",
    pattern: "https?://[\\w.-]+(?:/[\\w./-]*)?",
    description: "Match HTTP/HTTPS URLs",
    testString: "Visit https://example.com or http://test.org/path",
    flags: "gi",
  },
  {
    name: "Phone (US)",
    pattern: "\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}",
    description: "Match US phone numbers",
    testString: "Call (555) 123-4567 or 555.987.6543",
    flags: "g",
  },
  {
    name: "IPv4 Address",
    pattern:
      "\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b",
    description: "Match IPv4 addresses",
    testString: "Server IPs: 192.168.1.1, 10.0.0.255, 172.16.0.1",
    flags: "g",
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
    description: "Match ISO date format",
    testString: "Events on 2024-01-15 and 2024-12-31",
    flags: "g",
  },
  {
    name: "Hex Color",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b",
    description: "Match hex color codes",
    testString: "Colors: #fff, #000000, #3498db, #f0f",
    flags: "gi",
  },
  {
    name: "HTML Tags",
    pattern: "<([a-z]+)(?:[^>]*)>([\\s\\S]*?)</\\1>",
    description: "Match HTML tag pairs",
    testString: '<div class="test">Content</div><span>More</span>',
    flags: "gi",
  },
  {
    name: "Words",
    pattern: "\\b\\w+\\b",
    description: "Match individual words",
    testString: "Hello world, this is a test!",
    flags: "g",
  },
  {
    name: "Capture Groups",
    pattern: "(\\w+)\\s+(\\w+)",
    description: "Capture first two words",
    testString: "John Doe, Jane Smith, Bob Jones",
    flags: "g",
  },
  {
    name: "Named Groups",
    pattern: "(?<firstName>\\w+)\\s+(?<lastName>\\w+)",
    description: "Named capture groups",
    testString: "John Doe, Jane Smith",
    flags: "g",
  },
];

export interface QuickRefItem {
  token: string;
  description: string;
}

export interface QuickRefCategory {
  name: string;
  items: QuickRefItem[];
}

export const QUICK_REFERENCE: QuickRefCategory[] = [
  {
    name: "Character Classes",
    items: [
      { token: ".", description: "Any character except newline" },
      { token: "\\d", description: "Digit (0-9)" },
      { token: "\\D", description: "Non-digit" },
      { token: "\\w", description: "Word character (a-z, A-Z, 0-9, _)" },
      { token: "\\W", description: "Non-word character" },
      { token: "\\s", description: "Whitespace" },
      { token: "\\S", description: "Non-whitespace" },
      { token: "[abc]", description: "Any of a, b, or c" },
      { token: "[^abc]", description: "Not a, b, or c" },
      { token: "[a-z]", description: "Character range" },
    ],
  },
  {
    name: "Anchors",
    items: [
      { token: "^", description: "Start of string/line" },
      { token: "$", description: "End of string/line" },
      { token: "\\b", description: "Word boundary" },
      { token: "\\B", description: "Non-word boundary" },
    ],
  },
  {
    name: "Quantifiers",
    items: [
      { token: "*", description: "0 or more" },
      { token: "+", description: "1 or more" },
      { token: "?", description: "0 or 1" },
      { token: "{n}", description: "Exactly n times" },
      { token: "{n,}", description: "n or more times" },
      { token: "{n,m}", description: "Between n and m times" },
      { token: "*?", description: "0 or more (lazy)" },
      { token: "+?", description: "1 or more (lazy)" },
    ],
  },
  {
    name: "Groups",
    items: [
      { token: "(abc)", description: "Capturing group" },
      { token: "(?:abc)", description: "Non-capturing group" },
      { token: "(?<name>abc)", description: "Named group" },
      { token: "\\1", description: "Backreference to group 1" },
      { token: "a|b", description: "Alternation (a or b)" },
    ],
  },
  {
    name: "Lookahead/Lookbehind",
    items: [
      { token: "(?=abc)", description: "Positive lookahead" },
      { token: "(?!abc)", description: "Negative lookahead" },
      { token: "(?<=abc)", description: "Positive lookbehind" },
      { token: "(?<!abc)", description: "Negative lookbehind" },
    ],
  },
];
