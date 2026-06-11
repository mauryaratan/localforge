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

  useEffect(() => {
    if (!isHydratedRef.current) {
      isHydratedRef.current = true;
      return;
    }
    scheduleStorageValue(key, value);
  }, [key, value]);

  return [value, setValue];
};
