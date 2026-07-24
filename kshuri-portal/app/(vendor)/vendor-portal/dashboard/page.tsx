"use client"

import Link from "next/link"
import { TrendingUp, Eye, MessageSquare, CalendarCheck, Star, IndianRupee, ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VendorNavbar } from "@/components/vendor-navbar"
import { VendorFooter } from "@/components/vendor-footer"
import { BackToTop } from "@/components/back-to-top"
import { FadeIn, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/motion-wrapper"
import { dashboardStats, viewsData, recentInquiries } from "@/lib/dashboard-data"
import { formatINR } from "@/lib/data"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  responded: "bg-amber-100 text-amber-800",
  booked: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
}

export default function VendorDashboardPage() {
  const stats = [
    {
      label: "Profile Views",
      value: dashboardStats.profileViews,
      change: dashboardStats.viewsChange,
      icon: Eye,
      prefix: "",
      suffix: "",
    },
    {
      label: "Inquiries",
      value: dashboardStats.inquiries,
      change: dashboardStats.inquiriesChange,
      icon: MessageSquare,
      prefix: "",
      suffix: "",
    },
    {
      label: "Bookings",
      value: dashboardStats.bookings,
      change: dashboardStats.bookingsChange,
      icon: CalendarCheck,
      prefix: "",
      suffix: "",
    },
    {
      label: "Revenue",
      value: dashboardStats.revenue,
      change: dashboardStats.revenueChange,
      icon: IndianRupee,
      prefix: "₹",
      suffix: "",
      format: true,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0808]">
      <VendorNavbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-white/10 bg-white/[0.02] px-4 py-10 lg:py-12">
          <div className="mx-auto max-w-7xl">
            <FadeIn>
              <div className="flex items-center gap-2 text-sm text-white/30">
                <Link href="/vendor-portal" className="hover:text-white/60 transition-colors">
                  Partner Portal
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-white/60">Dashboard</span>
              </div>
              <h1 className="mt-4 font-serif text-3xl font-bold text-white sm:text-4xl">
                Vendor Dashboard
              </h1>
              <p className="mt-2 text-sm text-white/40">
                Track your performance, manage inquiries, and grow your business.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Dashboard Content */}
        <section className="px-4 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl">

            {/* Stat Cards */}
            <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <Card className="border-white/10 bg-white/[0.04] text-white">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                          <stat.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className={cn(
                          "flex items-center gap-0.5 text-xs font-medium",
                          stat.change >= 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {stat.change >= 0 ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          {Math.abs(stat.change)}%
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="font-serif text-2xl font-bold text-white">
                          {stat.format ? formatINR(stat.value) : (
                            <>
                              {stat.prefix}
                              <AnimatedCounter target={stat.value} />
                              {stat.suffix}
                            </>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-white/40">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Charts + Performance */}
            <div className="mt-8 grid gap-6 lg:grid-cols-5">
              {/* Views Chart */}
              <FadeIn delay={0.1} className="lg:col-span-3">
                <Card className="border-white/10 bg-white/[0.04] text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 font-serif text-base text-white">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Profile Views & Inquiries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={viewsData}>
                        <defs>
                          <linearGradient id="viewsGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c2d12" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#7c2d12" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="inqGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#b45309" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: "#1a0a0a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            color: "white",
                            fontSize: "12px",
                          }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#7c2d12" fill="url(#viewsGrad2)" strokeWidth={2} />
                        <Area type="monotone" dataKey="inquiries" stroke="#b45309" fill="url(#inqGrad2)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Performance */}
              <FadeIn delay={0.2} className="lg:col-span-2">
                <Card className="border-white/10 bg-white/[0.04] text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 font-serif text-base text-white">
                      <Star className="h-4 w-4 text-gold" /> Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="rounded-lg bg-white/[0.04] p-4 text-center">
                      <p className="text-xs text-white/40">Conversion Rate</p>
                      <p className="mt-1 font-serif text-3xl font-bold text-white">
                        {dashboardStats.conversionRate}%
                      </p>
                      <p className="mt-1 text-xs text-white/30">Inquiries → Bookings</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.04] p-4 text-center">
                      <p className="text-xs text-white/40">Average Rating</p>
                      <div className="mt-1 flex items-center justify-center gap-1">
                        <Star className="h-5 w-5 fill-gold text-gold" />
                        <span className="font-serif text-3xl font-bold text-white">
                          {dashboardStats.avgRating}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/30">Based on all reviews</p>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-center">
                      <p className="text-xs text-white/40">Profile Completeness</p>
                      <p className="mt-1 font-serif text-3xl font-bold text-primary">85%</p>
                      <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs text-gold/70 hover:text-gold">
                        Complete Profile →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>

            {/* Recent Inquiries */}
            <FadeIn delay={0.3} className="mt-8">
              <Card className="border-white/10 bg-white/[0.04] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between font-serif text-base text-white">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Recent Inquiries
                    </span>
                    <Badge className="border-white/20 bg-white/10 text-white/60 text-xs">
                      {recentInquiries.filter((i) => i.status === "new").length} new
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-white/[0.06]">
                    {recentInquiries.map((inq) => (
                      <motion.div
                        key={inq.id}
                        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white/80">
                              {inq.customerName}
                            </p>
                            <Badge className={cn("text-[10px]", statusColors[inq.status])}>
                              {inq.status}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-white/30 line-clamp-1">
                            {inq.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/30">
                          <span>{inq.eventType}</span>
                          <span>{inq.budget}</span>
                          <span>{inq.receivedAt}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

          </div>
        </section>
      </main>

      <VendorFooter />
      <BackToTop />
    </div>
  )
}
