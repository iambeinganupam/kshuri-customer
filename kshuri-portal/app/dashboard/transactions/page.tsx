'use client'

// ─────────────────────────────────────────────────────────────────────────────
// /dashboard/transactions — list of the customer's payments and refunds
// ─────────────────────────────────────────────────────────────────────────────
// Powered by useCustomerTransactions (cursor-paginated under the hood). v1
// shows the first page; pagination + filters land in a later iteration.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import Link from 'next/link'
import { useCustomerTransactions } from '@kshuri/api-client'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type StatusFilter = 'all' | 'pending' | 'completed' | 'failed' | 'refunded'

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Settled' },
  { key: 'refunded', label: 'Refunded' },
]

function fmtINR(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

function badgeVariant(
  status: string,
): 'default' | 'destructive' | 'secondary' | 'outline' {
  if (status === 'refunded') return 'destructive'
  if (status === 'completed') return 'default'
  if (status === 'failed') return 'destructive'
  return 'secondary'
}

export default function TransactionsListPage() {
  const [status, setStatus] = useState<StatusFilter>('all')
  const { data, isLoading } = useCustomerTransactions(
    status === 'all' ? undefined : { status: status as 'pending' | 'completed' | 'failed' | 'refunded' },
  )

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Your payments, tips, and refunds.
        </p>
      </header>

      <Tabs
        value={status}
        onValueChange={(v) => setStatus(v as StatusFilter)}
      >
        <TabsList>
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (data?.items ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No transactions yet.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {data!.items.map((tx) => (
            <li key={tx.id}>
              <Link
                href={`/dashboard/transactions/${tx.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-muted/30"
              >
                <div className="space-y-0.5">
                  <p className="font-medium">{tx.vendorName ?? 'Vendor'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString('en-IN')} ·{' '}
                    {tx.method ?? 'unknown'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{fmtINR(tx.amount)}</p>
                  <Badge variant={badgeVariant(tx.status)}>{tx.status}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
