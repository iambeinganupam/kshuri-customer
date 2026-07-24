import { Star } from 'lucide-react';

interface RatingBreakdownProps {
  avg: number;
  total: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

function pct(count: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((count / total) * 100);
}

export function RatingBreakdown({ avg, total, breakdown }: RatingBreakdownProps) {
  const rows = ([5, 4, 3, 2, 1] as const).map((star) => ({
    star,
    count: breakdown[star] ?? 0,
  }));

  return (
    <section className="space-y-3" aria-label="Rating breakdown">
      <header className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">{avg.toFixed(1)}</span>
        <Star className="h-5 w-5 fill-amber-500 text-amber-500" aria-hidden />
        <span className="text-sm text-muted-foreground">({total} ratings)</span>
      </header>
      <ul className="space-y-1.5">
        {rows.map(({ star, count }) => {
          const width = pct(count, total);
          return (
            <li key={star} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-right tabular-nums">{star}</span>
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
              <div
                className="h-2 flex-1 rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={width}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="w-12 text-right tabular-nums text-muted-foreground">{count}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
