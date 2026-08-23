import {
  type RegexResult,
  type SubstitutionResult,
  substituteRegex,
  testRegex,
} from "@/lib/regex-tester";

interface RegexWorkRequest {
  flags: string;
  id: number;
  pattern: string;
  replacement: string | null; // null = match mode, string = replace mode
  testString: string;
}

interface RegexWorkResponse {
  id: number;
  result: RegexResult;
  substitution: SubstitutionResult | null;
}

self.onmessage = (event: MessageEvent<RegexWorkRequest>) => {
  const { id, pattern, testString, flags, replacement } = event.data;
  const result = testRegex(pattern, testString, flags);
  const substitution =
    replacement === null
      ? null
      : substituteRegex(pattern, testString, replacement, flags);
  self.postMessage({ id, result, substitution } satisfies RegexWorkResponse);
};
