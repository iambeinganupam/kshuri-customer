import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { ClientProviders } from '@/lib/providers/providers'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: 'Kshuri — Daily grooming, on demand',
  description: 'Book trusted hair stylists, makeup artists, spa therapists, barbers, and skincare professionals near you. Real reviews, instant booking, transparent pricing.',
  generator: 'v0.app',
  keywords: ['grooming', 'hair salon', 'makeup artist', 'spa', 'barber', 'nail salon', 'beauty appointment', 'home salon services', 'India grooming'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#7a1a1a',
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased pb-[60px] md:pb-0">
        <ClientProviders>
          {children}
          <MobileBottomNav />
          <Toaster position="top-right" richColors />
          <Analytics />
        </ClientProviders>
      </body>
    </html>
  )
}
