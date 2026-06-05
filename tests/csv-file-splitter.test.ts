import { describe, expect, it } from "vitest";
import {
  bytesInText,
  splitCsvRecords,
  splitCsvTextBySize,
} from "@/lib/csv-file-splitter";

describe("splitCsvRecords", () => {
  it("keeps quoted multiline rows together", () => {
    const records = splitCsvRecords(
      'id,name,note\n1,Ada,"hello\nworld"\n2,Lin,ok'
    );

    expect(records).toEqual([
      "id,name,note",
      '1,Ada,"hello\nworld"',
      "2,Lin,ok",
    ]);
  });

  it("handles escaped quotes", () => {
    const records = splitCsvRecords('id,note\n1,"she said ""hi"""\n2,done');

    expect(records).toEqual(["id,note", '1,"she said ""hi"""', "2,done"]);
  });
});

describe("splitCsvTextBySize", () => {
  it("splits CSV into byte-sized chunks and repeats the header", () => {
    const csv = "id,name\n1,Ada\n2,Lin\n3,Grace\n4,Katherine\n";
    const result = splitCsvTextBySize(csv, {
      baseName: "people.csv",
      repeatHeader: true,
      targetBytes: bytesInText("id,name\n1,Ada\n2,Lin\n"),
    });

    expect(result.headerIncluded).toBe(true);
    expect(result.totalRows).toBe(4);
    expect(result.chunks).toHaveLength(3);
    expect(result.chunks[0]?.fileName).toBe("people-part-01.csv");
    expect(result.chunks[0]?.content).toBe("id,name\n1,Ada\n2,Lin\n");
    expect(result.chunks[1]?.content).toBe("id,name\n3,Grace\n");
    expect(result.chunks[2]?.content).toBe("id,name\n4,Katherine\n");
  });

  it("can split without repeating the first row", () => {
    const result = splitCsvTextBySize("a\nb\nc\n", {
      repeatHeader: false,
      targetBytes: bytesInText("a\nb\n"),
    });

    expect(result.headerIncluded).toBe(false);
    expect(result.totalRows).toBe(3);
    expect(result.chunks.map((chunk) => chunk.content)).toEqual([
      "a\nb\n",
      "c\n",
    ]);
  });

  it("keeps an oversized row intact", () => {
    const result = splitCsvTextBySize("id,note\n1,short\n2,very-very-long\n", {
      repeatHeader: true,
      targetBytes: bytesInText("id,note\n1,short\n"),
    });

    expect(result.oversizedRows).toBe(1);
    expect(result.chunks.at(-1)?.content).toBe("id,note\n2,very-very-long\n");
  });

  it("returns no chunks for an empty file", () => {
    const result = splitCsvTextBySize("", {
      repeatHeader: true,
      targetBytes: 1024,
    });

    expect(result.chunks).toEqual([]);
    expect(result.totalRows).toBe(0);
  });
});
