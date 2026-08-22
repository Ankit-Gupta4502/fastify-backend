import { useState } from "react";

export function useClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), resetAfterMs);
  }

  return { copied, copy };
}
