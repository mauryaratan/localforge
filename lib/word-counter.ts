/**
 * Word Counter utility functions
 * Provides text analysis including word count, character count, reading time, etc.
 */

export interface WordCountStats {
  words: number;
  uniqueWords: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  pages: number;
  lines: number;
  avgWordLength: number;
  avgSentenceLength: number;
  longestSentenceWords: number;
  shortestSentenceWords: number;
  readingTimeSeconds: number;
  speakingTimeSeconds: number;
}

// Average reading speed (words per minute)
const READING_WPM = 265;

// Average speaking speed (words per minute)
const SPEAKING_WPM = 150;

// Average words per page (standard double-spaced)
const WORDS_PER_PAGE = 275;

/**
 * Count words in text
 */
export const countWords = (text: string): number => {
  if (!text.trim()) return 0;

  // Split by whitespace and filter out empty strings
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
};

/**
 * Get unique words from text
 */
export const getUniqueWords = (text: string): string[] => {
  if (!text.trim()) return [];

  const words = text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ") // Keep words, spaces, apostrophes, hyphens
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/^['-]+|['-]+$/g, "")); // Trim leading/trailing punctuation

  return [...new Set(words)].filter(Boolean);
};

/**
 * Count characters in text
 */
export const countCharacters = (text: string): number => {
  return text.length;
};

/**
 * Count characters excluding spaces
 */
export const countCharactersNoSpaces = (text: string): number => {
  return text.replace(/\s/g, "").length;
};

/**
 * Count sentences in text
 */
export const countSentences = (text: string): number => {
  if (!text.trim()) return 0;

  // Match sentence-ending punctuation followed by space or end of string
  // Handles common abbreviations and edge cases
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return sentences.length;
};

/**
 * Get individual sentences from text
 */
export const getSentences = (text: string): string[] => {
  if (!text.trim()) return [];

  // Split by sentence-ending punctuation, keeping non-empty sentences
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

/**
 * Count paragraphs in text
 */
export const countParagraphs = (text: string): number => {
  if (!text.trim()) return 0;

  // Split by two or more newlines (paragraph breaks)
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // If no double newlines, count single newline separated blocks or entire text as 1
  if (paragraphs.length === 0) {
    return text.trim() ? 1 : 0;
  }

  return paragraphs.length;
};

/**
 * Count lines in text
 */
export const countLines = (text: string): number => {
  if (!text) return 0;

  return text.split("\n").length;
};

/**
 * Calculate average word length
 */
export const calculateAvgWordLength = (text: string): number => {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[^\w]/g, ""));

  if (words.length === 0) return 0;

  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  return totalLength / words.length;
};

/**
 * Calculate average sentence length in words
 */
export const calculateAvgSentenceLength = (text: string): number => {
  const sentences = getSentences(text);
  if (sentences.length === 0) return 0;

  const totalWords = sentences.reduce(
    (sum, sentence) => sum + countWords(sentence),
    0
  );
  return totalWords / sentences.length;
};

/**
 * Get longest sentence word count
 */
export const getLongestSentenceWords = (text: string): number => {
  const sentences = getSentences(text);
  if (sentences.length === 0) return 0;

  return Math.max(...sentences.map((s) => countWords(s)));
};

/**
 * Get shortest sentence word count
 */
export const getShortestSentenceWords = (text: string): number => {
  const sentences = getSentences(text);
  if (sentences.length === 0) return 0;

  return Math.min(...sentences.map((s) => countWords(s)));
};

/**
 * Calculate reading time in seconds
 */
export const calculateReadingTime = (wordCount: number): number => {
  if (wordCount === 0) return 0;
  return Math.ceil((wordCount / READING_WPM) * 60);
};

/**
 * Calculate speaking time in seconds
 */
export const calculateSpeakingTime = (wordCount: number): number => {
  if (wordCount === 0) return 0;
  return Math.ceil((wordCount / SPEAKING_WPM) * 60);
};

/**
 * Calculate page count
 */
export const calculatePages = (wordCount: number): number => {
  if (wordCount === 0) return 0;
  return Math.ceil(wordCount / WORDS_PER_PAGE);
};

/**
 * Format seconds to MM:SS string
 */
export const formatTime = (seconds: number): string => {
  if (seconds === 0) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Format seconds to human-readable string
 */
export const formatTimeReadable = (seconds: number): string => {
  if (seconds === 0) return "0 sec";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
};

/**
 * Get all word count statistics
 */
export const getWordCountStats = (text: string): WordCountStats => {
  const words = countWords(text);
  const uniqueWords = getUniqueWords(text);
  const sentences = countSentences(text);

  return {
    words,
    uniqueWords: uniqueWords.length,
    characters: countCharacters(text),
    charactersNoSpaces: countCharactersNoSpaces(text),
    sentences,
    paragraphs: countParagraphs(text),
    pages: calculatePages(words),
    lines: countLines(text),
    avgWordLength: calculateAvgWordLength(text),
    avgSentenceLength: calculateAvgSentenceLength(text),
    longestSentenceWords: getLongestSentenceWords(text),
    shortestSentenceWords: getShortestSentenceWords(text),
    readingTimeSeconds: calculateReadingTime(words),
    speakingTimeSeconds: calculateSpeakingTime(words),
  };
};

/**
 * Get top N most frequent words
 */
export const getTopWords = (
  text: string,
  limit = 10
): { word: string; count: number }[] => {
  if (!text.trim()) return [];

  const words = text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/^['-]+|['-]+$/g, ""))
    .filter((word) => word.length > 0);

  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
};

/**
 * Example texts for demonstration
 */
export const exampleTexts = {
  short:
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
  medium: `In the heart of the city, where neon lights flicker against rain-slicked streets, a lone figure walks purposefully toward an uncertain future. The night air carries whispers of change, stories untold, and dreams yet to be realized.

Every step echoes with determination. The journey ahead is long, but the destination promises everything worth fighting for. Success isn't just about reaching the end—it's about the courage to begin.`,
  long: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.`,
};
