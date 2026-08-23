import { vi } from "vitest";

// Guard all shims so this file is safe to load in non-jsdom environments
// (e.g. certificate-parser.test.ts runs with environment: "node").
if (typeof window === "undefined") {
  // Not a browser-like environment — nothing to shim.
} else {
  // jsdom in some versions requires --localstorage-file; provide a simple
  // in-memory shim so localStorage usage in components works during tests.
  if (typeof localStorage === "undefined" || localStorage === null) {
    const store: Record<string, string> = {};
    const localStorageMock = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const key of Object.keys(store)) {
          delete store[key];
        }
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
    };
    Object.defineProperty(global, "localStorage", {
      value: localStorageMock,
      configurable: true,
    });
  }

  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  if (!global.ResizeObserver) {
    global.ResizeObserver = class {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op shim
      observe() {}
      // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op shim
      unobserve() {}
      // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op shim
      disconnect() {}
    };
  }

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }

  // URL.createObjectURL is used in json-csv page download handler
  if (!URL.createObjectURL) {
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
  }

  // navigator.clipboard is used in keycode page copy handler
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  }
}
