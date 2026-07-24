import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  city:   z.string().min(1).max(60),
  region: z.string().default('IN'),
  lat:    z.number(),
  lng:    z.number(),
  source: z.enum(['manual', 'browser']),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    'kshuri_geo',
    JSON.stringify({ ...parsed.data, ts: Date.now() }),
    { httpOnly: false, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 30 },
  );
  return res;
}
