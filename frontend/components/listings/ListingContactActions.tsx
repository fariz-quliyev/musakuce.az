"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Contact info is revealed on click rather than printed as plain
 * crawlable text (spec: reduce scraping of phone numbers), and a copy
 * link button covers the "sharing action" requirement without needing
 * the Web Share API (not available on all desktop browsers).
 */
export function ListingContactActions({ contactName, contactInfo }: { contactName: string; contactInfo: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore, non-critical action.
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {revealed ? (
        <div className="rounded-lg border border-stone-light bg-paper-soft px-4 py-2.5 text-sm">
          <span className="font-semibold text-ink">{contactName}</span>
          <span className="mx-2 text-ink-faint">·</span>
          <span className="text-ink">{contactInfo}</span>
        </div>
      ) : (
        <Button type="button" variant="primary" onClick={() => setRevealed(true)}>
          Nömrəni göstər
        </Button>
      )}
      <Button type="button" variant="ghost" onClick={handleCopyLink}>
        {copied ? "Kopyalandı ✓" : "Linki kopyala"}
      </Button>
    </div>
  );
}
