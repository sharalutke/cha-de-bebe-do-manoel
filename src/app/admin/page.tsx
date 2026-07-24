import type { Metadata } from "next";

import { AdminPage } from "@/features/admin/admin-page";

export const metadata: Metadata = {
  title: "Administracao",
  description: "Painel administrativo protegido para gerenciar presentes e reservas.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRoute() {
  return <AdminPage />;
}
