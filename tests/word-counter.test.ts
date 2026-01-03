import { describe, expect, it } from "vitest";
import {
  calculateAvgSentenceLength,
  calculateAvgWordLength,
  calculatePages,
  calculateReadingTime,
  calculateSpeakingTime,
  countCharacters,
  countCharactersNoSpaces,
  countLines,
  countParagraphs,
  countSentences,
  countWords,
  formatTime,
  formatTimeReadable,
  getLongestSentenceWords,
  getShortestSentenceWords,
  getTopWords,
  getUniqueWords,
  getWordCountStats,
} from "@/lib/word-counter";

describe("word-counter", () => {
  describe("countWords", () => {
    it("should count words in a simple sentence", () => {
      expect(countWords("Hello world")).toBe(2);
      expect(countWords("The quick brown fox")).toBe(4);
    });

    it("should return 0 for empty string", () => {
      expect(countWords("")).toBe(0);
      expect(countWords("   ")).toBe(0);
    });

    it("should handle multiple spaces between words", () => {
      expect(countWords("Hello    world")).toBe(2);
    });

    it("should handle newlines and tabs", () => {
      expect(countWords("Hello\nworld")).toBe(2);
      expect(countWords("Hello\tworld")).toBe(2);
    });
  });

  describe("countCharacters", () => {
    it("should count all characters including spaces", () => {
      expect(countCharacters("Hello world")).toBe(11);
      expect(countCharacters("ABC")).toBe(3);
    });

    it("should return 0 for empty string", () => {
      expect(countCharacters("")).toBe(0);
    });
  });

  describe("countCharactersNoSpaces", () => {
    it("should count characters excluding spaces", () => {
      expect(countCharactersNoSpaces("Hello world")).toBe(10);
      expect(countCharactersNoSpaces("A B C")).toBe(3);
    });

    it("should exclude all whitespace types", () => {
      expect(countCharactersNoSpaces("A\nB\tC")).toBe(3);
    });
  });

  describe("countSentences", () => {
    it("should count sentences ending with period", () => {
      expect(countSentences("Hello. World.")).toBe(2);
    });

    it("should count sentences with different punctuation", () => {
      expect(countSentences("Hello! How are you? Fine.")).toBe(3);
    });

    it("should return 0 for empty string", () => {
      expect(countSentences("")).toBe(0);
    });

    it("should handle single sentence without ending punctuation", () => {
      expect(countSentences("Hello world")).toBe(1);
    });
  });

  describe("countParagraphs", () => {
    it("should count paragraphs separated by double newlines", () => {
      expect(countParagraphs("First paragraph.\n\nSecond paragraph.")).toBe(2);
    });

    it("should return 1 for text without paragraph breaks", () => {
      expect(countParagraphs("Single paragraph text")).toBe(1);
    });

    it("should return 0 for empty string", () => {
      expect(countParagraphs("")).toBe(0);
    });
  });

  describe("countLines", () => {
    it("should count lines separated by newlines", () => {
      expect(countLines("Line 1\nLine 2\nLine 3")).toBe(3);
    });

    it("should return 1 for single line", () => {
      expect(countLines("Single line")).toBe(1);
    });

    it("should return 0 for empty string", () => {
      expect(countLines("")).toBe(0);
    });
  });

  describe("getUniqueWords", () => {
    it("should return unique words", () => {
      const unique = getUniqueWords("hello world hello");
      expect(unique).toContain("hello");
      expect(unique).toContain("world");
      expect(unique.length).toBe(2);
    });

    it("should be case insensitive", () => {
      const unique = getUniqueWords("Hello HELLO hello");
      expect(unique.length).toBe(1);
    });

    it("should return empty array for empty string", () => {
      expect(getUniqueWords("")).toEqual([]);
    });
  });

  describe("calculateAvgWordLength", () => {
    it("should calculate average word length", () => {
      expect(calculateAvgWordLength("cat dog")).toBe(3); // (3 + 3) / 2
    });

    it("should return 0 for empty string", () => {
      expect(calculateAvgWordLength("")).toBe(0);
    });
  });

  describe("calculateAvgSentenceLength", () => {
    it("should calculate average sentence length in words", () => {
      expect(calculateAvgSentenceLength("Hello world. Goodbye.")).toBe(1.5); // (2 + 1) / 2
    });

    it("should return 0 for empty string", () => {
      expect(calculateAvgSentenceLength("")).toBe(0);
    });
  });

  describe("getLongestSentenceWords", () => {
    it("should return longest sentence word count", () => {
      expect(
        getLongestSentenceWords("Hi. Hello world today. Bye.")
      ).toBe(3);
    });

    it("should return 0 for empty string", () => {
      expect(getLongestSentenceWords("")).toBe(0);
    });
  });

  describe("getShortestSentenceWords", () => {
    it("should return shortest sentence word count", () => {
      expect(
        getShortestSentenceWords("Hi. Hello world today. Bye.")
      ).toBe(1);
    });

    it("should return 0 for empty string", () => {
      expect(getShortestSentenceWords("")).toBe(0);
    });
  });

  describe("calculateReadingTime", () => {
    it("should calculate reading time in seconds", () => {
      // 265 words = 1 minute = 60 seconds
      expect(calculateReadingTime(265)).toBe(60);
    });

    it("should return 0 for 0 words", () => {
      expect(calculateReadingTime(0)).toBe(0);
    });
  });

  describe("calculateSpeakingTime", () => {
    it("should calculate speaking time in seconds", () => {
      // 150 words = 1 minute = 60 seconds
      expect(calculateSpeakingTime(150)).toBe(60);
    });

    it("should return 0 for 0 words", () => {
      expect(calculateSpeakingTime(0)).toBe(0);
    });
  });

  describe("calculatePages", () => {
    it("should calculate page count", () => {
      // 275 words per page
      expect(calculatePages(275)).toBe(1);
      expect(calculatePages(550)).toBe(2);
    });

    it("should round up partial pages", () => {
      expect(calculatePages(300)).toBe(2);
    });

    it("should return 0 for 0 words", () => {
      expect(calculatePages(0)).toBe(0);
    });
  });

  describe("formatTime", () => {
    it("should format seconds to MM:SS", () => {
      expect(formatTime(65)).toBe("1:05");
      expect(formatTime(120)).toBe("2:00");
      expect(formatTime(3661)).toBe("61:01");
    });

    it("should return 0:00 for 0 seconds", () => {
      expect(formatTime(0)).toBe("0:00");
    });
  });

  describe("formatTimeReadable", () => {
    it("should format seconds to readable string", () => {
      expect(formatTimeReadable(65)).toBe("1 min 5 sec");
      expect(formatTimeReadable(120)).toBe("2 min");
      expect(formatTimeReadable(30)).toBe("30 sec");
    });

    it("should return 0 sec for 0 seconds", () => {
      expect(formatTimeReadable(0)).toBe("0 sec");
    });
  });

  describe("getTopWords", () => {
    it("should return top words with counts", () => {
      const result = getTopWords("hello hello hello world world test", 2);
      expect(result[0]).toEqual({ word: "hello", count: 3 });
      expect(result[1]).toEqual({ word: "world", count: 2 });
    });

    it("should return empty array for empty string", () => {
      expect(getTopWords("", 5)).toEqual([]);
    });

    it("should respect limit", () => {
      const result = getTopWords("a b c d e f g", 3);
      expect(result.length).toBe(3);
    });
  });

  describe("getWordCountStats", () => {
    it("should return complete stats object", () => {
      const text = "Hello world. How are you?";
      const stats = getWordCountStats(text);

      expect(stats.words).toBe(5);
      expect(stats.characters).toBe(25);
      expect(stats.charactersNoSpaces).toBe(21);
      expect(stats.sentences).toBe(2);
      expect(stats.paragraphs).toBe(1);
      expect(typeof stats.readingTimeSeconds).toBe("number");
      expect(typeof stats.speakingTimeSeconds).toBe("number");
    });

    it("should handle empty string", () => {
      const stats = getWordCountStats("");

      expect(stats.words).toBe(0);
      expect(stats.characters).toBe(0);
      expect(stats.sentences).toBe(0);
    });
  });
});
