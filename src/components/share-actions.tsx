"use client";

import { Camera, Copy, MessageCircle, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import { getSiteUrl } from "@/lib/base-path";
import { formatPhoneForWhatsApp } from "@/lib/formatters";

type ShareActionsProps = {
  whatsappNumber?: string;
  compact?: boolean;
};

export function ShareActions({ whatsappNumber, compact = false }: ShareActionsProps) {
  const { showToast } = useToast();
  const siteUrl = getSiteUrl();
  const text = `Venha celebrar o Cha de Bebe do Manoel: ${siteUrl}`;
  const whatsappHref = `https://wa.me/${formatPhoneForWhatsApp(
    whatsappNumber ?? "",
  )}?text=${encodeURIComponent(text)}`;

  async function copyLink(label = "Link copiado") {
    await navigator.clipboard.writeText(siteUrl);
    showToast({
      title: label,
      description: "Agora e so enviar para quem voce quiser.",
      variant: "success",
    });
  }

  async function shareNative() {
    if (navigator.share) {
      await navigator.share({
        title: "Cha de Bebe do Manoel",
        text,
        url: siteUrl,
      });
      return;
    }

    await copyLink("Link pronto para compartilhar");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" icon={Share2} onClick={() => void shareNative()}>
        {compact ? "Compartilhar" : "Compartilhar"}
      </Button>
      {whatsappNumber ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sage-200 bg-white/70 px-5 text-sm font-semibold text-sage-800 transition hover:bg-sage-50"
        >
          <MessageCircle aria-hidden className="size-4" />
          WhatsApp
        </a>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        icon={Camera}
        onClick={() => void copyLink("Link copiado para usar no Instagram")}
      >
        Instagram
      </Button>
      <Button type="button" variant="ghost" icon={Copy} onClick={() => void copyLink()}>
        Copiar
      </Button>
    </div>
  );
}
