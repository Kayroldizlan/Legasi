"use client";

import { useEffect } from "react";

import { useSupabase } from "./use-supabase";

interface Options {
  channel: string;
  table: string;
  filter?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  onChange: (payload: { new: unknown; old: unknown; eventType: string }) => void;
}

/**
 * Tiny helper to subscribe to Postgres changes on a single table.
 */
export function useRealtimeTable({
  channel,
  table,
  filter,
  event = "*",
  onChange,
}: Options) {
  const supabase = useSupabase();

  useEffect(() => {
    const ch = supabase
      .channel(channel)
      .on(
        "postgres_changes",
        { event, schema: "public", table, filter },
        (payload) => {
          onChange({
            new: payload.new,
            old: payload.old,
            eventType: payload.eventType,
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase, channel, table, filter, event, onChange]);
}
