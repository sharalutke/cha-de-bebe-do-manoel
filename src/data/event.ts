import type { EventSettings } from "@/types/domain";

export const DEFAULT_EVENT_DATE = "2026-08-22T15:00:00-03:00";

const configuredEventDate = process.env.NEXT_PUBLIC_EVENT_DATE?.trim();

export const eventSettings: EventSettings = {
  id: "local-event",
  event_date: configuredEventDate || DEFAULT_EVENT_DATE,
  event_time: "15h",
  location_name: "Informe o local no admin",
  address: "Informe o endereco no admin",
  google_maps_url: "https://maps.google.com",
  whatsapp_number: "5500000000000",
  dress_code: "Tons claros, verde salvia, bege ou branco",
  welcome_message:
    "Estamos preparando cada detalhe com carinho para receber o Manoel. Sua presenca e seu gesto tornam esse momento ainda mais especial.",
  event_headline: "Um encontro leve e cheio de afeto",
  event_description: "Confira data, horario, local e orientacoes do cha de bebe.",
  couple_photo_url: null,
  couple_photo_alt: "Foto da familia do Manoel",
  ultrasound_photo_url: null,
  ultrasound_photo_alt: "Ultrassom do Manoel",
};
