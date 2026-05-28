"use client";

import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import toast from "react-hot-toast";

import { Badge, Button, Input, Textarea } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";

import type { Banner } from "@/types/database";

export function BannerManager({ initial }: { initial: Banner[] }) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [items, setItems] = React.useState(initial);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [link, setLink] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("banners")
      .insert({
        title,
        body: body || null,
        image_url: imageUrl || null,
        link: link || null,
      } as never)
      .select()
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    setItems([data as Banner, ...items]);
    setTitle("");
    setBody("");
    setImageUrl("");
    setLink("");
    toast.success("Banner published");
    router.refresh();
  };

  const toggle = async (b: Banner) => {
    setItems(items.map((x) => (x.id === b.id ? { ...x, is_active: !x.is_active } : x)));
    await supabase.from("banners").update({ is_active: !b.is_active } as never).eq("id", b.id);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete banner?")) return;
    setItems(items.filter((x) => x.id !== id));
    await supabase.from("banners").delete().eq("id", id);
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Link (optional)" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/about" />
        <Input label="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="sm:col-span-2" />
        <Textarea label="Body" value={body} onChange={(e) => setBody(e.target.value)} className="sm:col-span-2" rows={3} />
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" loading={busy}>
            <Plus className="h-4 w-4" /> Publish banner
          </Button>
        </div>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((b) => (
          <article key={b.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold truncate">{b.title}</p>
                <p className="text-xs text-ink-subtle">
                  {formatRelativeTime(b.created_at)}
                </p>
              </div>
              <Badge tone={b.is_active ? "success" : "muted"}>
                {b.is_active ? "Active" : "Hidden"}
              </Badge>
            </div>
            {b.body && (
              <p className="mt-2 text-sm text-ink-muted line-clamp-3">{b.body}</p>
            )}
            <div className="mt-3 flex justify-end gap-1.5">
              <button
                onClick={() => toggle(b)}
                title={b.is_active ? "Hide" : "Show"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-muted hover:bg-surface-subtle"
              >
                {b.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => remove(b.id)}
                title="Delete"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 && (
          <p className="sm:col-span-2 text-sm text-ink-subtle">
            No banners yet. Publish your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
