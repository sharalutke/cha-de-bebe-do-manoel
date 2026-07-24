export const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeZone: "America/Sao_Paulo",
});

export function formatPhoneForWhatsApp(phone: string) {
  return phone.replace(/\D/g, "");
}

export function pluralize(value: number, singular: string, plural: string) {
  return value === 1 ? singular : plural;
}
