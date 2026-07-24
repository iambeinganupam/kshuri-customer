"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGroomingCategories } from "@/lib/content/categories"

// Cities: backend doesn't expose a /cities endpoint yet. Hardcoded for now —
// will move to a /meta/cities endpoint in a future spec.
const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Udaipur'] as const
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
}

export function SearchBar({ className }: SearchBarProps) {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [category, setCategory] = useState("")
  const [focused, setFocused] = useState(false)
  const { categories } = useGroomingCategories()
  const cities = CITIES

  function handleSearch() {
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (category) params.set("category", category)
    router.push(`/vendors?${params.toString()}`)
  }

  return (
    <motion.div
      className={cn(
        "flex flex-col gap-2 rounded-xl border bg-card p-2 shadow-lg sm:flex-row sm:items-stretch transition-all duration-300",
        focused
          ? "border-primary/40 shadow-xl shadow-primary/10 ring-2 ring-primary/20"
          : "border-border/60",
        className
      )}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Select value={city} onValueChange={setCity}>
        <SelectTrigger className="h-11 w-full sm:w-44 border-border/40 bg-background">
          <SelectValue placeholder="Select City" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="h-11 w-full sm:w-52 border-border/40 bg-background">
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.slug} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={handleSearch}
        className="h-11 w-full sm:flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
      >
        <Search className="h-4 w-4" />
        Find Vendors
      </Button>
    </motion.div>
  )
}
