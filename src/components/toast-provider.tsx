"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

import { cn } from "@/lib/cn";
import type { ToastMessage } from "@/types/domain";

type ToastContextValue = {
  showToast: (message: Omit<ToastMessage, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  const showToast = useCallback(
    (message: Omit<ToastMessage, "id">) => {
      const id = crypto.randomUUID();
      setMessages((current) => [...current, { ...message, id }]);
      window.setTimeout(() => dismiss(id), 4600);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-50 grid w-[min(360px,calc(100vw-32px))] gap-3">
        {messages.map((message) => {
          const variant = message.variant ?? "info";
          const Icon = icons[variant];

          return (
            <div
              key={message.id}
              className={cn(
                "premium-card rounded-3xl p-4 text-sm",
                variant === "error" && "border-red-200 bg-red-50/90",
              )}
              role="status"
            >
              <div className="flex gap-3">
                <Icon
                  aria-hidden
                  className={cn(
                    "mt-0.5 size-5 shrink-0",
                    variant === "success" && "text-sage-700",
                    variant === "error" && "text-red-700",
                    variant === "info" && "text-clay-500",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{message.title}</p>
                  {message.description ? (
                    <p className="mt-1 leading-6 text-ink-900/65">{message.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="focus-ring -mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-ink-900/60 transition hover:bg-white"
                  onClick={() => dismiss(message.id)}
                  aria-label="Fechar aviso"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
