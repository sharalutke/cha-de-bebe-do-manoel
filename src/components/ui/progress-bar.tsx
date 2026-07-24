"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/cn";

type ProgressBarProps = {
  value: number;
  label?: string;
  className?: string;
};

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between text-sm font-medium text-ink-900/70">
          <span>{label}</span>
          <span>{safeValue.toFixed(1)}%</span>
        </div>
      ) : null}
      <div
        className="h-3 overflow-hidden rounded-full bg-sage-100"
        role="progressbar"
        aria-label={label ?? "Progresso"}
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sage-500 to-sage-700"
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
