"use client";

import {
  Check,
  Copy,
  MessageSquare,
  MoreHorizontal,
  QrCode,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import toast from "react-hot-toast";

import { Button, Modal } from "@/components/ui";
import {
  acceptConnectionAction,
  cancelConnectionRequestAction,
  sendConnectionRequestAction,
} from "@/lib/actions/connections";
import { absoluteUrl, buildProfileUrl, cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import { QrCard } from "./qr-card";

import type { Connection, Profile } from "@/types/database";

interface Props {
  profile: Profile;
  initialConnection: Connection | null;
  variant?: "default" | "header";
}

export function ProfileActions({
  profile,
  initialConnection,
  variant = "default",
}: Props) {
  const me = useAuthStore((s) => s.profile);
  const router = useRouter();
  const [conn, setConn] = React.useState(initialConnection);
  const [busy, setBusy] = React.useState(false);
  const [qrOpen, setQrOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const isOwn = me?.id === profile.id;
  const isAccepted = conn?.status === "accepted";
  const isPending = conn?.status === "pending";
  const iAmRequester = conn?.requester_id === me?.id;
  const isHeader = variant === "header";

  const profileUrl = absoluteUrl(buildProfileUrl(profile.username));

  React.useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Profile link copied");
    setTimeout(() => setCopied(false), 1500);
    setMenuOpen(false);
  };

  const sendConnect = async () => {
    if (!me) {
      router.push(`/login?next=${buildProfileUrl(profile.username)}`);
      return;
    }
    setBusy(true);
    try {
      const result = await sendConnectionRequestAction(
        profile.id,
        profile.username,
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setConn(result.data);
      toast.success("Connection request sent");
    } finally {
      setBusy(false);
    }
  };

  const acceptConnect = async () => {
    if (!conn) return;
    setBusy(true);
    try {
      const result = await acceptConnectionAction(conn.id, profile.username);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setConn(result.data);
      toast.success("Connection accepted");
    } finally {
      setBusy(false);
    }
  };

  const cancelConnect = async () => {
    if (!conn) return;
    setBusy(true);
    try {
      const result = await cancelConnectionRequestAction(
        conn.id,
        profile.username,
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setConn(null);
    } finally {
      setBusy(false);
    }
  };

  const outlineClass = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-ink transition hover:bg-zinc-50",
    isHeader && "min-w-[110px]",
  );

  const primaryClass = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700 shadow-[0_8px_24px_rgb(239_68_68/0.18)]",
    isHeader && "min-w-[110px]",
  );

  if (isOwn) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href="/settings" className={primaryClass}>
          Edit profile
        </Link>
        <button type="button" onClick={copyLink} className={outlineClass}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy link
        </button>
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className={outlineClass}
        >
          <QrCode className="h-4 w-4" />
          QR code
        </button>
        <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Share your profile">
          <QrCard url={profileUrl} username={profile.username} />
        </Modal>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isAccepted ? (
        <Link href={`/messages/${profile.id}`} className={primaryClass}>
          <MessageSquare className="h-4 w-4" />
          Message
        </Link>
      ) : isPending ? (
        iAmRequester ? (
          <Button variant="secondary" loading={busy} onClick={cancelConnect}>
            <X className="h-4 w-4" />
            Cancel request
          </Button>
        ) : (
          <Button loading={busy} onClick={acceptConnect} className={isHeader ? primaryClass : undefined}>
            <Check className="h-4 w-4" />
            Accept request
          </Button>
        )
      ) : (
        <Button
          loading={busy}
          onClick={sendConnect}
          className={isHeader ? primaryClass : undefined}
        >
          <UserPlus className="h-4 w-4" />
          Connect
        </Button>
      )}

      {me && !isAccepted && !isPending && (
        <Link href={`/messages/${profile.id}`} className={outlineClass}>
          <MessageSquare className="h-4 w-4" />
          Message
        </Link>
      )}

      {isHeader ? (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-elevated">
              <button
                type="button"
                onClick={copyLink}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-zinc-50"
              >
                <Copy className="h-4 w-4" />
                Copy link
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setQrOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-zinc-50"
              >
                <QrCode className="h-4 w-4" />
                QR code
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <button type="button" onClick={copyLink} className={outlineClass}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy link
          </button>
          <button type="button" onClick={() => setQrOpen(true)} className={outlineClass}>
            <QrCode className="h-4 w-4" />
            QR
          </button>
        </>
      )}

      <Modal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title={`Share ${profile.full_name}'s profile`}
      >
        <QrCard url={profileUrl} username={profile.username} />
      </Modal>
    </div>
  );
}
