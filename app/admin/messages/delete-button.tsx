"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";

export function DeleteMessageButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const remove = async () => {
    if (!confirm("Delete this message?")) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("messages").delete().eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    router.refresh();
  };

  return (
    <button
      onClick={remove}
      disabled={busy}
      aria-label="Delete"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
