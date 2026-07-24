"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Heart, MapPin, Users, IndianRupee, Quote, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"
import { weddingStories } from "@/lib/stories-data"
import { cn } from "@/lib/utils"

const styles = ["All", "Traditional", "Royal", "Minimalist", "Destination", "Intimate"] as const

const styleColors: Record<string, string> = {
  Traditional: "bg-amber-100 text-amber-800",
  Royal: "bg-purple-100 text-purple-800",
  Minimalist: "bg-slate-100 text-slate-800",
  Destination: "bg-teal-100 text-teal-800",
  Intimate: "bg-rose-100 text-rose-800",
}

const styleGradients: Record<string, string> = {
  Traditional: "from-amber-600/70 to-orange-500/50",
  Royal: "from-purple-700/70 to-indigo-600/50",
  Minimalist: "from-slate-600/70 to-gray-500/50",
  Destination: "from-teal-600/70 to-cyan-500/50",
  Intimate: "from-rose-600/70 to-pink-500/50",
}

export default function StoriesPage() {
  const [filter, setFilter] = useState<string>("All")

  const filtered = filter === "All"
    ? weddingStories
    : weddingStories.filter((s) => s.style === filter)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 to-gold/5 px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <FadeIn>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">Wedding Stories</span>
              </div>
              <h1 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Real Wedding Stories
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Get inspired by real couples who planned their dream weddings through Kshuri.
                See which vendors they chose and how they brought their vision to life.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {styles.map((style) => (
                  <Button
                    key={style}
                    variant={filter === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(style)}
                    className="text-xs"
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="px-4 py-10 lg:py-14">
          <div className="mx-auto max-w-6xl">
            <StaggerContainer staggerDelay={0.1} className="flex flex-col gap-8">
              {filtered.map((story) => (
                <StaggerItem key={story.id}>
                  <Card className="overflow-hidden border-border/60">
                    <div className="grid lg:grid-cols-5">
                      {/* Left: gradient banner */}
                      <div className={cn(
                        "flex flex-col items-center justify-center gap-3 bg-gradient-to-br p-6 text-white lg:col-span-2",
                        styleGradients[story.style]
                      )}>
                        <Heart className="h-8 w-8 fill-white/30 text-white" />
                        <h2 className="text-center font-serif text-2xl font-bold">
                          {story.couple}
                        </h2>
                        <div className="flex items-center gap-1.5 text-sm text-white/80">
                          <MapPin className="h-3.5 w-3.5" /> {story.city}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                          {story.functions.map((fn) => (
                            <Badge key={fn} className="bg-white/20 text-white text-xs border-0">
                              {fn}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-white/70">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {story.guestCount} guests
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5" /> {story.budgetRange}
                          </span>
                        </div>
                        <Badge className={cn("mt-2 text-xs", styleColors[story.style])}>
                          {story.style}
                        </Badge>
                      </div>

                      {/* Right: details */}
                      <CardContent className="flex flex-col gap-4 p-6 lg:col-span-3">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {story.description}
                        </p>

                        <div className="flex gap-2 rounded-lg bg-secondary/40 p-3">
                          <Quote className="h-5 w-5 shrink-0 text-primary/40 mt-0.5" />
                          <p className="text-sm italic text-card-foreground">
                            &ldquo;{story.quote}&rdquo;
                          </p>
                        </div>

                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Vendors Used
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {story.vendorCredits.map((vc) => (
                              <Link key={vc.slug} href={`/vendors/${vc.slug}`}>
                                <motion.div
                                  className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs transition-colors hover:border-primary/30 hover:bg-primary/5"
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  <span className="font-medium text-card-foreground">{vc.name}</span>
                                  <span className="text-muted-foreground">• {vc.role}</span>
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {filtered.length === 0 && (
              <FadeIn className="py-20 text-center">
                <p className="text-muted-foreground">No stories found for this style.</p>
              </FadeIn>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
