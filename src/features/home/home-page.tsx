"use client";

import { motion } from "framer-motion";
import { Baby, CalendarDays, Camera, Gift, MapPin, ScanLine, Shirt, Sparkles } from "lucide-react";

import { ShareActions } from "@/components/share-actions";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useEventSettings } from "@/hooks/use-event-settings";
import { useRegistryData } from "@/hooks/use-registry-data";
import { dateFormatter } from "@/lib/formatters";

import { Countdown } from "./countdown";
import { PhotoFrame } from "./photo-frame";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function HomePage() {
  const { progress, isDemoMode } = useRegistryData();
  const { eventSettings } = useEventSettings();
  const eventDate = new Date(eventSettings.event_date);

  return (
    <>
      <section className="page-shell grid gap-8 py-10 md:grid-cols-[1.06fr_0.94fr] md:py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sage-700">
            <Sparkles aria-hidden className="size-4" />
            Bem-vindo ao cha de bebe
          </p>
          <h1 className="text-balance font-serif text-7xl leading-[0.92] text-sage-900 md:text-8xl lg:text-9xl">
            MANOEL
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-ink-900/70">
            {eventSettings.welcome_message}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/presentes" icon={Gift} className="min-h-12 px-6">
              Acessar lista de presentes
            </ButtonLink>
            <ButtonLink
              href="#evento"
              variant="secondary"
              icon={CalendarDays}
              className="min-h-12 px-6"
            >
              Informacoes do evento
            </ButtonLink>
          </div>
          {isDemoMode ? (
            <p className="mt-5 max-w-xl rounded-2xl bg-linen-100 px-4 py-3 text-sm leading-6 text-ink-900/60">
              Modo demonstrativo ativo. Ao conectar o Supabase, reservas e progresso passam a usar
              dados reais em tempo real.
            </p>
          ) : null}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
          className="grid gap-4"
        >
          <PhotoFrame
            title="Foto do casal"
            subtitle="Imagem principal da familia."
            icon={Camera}
            imageUrl={eventSettings.couple_photo_url}
            imageAlt={eventSettings.couple_photo_alt}
            className="min-h-[340px]"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <PhotoFrame
              title="Ultrassom"
              subtitle="Primeiro retrato do Manoel."
              icon={ScanLine}
              imageUrl={eventSettings.ultrasound_photo_url}
              imageAlt={eventSettings.ultrasound_photo_alt}
            />
            <div className="premium-card rounded-[32px] p-6">
              <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-sage-100 text-sage-700">
                <Baby aria-hidden className="size-5" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage-700">
                Enxoval
              </p>
              <p className="mt-3 font-serif text-5xl text-sage-900">
                {progress.percentage.toFixed(1)}%
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-900/60">do enxoval concluido</p>
              <ProgressBar value={progress.percentage} className="mt-5" />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="page-shell grid gap-4 pb-14 md:grid-cols-[0.9fr_1.1fr]">
        <div className="premium-card rounded-[32px] p-6 md:p-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">
            Contagem regressiva
          </p>
          <Countdown targetDate={eventSettings.event_date} />
        </div>
        <div className="premium-card rounded-[32px] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">
                Progresso ponderado
              </p>
              <p className="mt-3 text-pretty leading-7 text-ink-900/68">
                A barra considera itens ja adquiridos e reservas confirmadas, ponderando cada item
                pelo peso definido no banco.
              </p>
            </div>
            <div className="rounded-3xl bg-sage-700 px-6 py-5 text-white">
              <p className="text-3xl font-semibold">{progress.completed_weight.toFixed(0)}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">pontos completos</p>
            </div>
          </div>
        </div>
      </section>

      <section id="evento" className="bg-white/55 py-16">
        <div className="page-shell grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sage-700">
              <CalendarDays aria-hidden className="size-4" />
              Informacoes do evento
            </p>
            <h2 className="font-serif text-5xl leading-none text-sage-900">
              {eventSettings.event_headline ?? "Informacoes do evento"}
            </h2>
            <p className="mt-5 text-pretty leading-8 text-ink-900/65">
              {eventSettings.event_description ??
                "Confira data, horario, local e orientacoes do cha de bebe."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={CalendarDays} title="Data" value={dateFormatter.format(eventDate)} />
            <InfoCard icon={Sparkles} title="Horario" value={eventSettings.event_time} />
            <InfoCard
              icon={MapPin}
              title="Local"
              value={eventSettings.location_name}
              detail={eventSettings.address}
              href={eventSettings.google_maps_url}
              linkLabel="Abrir mapa"
            />
            <InfoCard
              icon={Shirt}
              title="Dress code"
              value={eventSettings.dress_code ?? "A definir"}
            />
            <div className="premium-card rounded-[32px] p-6 sm:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">
                Compartilhe
              </p>
              <p className="mt-3 text-sm leading-6 text-ink-900/60">
                Envie o convite digital e a lista para familiares e amigos.
              </p>
              <div className="mt-5">
                <ShareActions whatsappNumber={eventSettings.whatsapp_number} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

type InfoCardProps = {
  icon: typeof CalendarDays;
  title: string;
  value: string;
  detail?: string;
  href?: string;
  linkLabel?: string;
};

function InfoCard({ icon: Icon, title, value, detail, href, linkLabel }: InfoCardProps) {
  return (
    <div className="premium-card rounded-[32px] p-6">
      <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-sage-100 text-sage-700">
        <Icon aria-hidden className="size-5" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-700">{title}</p>
      <p className="mt-2 text-pretty text-lg font-semibold leading-7 text-ink-900">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-ink-900/60">{detail}</p> : null}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-sm font-semibold text-sage-700 hover:text-sage-900"
        >
          {linkLabel ?? "Abrir link"}
        </a>
      ) : null}
    </div>
  );
}
