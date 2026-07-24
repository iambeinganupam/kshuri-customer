import { Award, BadgeCheck, ShieldCheck, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TrustBadgeRowProps {
  badges: string[];
  repeatCustomerPct?: number;
}

const BADGE_MAP: Record<string, { icon: LucideIcon; label: string }> = {
  verified: { icon: BadgeCheck, label: 'Verified' },
  kyc_done: { icon: ShieldCheck, label: 'KYC done' },
  top_rated: { icon: Award, label: 'Top rated' },
};

function Chip({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </span>
  );
}

export function TrustBadgeRow({ badges, repeatCustomerPct }: TrustBadgeRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map((b) => {
        const known = BADGE_MAP[b];
        if (known) {
          const I = known.icon;
          return (
            <Chip key={b} icon={I}>
              {known.label}
            </Chip>
          );
        }
        return (
          <Chip key={b} icon={Sparkles}>
            {b}
          </Chip>
        );
      })}
      {typeof repeatCustomerPct === 'number' && repeatCustomerPct >= 30 && (
        <Chip icon={Sparkles}>
          Loved by repeat customers — {repeatCustomerPct}% return
        </Chip>
      )}
    </div>
  );
}
