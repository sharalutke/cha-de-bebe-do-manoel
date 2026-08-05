import type { ComponentType } from "react";

import { cn } from "@/lib/cn";
import { withBasePath } from "@/lib/base-path";

type PhotoFrameProps = {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  imageUrl?: string | null;
  imageAlt?: string | null;
  className?: string;
};

export function PhotoFrame({
  title,
  subtitle,
  icon: Icon,
  imageUrl,
  imageAlt,
  className,
}: PhotoFrameProps) {
  const framedImageUrl = imageUrl ? withBasePath(imageUrl) : null;

  return (
    <div
      className={cn(
        "relative min-h-64 overflow-hidden rounded-[32px] border border-white/80 bg-linen-100 shadow-soft",
        className,
      )}
    >
      {framedImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={framedImageUrl}
          alt={imageAlt ?? title}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(143,167,117,0.38),transparent_22rem),linear-gradient(135deg,rgba(255,255,255,0.86),rgba(242,230,210,0.56))]" />
          <div className="absolute -right-12 -top-12 size-44 rounded-full border border-sage-200/70" />
          <div className="absolute -bottom-12 left-8 size-36 rounded-full bg-sage-100/70" />
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/92 via-white/72 to-transparent" />
      <div className="relative flex h-full min-h-64 flex-col justify-end p-6">
        <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-white/80 text-sage-700 shadow-sm">
          <Icon aria-hidden className="size-5" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage-700">{title}</p>
        <p className="mt-2 max-w-xs text-sm leading-6 text-ink-900/60">{subtitle}</p>
      </div>
    </div>
  );
}
