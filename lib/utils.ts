import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PendingStorageWrite {
  timeoutId: number;
  value: string;
}

const pendingStorageWrites = new Map<string, PendingStorageWrite>();
let storageFlushListenersRegistered = false;

const writeStorageValue = (key: string, value: string): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
};

const flushScheduledWrite = (key: string): boolean => {
  const pendingWrite = pendingStorageWrites.get(key);
  if (!pendingWrite) {
    return false;
  }

  clearTimeout(pendingWrite.timeoutId);
  pendingStorageWrites.delete(key);
  return writeStorageValue(key, pendingWrite.value);
};

export const flushScheduledStorageWrites = (): void => {
  for (const key of pendingStorageWrites.keys()) {
    flushScheduledWrite(key);
  }
};

const registerStorageFlushListeners = (): void => {
  if (
    storageFlushListenersRegistered ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }

  storageFlushListenersRegistered = true;

  window.addEventListener("pagehide", flushScheduledStorageWrites);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushScheduledStorageWrites();
    }
  });
};

/**
 * Safely read from localStorage with SSR support and error handling.
 * Use as lazy initializer: useState(() => getStorageValue(key))
 * This avoids running localStorage.getItem on every render.
 */
export const getStorageValue = (key: string, fallback = ""): string => {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * Safely write to localStorage with error handling.
 * Handles quota exceeded and private browsing errors.
 */
export const setStorageValue = (key: string, value: string): boolean =>
  writeStorageValue(key, value);

/**
 * Debounce localStorage writes so typing-heavy tools avoid synchronous writes
 * on every keystroke. Pending writes are flushed on page hide.
 */
export const scheduleStorageValue = (
  key: string,
  value: string,
  delay = 300
): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  registerStorageFlushListeners();

  const pendingWrite = pendingStorageWrites.get(key);
  if (pendingWrite) {
    clearTimeout(pendingWrite.timeoutId);
  }

  const timeoutId = window.setTimeout(() => {
    pendingStorageWrites.delete(key);
    writeStorageValue(key, value);
  }, delay);

  pendingStorageWrites.set(key, { timeoutId, value });
  return true;
};
