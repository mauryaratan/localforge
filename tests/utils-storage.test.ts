import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let flushScheduledStorageWrites: typeof import("@/lib/utils").flushScheduledStorageWrites;
let scheduleStorageValue: typeof import("@/lib/utils").scheduleStorageValue;

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

describe("scheduleStorageValue", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.stubGlobal("localStorage", createStorageMock());

    ({ flushScheduledStorageWrites, scheduleStorageValue } = await import(
      "@/lib/utils"
    ));
  });

  afterEach(() => {
    flushScheduledStorageWrites();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("debounces repeated writes to the same key", () => {
    scheduleStorageValue("devtools:test", "first", 300);
    scheduleStorageValue("devtools:test", "second", 300);

    vi.advanceTimersByTime(299);
    expect(localStorage.getItem("devtools:test")).toBeNull();

    vi.advanceTimersByTime(1);
    expect(localStorage.getItem("devtools:test")).toBe("second");
  });

  it("removes the key when the scheduled value is empty", () => {
    localStorage.setItem("devtools:test", "value");

    scheduleStorageValue("devtools:test", "", 300);
    vi.advanceTimersByTime(300);

    expect(localStorage.getItem("devtools:test")).toBeNull();
  });

  it("flushes pending writes immediately", () => {
    scheduleStorageValue("devtools:test", "pending", 300);

    flushScheduledStorageWrites();

    expect(localStorage.getItem("devtools:test")).toBe("pending");
  });
});
