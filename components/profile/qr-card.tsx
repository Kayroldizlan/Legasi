"use client";

import { Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import * as React from "react";

import { Button } from "@/components/ui";

export function QrCard({ url, username }: { url: string; username: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  const download = () => {
    const canvas = ref.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${username}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={ref}
        className="rounded-2xl border border-border bg-white p-4 shadow-soft"
      >
        <QRCodeCanvas
          value={url}
          size={220}
          bgColor="#ffffff"
          fgColor="#0f172a"
          level="H"
        />
      </div>
      <p className="text-xs text-center text-ink-muted break-all max-w-xs">{url}</p>
      <Button variant="secondary" onClick={download}>
        <Download className="h-4 w-4" /> Download QR
      </Button>
    </div>
  );
}
