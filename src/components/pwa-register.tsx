"use client";

import { useEffect } from "react";

import { withBasePath } from "@/lib/base-path";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const swUrl = withBasePath("/sw.js");
    navigator.serviceWorker.register(swUrl).catch(() => undefined);
  }, []);

  return null;
}
