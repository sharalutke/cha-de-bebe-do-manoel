"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownProps = {
  targetDate: string;
};

function getDiff(targetDate: string) {
  const targetTime = new Date(targetDate).getTime();
  const distance = Number.isFinite(targetTime) ? targetTime - Date.now() : 0;
  const safeDistance = Math.max(distance, 0);

  return {
    days: Math.floor(safeDistance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((safeDistance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((safeDistance / (1000 * 60)) % 60),
    seconds: Math.floor((safeDistance / 1000) % 60),
  };
}

export function Countdown({ targetDate }: CountdownProps) {
  const [diff, setDiff] = useState(() => getDiff(targetDate));

  useEffect(() => {
    const timer = window.setInterval(() => setDiff(getDiff(targetDate)), 1000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  const items = useMemo(
    () => [
      ["Dias", diff.days],
      ["Horas", diff.hours],
      ["Min", diff.minutes],
      ["Seg", diff.seconds],
    ],
    [diff],
  );

  return (
    <div className="grid grid-cols-4 gap-2" aria-label="Contador regressivo">
      {items.map(([label, value]) => (
        <div key={label} className="soft-panel rounded-3xl px-3 py-4 text-center">
          <span className="block text-2xl font-semibold text-sage-800 md:text-3xl">
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-900/50">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
