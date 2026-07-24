import type { EventSettings } from "@/types/domain";

export const eventSettings: EventSettings = {
  id: "local-event",
  event_date: process.env.NEXT_PUBLIC_EVENT_DATE ?? "2026-10-18T15:00:00-03:00",
  event_time: "15h",
  location_name: "Local a definir",
  address: "Endereco sera atualizado em breve",
  google_maps_url: "https://maps.google.com",
  whatsapp_number: "5500000000000",
  dress_code: "Tons claros, verde salvia, bege ou branco",
  welcome_message:
    "Estamos preparando cada detalhe com carinho para receber o Manoel. Sua presenca e seu gesto tornam esse momento ainda mais especial.",
};
