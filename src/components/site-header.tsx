import Link from "next/link";
import { Gift, Heart, Settings } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sage-200/60 bg-linen-50/80 backdrop-blur-xl">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-full">
          <span className="flex size-10 items-center justify-center rounded-full bg-sage-700 text-white">
            <Heart aria-hidden className="size-4" />
          </span>
          <span>
            <span className="block font-serif text-2xl leading-none text-sage-900">Manoel</span>
            <span className="block text-xs font-medium uppercase tracking-[0.2em] text-sage-700">
              Cha de Bebe
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Navegacao principal">
          <Link
            href="/#evento"
            className="focus-ring rounded-full px-4 py-2 text-sm font-medium text-sage-800 transition hover:bg-sage-50"
          >
            Evento
          </Link>
          <Link
            href="/presentes"
            className="focus-ring rounded-full px-4 py-2 text-sm font-medium text-sage-800 transition hover:bg-sage-50"
          >
            Presentes
          </Link>
          <Link
            href="/admin"
            className="focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-sage-800 transition hover:bg-sage-50"
          >
            <Settings aria-hidden className="size-4" />
            Admin
          </Link>
        </nav>

        <ButtonLink href="/presentes" icon={Gift} className="hidden sm:inline-flex">
          Lista
        </ButtonLink>
      </div>
    </header>
  );
}
