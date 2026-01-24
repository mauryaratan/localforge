import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
export const setStorageValue = (key: string, value: string): boolean => {
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
