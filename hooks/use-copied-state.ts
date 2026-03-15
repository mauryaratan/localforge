"use client";

import { useCallback, useState } from "react";

export const useCopiedState = () => {
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const handleCopy = useCallback(async (text: string, key: string) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      }, 1500);
    } catch {
      // Clipboard API failed
    }
  }, []);

  return { copied, handleCopy };
};
