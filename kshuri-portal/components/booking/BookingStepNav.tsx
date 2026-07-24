'use client'

// ─────────────────────────────────────────────────────────────────────────────
// BookingStepNav — top-of-flow progress indicator for /book/[slug]/*
// ─────────────────────────────────────────────────────────────────────────────
// Pure presentation. The address step is shown only when the parent layout
// decides it's needed (see addressRequired predicate), so the step list is
// computed upstream and passed in.
// ─────────────────────────────────────────────────────────────────────────────

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BookingStep {
  key: string
  label: string
}

interface BookingStepNavProps {
  steps: BookingStep[]
  currentIdx: number
}

export function BookingStepNav({ steps, currentIdx }: BookingStepNavProps) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((step, i) => {
        const isComplete = i < currentIdx
        const isCurrent = i === currentIdx
        return (
          <li key={step.key} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                isComplete && 'border-primary bg-primary text-primary-foreground',
                isCurrent && 'border-primary text-primary',
                !isComplete &&
                  !isCurrent &&
                  'border-muted-foreground/30 text-muted-foreground',
              )}
            >
              {isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                'hidden text-xs sm:inline',
                isCurrent ? 'font-medium' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className="mx-2 h-px flex-1 bg-muted" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
