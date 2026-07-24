import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextField({ label, className, id, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name ?? label;

  return (
    <label className="grid gap-2 text-sm font-medium text-ink-900/80" htmlFor={fieldId}>
      {label}
      <input
        id={fieldId}
        className={cn(
          "focus-ring min-h-11 rounded-2xl border border-sage-200 bg-white/80 px-4 text-ink-900 shadow-sm transition placeholder:text-ink-900/35 focus:border-sage-500",
          className,
        )}
        {...props}
      />
    </label>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function TextAreaField({ label, className, id, ...props }: TextAreaFieldProps) {
  const fieldId = id ?? props.name ?? label;

  return (
    <label className="grid gap-2 text-sm font-medium text-ink-900/80" htmlFor={fieldId}>
      {label}
      <textarea
        id={fieldId}
        className={cn(
          "focus-ring min-h-28 resize-y rounded-2xl border border-sage-200 bg-white/80 px-4 py-3 text-ink-900 shadow-sm transition placeholder:text-ink-900/35 focus:border-sage-500",
          className,
        )}
        {...props}
      />
    </label>
  );
}
