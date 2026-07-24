"use client"

// Re-export from the top-level hooks/ implementation so we keep a single
// source of truth (shadcn historically scaffolds this file inside
// components/ui/; we keep it for import-path compatibility but delegate).
export { useIsMobile } from "@/hooks/use-mobile"
