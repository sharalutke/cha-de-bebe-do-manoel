import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/base-path";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date("2026-07-23");

  return ["", "/presentes", "/reserva/sucesso"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
