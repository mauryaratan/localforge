"use client";

import { useEffect, useRef, useState } from "react";
import { getStorageValue, scheduleStorageValue } from "@/lib/utils";

/**
 * Persisted string state for tool pages. Reads localStorage lazily on
 * first client render and debounce-writes on change. Writes are skipped
 * until after mount so the initial render never echoes the stored value
 * straight back into storage.
 */
export const useToolStorage = (
  key: string,
  fallback = ""
): [string, (value: string) => void] => {
  const [value, setValue] = useState(() => getStorageValue(key, fallback));
  const isHydratedRef = useRef(false);
  const keyRef = useRef(key);

  useEffect(() => {
    // If the key changes, re-read storage for the new key instead of
    // writing the previous key's value under it
    if (keyRef.current !== key) {
      keyRef.current = key;
      isHydratedRef.current = false;
      setValue(getStorageValue(key, fallback));
      return;
    }
    if (!isHydratedRef.current) {
      isHydratedRef.current = true;
      return;
    }
    scheduleStorageValue(key, value);
  }, [key, value, fallback]);

  return [value, setValue];
};
