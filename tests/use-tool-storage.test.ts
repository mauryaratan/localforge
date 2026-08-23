import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createStorageMock = (): Storage => {
  const store = new Map<string, string>();
  return {
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
};

describe("useToolStorage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.stubGlobal("localStorage", createStorageMock());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("initializes from localStorage when a value exists", async () => {
    localStorage.setItem("devtools:test:key", "stored-value");
    const { useToolStorage } = await import("@/hooks/use-tool-storage");
    const { result } = renderHook(() =>
      useToolStorage("devtools:test:key", "fallback")
    );
    expect(result.current[0]).toBe("stored-value");
  });

  it("initializes to fallback when storage is empty", async () => {
    const { useToolStorage } = await import("@/hooks/use-tool-storage");
    const { result } = renderHook(() =>
      useToolStorage("devtools:test:empty", "my-fallback")
    );
    expect(result.current[0]).toBe("my-fallback");
  });

  it("does NOT write on mount", async () => {
    const { useToolStorage } = await import("@/hooks/use-tool-storage");
    renderHook(() => useToolStorage("devtools:test:nomount", "initial"));
    vi.advanceTimersByTime(400);
    expect(localStorage.getItem("devtools:test:nomount")).toBeNull();
  });

  it("writes the new value ~300ms after setValue", async () => {
    const { useToolStorage } = await import("@/hooks/use-tool-storage");
    const { result } = renderHook(() =>
      useToolStorage("devtools:test:write", "")
    );
    act(() => {
      result.current[1]("new-value");
    });
    vi.advanceTimersByTime(299);
    expect(localStorage.getItem("devtools:test:write")).toBeNull();
    vi.advanceTimersByTime(1);
    expect(localStorage.getItem("devtools:test:write")).toBe("new-value");
  });

  it("setting empty string removes the key", async () => {
    localStorage.setItem("devtools:test:remove", "existing");
    const { useToolStorage } = await import("@/hooks/use-tool-storage");
    const { result } = renderHook(() =>
      useToolStorage("devtools:test:remove", "")
    );
    act(() => {
      result.current[1]("");
    });
    vi.advanceTimersByTime(300);
    expect(localStorage.getItem("devtools:test:remove")).toBeNull();
  });

  it("rapid successive setValue calls produce one final write (debounce)", async () => {
    const { useToolStorage } = await import("@/hooks/use-tool-storage");
    const { result } = renderHook(() =>
      useToolStorage("devtools:test:debounce", "")
    );
    act(() => {
      result.current[1]("first");
    });
    act(() => {
      result.current[1]("second");
    });
    act(() => {
      result.current[1]("third");
    });
    vi.advanceTimersByTime(300);
    expect(localStorage.getItem("devtools:test:debounce")).toBe("third");
  });
});
