"use client"

import { useRef, useEffect, ReactNode } from "react"
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  type Variant,
  type Transition,
} from "framer-motion"
import { cn } from "@/lib/utils"

/* ───────────────────── FadeIn ───────────────────── */

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
  once?: boolean
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = 24,
  once = true,
}: FadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: "-60px" })

  const directionMap: Record<string, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...directionMap[direction] }
      }
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ───────────────── StaggerContainer ─────────────── */

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ───────────────── StaggerItem ─────────────── */

interface StaggerItemProps {
  children: ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right"
}

export function StaggerItem({
  children,
  className,
  direction = "up",
}: StaggerItemProps) {
  const yMap = { up: 20, down: -20, left: 0, right: 0 }
  const xMap = { up: 0, down: 0, left: 20, right: -20 }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: yMap[direction], x: xMap[direction] },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ───────────────── AnimatedCounter ─────────────── */

interface AnimatedCounterProps {
  target: number
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
}

export function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  className,
  duration = 2,
}: AnimatedCounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => {
    if (target >= 1000) {
      return `${Math.round(v).toLocaleString("en-IN")}`
    }
    return `${Math.round(v)}`
  })

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, {
        duration,
        ease: [0.21, 0.47, 0.32, 0.98],
      })
      return controls.stop
    }
  }, [isInView, target, duration, count])

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

/* ───────────────── ScaleOnHover ─────────────── */

interface ScaleOnHoverProps {
  children: ReactNode
  className?: string
  scale?: number
}

export function ScaleOnHover({
  children,
  className,
  scale = 1.03,
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ───────────────── SlideTransition (for booking steps) ─────────────── */

interface SlideTransitionProps {
  children: ReactNode
  direction?: number
  className?: string
}

export function SlideTransition({
  children,
  direction = 1,
  className,
}: SlideTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction * 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -40 }}
      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ───────────────── GlowOrb ─────────────── */

interface GlowOrbProps {
  className?: string
  color?: string
  size?: number
  delay?: number
  duration?: number
}

export function GlowOrb({
  className,
  delay = 0,
  duration = 7,
}: GlowOrbProps) {
  return (
    <motion.div
      className={cn("pointer-events-none absolute rounded-full blur-[100px]", className)}
      animate={{
        scale: [1, 1.15, 0.95, 1],
        opacity: [0.35, 0.55, 0.3, 0.35],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

/* ───────────────── FloatingBadge ─────────────── */

interface FloatingBadgeProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FloatingBadge({ children, className, delay = 0 }: FloatingBadgeProps) {
  return (
    <motion.span
      className={cn("inline-flex items-center gap-2", className)}
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.span>
  )
}

/* ───────────────── RevealText (word by word) ─────────────── */

interface RevealTextProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
}

export function RevealText({ text, className, delay = 0, stagger = 0.04 }: RevealTextProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const words = text.split(" ")

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap gap-x-[0.3em]", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{
            duration: 0.45,
            delay: delay + i * stagger,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

/* ───────────────── PremiumCard (3D tilt on hover) ─────────────── */

interface PremiumCardProps {
  children: ReactNode
  className?: string
}

export function PremiumCard({ children, className }: PremiumCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotateX = ((y - cy) / cy) * -6
    const rotateY = ((x - cx) / cx) * 6
    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  function handleMouseLeave() {
    if (!ref.current) return
    ref.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("transition-transform duration-200 ease-out will-change-transform", className)}
    >
      {children}
    </div>
  )
}
