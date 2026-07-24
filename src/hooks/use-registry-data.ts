"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { categories as fallbackCategories, gifts as fallbackGifts } from "@/data/registry";
import { calculateRegistryProgress, getRemainingQuantity } from "@/lib/progress";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Category, Gift, RegistryProgress, Reservation } from "@/types/domain";

export type ReservationInput = {
  giftId: string;
  quantity: number;
  guestName: string;
  guestPhone?: string;
  guestMessage?: string;
};

export function useRegistryData() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [gifts, setGifts] = useState<Gift[]>(fallbackGifts);
  const [progress, setProgress] = useState<RegistryProgress>(() =>
    calculateRegistryProgress(fallbackGifts),
  );
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setCategories(fallbackCategories);
      setGifts(fallbackGifts);
      setProgress(calculateRegistryProgress(fallbackGifts));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const [categoriesResult, giftsResult, progressResult] = await Promise.all([
      supabase.from("categories").select("*").order("display_order", { ascending: true }),
      supabase
        .from("gifts")
        .select("*, category:categories(*)")
        .order("display_order", { ascending: true }),
      supabase.rpc("get_registry_progress").maybeSingle(),
    ]);

    if (categoriesResult.error || giftsResult.error || progressResult.error) {
      setError(
        categoriesResult.error?.message ??
          giftsResult.error?.message ??
          progressResult.error?.message ??
          "Nao foi possivel carregar a lista.",
      );
      setIsLoading(false);
      return;
    }

    setCategories((categoriesResult.data ?? []) as Category[]);
    setGifts((giftsResult.data ?? []) as unknown as Gift[]);
    setProgress((progressResult.data as RegistryProgress | null) ?? calculateRegistryProgress([]));
    setIsLoading(false);
  }, [supabase]);

  const reserveGift = useCallback(
    async (input: ReservationInput) => {
      if (!supabase) {
        const targetGift = gifts.find((gift) => gift.id === input.giftId);
        if (!targetGift) {
          throw new Error("Presente nao encontrado.");
        }

        const remaining = getRemainingQuantity(targetGift);
        if (input.quantity > remaining) {
          throw new Error(`Restam apenas ${remaining} unidade(s).`);
        }

        setGifts((current) => {
          const next = current.map((gift) => {
            if (gift.id !== input.giftId) {
              return gift;
            }

            const quantity_reserved = gift.quantity_reserved + input.quantity;
            const status =
              gift.quantity_owned + quantity_reserved >= gift.quantity_needed
                ? ("reserved" as const)
                : gift.status;

            return { ...gift, quantity_reserved, status };
          });

          setProgress(calculateRegistryProgress(next));
          return next;
        });

        return {
          id: crypto.randomUUID(),
          gift_id: input.giftId,
          guest_name: input.guestName,
          guest_phone: input.guestPhone ?? null,
          guest_message: input.guestMessage ?? null,
          quantity: input.quantity,
          status: "confirmed",
          created_at: new Date().toISOString(),
        } satisfies Reservation;
      }

      const { data, error } = await supabase.rpc("create_gift_reservation", {
        p_gift_id: input.giftId,
        p_quantity: input.quantity,
        p_guest_name: input.guestName,
        p_guest_phone: input.guestPhone ?? null,
        p_guest_message: input.guestMessage ?? null,
      });

      if (error) {
        throw new Error(error.message);
      }

      await refresh();
      return data as Reservation;
    },
    [gifts, refresh, supabase],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel("registry-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "gifts" }, () => {
        void refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, supabase]);

  return {
    categories,
    gifts,
    progress,
    isLoading,
    error,
    isDemoMode: !supabase,
    refresh,
    reserveGift,
  };
}
