// Keycode utility functions and data

export interface KeyEventInfo {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  location: number;
  charCode: number;
  repeat: boolean;
  isComposing: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  eventType: "keydown" | "keyup" | "keypress";
  timestamp: number;
}

export interface KeyDescription {
  name: string;
  description: string;
}

// Key location descriptions
export const locationDescriptions: Record<number, string> = {
  0: "Standard key",
  1: "Left-side modifier keys",
  2: "Right-side modifier keys",
  3: "Numpad",
};

// Key code to description mapping
export const keyCodeDescriptions: Record<number, KeyDescription> = {
  8: { name: "backspace", description: "Backspace key" },
  9: { name: "tab", description: "Tab key" },
  13: { name: "enter", description: "Enter/Return key" },
  16: { name: "shift", description: "Shift key" },
  17: { name: "ctrl", description: "Control key" },
  18: { name: "alt", description: "Alt/Option key" },
  19: { name: "pause", description: "Pause/Break key" },
  20: { name: "caps lock", description: "Caps Lock key" },
  27: { name: "escape", description: "Escape key" },
  32: { name: "space", description: "Space bar" },
  33: { name: "page up", description: "Page Up key" },
  34: { name: "page down", description: "Page Down key" },
  35: { name: "end", description: "End key" },
  36: { name: "home", description: "Home key" },
  37: { name: "left arrow", description: "Left Arrow key" },
  38: { name: "up arrow", description: "Up Arrow key" },
  39: { name: "right arrow", description: "Right Arrow key" },
  40: { name: "down arrow", description: "Down Arrow key" },
  45: { name: "insert", description: "Insert key" },
  46: { name: "delete", description: "Delete key" },
  48: { name: "0", description: "Digit 0" },
  49: { name: "1", description: "Digit 1" },
  50: { name: "2", description: "Digit 2" },
  51: { name: "3", description: "Digit 3" },
  52: { name: "4", description: "Digit 4" },
  53: { name: "5", description: "Digit 5" },
  54: { name: "6", description: "Digit 6" },
  55: { name: "7", description: "Digit 7" },
  56: { name: "8", description: "Digit 8" },
  57: { name: "9", description: "Digit 9" },
  65: { name: "a", description: "Letter A" },
  66: { name: "b", description: "Letter B" },
  67: { name: "c", description: "Letter C" },
  68: { name: "d", description: "Letter D" },
  69: { name: "e", description: "Letter E" },
  70: { name: "f", description: "Letter F" },
  71: { name: "g", description: "Letter G" },
  72: { name: "h", description: "Letter H" },
  73: { name: "i", description: "Letter I" },
  74: { name: "j", description: "Letter J" },
  75: { name: "k", description: "Letter K" },
  76: { name: "l", description: "Letter L" },
  77: { name: "m", description: "Letter M" },
  78: { name: "n", description: "Letter N" },
  79: { name: "o", description: "Letter O" },
  80: { name: "p", description: "Letter P" },
  81: { name: "q", description: "Letter Q" },
  82: { name: "r", description: "Letter R" },
  83: { name: "s", description: "Letter S" },
  84: { name: "t", description: "Letter T" },
  85: { name: "u", description: "Letter U" },
  86: { name: "v", description: "Letter V" },
  87: { name: "w", description: "Letter W" },
  88: { name: "x", description: "Letter X" },
  89: { name: "y", description: "Letter Y" },
  90: { name: "z", description: "Letter Z" },
  91: { name: "meta left", description: "Left Meta/Windows/Command key" },
  92: { name: "meta right", description: "Right Meta/Windows/Command key" },
  93: { name: "context menu", description: "Context Menu key" },
  96: { name: "numpad 0", description: "Numpad 0" },
  97: { name: "numpad 1", description: "Numpad 1" },
  98: { name: "numpad 2", description: "Numpad 2" },
  99: { name: "numpad 3", description: "Numpad 3" },
  100: { name: "numpad 4", description: "Numpad 4" },
  101: { name: "numpad 5", description: "Numpad 5" },
  102: { name: "numpad 6", description: "Numpad 6" },
  103: { name: "numpad 7", description: "Numpad 7" },
  104: { name: "numpad 8", description: "Numpad 8" },
  105: { name: "numpad 9", description: "Numpad 9" },
  106: { name: "multiply", description: "Numpad Multiply (*)" },
  107: { name: "add", description: "Numpad Add (+)" },
  109: { name: "subtract", description: "Numpad Subtract (-)" },
  110: { name: "decimal", description: "Numpad Decimal (.)" },
  111: { name: "divide", description: "Numpad Divide (/)" },
  112: { name: "f1", description: "Function key F1" },
  113: { name: "f2", description: "Function key F2" },
  114: { name: "f3", description: "Function key F3" },
  115: { name: "f4", description: "Function key F4" },
  116: { name: "f5", description: "Function key F5" },
  117: { name: "f6", description: "Function key F6" },
  118: { name: "f7", description: "Function key F7" },
  119: { name: "f8", description: "Function key F8" },
  120: { name: "f9", description: "Function key F9" },
  121: { name: "f10", description: "Function key F10" },
  122: { name: "f11", description: "Function key F11" },
  123: { name: "f12", description: "Function key F12" },
  144: { name: "num lock", description: "Num Lock key" },
  145: { name: "scroll lock", description: "Scroll Lock key" },
  186: { name: "semicolon", description: "Semicolon (;)" },
  187: { name: "equal", description: "Equal sign (=)" },
  188: { name: "comma", description: "Comma (,)" },
  189: { name: "dash", description: "Dash/Minus (-)" },
  190: { name: "period", description: "Period (.)" },
  191: { name: "forward slash", description: "Forward Slash (/)" },
  192: { name: "grave accent", description: "Grave Accent/Backtick (`)" },
  219: { name: "open bracket", description: "Open Bracket ([)" },
  220: { name: "back slash", description: "Backslash (\\)" },
  221: { name: "close bracket", description: "Close Bracket (])" },
  222: { name: "single quote", description: "Single Quote (')" },
};

// Get similar key codes (same range/type)
export const getSimilarKeyCodes = (keyCode: number): number[] => {
  const similar: number[] = [];

  // Modifier keys
  if ([16, 17, 18, 91, 92].includes(keyCode)) {
    return [16, 17, 18, 91, 92].filter((k) => k !== keyCode);
  }

  // Arrow keys
  if ([37, 38, 39, 40].includes(keyCode)) {
    return [37, 38, 39, 40].filter((k) => k !== keyCode);
  }

  // Numbers
  if (keyCode >= 48 && keyCode <= 57) {
    return Array.from({ length: 10 }, (_, i) => 48 + i).filter(
      (k) => k !== keyCode
    );
  }

  // Letters
  if (keyCode >= 65 && keyCode <= 90) {
    const index = keyCode - 65;
    const start = Math.max(0, index - 2);
    const end = Math.min(25, index + 2);
    return Array.from(
      { length: end - start + 1 },
      (_, i) => 65 + start + i
    ).filter((k) => k !== keyCode);
  }

  // Numpad
  if (keyCode >= 96 && keyCode <= 105) {
    return Array.from({ length: 10 }, (_, i) => 96 + i).filter(
      (k) => k !== keyCode
    );
  }

  // Function keys
  if (keyCode >= 112 && keyCode <= 123) {
    return Array.from({ length: 12 }, (_, i) => 112 + i).filter(
      (k) => k !== keyCode
    );
  }

  // Navigation keys
  if ([33, 34, 35, 36, 45, 46].includes(keyCode)) {
    return [33, 34, 35, 36, 45, 46].filter((k) => k !== keyCode);
  }

  return similar;
};

// Get key description
export const getKeyDescription = (keyCode: number): KeyDescription => {
  return (
    keyCodeDescriptions[keyCode] || {
      name: "unknown",
      description: `Key code ${keyCode}`,
    }
  );
};

// Get location description
export const getLocationDescription = (location: number): string => {
  return locationDescriptions[location] || "Unknown location";
};

// Get Unicode value from key
export const getUnicodeValue = (key: string): string => {
  if (key.length === 1) {
    return `U+${key.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
  }
  return "";
};

// Get Unicode character representation
export const getUnicodeChar = (key: string): string => {
  if (key.length === 1) {
    return key;
  }
  // Special key symbols
  const specialKeys: Record<string, string> = {
    Enter: "↵",
    Tab: "⇥",
    Escape: "⎋",
    Backspace: "⌫",
    Delete: "⌦",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    Shift: "⇧",
    Control: "⌃",
    Alt: "⌥",
    Meta: "⌘",
    CapsLock: "⇪",
    Space: "␣",
  };
  return specialKeys[key] || "";
};

// Convert KeyboardEvent to KeyEventInfo
export const keyboardEventToInfo = (
  event: KeyboardEvent,
  eventType: "keydown" | "keyup" | "keypress"
): KeyEventInfo => {
  return {
    key: event.key,
    code: event.code,
    keyCode: event.keyCode,
    which: event.which,
    location: event.location,
    charCode: event.charCode,
    repeat: event.repeat,
    isComposing: event.isComposing,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
    eventType,
    timestamp: Date.now(),
  };
};

// Format event as JSON for display
export const formatEventJson = (info: KeyEventInfo): string => {
  const obj = {
    key: info.key,
    keyCode: info.keyCode,
    which: info.which,
    code: info.code,
    location: info.location,
    altKey: info.altKey,
    ctrlKey: info.ctrlKey,
    metaKey: info.metaKey,
    shiftKey: info.shiftKey,
    repeat: info.repeat,
  };
  return JSON.stringify(obj, null, 2);
};

// Common key code lookup table
export const keyCodeTable: Array<{
  code: number;
  key: string;
  description: string;
}> = [
  { code: 8, key: "Backspace", description: "Backspace" },
  { code: 9, key: "Tab", description: "Tab" },
  { code: 13, key: "Enter", description: "Enter" },
  { code: 16, key: "Shift", description: "Shift" },
  { code: 17, key: "Control", description: "Ctrl" },
  { code: 18, key: "Alt", description: "Alt/Option" },
  { code: 19, key: "Pause", description: "Pause/Break" },
  { code: 20, key: "CapsLock", description: "Caps Lock" },
  { code: 27, key: "Escape", description: "Escape" },
  { code: 32, key: " ", description: "Space" },
  { code: 33, key: "PageUp", description: "Page Up" },
  { code: 34, key: "PageDown", description: "Page Down" },
  { code: 35, key: "End", description: "End" },
  { code: 36, key: "Home", description: "Home" },
  { code: 37, key: "ArrowLeft", description: "Left Arrow" },
  { code: 38, key: "ArrowUp", description: "Up Arrow" },
  { code: 39, key: "ArrowRight", description: "Right Arrow" },
  { code: 40, key: "ArrowDown", description: "Down Arrow" },
  { code: 45, key: "Insert", description: "Insert" },
  { code: 46, key: "Delete", description: "Delete" },
  { code: 91, key: "Meta", description: "Meta/Cmd/Win" },
  { code: 112, key: "F1", description: "F1" },
  { code: 113, key: "F2", description: "F2" },
  { code: 114, key: "F3", description: "F3" },
  { code: 115, key: "F4", description: "F4" },
  { code: 116, key: "F5", description: "F5" },
  { code: 117, key: "F6", description: "F6" },
  { code: 118, key: "F7", description: "F7" },
  { code: 119, key: "F8", description: "F8" },
  { code: 120, key: "F9", description: "F9" },
  { code: 121, key: "F10", description: "F10" },
  { code: 122, key: "F11", description: "F11" },
  { code: 123, key: "F12", description: "F12" },
];

// Modifier key symbols
export const modifierSymbols = {
  meta: "⌘",
  shift: "⇧",
  alt: "⌥",
  ctrl: "⌃",
};

// Get active modifiers display
export const getActiveModifiers = (info: KeyEventInfo): string[] => {
  const modifiers: string[] = [];
  if (info.metaKey) {
    modifiers.push(modifierSymbols.meta);
  }
  if (info.shiftKey) {
    modifiers.push(modifierSymbols.shift);
  }
  if (info.altKey) {
    modifiers.push(modifierSymbols.alt);
  }
  if (info.ctrlKey) {
    modifiers.push(modifierSymbols.ctrl);
  }
  return modifiers;
};
