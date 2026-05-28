"use client";

import { Check, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import * as React from "react";
import toast from "react-hot-toast";

interface ProfileShareCardProps {
  url: string;
  fullName: string;
}

/**
 * Compact share card with QR code + "Share Profile" button.
 *
 * Designed to sit at the top-right of the profile cover (desktop) and stack
 * below the cover on mobile. Uses the Web Share API when available, falling
 * back to copying the profile URL.
 */
export function ProfileShareCard({ url, fullName }: ProfileShareCardProps) {
  const [copied, setCopied] = React.useState(false);

  const share = async () => {
    const data = {
      title: fullName,
      text: `Connect with ${fullName} on ConnectDirectory`,
      url,
    };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // user cancelled or share failed — fall through to copy fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Profile link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="w-44 rounded-2xl border border-border bg-surface p-3 shadow-elevated">
      <div className="rounded-xl bg-white p-2">
        <QRCodeCanvas
          value={url}
          size={148}
          bgColor="#ffffff"
          fgColor="#0f172a"
          level="H"
          includeMargin={false}
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      <button
        type="button"
        onClick={share}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-surface-subtle"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            Copied
          </>
        ) : (
          <>
            <Share2 className="h-3 w-3" />
            Share Profile
          </>
        )}
      </button>
    </div>
  );
}
