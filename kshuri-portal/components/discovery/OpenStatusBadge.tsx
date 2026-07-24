interface OpenStatusBadgeProps {
  hours: Array<{ dow: number; open: string; close: string; is_closed?: boolean }>;
  isOpenNow: boolean;
  tz?: string;
}

interface IstParts {
  dow: number;
  hhmm: string;
}

function nowInTz(tz: string): IstParts {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour12: false,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dow = map[parts.weekday as string] ?? 0;
  const hhmm = `${parts.hour}:${parts.minute}`;
  return { dow, hhmm };
}

function trimToHHMM(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export function OpenStatusBadge({ hours, isOpenNow, tz = 'Asia/Kolkata' }: OpenStatusBadgeProps) {
  if (isOpenNow) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700">
        Open now
      </span>
    );
  }

  if (!hours || hours.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        Closed
      </span>
    );
  }

  const { dow, hhmm } = nowInTz(tz);
  const today = hours.find((h) => h.dow === dow && !h.is_closed);
  if (today && hhmm < trimToHHMM(today.open)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700">
        Opens at {trimToHHMM(today.open)}
      </span>
    );
  }

  // Find next open day (1..7 days ahead)
  for (let off = 1; off <= 7; off++) {
    const target = (dow + off) % 7;
    const next = hours.find((h) => h.dow === target && !h.is_closed);
    if (next) {
      const label = off === 1 ? 'tomorrow' : `in ${off} days`;
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700">
          Opens {label} at {trimToHHMM(next.open)}
        </span>
      );
    }
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      Closed
    </span>
  );
}
