import Link from "next/link";
import type { ComponentProps, ComponentType, ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-sage-700 text-white shadow-soft hover:bg-sage-800",
  secondary: "border border-sage-200 bg-white/70 text-sage-800 hover:bg-sage-50",
  ghost: "text-sage-800 hover:bg-sage-50",
  danger: "bg-red-950 text-white hover:bg-red-900",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

export function Button({
  className,
  variant = "primary",
  icon: Icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden className="size-4" /> : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  href: ComponentProps<typeof Link>["href"];
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  icon: Icon,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition",
        variantClasses[variant],
        className,
      )}
    >
      {Icon ? <Icon aria-hidden className="size-4" /> : null}
      {children}
    </Link>
  );
}
