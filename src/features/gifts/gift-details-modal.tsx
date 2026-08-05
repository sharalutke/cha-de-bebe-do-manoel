"use client";

import { FormEvent, useMemo, useState } from "react";
import { ExternalLink, Minus, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TextAreaField, TextField } from "@/components/ui/text-field";
import { getGiftCompletion, getRemainingQuantity } from "@/lib/progress";
import type { Gift } from "@/types/domain";

type GiftDetailsModalProps = {
  gift: Gift | null;
  isSubmitting: boolean;
  onClose: () => void;
  onReserve: (payload: {
    quantity: number;
    guestName: string;
    guestPhone?: string;
    guestMessage?: string;
  }) => Promise<void>;
};

export function GiftDetailsModal({
  gift,
  isSubmitting,
  onClose,
  onReserve,
}: GiftDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestMessage, setGuestMessage] = useState("");

  const remaining = useMemo(() => (gift ? getRemainingQuantity(gift) : 0), [gift]);

  if (!gift) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onReserve({
      quantity,
      guestName,
      guestPhone,
      guestMessage,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink-900/35 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="premium-card max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-700">
              {gift.category?.name ?? "Presente"}
            </p>
            <h2 className="mt-2 text-pretty font-serif text-4xl text-sage-900">{gift.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-ink-900/70 transition hover:bg-sage-50"
            aria-label="Fechar detalhes"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] bg-gradient-to-br from-sage-100 via-linen-100 to-white p-5">
            <p className="text-sm leading-7 text-ink-900/68">{gift.description}</p>
            {gift.notes ? (
              <p className="mt-4 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-ink-900/62">
                {gift.notes}
              </p>
            ) : null}
            <div className="mt-5">
              <ProgressBar value={getGiftCompletion(gift)} label="Progresso do item" />
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
              <Metric label="Precisa" value={gift.quantity_needed} />
              <Metric label="Ja possui" value={gift.quantity_owned} />
              <Metric label="Reservado" value={gift.quantity_reserved} />
            </dl>
            {gift.suggested_brands.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-700">
                  Marcas sugeridas
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {gift.suggested_brands.map((brand) => (
                    <span
                      key={brand}
                      className="rounded-full border border-sage-200 bg-white/70 px-3 py-1 text-xs font-medium text-sage-800"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {gift.product_url ? (
              <a
                href={gift.product_url}
                target="_blank"
                rel="noreferrer"
                className="focus-ring mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-sage-200 bg-white/80 px-5 text-sm font-semibold text-sage-800 transition hover:bg-sage-50"
              >
                <ExternalLink aria-hidden className="size-4" />
                Abrir link do presente
              </a>
            ) : null}
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">Quantidade</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  className="focus-ring flex size-11 items-center justify-center rounded-full border border-sage-200 bg-white text-sage-800 transition hover:bg-sage-50"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  aria-label="Diminuir quantidade"
                >
                  <Minus aria-hidden className="size-4" />
                </button>
                <span className="flex min-h-11 min-w-16 items-center justify-center rounded-2xl bg-sage-100 px-4 text-lg font-semibold text-sage-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="focus-ring flex size-11 items-center justify-center rounded-full border border-sage-200 bg-white text-sage-800 transition hover:bg-sage-50"
                  onClick={() => setQuantity((current) => Math.min(remaining, current + 1))}
                  aria-label="Aumentar quantidade"
                >
                  <Plus aria-hidden className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-900/55">{remaining} unidade(s) disponiveis.</p>
            </div>

            <TextField
              label="Nome"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              minLength={2}
              required
              placeholder="Seu nome"
            />
            <TextField
              label="Telefone (opcional)"
              value={guestPhone}
              onChange={(event) => setGuestPhone(event.target.value)}
              placeholder="(00) 00000-0000"
              inputMode="tel"
            />
            <TextAreaField
              label="Mensagem (opcional)"
              value={guestMessage}
              onChange={(event) => setGuestMessage(event.target.value)}
              placeholder="Escreva uma mensagem para a familia"
            />
            <Button type="submit" disabled={isSubmitting || remaining === 0}>
              {isSubmitting ? "Confirmando..." : "Confirmar reserva"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/75 p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-900/45">
        {label}
      </dt>
      <dd className="mt-1 text-xl font-semibold text-sage-800">{value}</dd>
    </div>
  );
}
