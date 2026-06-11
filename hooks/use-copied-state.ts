"use client";

import { useCallback, useState } from "react";

const copyViaExecCommand = (text: string): boolean => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.setAttribute("readonly", "");
  document.body.appendChild(textarea);
  textarea.select();
  let succeeded = false;
  try {
    succeeded = document.execCommand("copy");
  } catch {
    succeeded = false;
  }
  document.body.removeChild(textarea);
  return succeeded;
};

export const useCopiedState = () => {
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const handleCopy = useCallback(async (text: string, key: string) => {
    if (!text) {
      return;
    }

    let succeeded = false;
    try {
      await navigator.clipboard.writeText(text);
      succeeded = true;
    } catch {
      // Clipboard API unavailable (insecure context, denied permission) —
      // fall back to the legacy execCommand path
      succeeded = copyViaExecCommand(text);
    }

    if (!succeeded) {
      return;
    }

    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  }, []);

  return { copied, handleCopy };
};
