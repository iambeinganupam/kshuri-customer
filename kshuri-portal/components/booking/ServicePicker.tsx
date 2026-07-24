'use client'

// ─────────────────────────────────────────────────────────────────────────────
// ServicePicker — Step 1 of /book/[slug]/*
// ─────────────────────────────────────────────────────────────────────────────
// Lets the customer toggle one or more services. A sticky footer shows the
// running total + duration + a home-service hint, and a Continue button.
// Onsite vs home-service distinction surfaces via a Badge so the flow makes
// the upcoming Address step legible.
// ─────────────────────────────────────────────────────────────────────────────

import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VendorService } from '@/lib/booking/booking-types'

interface ServicePickerProps {
  services: VendorService[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onContinue: () => void
}

function formatPrice(p: number) {
  return `₹${p.toLocaleString('en-IN')}`
}

function formatDuration(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

export function ServicePicker({
  services,
  selectedIds,
  onToggle,
  onContinue,
}: ServicePickerProps) {
  const selected = services.filter((s) => selectedIds.includes(s.id))
  const totalPrice = selected.reduce((sum, s) => sum + Number(s.price ?? 0), 0)
  const totalDuration = selected.reduce(
    (sum, s) => sum + (s.duration_minutes ?? 0),
    0,
  )
  const hasHomeService = selected.some(
    (s) => s.service_location && s.service_location !== 'onsite',
  )

  if (services.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          This vendor hasn&apos;t added any services yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedIds.includes(service.id)
          const isHome =
            service.service_location && service.service_location !== 'onsite'
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onToggle(service.id)}
              className={cn(
                'flex w-full items-start justify-between gap-4 rounded-lg border p-4 text-left transition',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-foreground/30',
              )}
              aria-pressed={isSelected}
            >
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{service.name}</span>
                  {isHome && (
                    <Badge variant="secondary">
                      {service.service_location === 'home'
                        ? 'Home service'
                        : 'Onsite or home'}
                    </Badge>
                  )}
                </div>
                {service.description && (
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDuration(service.duration_minutes ?? 0)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-semibold">
                  {formatPrice(Number(service.price ?? 0))}
                </span>
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30',
                  )}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="sticky bottom-4 rounded-lg border bg-background p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {selected.length} selected · {formatDuration(totalDuration)}
              {hasHomeService && ' · home service'}
            </p>
            <p className="text-lg font-semibold">{formatPrice(totalPrice)}</p>
          </div>
          <Button onClick={onContinue} disabled={selected.length === 0} size="lg">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
