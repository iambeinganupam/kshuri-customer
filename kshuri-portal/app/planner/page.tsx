"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ChevronRight, IndianRupee } from "lucide-react"
import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"
import { FadeIn, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/motion-wrapper"
import { defaultBudgetSplit } from "@/lib/checklist-data"
import { formatINR, vendors } from "@/lib/data"

const COLORS = [
  "#7c2d12", "#b45309", "#a16207", "#4d7c0f",
  "#0e7490", "#1d4ed8", "#7e22ce", "#be123c",
]

export default function PlannerPage() {
  const [totalBudget, setTotalBudget] = useState(1500000) // 15 lakhs default
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    Object.entries(defaultBudgetSplit).forEach(([key, val]) => {
      initial[key] = val.percent
    })
    return initial
  })

  const totalPercent = useMemo(
    () => Object.values(allocations).reduce((s, v) => s + v, 0),
    [allocations]
  )

  const chartData = useMemo(
    () =>
      Object.entries(defaultBudgetSplit).map(([key, val]) => ({
        name: val.label,
        value: allocations[key],
        amount: Math.round((allocations[key] / 100) * totalBudget),
        slug: val.slug,
      })),
    [allocations, totalBudget]
  )

  function updateAllocation(key: string, value: number) {
    setAllocations((prev) => ({ ...prev, [key]: value }))
  }

  function handleBudgetInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10)
    if (!isNaN(val)) setTotalBudget(val)
  }

  // Find affordable vendors per category
  function getAffordableCount(slug: string, amount: number): number {
    if (!slug) return 0
    return vendors.filter(
      (v) => v.categorySlug === slug && v.priceMin <= amount
    ).length
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 to-gold/5 px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">Budget Planner</span>
              </div>
              <h1 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Wedding Budget Planner
              </h1>
              <p className="mt-2 text-muted-foreground">
                Set your total budget, adjust category allocations, and see how far your budget goes.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="px-4 py-10 lg:py-14">
          <div className="mx-auto max-w-5xl">
            <FadeIn className="mb-8">
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Total Wedding Budget</Label>
                      <div className="relative mt-1.5">
                        <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={totalBudget.toLocaleString("en-IN")}
                          onChange={handleBudgetInput}
                          className="pl-9 text-lg font-semibold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[500000, 1000000, 1500000, 2500000, 5000000].map((val) => (
                        <Button
                          key={val}
                          variant={totalBudget === val ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTotalBudget(val)}
                          className="text-xs"
                        >
                          {val >= 10000000 ? `${val / 10000000}Cr` : `${val / 100000}L`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <div className="grid gap-8 lg:grid-cols-5">
              {/* Sliders */}
              <div className="lg:col-span-3">
                <StaggerContainer staggerDelay={0.05} className="flex flex-col gap-4">
                  {Object.entries(defaultBudgetSplit).map(([key, val], i) => {
                    const amount = Math.round((allocations[key] / 100) * totalBudget)
                    const affordable = getAffordableCount(val.slug, amount)
                    return (
                      <StaggerItem key={key}>
                        <div className="rounded-lg border border-border/50 bg-card p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                              />
                              <span className="text-sm font-medium text-card-foreground">
                                {val.label}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-foreground">
                                {formatINR(amount)}
                              </span>
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({allocations[key]}%)
                              </span>
                            </div>
                          </div>
                          <Slider
                            value={[allocations[key]]}
                            onValueChange={([v]) => updateAllocation(key, v)}
                            max={50}
                            min={0}
                            step={1}
                            className="my-2"
                          />
                          {val.slug && affordable > 0 && (
                            <Link href={`/services/${val.slug}`} className="text-xs text-primary hover:underline">
                              {affordable} vendors within this budget →
                            </Link>
                          )}
                        </div>
                      </StaggerItem>
                    )
                  })}
                </StaggerContainer>

                {totalPercent !== 100 && (
                  <motion.p
                    className="mt-4 text-sm text-amber-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ⚠ Total allocation is {totalPercent}% (should be 100%)
                  </motion.p>
                )}
              </div>

              {/* Chart */}
              <FadeIn delay={0.2} className="lg:col-span-2">
                <Card className="sticky top-20 border-border/60">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-center font-serif text-lg font-semibold text-card-foreground">
                      Budget Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => {
                            const amount =
                              (props.payload as { amount?: number } | undefined)?.amount ?? 0;
                            return [`${formatINR(amount)} (${value}%)`, name];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                      <p className="text-xs text-muted-foreground">Total Budget</p>
                      <p className="font-serif text-2xl font-bold text-foreground">
                        {formatINR(totalBudget)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
