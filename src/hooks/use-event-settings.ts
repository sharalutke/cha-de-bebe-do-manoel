"use client";

import { useEffect, useMemo, useState } from "react";

import { eventSettings as fallbackEventSettings } from "@/data/event";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { EventSettings } from "@/types/domain";

export function useEventSettings() {
  const [eventSettings, setEventSettings] = useState<EventSettings>(fallbackEventSettings);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadEventSettings() {
      setIsLoading(true);
      const { data } = await client
        .from("event_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (isMounted && data) {
        setEventSettings(data as EventSettings);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    void loadEventSettings();

    const channel = client
      .channel("event-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "event_settings" }, () => {
        void loadEventSettings();
      })
      .subscribe();

    return () => {
      isMounted = false;
      void client.removeChannel(channel);
    };
  }, [supabase]);

  return { eventSettings, isLoading };
}
