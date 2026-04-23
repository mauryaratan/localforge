import {
  type Change,
  createTwoFilesPatch,
  diffLines,
  diffWordsWithSpace,
} from "diff";

export type DiffGranularity = "lines" | "words";

export interface DiffStats {
  additions: number;
  changedBlocks: number;
  deletions: number;
  unchanged: number;
}

export interface DiffSegment {
  id: string;
  newLineNumber: number | null;
  oldLineNumber: number | null;
  type: "added" | "removed" | "unchanged";
  value: string;
}

export interface DiffResult {
  hasChanges: boolean;
  patch: string;
  segments: DiffSegment[];
  stats: DiffStats;
}

const countLineUnits = (value: string): number => {
  if (!value) {
    return 0;
  }

  const normalized = value.endsWith("\n") ? value.slice(0, -1) : value;
  return normalized.length === 0 ? 1 : normalized.split("\n").length;
};

const createSegments = (changes: Change[]): DiffSegment[] => {
  const segments: DiffSegment[] = [];
  let oldLineNumber = 1;
  let newLineNumber = 1;

  changes.forEach((change, changeIndex) => {
    let type: DiffSegment["type"] = "unchanged";
    if (change.added) {
      type = "added";
    } else if (change.removed) {
      type = "removed";
    }
    const lines = change.value.endsWith("\n")
      ? change.value.slice(0, -1).split("\n")
      : change.value.split("\n");

    lines.forEach((line, lineIndex) => {
      const oldNumber = type === "added" ? null : oldLineNumber;
      const newNumber = type === "removed" ? null : newLineNumber;

      segments.push({
        id: `${changeIndex}-${lineIndex}`,
        newLineNumber: newNumber,
        oldLineNumber: oldNumber,
        type,
        value: line,
      });

      if (type !== "added") {
        oldLineNumber += 1;
      }
      if (type !== "removed") {
        newLineNumber += 1;
      }
    });
  });

  return segments;
};

const createStats = (changes: Change[]): DiffStats =>
  changes.reduce<DiffStats>(
    (stats, change) => {
      const units = countLineUnits(change.value);

      if (change.added) {
        stats.additions += units;
        stats.changedBlocks += 1;
      } else if (change.removed) {
        stats.deletions += units;
        stats.changedBlocks += 1;
      } else {
        stats.unchanged += units;
      }

      return stats;
    },
    { additions: 0, changedBlocks: 0, deletions: 0, unchanged: 0 }
  );

export const createDiff = (
  original: string,
  modified: string,
  granularity: DiffGranularity = "lines"
): DiffResult => {
  const changes =
    granularity === "words"
      ? diffWordsWithSpace(original, modified)
      : diffLines(original, modified);
  const patch = createTwoFilesPatch(
    "Original",
    "Modified",
    original,
    modified,
    "",
    "",
    { context: 4 }
  );
  const stats = createStats(changes);

  return {
    hasChanges: stats.additions > 0 || stats.deletions > 0,
    patch,
    segments: createSegments(changes),
    stats,
  };
};

export const normalizeForDiff = (
  value: string,
  options: { trimTrailingWhitespace?: boolean }
): string => {
  if (!options.trimTrailingWhitespace) {
    return value;
  }

  return value
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
};

export const diffExamples = {
  original: `export const formatUser = (user) => {
  return user.name;
};

const timeout = 5000;`,
  modified: `export const formatUser = (user) => {
  return user.displayName ?? user.name;
};

const timeout = 7500;
const retries = 3;`,
};
