import type { Metadata } from "next";

import { GiftRegistry } from "@/features/gifts/gift-registry";

export const metadata: Metadata = {
  title: "Lista de Presentes",
  description:
    "Pesquise, filtre e reserve presentes da lista do Chá de Bebê do Manoel em tempo real.",
};

export default function PresentesPage() {
  return <GiftRegistry />;
}
