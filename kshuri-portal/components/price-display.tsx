import { formatINR } from "@/lib/data"
import { cn } from "@/lib/utils"

interface PriceDisplayProps {
  min: number
  max: number
  unit: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PriceDisplay({
  min,
  max,
  unit,
  size = "md",
  className,
}: PriceDisplayProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span
        className={cn(
          "font-semibold text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-lg"
        )}
      >
        {formatINR(min)} - {formatINR(max)}
      </span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
  )
}
