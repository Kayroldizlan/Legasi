"use client";

import { Check, Copy, MessageSquare, QrCode, UserPlus, X } from "lucide-react";
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
import { absoluteUrl, buildProfileUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import { QrCard } from "./qr-card";

import type { Connection, Profile } from "@/types/database";

interface Props {
  profile: Profile;
  initialConnection: Connection | null;
}

export function ProfileActions({ profile, initialConnection }: Props) {
  const me = useAuthStore((s) => s.profile);
  const router = useRouter();
  const [conn, setConn] = React.useState(initialConnection);
  const [busy, setBusy] = React.useState(false);
  const [qrOpen, setQrOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const isOwn = me?.id === profile.id;
  const isAccepted = conn?.status === "accepted";
  const isPending = conn?.status === "pending";
  const iAmRequester = conn?.requester_id === me?.id;

  const profileUrl = absoluteUrl(buildProfileUrl(profile.username));

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Profile link copied");
    setTimeout(() => setCopied(false), 1500);
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

  if (isOwn) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          href="/settings"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
        >
          Edit profile
        </Link>
        <button
          onClick={copyLink}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-subtle"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy link
        </button>
        <button
          onClick={() => setQrOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-subtle"
        >
          <QrCode className="h-4 w-4" />
          QR code
        </button>
        <Modal
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          title="Share your profile"
        >
          <QrCard url={profileUrl} username={profile.username} />
        </Modal>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {isAccepted ? (
        <Link
          href={`/messages/${profile.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
        >
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
          <Button loading={busy} onClick={acceptConnect}>
            <Check className="h-4 w-4" />
            Accept request
          </Button>
        )
      ) : (
        <Button loading={busy} onClick={sendConnect}>
          <UserPlus className="h-4 w-4" />
          Connect
        </Button>
      )}
      {me && (
        <Link
          href={`/messages/${profile.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-subtle"
        >
          <MessageSquare className="h-4 w-4" />
          Message
        </Link>
      )}
      <button
        onClick={copyLink}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-subtle"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        Copy link
      </button>
      <button
        onClick={() => setQrOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-subtle"
      >
        <QrCode className="h-4 w-4" />
        QR
      </button>
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
