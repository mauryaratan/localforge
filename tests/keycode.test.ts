import { describe, expect, it } from "vitest";
import {
  formatEventJson,
  getKeyDescription,
  getLocationDescription,
  getSimilarKeyCodes,
  getUnicodeChar,
  getUnicodeValue,
  type KeyEventInfo,
  keyCodeDescriptions,
  keyCodeTable,
  locationDescriptions,
  modifierSymbols,
} from "@/lib/keycode";

describe("getKeyDescription", () => {
  it("should return description for known key codes", () => {
    const enterKey = getKeyDescription(13);
    expect(enterKey.name).toBe("enter");
    expect(enterKey.description).toBe("Enter/Return key");
  });

  it("should return description for letter keys", () => {
    const aKey = getKeyDescription(65);
    expect(aKey.name).toBe("a");
    expect(aKey.description).toBe("Letter A");
  });

  it("should return description for function keys", () => {
    const f1Key = getKeyDescription(112);
    expect(f1Key.name).toBe("f1");
    expect(f1Key.description).toBe("Function key F1");
  });

  it("should return unknown for undefined key codes", () => {
    const unknownKey = getKeyDescription(999);
    expect(unknownKey.name).toBe("unknown");
    expect(unknownKey.description).toBe("Key code 999");
  });

  it("should return description for modifier keys", () => {
    const shiftKey = getKeyDescription(16);
    expect(shiftKey.name).toBe("shift");
    expect(shiftKey.description).toBe("Shift key");

    const ctrlKey = getKeyDescription(17);
    expect(ctrlKey.name).toBe("ctrl");
    expect(ctrlKey.description).toBe("Control key");
  });
});

describe("getLocationDescription", () => {
  it("should return standard key for location 0", () => {
    expect(getLocationDescription(0)).toBe("Standard key");
  });

  it("should return left-side for location 1", () => {
    expect(getLocationDescription(1)).toBe("Left-side modifier keys");
  });

  it("should return right-side for location 2", () => {
    expect(getLocationDescription(2)).toBe("Right-side modifier keys");
  });

  it("should return numpad for location 3", () => {
    expect(getLocationDescription(3)).toBe("Numpad");
  });

  it("should return unknown for invalid location", () => {
    expect(getLocationDescription(99)).toBe("Unknown location");
  });
});

describe("getUnicodeValue", () => {
  it("should return Unicode for single character", () => {
    expect(getUnicodeValue("A")).toBe("U+0041");
    expect(getUnicodeValue("a")).toBe("U+0061");
    expect(getUnicodeValue("1")).toBe("U+0031");
  });

  it("should return empty string for multi-character keys", () => {
    expect(getUnicodeValue("Enter")).toBe("");
    expect(getUnicodeValue("Shift")).toBe("");
  });

  it("should handle special characters", () => {
    expect(getUnicodeValue("@")).toBe("U+0040");
    expect(getUnicodeValue(" ")).toBe("U+0020");
  });
});

describe("getUnicodeChar", () => {
  it("should return the character for single char keys", () => {
    expect(getUnicodeChar("A")).toBe("A");
    expect(getUnicodeChar("5")).toBe("5");
  });

  it("should return special symbols for known special keys", () => {
    expect(getUnicodeChar("Enter")).toBe("↵");
    expect(getUnicodeChar("Tab")).toBe("⇥");
    expect(getUnicodeChar("Escape")).toBe("⎋");
    expect(getUnicodeChar("Backspace")).toBe("⌫");
    expect(getUnicodeChar("ArrowUp")).toBe("↑");
    expect(getUnicodeChar("ArrowDown")).toBe("↓");
    expect(getUnicodeChar("Shift")).toBe("⇧");
    expect(getUnicodeChar("Control")).toBe("⌃");
    expect(getUnicodeChar("Alt")).toBe("⌥");
    expect(getUnicodeChar("Meta")).toBe("⌘");
  });

  it("should return empty string for unknown multi-char keys", () => {
    expect(getUnicodeChar("F12")).toBe("");
    expect(getUnicodeChar("Unknown")).toBe("");
  });
});

describe("getSimilarKeyCodes", () => {
  it("should return similar modifier keys", () => {
    const similar = getSimilarKeyCodes(16); // Shift
    expect(similar).toContain(17); // Ctrl
    expect(similar).toContain(18); // Alt
    expect(similar).not.toContain(16); // Not the same key
  });

  it("should return similar arrow keys", () => {
    const similar = getSimilarKeyCodes(37); // Left arrow
    expect(similar).toContain(38); // Up
    expect(similar).toContain(39); // Right
    expect(similar).toContain(40); // Down
    expect(similar).not.toContain(37);
  });

  it("should return similar number keys", () => {
    const similar = getSimilarKeyCodes(53); // Digit 5
    expect(similar).toContain(48); // 0
    expect(similar).toContain(57); // 9
    expect(similar).not.toContain(53);
  });

  it("should return similar letter keys", () => {
    const similar = getSimilarKeyCodes(77); // M
    expect(similar.length).toBeGreaterThan(0);
    expect(similar).not.toContain(77);
    // Should include nearby letters
    expect(similar.some((k) => k >= 65 && k <= 90)).toBe(true);
  });

  it("should return similar function keys", () => {
    const similar = getSimilarKeyCodes(116); // F5
    expect(similar).toContain(112); // F1
    expect(similar).toContain(123); // F12
    expect(similar).not.toContain(116);
  });

  it("should return similar numpad keys", () => {
    const similar = getSimilarKeyCodes(101); // Numpad 5
    expect(similar).toContain(96); // Numpad 0
    expect(similar).toContain(105); // Numpad 9
    expect(similar).not.toContain(101);
  });

  it("should return empty array for keys without similar group", () => {
    const similar = getSimilarKeyCodes(8); // Backspace
    expect(similar).toEqual([]);
  });
});

describe("formatEventJson", () => {
  const mockEvent: KeyEventInfo = {
    key: "a",
    code: "KeyA",
    keyCode: 65,
    which: 65,
    location: 0,
    charCode: 97,
    repeat: false,
    isComposing: false,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    eventType: "keydown",
    timestamp: Date.now(),
  };

  it("should format event as JSON string", () => {
    const json = formatEventJson(mockEvent);
    expect(json).toContain('"key": "a"');
    expect(json).toContain('"code": "KeyA"');
    expect(json).toContain('"keyCode": 65');
  });

  it("should include modifier states", () => {
    const modifiedEvent: KeyEventInfo = {
      ...mockEvent,
      shiftKey: true,
      ctrlKey: true,
    };
    const json = formatEventJson(modifiedEvent);
    expect(json).toContain('"shiftKey": true');
    expect(json).toContain('"ctrlKey": true');
  });

  it("should be valid JSON", () => {
    const json = formatEventJson(mockEvent);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

describe("keyCodeDescriptions", () => {
  it("should have descriptions for all number keys", () => {
    for (let i = 48; i <= 57; i++) {
      expect(keyCodeDescriptions[i]).toBeDefined();
      expect(keyCodeDescriptions[i].name).toBe(String(i - 48));
    }
  });

  it("should have descriptions for all letter keys", () => {
    for (let i = 65; i <= 90; i++) {
      expect(keyCodeDescriptions[i]).toBeDefined();
      const letter = String.fromCharCode(i).toLowerCase();
      expect(keyCodeDescriptions[i].name).toBe(letter);
    }
  });

  it("should have descriptions for function keys F1-F12", () => {
    for (let i = 112; i <= 123; i++) {
      expect(keyCodeDescriptions[i]).toBeDefined();
      expect(keyCodeDescriptions[i].name).toBe(`f${i - 111}`);
    }
  });
});

describe("locationDescriptions", () => {
  it("should have all four standard locations", () => {
    expect(Object.keys(locationDescriptions)).toHaveLength(4);
    expect(locationDescriptions[0]).toBeDefined();
    expect(locationDescriptions[1]).toBeDefined();
    expect(locationDescriptions[2]).toBeDefined();
    expect(locationDescriptions[3]).toBeDefined();
  });
});

describe("modifierSymbols", () => {
  it("should have correct symbols", () => {
    expect(modifierSymbols.meta).toBe("⌘");
    expect(modifierSymbols.shift).toBe("⇧");
    expect(modifierSymbols.alt).toBe("⌥");
    expect(modifierSymbols.ctrl).toBe("⌃");
  });
});

describe("keyCodeTable", () => {
  it("should have common keys", () => {
    const codes = keyCodeTable.map((k) => k.code);
    expect(codes).toContain(13); // Enter
    expect(codes).toContain(27); // Escape
    expect(codes).toContain(32); // Space
    expect(codes).toContain(9); // Tab
  });

  it("should have valid structure for all entries", () => {
    for (const entry of keyCodeTable) {
      expect(typeof entry.code).toBe("number");
      expect(typeof entry.key).toBe("string");
      expect(typeof entry.description).toBe("string");
      expect(entry.code).toBeGreaterThan(0);
    }
  });
});
