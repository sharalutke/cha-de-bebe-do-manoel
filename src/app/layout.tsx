import type { Metadata, Viewport } from "next";

import { PwaRegister } from "@/components/pwa-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToastProvider } from "@/components/toast-provider";
import { getSiteUrl, withBasePath } from "@/lib/base-path";

import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chá de Bebê do Manoel",
    template: "%s | Chá de Bebê do Manoel",
  },
  description:
    "Lista de presentes elegante e em tempo real para familiares e amigos celebrarem a chegada do Manoel.",
  applicationName: "Chá de Bebê do Manoel",
  authors: [{ name: "Familia do Manoel" }],
  generator: "Next.js",
  keywords: ["cha de bebe", "Manoel", "lista de presentes", "enxoval", "Supabase"],
  openGraph: {
    title: "Chá de Bebê do Manoel",
    description: "Escolha um presente com carinho e acompanhe o progresso do enxoval do Manoel.",
    url: siteUrl,
    siteName: "Chá de Bebê do Manoel",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: withBasePath("/og.png"),
        width: 1200,
        height: 630,
        alt: "Chá de Bebê do Manoel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chá de Bebê do Manoel",
    description: "Escolha um presente com carinho e acompanhe o progresso do enxoval do Manoel.",
    images: [withBasePath("/og.png")],
  },
  icons: {
    icon: withBasePath("/favicon.svg"),
    apple: withBasePath("/icons/icon.svg"),
  },
  manifest: withBasePath("/manifest.webmanifest"),
};

export const viewport: Viewport = {
  themeColor: "#f4f7f1",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </ToastProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
