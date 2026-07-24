'use client'

// ─────────────────────────────────────────────────────────────────────────────
// /dashboard/transactions/[id] — detail view for a single transaction
// ─────────────────────────────────────────────────────────────────────────────
// Shows the amount, method, status, linked booking, and a refund block
// when the transaction has been refunded.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { use } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useCustomerTransaction } from '@kshuri/api-client'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

function fmtINR(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: tx, isLoading } = useCustomerTransaction(id)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }
  if (!tx) {
    return <p className="text-sm text-destructive">Transaction not found.</p>
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/transactions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> All transactions
      </Link>
      <h1 className="text-2xl font-semibold">
        Transaction #{tx.id.slice(0, 8)}
      </h1>

      <Card className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Amount
          </p>
          <Badge
            variant={tx.status === 'refunded' ? 'destructive' : 'default'}
          >
            {tx.status}
          </Badge>
        </div>
        <p className="text-2xl font-semibold">{fmtINR(tx.amount)}</p>
        <p className="text-sm text-muted-foreground">
          {tx.method ?? 'unknown'} ·{' '}
          {new Date(tx.createdAt).toLocaleString('en-IN')}
        </p>
        {tx.billNumber && (
          <p className="text-xs text-muted-foreground">
            Bill #{tx.billNumber}
          </p>
        )}
      </Card>

      {tx.appointmentId && (
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Linked booking
          </p>
          <Link
            className="text-sm underline"
            href={`/dashboard/bookings/${tx.appointmentId}`}
          >
            View booking →
          </Link>
        </Card>
      )}

      {tx.refund && (
        <Card className="space-y-2 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Refund
          </p>
          <p className="text-lg font-semibold">{fmtINR(tx.refund.amount)}</p>
          {tx.refund.reason && (
            <p className="text-sm text-muted-foreground">{tx.refund.reason}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Refunded on{' '}
            {new Date(tx.refund.refundedAt).toLocaleString('en-IN')}
          </p>
        </Card>
      )}
    </div>
  )
}
