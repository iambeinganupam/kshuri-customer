import { ImageResponse } from 'next/og';

// Static metadata exports — Next.js 16 file convention.
export const alt = 'Vendor profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface OGVendorPayload {
  vendor: { name: string };
  gallery: Array<{ url: string }>;
}

async function getOGData(slug: string): Promise<OGVendorPayload | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1';
  try {
    const res = await fetch(`${base}/discover/vendors/${encodeURIComponent(slug)}/profile`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: true; data: OGVendorPayload };
    return json.data;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getOGData(slug);
  const name = data?.vendor.name ?? 'Vendor';
  const hero = data?.gallery?.[0]?.url;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#0b0f1a',
          color: 'white',
          padding: '48px',
          backgroundImage: hero
            ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${hero})`
            : 'linear-gradient(135deg, #1a1f2e 0%, #0b0f1a 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.7, letterSpacing: 4 }}>KSHURI</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, marginTop: 16 }}>
          {name}
        </div>
      </div>
    ),
    size,
  );
}
