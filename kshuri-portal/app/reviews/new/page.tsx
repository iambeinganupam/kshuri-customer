import { redirect } from 'next/navigation';
import { NewReviewForm } from './NewReviewForm';

type TargetKind = 'vendor' | 'service_line' | 'product';

function parseTarget(t: string | undefined): { kind: TargetKind; id: string } | null {
  if (!t) return null;
  const idx = t.indexOf(':');
  if (idx < 0) return null;
  const kind = t.slice(0, idx);
  const id = t.slice(idx + 1);
  if (!['vendor', 'service_line', 'product'].includes(kind)) return null;
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) return null;
  return { kind: kind as TargetKind, id };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'Write a review | Kshuri' };
}

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ target?: string }>;
}) {
  const { target } = await searchParams;
  const parsed = parseTarget(target);
  if (!parsed) redirect('/');

  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Write a review</h1>
        <p className="text-sm text-muted-foreground">
          Sharing your experience helps other customers make better choices.
        </p>
      </header>
      <NewReviewForm targetKind={parsed.kind} targetId={parsed.id} />
    </main>
  );
}
