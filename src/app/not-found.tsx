import Link from "next/link";
import { Home, Search } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="page-shell flex min-h-[70vh] items-center py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-linen-200 text-clay-500">
          <Search aria-hidden className="size-8" />
        </div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-sage-700">
          Pagina nao encontrada
        </p>
        <h1 className="font-serif text-5xl text-ink-900">Esse caminho ainda nao existe</h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty leading-8 text-ink-900/70">
          Talvez o link tenha mudado. Voce pode voltar para a lista de presentes ou para a pagina
          inicial.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/presentes">Lista de presentes</ButtonLink>
          <Link
            href="/"
            className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sage-200 px-5 text-sm font-semibold text-sage-800 transition hover:bg-sage-50"
          >
            <Home aria-hidden className="size-4" />
            Inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
