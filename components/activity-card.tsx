"use client"

import { cn } from "@/lib/utils"
import type { Activity } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { faIR } from "date-fns/locale"

interface ActivityCardProps {
  activity: Activity
  isNew?: boolean
}

const colorStyles: Record<string, { border: string; bg: string; icon: string }> = {
  blue: { border: "border-r-blue-500", bg: "bg-blue-500/10", icon: "bg-blue-500/20 text-blue-400" },
  gold: { border: "border-r-yellow-500", bg: "bg-yellow-500/10", icon: "bg-yellow-500/20 text-yellow-400" },
  green: { border: "border-r-green-500", bg: "bg-green-500/10", icon: "bg-green-500/20 text-green-400" },
  red: { border: "border-r-red-500", bg: "bg-red-500/10", icon: "bg-red-500/20 text-red-400" },
  orange: { border: "border-r-orange-500", bg: "bg-orange-500/10", icon: "bg-orange-500/20 text-orange-400" },
  teal: { border: "border-r-teal-500", bg: "bg-teal-500/10", icon: "bg-teal-500/20 text-teal-400" },
  purple: { border: "border-r-purple-500", bg: "bg-purple-500/10", icon: "bg-purple-500/20 text-purple-400" },
}

export function ActivityCard({ activity, isNew }: ActivityCardProps) {
  const styles = colorStyles[activity.color] || colorStyles.blue
  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: faIR })

  // Check if activity is less than 5 minutes old for pulse animation
  const isRecent = Date.now() - new Date(activity.created_at).getTime() < 5 * 60 * 1000

  return (
    <div
      className={cn(
        "relative bg-card rounded-xl border border-border border-r-4 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
        styles.border,
        isRecent && "animate-pulse-subtle",
      )}
    >
      {isNew && (
        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
          جدید
        </span>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl", styles.icon)}>
          {activity.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground leading-snug">{activity.title}</p>
          {activity.description && <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>}

          {/* Extra info for specific types */}
          {activity.type === "tournament_complete" && activity.metadata.placements && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activity.metadata.placements.slice(0, 3).map((p, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    i === 0 && "bg-yellow-500/20 text-yellow-400",
                    i === 1 && "bg-gray-400/20 text-gray-400",
                    i === 2 && "bg-orange-700/20 text-orange-600",
                  )}
                >
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {p.player_name}
                </span>
              ))}
            </div>
          )}

          {/* Streak fires */}
          {activity.type === "winning_streak" && activity.metadata.streak_count && (
            <div className="mt-1">
              {Array.from({ length: Math.min(activity.metadata.streak_count, 5) }).map((_, i) => (
                <span key={i}>🔥</span>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
      </div>
    </div>
  )
}
