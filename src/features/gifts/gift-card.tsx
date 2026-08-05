"use client";

import { BadgeCheck, ExternalLink, Gift, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getGiftCompletion, getRemainingQuantity } from "@/lib/progress";
import type { Gift as GiftType } from "@/types/domain";

type GiftCardProps = {
  gift: GiftType;
  onSelect: (gift: GiftType) => void;
};

export function GiftCard({ gift, onSelect }: GiftCardProps) {
  const remaining = getRemainingQuantity(gift);
  const isReserved = remaining === 0 || gift.status === "reserved";

  return (
    <article className="premium-card flex min-h-[340px] flex-col rounded-[28px] p-5 transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
          {isReserved ? (
            <BadgeCheck aria-hidden className="size-5" />
          ) : (
            <Gift aria-hidden className="size-5" />
          )}
        </div>
        <span className="rounded-full bg-linen-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-clay-500">
          {gift.category?.name ?? "Presente"}
        </span>
      </div>

      <div className="mt-5 flex-1">
        <h3 className="text-pretty text-xl font-semibold leading-7 text-ink-900">{gift.name}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-900/62">{gift.description}</p>
        {gift.suggested_brands.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {gift.suggested_brands.slice(0, 3).map((brand) => (
              <span
                key={brand}
                className="rounded-full border border-sage-200 bg-white/70 px-3 py-1 text-xs font-medium text-sage-800"
              >
                {brand}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <ProgressBar value={getGiftCompletion(gift)} label="Item" />
        <div className="flex items-center justify-between gap-3 text-sm text-ink-900/62">
          <span>
            {gift.quantity_owned + gift.quantity_reserved}/{gift.quantity_needed} completo
          </span>
          <span>{remaining} restante(s)</span>
        </div>
        {gift.product_url ? (
          <a
            href={gift.product_url}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-sage-200 bg-white/70 px-5 text-sm font-semibold text-sage-800 transition hover:bg-sage-50"
          >
            <ExternalLink aria-hidden className="size-4" />
            Ver sugestao
          </a>
        ) : null}
        <Button
          type="button"
          icon={isReserved ? PackageCheck : Gift}
          className="w-full"
          variant={isReserved ? "secondary" : "primary"}
          onClick={() => onSelect(gift)}
          disabled={isReserved}
        >
          {isReserved ? "Reservado" : "Escolher presente"}
        </Button>
      </div>
    </article>
  );
}
