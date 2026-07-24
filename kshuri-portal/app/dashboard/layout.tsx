import type { ReactNode } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <DashboardHeader />
      <DashboardTabs />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
