import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCache,
  fetchEntities,
  getEntities,
  parseEntitiesJson,
  type HTMLSymbol,
} from "@/lib/html-symbols";

type CachedRecord = {
  id: string;
  symbols: HTMLSymbol[];
  timestamp: number;
};

const entitiesFixture = {
  "&amp;": { codepoints: [38], characters: "&" },
  "&euro;": { codepoints: [8364], characters: "€" },
  "&rarr;": { codepoints: [8594], characters: "→" },
};

const createIndexedDbMock = (store: Map<string, CachedRecord>) => ({
  open: vi.fn(() => {
    const request = {} as IDBOpenDBRequest;
    queueMicrotask(() => {
      const db = {
        objectStoreNames: {
          contains: () => true,
        },
        createObjectStore: vi.fn(),
        transaction: () => {
          const tx = {
            oncomplete: null as (() => void) | null,
            objectStore: () => ({
              get: (id: string) => {
                const req = {} as IDBRequest;
                queueMicrotask(() => {
                  (req as unknown as { result: CachedRecord | undefined }).result =
                    store.get(id);
                  req.onsuccess?.(new Event("success") as Event & { target: IDBRequest });
                  tx.oncomplete?.();
                });
                return req;
              },
              put: (value: CachedRecord) => {
                const req = {} as IDBRequest;
                queueMicrotask(() => {
                  store.set(value.id, value);
                  req.onsuccess?.(new Event("success") as Event & { target: IDBRequest });
                  tx.oncomplete?.();
                });
                return req;
              },
              delete: (id: string) => {
                const req = {} as IDBRequest;
                queueMicrotask(() => {
                  store.delete(id);
                  req.onsuccess?.(new Event("success") as Event & { target: IDBRequest });
                  tx.oncomplete?.();
                });
                return req;
              },
            }),
          };
          return tx as unknown as IDBTransaction;
        },
        close: vi.fn(),
      } as unknown as IDBDatabase;

      (request as unknown as { result: IDBDatabase }).result = db;
      request.onupgradeneeded?.({ target: { result: db } } as unknown as IDBVersionChangeEvent);
      request.onsuccess?.(new Event("success") as Event & { target: IDBRequest });
    });
    return request;
  }),
});

describe("html-symbols cache and fetch paths", () => {
  let cacheStore: Map<string, CachedRecord>;

  beforeEach(() => {
    vi.resetModules();
    cacheStore = new Map();
    vi.stubGlobal("indexedDB", createIndexedDbMock(cacheStore) as unknown as IDBFactory);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("fetches and parses entities from network source", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => entitiesFixture,
    } as Response);

    const symbols = await fetchEntities();
    expect(symbols.length).toBeGreaterThan(0);
    expect(symbols.some((s) => s.entity === "&amp;")).toBe(true);
  });

  it("throws when network source returns non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
    } as Response);

    await expect(fetchEntities()).rejects.toThrow("Failed to fetch entities: 503");
  });

  it("returns fresh cached symbols without fetching", async () => {
    const cachedSymbols = parseEntitiesJson(entitiesFixture);
    cacheStore.set("html-entities", {
      id: "html-entities",
      symbols: cachedSymbols,
      timestamp: Date.now(),
    });

    const symbols = await getEntities();
    expect(symbols).toEqual(cachedSymbols);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches and refreshes cache when cache is expired", async () => {
    const staleSymbols = parseEntitiesJson({
      "&copy;": { codepoints: [169], characters: "©" },
    });
    const freshSymbols = parseEntitiesJson(entitiesFixture);

    cacheStore.set("html-entities", {
      id: "html-entities",
      symbols: staleSymbols,
      timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => entitiesFixture,
    } as Response);

    const symbols = await getEntities();

    expect(symbols).toEqual(freshSymbols);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(cacheStore.get("html-entities")?.symbols).toEqual(freshSymbols);
  });

  it("serves cached symbols and schedules background revalidation", async () => {
    const cachedSymbols = parseEntitiesJson(entitiesFixture);
    cacheStore.set("html-entities", {
      id: "html-entities",
      symbols: cachedSymbols,
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    });

    const idleCallbacks: Array<() => Promise<void> | void> = [];
    vi.stubGlobal("requestIdleCallback", (cb: () => void) => {
      idleCallbacks.push(cb as () => Promise<void> | void);
      return 1;
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => entitiesFixture,
    } as Response);

    const symbols = await getEntities();
    expect(symbols).toEqual(cachedSymbols);
    expect(fetch).not.toHaveBeenCalled();
    expect(idleCallbacks).toHaveLength(1);

    await idleCallbacks[0]();
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("falls back to network fetch when cache access fails", async () => {
    vi.stubGlobal(
      "indexedDB",
      {
        open: () => {
          throw new Error("indexedDB unavailable");
        },
      } as unknown as IDBFactory
    );

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => entitiesFixture,
    } as Response);

    const symbols = await getEntities();
    expect(symbols.length).toBeGreaterThan(0);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("clears cached entity data", async () => {
    const cachedSymbols = parseEntitiesJson(entitiesFixture);
    cacheStore.set("html-entities", {
      id: "html-entities",
      symbols: cachedSymbols,
      timestamp: Date.now(),
    });

    await clearCache();
    expect(cacheStore.has("html-entities")).toBe(false);
  });
});
