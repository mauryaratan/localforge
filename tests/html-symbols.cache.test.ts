import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCache,
  fetchEntities,
  getEntities,
  HTML_SYMBOLS_DATASET_VERSION,
  type HTMLSymbol,
  parseEntitiesJson,
} from "@/lib/html-symbols";

interface CachedRecord {
  id: string;
  symbols: HTMLSymbol[];
  timestamp: number;
  version?: string;
}

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
                  (
                    req as unknown as { result: CachedRecord | undefined }
                  ).result = store.get(id);
                  req.onsuccess?.(
                    new Event("success") as Event & { target: IDBRequest }
                  );
                  tx.oncomplete?.();
                });
                return req;
              },
              put: (value: CachedRecord) => {
                const req = {} as IDBRequest;
                queueMicrotask(() => {
                  store.set(value.id, value);
                  req.onsuccess?.(
                    new Event("success") as Event & { target: IDBRequest }
                  );
                  tx.oncomplete?.();
                });
                return req;
              },
              delete: (id: string) => {
                const req = {} as IDBRequest;
                queueMicrotask(() => {
                  store.delete(id);
                  req.onsuccess?.(
                    new Event("success") as Event & { target: IDBRequest }
                  );
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
      request.onupgradeneeded?.({
        target: { result: db },
      } as unknown as IDBVersionChangeEvent);
      request.onsuccess?.(
        new Event("success") as Event & { target: IDBRequest }
      );
    });
    return request;
  }),
});

describe("html-symbols cache and fetch paths", () => {
  let cacheStore: Map<string, CachedRecord>;

  beforeEach(() => {
    vi.resetModules();
    cacheStore = new Map();
    vi.stubGlobal(
      "indexedDB",
      createIndexedDbMock(cacheStore) as unknown as IDBFactory
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("loads bundled entities without a network fetch", async () => {
    const symbols = await fetchEntities();
    expect(symbols.length).toBeGreaterThan(0);
    expect(symbols.some((s) => s.unicode === "U+0026")).toBe(true);
    expect(symbols.length).toBeGreaterThan(1000);
  });

  it("returns fresh cached symbols without fetching", async () => {
    const cachedSymbols = parseEntitiesJson(entitiesFixture);
    cacheStore.set("html-entities", {
      id: "html-entities",
      symbols: cachedSymbols,
      timestamp: Date.now(),
      version: HTML_SYMBOLS_DATASET_VERSION,
    });

    const symbols = await getEntities();
    expect(symbols).toEqual(cachedSymbols);
  });

  it("refreshes cache from bundled data when cached version is stale", async () => {
    const staleSymbols = parseEntitiesJson({
      "&copy;": { codepoints: [169], characters: "©" },
    });
    const bundledSymbols = await fetchEntities();

    cacheStore.set("html-entities", {
      id: "html-entities",
      symbols: staleSymbols,
      timestamp: Date.now(),
      version: "old-version",
    });

    const symbols = await getEntities();

    expect(symbols).toEqual(bundledSymbols);
    expect(cacheStore.get("html-entities")?.symbols).toEqual(bundledSymbols);
    expect(cacheStore.get("html-entities")?.version).toBe(
      HTML_SYMBOLS_DATASET_VERSION
    );
  });

  it("falls back to bundled entities when cache access fails", async () => {
    vi.stubGlobal("indexedDB", {
      open: () => {
        throw new Error("indexedDB unavailable");
      },
    } as unknown as IDBFactory);

    const symbols = await getEntities();
    expect(symbols.length).toBeGreaterThan(0);
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
