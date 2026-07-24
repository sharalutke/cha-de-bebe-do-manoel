import { Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-sage-200/70 bg-white/40 py-10">
      <div className="page-shell flex flex-col gap-4 text-sm text-ink-900/60 md:flex-row md:items-center md:justify-between">
        <p>Chá de Bebê do Manoel. Feito para celebrar com carinho.</p>
        <p className="inline-flex items-center gap-2">
          <Heart aria-hidden className="size-4 text-sage-700" />
          Enxoval atualizado em tempo real pelo Supabase.
        </p>
      </div>
    </footer>
  );
}
