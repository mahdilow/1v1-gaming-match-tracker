import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  className?: string
  variant?: "default" | "primary" | "accent" | "success"
}

export function StatsCard({ title, value, icon: Icon, className, variant = "default" }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4 border border-border",
        variant === "default" && "bg-card",
        variant === "primary" && "bg-primary/10 border-primary/20",
        variant === "accent" && "bg-accent/10 border-accent/20",
        variant === "success" && "bg-success/10 border-success/20",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2.5 rounded-xl",
            variant === "default" && "bg-secondary",
            variant === "primary" && "bg-primary/20",
            variant === "accent" && "bg-accent/20",
            variant === "success" && "bg-success/20",
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              variant === "default" && "text-foreground",
              variant === "primary" && "text-primary",
              variant === "accent" && "text-accent",
              variant === "success" && "text-success",
            )}
          />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </div>
    </div>
  )
}
