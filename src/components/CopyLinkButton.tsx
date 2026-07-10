import { useState } from "react";
import { Button } from "@heroui/react";
import { Check, Share2 } from "lucide-react";
import { useTranslation } from "../i18n";

export function CopyLinkButton({ url }: { url: string }) {
  const { ui } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (permissions, non-secure context).
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted hover:text-foreground inline-flex h-auto min-h-0 items-center gap-1 px-2 py-0 text-xs"
      onPress={handleCopy}
      aria-label={copied ? ui.card.linkCopied : ui.card.copyLink}
    >
      {copied ? (
        <Check size={11} aria-hidden />
      ) : (
        <Share2 size={11} aria-hidden />
      )}
      <span>{copied ? ui.card.linkCopied : ui.card.copyLink}</span>
    </Button>
  );
}
