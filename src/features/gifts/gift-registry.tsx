"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Search, Sparkles } from "lucide-react";

import { ShareActions } from "@/components/share-actions";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TextField } from "@/components/ui/text-field";
import { useEventSettings } from "@/hooks/use-event-settings";
import { useRegistryData } from "@/hooks/use-registry-data";
import { cn } from "@/lib/cn";
import { getRemainingQuantity } from "@/lib/progress";
import type { Gift } from "@/types/domain";

import { GiftCard } from "./gift-card";
import { GiftDetailsModal } from "./gift-details-modal";

export function GiftRegistry() {
  const router = useRouter();
  const { showToast } = useToast();
  const { eventSettings } = useEventSettings();
  const { categories, gifts, progress, isLoading, error, isDemoMode, reserveGift } =
    useRegistryData();
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("todos");
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const publicCategories = categories
    .filter((category) => category.slug !== "enxoval-atual")
    .sort((a, b) => a.display_order - b.display_order);

  const filteredGifts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return gifts
      .filter((gift) => gift.is_public)
      .filter((gift) => categorySlug === "todos" || gift.category?.slug === categorySlug)
      .filter((gift) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = [
          gift.name,
          gift.description,
          gift.notes,
          gift.product_url,
          gift.category?.name,
          ...gift.suggested_brands,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("pt-BR");

        return haystack.includes(normalizedSearch);
      })
      .sort((a, b) => {
        const aRemaining = getRemainingQuantity(a);
        const bRemaining = getRemainingQuantity(b);

        if (aRemaining === 0 && bRemaining > 0) {
          return 1;
        }

        if (bRemaining === 0 && aRemaining > 0) {
          return -1;
        }

        return a.display_order - b.display_order;
      });
  }, [categorySlug, gifts, search]);

  async function handleReserve(payload: {
    quantity: number;
    guestName: string;
    guestPhone?: string;
    guestMessage?: string;
  }) {
    if (!selectedGift) {
      return;
    }

    try {
      setIsSubmitting(true);
      await reserveGift({
        giftId: selectedGift.id,
        ...payload,
      });
      showToast({
        title: "Reserva confirmada",
        description: "O presente foi atualizado na lista.",
        variant: "success",
      });
      setSelectedGift(null);
      router.push("/reserva/sucesso");
    } catch (reservationError) {
      showToast({
        title: "Nao foi possivel reservar",
        description:
          reservationError instanceof Error
            ? reservationError.message
            : "Tente novamente em instantes.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="page-shell py-10 md:py-14">
        <div className="grid gap-8 md:grid-cols-[0.92fr_1.08fr] md:items-end">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sage-700">
              <Sparkles aria-hidden className="size-4" />
              Lista de presentes
            </p>
            <h1 className="text-balance font-serif text-5xl leading-none text-sage-900 md:text-7xl">
              Escolha um presente para o Manoel
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-ink-900/66">
              Pesquise por item, filtre por categoria e reserve a quantidade desejada. Quando um
              presente completar a quantidade necessaria, ele aparece como reservado.
            </p>
          </div>

          <div className="premium-card rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">
                  Enxoval concluido
                </p>
                <p className="mt-2 font-serif text-5xl text-sage-900">
                  {progress.percentage.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-3xl bg-sage-700 px-5 py-4 text-right text-white">
                <p className="text-2xl font-semibold">{progress.reserved_items}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">reservas</p>
              </div>
            </div>
            <ProgressBar value={progress.percentage} className="mt-5" />
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-[32px] border border-sage-200/70 bg-white/55 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <TextField
            label="Pesquisar"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Fralda, carrinho, mamadeira..."
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategorySlug("todos")}
              className={cn(
                "focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                categorySlug === "todos"
                  ? "border-sage-700 bg-sage-700 text-white"
                  : "border-sage-200 bg-white/70 text-sage-800 hover:bg-sage-50",
              )}
            >
              <Filter aria-hidden className="size-4" />
              Todos
            </button>
            {publicCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategorySlug(category.slug)}
                className={cn(
                  "focus-ring min-h-11 rounded-full border px-4 text-sm font-semibold transition",
                  categorySlug === category.slug
                    ? "border-sage-700 bg-sage-700 text-white"
                    : "border-sage-200 bg-white/70 text-sage-800 hover:bg-sage-50",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900">
            {error}
          </div>
        ) : null}

        {isDemoMode ? (
          <div className="mt-6 rounded-3xl bg-linen-100 p-5 text-sm leading-6 text-ink-900/64">
            Modo demonstrativo ativo. Configure as variaveis do Supabase para persistir reservas
            reais.
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-80 rounded-[28px]" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} onSelect={setSelectedGift} />
            ))}
          </div>
        )}

        {!isLoading && filteredGifts.length === 0 ? (
          <div className="mt-8 rounded-[32px] border border-sage-200 bg-white/70 p-8 text-center">
            <Search aria-hidden className="mx-auto mb-4 size-8 text-sage-700" />
            <p className="font-semibold text-ink-900">Nenhum presente encontrado</p>
            <p className="mt-2 text-sm text-ink-900/60">Tente outra busca ou categoria.</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-5"
              onClick={() => {
                setSearch("");
                setCategorySlug("todos");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        ) : null}

        <div className="mt-10 premium-card rounded-[32px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">
            Compartilhar lista
          </p>
          <p className="mt-3 text-sm leading-6 text-ink-900/62">
            Ajude a lista chegar em todos que querem participar desse momento.
          </p>
          <div className="mt-5">
            <ShareActions whatsappNumber={eventSettings.whatsapp_number} />
          </div>
        </div>
      </section>

      <GiftDetailsModal
        gift={selectedGift}
        isSubmitting={isSubmitting}
        onClose={() => setSelectedGift(null)}
        onReserve={handleReserve}
      />
    </>
  );
}
