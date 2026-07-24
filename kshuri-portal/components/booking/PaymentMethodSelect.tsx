'use client'

// ─────────────────────────────────────────────────────────────────────────────
// PaymentMethodSelect — radio list of payment options on the confirm step.
// ─────────────────────────────────────────────────────────────────────────────
// The parent decides which methods are available (some vendors may opt out
// of cash, etc.). In v1 the methods are static; future iterations can
// surface a vendor-level allowlist from the backend.
// ─────────────────────────────────────────────────────────────────────────────

import { Banknote, CreditCard, Smartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PaymentMethod = 'card' | 'upi' | 'cash'

interface PaymentMethodSelectProps {
  value: PaymentMethod | undefined
  onChange: (m: PaymentMethod) => void
  availableMethods: PaymentMethod[]
}

const METHODS: { key: PaymentMethod; label: string; sub: string; icon: LucideIcon }[] = [
  { key: 'card', label: 'Card', sub: 'Visa, MasterCard, RuPay', icon: CreditCard },
  { key: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: Smartphone },
  { key: 'cash', label: 'Pay at venue', sub: 'Cash or card at the salon', icon: Banknote },
]

export function PaymentMethodSelect({
  value,
  onChange,
  availableMethods,
}: PaymentMethodSelectProps) {
  const enabled = METHODS.filter((m) => availableMethods.includes(m.key))
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Payment method</p>
      <div className="grid gap-2">
        {enabled.map((m) => {
          const Icon = m.icon
          const isSelected = value === m.key
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onChange(m.key)}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 text-left transition',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-foreground/30',
              )}
              aria-pressed={isSelected}
            >
              <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.sub}</p>
              </div>
              <div
                className={cn(
                  'h-4 w-4 rounded-full border-2',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30',
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
