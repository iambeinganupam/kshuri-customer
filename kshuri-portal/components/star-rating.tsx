import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  size?: "xs" | "sm" | "md" | "lg"
  showValue?: boolean
  className?: string
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function StarRating({
  rating,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating)
    const half = !filled && i < rating
    return { filled, half }
  })

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {stars.map((star, i) => (
          <Star
            key={i}
            className={cn(
              sizeMap[size],
              star.filled
                ? "fill-gold text-gold"
                : star.half
                  ? "fill-gold/50 text-gold"
                  : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
