"use client"

import { useRef } from "react"
import { Quote } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import type { Testimonial } from "@/lib/data"
import { cn } from "@/lib/utils"

interface TestimonialCardProps {
  testimonial: Testimonial
  className?: string
}

export function TestimonialCard({
  testimonial,
  className,
}: TestimonialCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.97 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 20 } }}
    >
      <Card
        className={cn(
          "border border-border/60 bg-card transition-all duration-300",
          "hover:border-primary/30 hover:shadow-[0_8px_28px_-4px_oklch(0.38_0.15_18_/_0.14)]",
          className
        )}
      >
        <CardContent className="flex flex-col gap-4 p-6">
          <motion.div
            initial={{ rotate: 0, color: "oklch(0.38 0.15 18 / 0.3)" }}
            whileHover={{ rotate: -10, scale: 1.15, color: "oklch(0.38 0.15 18 / 0.7)" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Quote className="h-8 w-8" />
          </motion.div>
          <p className="text-sm leading-relaxed text-card-foreground">
            {testimonial.comment}
          </p>
          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-card-foreground">
                {testimonial.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {testimonial.location} &middot; {testimonial.eventType}
              </span>
            </div>
            <StarRating rating={testimonial.rating} size="sm" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
