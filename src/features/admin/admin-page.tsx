"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  BarChart3,
  CalendarDays,
  Camera,
  Download,
  Edit3,
  Gift,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  PackageCheck,
  Plus,
  RefreshCcw,
  Save,
  ShieldCheck,
  Shirt,
  Tags,
  Trash2,
  Unlock,
} from "lucide-react";

import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TextAreaField, TextField } from "@/components/ui/text-field";
import { eventSettings as fallbackEventSettings } from "@/data/event";
import { categories as fallbackCategories, gifts as fallbackGifts } from "@/data/registry";
import { cn } from "@/lib/cn";
import { withBasePath } from "@/lib/base-path";
import { calculateRegistryProgress } from "@/lib/progress";
import { slugify } from "@/lib/slugify";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type {
  Category,
  EventSettings,
  Gift as GiftType,
  RegistryProgress,
  Reservation,
} from "@/types/domain";

const EVENT_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

type EventFormState = {
  id?: string;
  event_date: string;
  event_time: string;
  location_name: string;
  address: string;
  google_maps_url: string;
  whatsapp_number: string;
  dress_code: string;
  welcome_message: string;
  event_headline: string;
  event_description: string;
  couple_photo_url: string;
  couple_photo_alt: string;
  ultrasound_photo_url: string;
  ultrasound_photo_alt: string;
};

type GiftFormState = {
  id?: string;
  category_id: string;
  name: string;
  slug: string;
  suggested_brands: string;
  image_url: string;
  description: string;
  notes: string;
  quantity_needed: number;
  quantity_owned: number;
  progress_weight: number;
  status: GiftType["status"];
  is_public: boolean;
  display_order: number;
};

type CategoryFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
};

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value.padStart(2, "0") ?? "00";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart(
    "minute",
  )}`;
}

function toSupabaseDateTime(value: string) {
  return value ? `${value}:00-03:00` : fallbackEventSettings.event_date;
}

function eventToForm(settings: EventSettings): EventFormState {
  return {
    id: settings.id,
    event_date: toDateTimeLocalValue(settings.event_date),
    event_time: settings.event_time,
    location_name: settings.location_name,
    address: settings.address,
    google_maps_url: settings.google_maps_url,
    whatsapp_number: settings.whatsapp_number,
    dress_code: settings.dress_code ?? "",
    welcome_message: settings.welcome_message,
    event_headline: settings.event_headline ?? "",
    event_description: settings.event_description ?? "",
    couple_photo_url: settings.couple_photo_url ?? "",
    couple_photo_alt: settings.couple_photo_alt ?? "",
    ultrasound_photo_url: settings.ultrasound_photo_url ?? "",
    ultrasound_photo_alt: settings.ultrasound_photo_alt ?? "",
  };
}

const emptyGift = (categoryId = ""): GiftFormState => ({
  category_id: categoryId,
  name: "",
  slug: "",
  suggested_brands: "",
  image_url: "",
  description: "",
  notes: "",
  quantity_needed: 1,
  quantity_owned: 0,
  progress_weight: 1,
  status: "available",
  is_public: true,
  display_order: 0,
});

const emptyCategory: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  display_order: 0,
  is_active: true,
};

export function AdminPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const { showToast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [gifts, setGifts] = useState<GiftType[]>(fallbackGifts);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [eventForm, setEventForm] = useState<EventFormState>(() =>
    eventToForm(fallbackEventSettings),
  );
  const [progress, setProgress] = useState<RegistryProgress>(() =>
    calculateRegistryProgress(fallbackGifts),
  );
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "event" | "gifts" | "categories" | "reservations"
  >("dashboard");
  const [giftForm, setGiftForm] = useState<GiftFormState>(() =>
    emptyGift(fallbackCategories[0]?.id),
  );
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategory);
  const [isBusy, setIsBusy] = useState(false);

  const loadData = useCallback(async () => {
    if (!supabase) {
      setCategories(fallbackCategories);
      setGifts(fallbackGifts);
      setEventForm(eventToForm(fallbackEventSettings));
      setProgress(calculateRegistryProgress(fallbackGifts));
      setIsAuthChecked(true);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData.session;
    setSession(currentSession);
    setIsAuthChecked(true);

    if (!currentSession) {
      return;
    }

    const adminResult = await supabase.from("admin_profiles").select("user_id").limit(1);
    const hasAdminAccess = !adminResult.error && (adminResult.data?.length ?? 0) > 0;
    setIsAdmin(hasAdminAccess);

    if (!hasAdminAccess) {
      return;
    }

    const [eventResult, categoriesResult, giftsResult, reservationsResult, progressResult] =
      await Promise.all([
      supabase
        .from("event_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from("categories").select("*").order("display_order", { ascending: true }),
      supabase
        .from("gifts")
        .select("*, category:categories(*)")
        .order("display_order", { ascending: true }),
      supabase
        .from("reservations")
        .select("*, gift:gifts(*)")
        .order("created_at", { ascending: false }),
      supabase.rpc("get_registry_progress").maybeSingle(),
    ]);

    if (
      eventResult.error ||
      categoriesResult.error ||
      giftsResult.error ||
      reservationsResult.error
    ) {
      showToast({
        title: "Falha ao carregar admin",
        description:
          eventResult.error?.message ??
          categoriesResult.error?.message ??
          giftsResult.error?.message ??
          reservationsResult.error?.message,
        variant: "error",
      });
      return;
    }

    setEventForm(eventToForm((eventResult.data as EventSettings | null) ?? fallbackEventSettings));
    setCategories((categoriesResult.data ?? []) as Category[]);
    setGifts((giftsResult.data ?? []) as unknown as GiftType[]);
    setReservations((reservationsResult.data ?? []) as unknown as Reservation[]);
    setProgress((progressResult.data as RegistryProgress | null) ?? calculateRegistryProgress([]));
    setGiftForm(emptyGift((categoriesResult.data?.[0] as Category | undefined)?.id));
  }, [showToast, supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setIsAdmin(false);
      }
      void loadData();
    });

    return () => data.subscription.unsubscribe();
  }, [loadData, supabase]);

  const stats = useMemo(() => {
    const publicGifts = gifts.filter((gift) => gift.is_public && gift.status !== "archived");
    const completedGifts = publicGifts.filter(
      (gift) => gift.quantity_owned + gift.quantity_reserved >= gift.quantity_needed,
    );
    const confirmedReservations = reservations.filter(
      (reservation) => reservation.status === "confirmed",
    );

    return {
      publicGifts: publicGifts.length,
      completedGifts: completedGifts.length,
      confirmedReservations: confirmedReservations.length,
      categories: categories.filter((category) => category.is_active).length,
    };
  }, [categories, gifts, reservations]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      showToast({
        title: "Supabase nao configurado",
        description: "Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        variant: "info",
      });
      return;
    }

    setIsBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsBusy(false);

    if (error) {
      showToast({
        title: "Login nao realizado",
        description: error.message,
        variant: "error",
      });
      return;
    }

    showToast({ title: "Login realizado", variant: "success" });
    await loadData();
  }

  async function handleLogout() {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  }

  async function handleSaveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !isAdmin) {
      showToast({
        title: "Conecte o Supabase para salvar",
        description: "O painel esta exibindo dados locais de demonstracao.",
        variant: "info",
      });
      return;
    }

    const payload = {
      id: eventForm.id ?? EVENT_SETTINGS_ID,
      event_date: toSupabaseDateTime(eventForm.event_date),
      event_time: eventForm.event_time.trim(),
      location_name: eventForm.location_name.trim(),
      address: eventForm.address.trim(),
      google_maps_url: eventForm.google_maps_url.trim() || "https://maps.google.com",
      whatsapp_number: eventForm.whatsapp_number.trim(),
      dress_code: eventForm.dress_code.trim() || null,
      welcome_message: eventForm.welcome_message.trim(),
      event_headline: eventForm.event_headline.trim() || null,
      event_description: eventForm.event_description.trim() || null,
      couple_photo_url: eventForm.couple_photo_url.trim() || null,
      couple_photo_alt: eventForm.couple_photo_alt.trim() || null,
      ultrasound_photo_url: eventForm.ultrasound_photo_url.trim() || null,
      ultrasound_photo_alt: eventForm.ultrasound_photo_alt.trim() || null,
    };

    const { error } = await supabase.from("event_settings").upsert(payload, {
      onConflict: "id",
    });

    if (error) {
      showToast({
        title: "Evento nao salvo",
        description: error.message,
        variant: "error",
      });
      return;
    }

    showToast({ title: "Evento salvo", variant: "success" });
    await loadData();
  }

  async function handleSaveGift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !isAdmin) {
      showToast({
        title: "Conecte o Supabase para salvar",
        description: "O painel esta exibindo dados locais de demonstracao.",
        variant: "info",
      });
      return;
    }

    const payload = {
      category_id: giftForm.category_id,
      name: giftForm.name.trim(),
      slug: giftForm.slug.trim() || slugify(giftForm.name),
      suggested_brands: giftForm.suggested_brands
        .split("\n")
        .map((brand) => brand.trim())
        .filter(Boolean),
      image_url: giftForm.image_url.trim() || null,
      description: giftForm.description.trim(),
      notes: giftForm.notes.trim() || null,
      quantity_needed: Number(giftForm.quantity_needed),
      quantity_owned: Number(giftForm.quantity_owned),
      progress_weight: Number(giftForm.progress_weight),
      status: giftForm.status,
      is_public: giftForm.is_public,
      display_order: Number(giftForm.display_order),
    };

    const result = giftForm.id
      ? await supabase.from("gifts").update(payload).eq("id", giftForm.id)
      : await supabase.from("gifts").insert(payload);

    if (result.error) {
      showToast({
        title: "Presente nao salvo",
        description: result.error.message,
        variant: "error",
      });
      return;
    }

    showToast({ title: "Presente salvo", variant: "success" });
    await loadData();
  }

  async function handleArchiveGift(gift: GiftType) {
    if (!supabase || !isAdmin) {
      return;
    }

    const { error } = await supabase
      .from("gifts")
      .update({ status: "archived", is_public: false })
      .eq("id", gift.id);

    if (error) {
      showToast({
        title: "Nao foi possivel arquivar",
        description: error.message,
        variant: "error",
      });
      return;
    }

    showToast({ title: "Presente arquivado", variant: "success" });
    await loadData();
  }

  async function handleReleaseGift(gift: GiftType) {
    if (!supabase || !isAdmin) {
      return;
    }

    const confirmed = reservations.filter(
      (reservation) => reservation.gift_id === gift.id && reservation.status === "confirmed",
    );

    for (const reservation of confirmed) {
      const { error } = await supabase.rpc("cancel_reservation", {
        p_reservation_id: reservation.id,
      });

      if (error) {
        showToast({
          title: "Nao foi possivel liberar",
          description: error.message,
          variant: "error",
        });
        return;
      }
    }

    showToast({ title: "Presente liberado", variant: "success" });
    await loadData();
  }

  async function handleSaveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !isAdmin) {
      showToast({
        title: "Conecte o Supabase para salvar",
        description: "O painel esta exibindo dados locais de demonstracao.",
        variant: "info",
      });
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      slug: categoryForm.slug.trim() || slugify(categoryForm.name),
      description: categoryForm.description.trim() || null,
      display_order: Number(categoryForm.display_order),
      is_active: categoryForm.is_active,
    };

    const result = categoryForm.id
      ? await supabase.from("categories").update(payload).eq("id", categoryForm.id)
      : await supabase.from("categories").insert(payload);

    if (result.error) {
      showToast({
        title: "Categoria nao salva",
        description: result.error.message,
        variant: "error",
      });
      return;
    }

    showToast({ title: "Categoria salva", variant: "success" });
    setCategoryForm(emptyCategory);
    await loadData();
  }

  async function handleCancelReservation(reservation: Reservation) {
    if (!supabase || !isAdmin) {
      return;
    }

    const { error } = await supabase.rpc("cancel_reservation", {
      p_reservation_id: reservation.id,
    });

    if (error) {
      showToast({ title: "Reserva nao cancelada", description: error.message, variant: "error" });
      return;
    }

    showToast({ title: "Reserva cancelada", variant: "success" });
    await loadData();
  }

  async function exportReservations() {
    const headers = [
      "Presente",
      "Convidado",
      "Telefone",
      "Mensagem",
      "Quantidade",
      "Status",
      "Criado em",
    ];
    const rows = reservations.map((reservation) => [
      reservation.gift?.name ?? reservation.gift_id,
      reservation.guest_name,
      reservation.guest_phone ?? "",
      reservation.guest_message ?? "",
      String(reservation.quantity),
      reservation.status,
      reservation.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `reservas-manoel-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function editGift(gift: GiftType) {
    setGiftForm({
      id: gift.id,
      category_id: gift.category_id,
      name: gift.name,
      slug: gift.slug,
      suggested_brands: gift.suggested_brands.join("\n"),
      image_url: gift.image_url ?? "",
      description: gift.description,
      notes: gift.notes ?? "",
      quantity_needed: gift.quantity_needed,
      quantity_owned: gift.quantity_owned,
      progress_weight: gift.progress_weight,
      status: gift.status,
      is_public: gift.is_public,
      display_order: gift.display_order,
    });
    setActiveTab("gifts");
  }

  function editCategory(category: Category) {
    setCategoryForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setActiveTab("categories");
  }

  if (!isAuthChecked) {
    return (
      <section className="page-shell py-12">
        <div className="skeleton h-96 rounded-[32px]" />
      </section>
    );
  }

  if (supabase && !session) {
    return (
      <section className="page-shell grid min-h-[70vh] items-center py-12">
        <form
          onSubmit={(event) => void handleLogin(event)}
          className="premium-card mx-auto grid w-full max-w-md gap-4 rounded-[32px] p-7"
        >
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-sage-100 text-sage-700">
            <Lock aria-hidden className="size-5" />
          </div>
          <h1 className="font-serif text-4xl text-sage-900">Administracao</h1>
          <p className="text-sm leading-6 text-ink-900/62">
            Entre com um usuario do Supabase Auth cadastrado em admin_profiles.
          </p>
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit" icon={ShieldCheck} disabled={isBusy}>
            {isBusy ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </section>
    );
  }

  if (supabase && session && !isAdmin) {
    return (
      <section className="page-shell grid min-h-[70vh] items-center py-12">
        <div className="premium-card mx-auto max-w-xl rounded-[32px] p-7 text-center">
          <Lock aria-hidden className="mx-auto mb-5 size-10 text-sage-700" />
          <h1 className="font-serif text-4xl text-sage-900">Acesso pendente</h1>
          <p className="mt-4 text-sm leading-6 text-ink-900/64">
            O usuario esta autenticado, mas ainda nao existe um registro correspondente em
            admin_profiles.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-6"
            onClick={() => void handleLogout()}
          >
            Sair
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sage-700">
            <ShieldCheck aria-hidden className="size-4" />
            Painel administrativo
          </p>
          <h1 className="font-serif text-5xl leading-none text-sage-900 md:text-6xl">
            Gestao do enxoval
          </h1>
          {!supabase ? (
            <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-900/62">
              Supabase ainda nao esta configurado. O painel exibe dados locais para revisao visual,
              mas salvar, cancelar e exportar dados reais exige conexao com o projeto.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            icon={RefreshCcw}
            onClick={() => void loadData()}
          >
            Atualizar
          </Button>
          {supabase ? (
            <Button type="button" variant="ghost" icon={LogOut} onClick={() => void handleLogout()}>
              Sair
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton
          active={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
          icon={BarChart3}
        >
          Dashboard
        </TabButton>
        <TabButton
          active={activeTab === "event"}
          onClick={() => setActiveTab("event")}
          icon={CalendarDays}
        >
          Evento
        </TabButton>
        <TabButton active={activeTab === "gifts"} onClick={() => setActiveTab("gifts")} icon={Gift}>
          Presentes
        </TabButton>
        <TabButton
          active={activeTab === "categories"}
          onClick={() => setActiveTab("categories")}
          icon={Tags}
        >
          Categorias
        </TabButton>
        <TabButton
          active={activeTab === "reservations"}
          onClick={() => setActiveTab("reservations")}
          icon={PackageCheck}
        >
          Reservas
        </TabButton>
      </div>

      {activeTab === "dashboard" ? (
        <Dashboard stats={stats} progress={progress} reservations={reservations} />
      ) : null}

      {activeTab === "event" ? (
        <EventForm form={eventForm} setForm={setEventForm} onSubmit={handleSaveEvent} />
      ) : null}

      {activeTab === "gifts" ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GiftForm
            form={giftForm}
            setForm={setGiftForm}
            categories={categories}
            onSubmit={handleSaveGift}
            onNew={() => setGiftForm(emptyGift(categories[0]?.id))}
          />
          <GiftTable
            gifts={gifts}
            onEdit={editGift}
            onArchive={handleArchiveGift}
            onRelease={handleReleaseGift}
          />
        </div>
      ) : null}

      {activeTab === "categories" ? (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <CategoryForm
            form={categoryForm}
            setForm={setCategoryForm}
            onSubmit={handleSaveCategory}
            onNew={() => setCategoryForm(emptyCategory)}
          />
          <CategoryTable categories={categories} onEdit={editCategory} />
        </div>
      ) : null}

      {activeTab === "reservations" ? (
        <ReservationsTable
          reservations={reservations}
          onCancel={handleCancelReservation}
          onExport={() => void exportReservations()}
        />
      ) : null}
    </section>
  );
}

function TabButton({
  active,
  icon: Icon,
  children,
  onClick,
}: {
  active: boolean;
  icon: typeof BarChart3;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
        active
          ? "border-sage-700 bg-sage-700 text-white"
          : "border-sage-200 bg-white/70 text-sage-800 hover:bg-sage-50",
      )}
    >
      <Icon aria-hidden className="size-4" />
      {children}
    </button>
  );
}

function Dashboard({
  stats,
  progress,
  reservations,
}: {
  stats: {
    publicGifts: number;
    completedGifts: number;
    confirmedReservations: number;
    categories: number;
  };
  progress: RegistryProgress;
  reservations: Reservation[];
}) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Presentes publicos" value={stats.publicGifts} />
        <StatCard label="Itens completos" value={stats.completedGifts} />
        <StatCard label="Reservas ativas" value={stats.confirmedReservations} />
        <StatCard label="Categorias" value={stats.categories} />
      </div>
      <div className="premium-card rounded-[32px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">
              Progresso geral
            </p>
            <p className="mt-2 font-serif text-5xl text-sage-900">
              {progress.percentage.toFixed(1)}%
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm md:w-80">
            <Metric label="Pontos totais" value={progress.total_weight.toFixed(0)} />
            <Metric label="Pontos completos" value={progress.completed_weight.toFixed(0)} />
          </div>
        </div>
        <ProgressBar value={progress.percentage} className="mt-6" />
      </div>
      <div className="premium-card rounded-[32px] p-6">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">
          Reservas recentes
        </p>
        <div className="grid gap-3">
          {reservations.slice(0, 5).map((reservation) => (
            <div
              key={reservation.id}
              className="flex flex-col gap-1 rounded-2xl bg-white/75 p-4 text-sm md:flex-row md:items-center md:justify-between"
            >
              <span className="font-semibold text-ink-900">{reservation.guest_name}</span>
              <span className="text-ink-900/60">
                {reservation.quantity}x {reservation.gift?.name ?? reservation.gift_id}
              </span>
            </div>
          ))}
          {reservations.length === 0 ? (
            <p className="text-sm text-ink-900/60">Nenhuma reserva registrada ainda.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="premium-card rounded-[28px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-700">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-sage-900">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-sage-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-900/45">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-sage-800">{value}</p>
    </div>
  );
}

function EventForm({
  form,
  setForm,
  onSubmit,
}: {
  form: EventFormState;
  setForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="premium-card grid gap-6 rounded-[32px] p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">
          Configuracao do evento
        </p>
        <h2 className="mt-2 font-serif text-4xl text-sage-900">Dados principais</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4 rounded-[28px] border border-sage-100 bg-white/55 p-5">
          <EventBlockTitle icon={CalendarDays} label="Data e chamada" />
          <TextField
            label="Data e horario reais"
            type="datetime-local"
            value={form.event_date}
            onChange={(event) =>
              setForm((current) => ({ ...current, event_date: event.target.value }))
            }
            required
          />
          <TextField
            label="Horario exibido no site"
            value={form.event_time}
            onChange={(event) =>
              setForm((current) => ({ ...current, event_time: event.target.value }))
            }
            required
          />
          <TextField
            label="Titulo da secao do evento"
            value={form.event_headline}
            onChange={(event) =>
              setForm((current) => ({ ...current, event_headline: event.target.value }))
            }
          />
          <TextAreaField
            label="Texto da secao do evento"
            value={form.event_description}
            onChange={(event) =>
              setForm((current) => ({ ...current, event_description: event.target.value }))
            }
          />
        </div>

        <div className="grid gap-4 rounded-[28px] border border-sage-100 bg-white/55 p-5">
          <EventBlockTitle icon={MapPin} label="Local e contato" />
          <TextField
            label="Nome do local"
            value={form.location_name}
            onChange={(event) =>
              setForm((current) => ({ ...current, location_name: event.target.value }))
            }
            required
          />
          <TextAreaField
            label="Endereco"
            value={form.address}
            onChange={(event) =>
              setForm((current) => ({ ...current, address: event.target.value }))
            }
            required
          />
          <TextField
            label="Link do Google Maps"
            type="url"
            value={form.google_maps_url}
            onChange={(event) =>
              setForm((current) => ({ ...current, google_maps_url: event.target.value }))
            }
          />
          <TextField
            label="WhatsApp com DDI e DDD"
            value={form.whatsapp_number}
            onChange={(event) =>
              setForm((current) => ({ ...current, whatsapp_number: event.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4 rounded-[28px] border border-sage-100 bg-white/55 p-5">
          <EventBlockTitle icon={MessageCircle} label="Texto de boas-vindas" />
          <TextAreaField
            label="Mensagem da capa"
            value={form.welcome_message}
            onChange={(event) =>
              setForm((current) => ({ ...current, welcome_message: event.target.value }))
            }
            required
          />
          <EventBlockTitle icon={Shirt} label="Dress code" />
          <TextAreaField
            label="Orientacao de roupa"
            value={form.dress_code}
            onChange={(event) =>
              setForm((current) => ({ ...current, dress_code: event.target.value }))
            }
          />
        </div>

        <div className="grid gap-4 rounded-[28px] border border-sage-100 bg-white/55 p-5">
          <EventBlockTitle icon={Camera} label="Fotos da home" />
          <TextField
            label="URL da foto do casal"
            value={form.couple_photo_url}
            onChange={(event) =>
              setForm((current) => ({ ...current, couple_photo_url: event.target.value }))
            }
          />
          <TextField
            label="Texto alternativo da foto do casal"
            value={form.couple_photo_alt}
            onChange={(event) =>
              setForm((current) => ({ ...current, couple_photo_alt: event.target.value }))
            }
          />
          <PhotoPreview url={form.couple_photo_url} alt={form.couple_photo_alt} />
          <TextField
            label="URL da foto do ultrassom"
            value={form.ultrasound_photo_url}
            onChange={(event) =>
              setForm((current) => ({ ...current, ultrasound_photo_url: event.target.value }))
            }
          />
          <TextField
            label="Texto alternativo do ultrassom"
            value={form.ultrasound_photo_alt}
            onChange={(event) =>
              setForm((current) => ({ ...current, ultrasound_photo_alt: event.target.value }))
            }
          />
          <PhotoPreview url={form.ultrasound_photo_url} alt={form.ultrasound_photo_alt} />
        </div>
      </div>

      <Button type="submit" icon={Save} className="w-fit">
        Salvar evento
      </Button>
    </form>
  );
}

function EventBlockTitle({ icon: Icon, label }: { icon: typeof CalendarDays; label: string }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-700">
      <Icon aria-hidden className="size-4" />
      {label}
    </p>
  );
}

function PhotoPreview({ url, alt }: { url: string; alt: string }) {
  const imageUrl = url.trim();

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sage-100 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBasePath(imageUrl)} alt={alt || "Previa da foto"} className="h-36 w-full object-cover" />
    </div>
  );
}

function GiftForm({
  form,
  setForm,
  categories,
  onSubmit,
  onNew,
}: {
  form: GiftFormState;
  setForm: React.Dispatch<React.SetStateAction<GiftFormState>>;
  categories: Category[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNew: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="premium-card grid gap-4 rounded-[32px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">
            {form.id ? "Editar presente" : "Novo presente"}
          </p>
          <h2 className="mt-2 font-serif text-4xl text-sage-900">Dados do item</h2>
        </div>
        <Button type="button" variant="secondary" icon={Plus} onClick={onNew}>
          Novo
        </Button>
      </div>
      <TextField
        label="Nome"
        value={form.name}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            name: event.target.value,
            slug: current.slug ? current.slug : slugify(event.target.value),
          }))
        }
        required
      />
      <TextField
        label="Slug"
        value={form.slug}
        onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
        required
      />
      <label className="grid gap-2 text-sm font-medium text-ink-900/80">
        Categoria
        <select
          className="focus-ring min-h-11 rounded-2xl border border-sage-200 bg-white/80 px-4 text-ink-900 shadow-sm"
          value={form.category_id}
          onChange={(event) =>
            setForm((current) => ({ ...current, category_id: event.target.value }))
          }
          required
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <TextAreaField
        label="Descricao"
        value={form.description}
        onChange={(event) =>
          setForm((current) => ({ ...current, description: event.target.value }))
        }
        required
      />
      <TextAreaField
        label="Observacoes"
        value={form.notes}
        onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
      />
      <TextAreaField
        label="Marcas sugeridas (uma por linha)"
        value={form.suggested_brands}
        onChange={(event) =>
          setForm((current) => ({ ...current, suggested_brands: event.target.value }))
        }
      />
      <TextField
        label="URL da imagem"
        value={form.image_url}
        onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="Quantidade necessaria"
          type="number"
          min={1}
          value={form.quantity_needed}
          onChange={(event) =>
            setForm((current) => ({ ...current, quantity_needed: Number(event.target.value) }))
          }
          required
        />
        <TextField
          label="Ja possuida"
          type="number"
          min={0}
          value={form.quantity_owned}
          onChange={(event) =>
            setForm((current) => ({ ...current, quantity_owned: Number(event.target.value) }))
          }
        />
        <TextField
          label="Peso"
          type="number"
          min={0.1}
          step={0.1}
          value={form.progress_weight}
          onChange={(event) =>
            setForm((current) => ({ ...current, progress_weight: Number(event.target.value) }))
          }
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="Ordem"
          type="number"
          value={form.display_order}
          onChange={(event) =>
            setForm((current) => ({ ...current, display_order: Number(event.target.value) }))
          }
        />
        <label className="grid gap-2 text-sm font-medium text-ink-900/80">
          Status
          <select
            className="focus-ring min-h-11 rounded-2xl border border-sage-200 bg-white/80 px-4 text-ink-900 shadow-sm"
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as GiftType["status"],
              }))
            }
          >
            <option value="available">Disponivel</option>
            <option value="reserved">Reservado</option>
            <option value="hidden">Oculto</option>
            <option value="owned">Ja adquirido</option>
            <option value="archived">Arquivado</option>
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-sage-200 bg-white/70 px-4 py-3 text-sm font-semibold text-ink-900/75">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(event) =>
              setForm((current) => ({ ...current, is_public: event.target.checked }))
            }
            className="size-4 accent-sage-700"
          />
          Publico
        </label>
      </div>
      <Button type="submit" icon={Save}>
        Salvar presente
      </Button>
    </form>
  );
}

function GiftTable({
  gifts,
  onEdit,
  onArchive,
  onRelease,
}: {
  gifts: GiftType[];
  onEdit: (gift: GiftType) => void;
  onArchive: (gift: GiftType) => void;
  onRelease: (gift: GiftType) => void;
}) {
  return (
    <div className="premium-card overflow-hidden rounded-[32px]">
      <div className="border-b border-sage-200/70 p-5">
        <h2 className="font-serif text-3xl text-sage-900">Presentes cadastrados</h2>
      </div>
      <div className="max-h-[760px] overflow-auto">
        {gifts.map((gift) => (
          <div
            key={gift.id}
            className="grid gap-3 border-b border-sage-100 p-5 md:grid-cols-[1fr_auto] md:items-center"
          >
            <div>
              <p className="font-semibold text-ink-900">{gift.name}</p>
              <p className="mt-1 text-sm text-ink-900/58">
                {gift.quantity_owned + gift.quantity_reserved}/{gift.quantity_needed} completo ·
                peso {gift.progress_weight} · {gift.status}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" icon={Edit3} onClick={() => onEdit(gift)}>
                Editar
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={Unlock}
                onClick={() => onRelease(gift)}
              >
                Liberar
              </Button>
              <Button type="button" variant="ghost" icon={Trash2} onClick={() => onArchive(gift)}>
                Arquivar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryForm({
  form,
  setForm,
  onSubmit,
  onNew,
}: {
  form: CategoryFormState;
  setForm: React.Dispatch<React.SetStateAction<CategoryFormState>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNew: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="premium-card grid gap-4 rounded-[32px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">
            {form.id ? "Editar categoria" : "Nova categoria"}
          </p>
          <h2 className="mt-2 font-serif text-4xl text-sage-900">Agrupamento</h2>
        </div>
        <Button type="button" variant="secondary" icon={Plus} onClick={onNew}>
          Nova
        </Button>
      </div>
      <TextField
        label="Nome"
        value={form.name}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            name: event.target.value,
            slug: current.slug ? current.slug : slugify(event.target.value),
          }))
        }
        required
      />
      <TextField
        label="Slug"
        value={form.slug}
        onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
        required
      />
      <TextAreaField
        label="Descricao"
        value={form.description}
        onChange={(event) =>
          setForm((current) => ({ ...current, description: event.target.value }))
        }
      />
      <TextField
        label="Ordem"
        type="number"
        value={form.display_order}
        onChange={(event) =>
          setForm((current) => ({ ...current, display_order: Number(event.target.value) }))
        }
      />
      <label className="flex items-center gap-3 rounded-2xl border border-sage-200 bg-white/70 px-4 py-3 text-sm font-semibold text-ink-900/75">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(event) =>
            setForm((current) => ({ ...current, is_active: event.target.checked }))
          }
          className="size-4 accent-sage-700"
        />
        Ativa
      </label>
      <Button type="submit" icon={Save}>
        Salvar categoria
      </Button>
    </form>
  );
}

function CategoryTable({
  categories,
  onEdit,
}: {
  categories: Category[];
  onEdit: (category: Category) => void;
}) {
  return (
    <div className="premium-card overflow-hidden rounded-[32px]">
      <div className="border-b border-sage-200/70 p-5">
        <h2 className="font-serif text-3xl text-sage-900">Categorias</h2>
      </div>
      {categories.map((category) => (
        <div
          key={category.id}
          className="grid gap-3 border-b border-sage-100 p-5 md:grid-cols-[1fr_auto] md:items-center"
        >
          <div>
            <p className="font-semibold text-ink-900">{category.name}</p>
            <p className="mt-1 text-sm text-ink-900/58">
              {category.slug} · ordem {category.display_order} ·{" "}
              {category.is_active ? "ativa" : "inativa"}
            </p>
          </div>
          <Button type="button" variant="secondary" icon={Edit3} onClick={() => onEdit(category)}>
            Editar
          </Button>
        </div>
      ))}
    </div>
  );
}

function ReservationsTable({
  reservations,
  onCancel,
  onExport,
}: {
  reservations: Reservation[];
  onCancel: (reservation: Reservation) => void;
  onExport: () => void;
}) {
  return (
    <div className="premium-card overflow-hidden rounded-[32px]">
      <div className="flex flex-col gap-4 border-b border-sage-200/70 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-3xl text-sage-900">Reservas</h2>
          <p className="mt-1 text-sm text-ink-900/60">
            Visualize, cancele e exporte em CSV compativel com Excel.
          </p>
        </div>
        <Button type="button" icon={Download} onClick={onExport}>
          Exportar Excel
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-sage-50 text-xs uppercase tracking-[0.16em] text-sage-700">
            <tr>
              <th className="px-5 py-4">Convidado</th>
              <th className="px-5 py-4">Presente</th>
              <th className="px-5 py-4">Qtd.</th>
              <th className="px-5 py-4">Telefone</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border-b border-sage-100">
                <td className="px-5 py-4 font-semibold text-ink-900">{reservation.guest_name}</td>
                <td className="px-5 py-4 text-ink-900/64">
                  {reservation.gift?.name ?? reservation.gift_id}
                </td>
                <td className="px-5 py-4 text-ink-900/64">{reservation.quantity}</td>
                <td className="px-5 py-4 text-ink-900/64">{reservation.guest_phone ?? "-"}</td>
                <td className="px-5 py-4 text-ink-900/64">{reservation.status}</td>
                <td className="px-5 py-4">
                  <Button
                    type="button"
                    variant="secondary"
                    icon={Trash2}
                    disabled={reservation.status === "cancelled"}
                    onClick={() => onCancel(reservation)}
                  >
                    Cancelar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reservations.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/60">Nenhuma reserva encontrada.</p>
        ) : null}
      </div>
    </div>
  );
}
