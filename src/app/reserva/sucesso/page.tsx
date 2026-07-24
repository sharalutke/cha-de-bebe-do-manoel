import Link from "next/link";
import { CheckCircle2, Gift } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export default function ReservaSucessoPage() {
  return (
    <section className="page-shell flex min-h-[70vh] items-center py-16">
      <div className="premium-card mx-auto max-w-2xl rounded-[32px] p-8 text-center md:p-12">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-sage-100 text-sage-700">
          <CheckCircle2 aria-hidden className="size-8" />
        </div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-sage-700">
          Reserva confirmada
        </p>
        <h1 className="font-serif text-4xl text-ink-900 md:text-5xl">Obrigado pelo carinho</h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-8 text-ink-900/70">
          Seu presente foi reservado para o Manoel. Cada gesto ajuda a construir esse comeco com
          mais cuidado, acolhimento e amor.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/presentes" icon={Gift}>
            Ver outros presentes
          </ButtonLink>
          <Link
            href="/"
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-sage-200 px-5 text-sm font-semibold text-sage-800 transition hover:bg-sage-50"
          >
            Voltar para o inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
