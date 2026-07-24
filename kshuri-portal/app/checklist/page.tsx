"use client"

import { useCallback } from "react"
import Link from "next/link"
import { ChevronRight, Check, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"
import { checklistPhases } from "@/lib/checklist-data"
import { useLocalStorage } from "@/hooks/use-web-storage"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "kshuri-checklist"
const EMPTY: string[] = []

export default function ChecklistPage() {
  const [checked, setChecked] = useLocalStorage<string[]>(STORAGE_KEY, EMPTY)

  const toggle = useCallback(
    (taskId: string) => {
      setChecked(
        checked.includes(taskId)
          ? checked.filter((id) => id !== taskId)
          : [...checked, taskId],
      )
    },
    [checked, setChecked],
  )

  const totalTasks = checklistPhases.reduce((sum, p) => sum + p.tasks.length, 0)
  const completedTasks = checked.length
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 to-gold/5 px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">Checklist</span>
              </div>
              <h1 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Wedding Planning Checklist
              </h1>
              <p className="mt-2 text-muted-foreground">
                Track every step from 12 months before to your wedding day.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Progress value={progressPercent} className="flex-1 h-2.5" />
                <span className="shrink-0 text-sm font-semibold text-primary">
                  {progressPercent}% done
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="px-4 py-10 lg:py-14">
          <div className="mx-auto max-w-3xl">
            <StaggerContainer staggerDelay={0.1} className="flex flex-col gap-8">
              {checklistPhases.map((phase) => {
                const phaseDone = phase.tasks.filter((t) => checked.includes(t.id)).length
                const phaseTotal = phase.tasks.length

                return (
                  <StaggerItem key={phase.id}>
                    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                      {/* Phase header */}
                      <div className="flex items-center gap-3 border-b border-border/40 bg-secondary/30 px-5 py-4">
                        <span className="text-2xl">{phase.icon}</span>
                        <div className="flex-1">
                          <h2 className="font-serif text-lg font-semibold text-card-foreground">
                            {phase.title}
                          </h2>
                          <p className="text-xs text-muted-foreground">{phase.timeframe}</p>
                        </div>
                        <span className="text-sm font-medium text-primary">
                          {phaseDone}/{phaseTotal}
                        </span>
                      </div>

                      {/* Tasks */}
                      <div className="divide-y divide-border/30">
                        {phase.tasks.map((task) => {
                          const isDone = checked.includes(task.id)
                          return (
                            <motion.div
                              key={task.id}
                              className={cn(
                                "flex items-start gap-3 px-5 py-3.5 transition-colors",
                                isDone && "bg-primary/[0.03]"
                              )}
                              whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                            >
                              <motion.button
                                onClick={() => toggle(task.id)}
                                className={cn(
                                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                                  isDone
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border hover:border-primary/50"
                                )}
                                whileTap={{ scale: 0.85 }}
                              >
                                {isDone && <Check className="h-3 w-3" />}
                              </motion.button>
                              <div className="flex-1">
                                <p
                                  className={cn(
                                    "text-sm font-medium transition-all",
                                    isDone
                                      ? "text-muted-foreground line-through"
                                      : "text-card-foreground"
                                  )}
                                >
                                  {task.title}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {task.description}
                                </p>
                              </div>
                              {task.categoryLink && (
                                <Link
                                  href={task.categoryLink}
                                  className="mt-0.5 shrink-0 text-xs text-primary hover:underline flex items-center gap-0.5"
                                >
                                  Find vendors <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
