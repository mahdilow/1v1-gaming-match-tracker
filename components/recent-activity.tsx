import { cn } from "@/lib/utils"
import { Swords, Trophy } from "lucide-react"
import type { Match, Tournament } from "@/lib/types"

type Activity = { type: "match"; data: Match } | { type: "tournament"; data: Tournament }

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>هنوز فعالیتی ثبت نشده</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
          <div className={cn("p-2 rounded-lg", activity.type === "match" ? "bg-primary/20" : "bg-accent/20")}>
            {activity.type === "match" ? (
              <Swords className="h-4 w-4 text-primary" />
            ) : (
              <Trophy className="h-4 w-4 text-accent" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {activity.type === "match" ? (
              <>
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.data.player1?.name} vs {activity.data.player2?.name}
                </p>
                <p className="text-xs text-success">برنده: {activity.data.winner?.name}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground truncate">{activity.data.name}</p>
                <p className="text-xs text-muted-foreground">{activity.data.game_type || "تورنمنت"}</p>
              </>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {new Date(
              activity.type === "match" ? activity.data.played_at : activity.data.tournament_date,
            ).toLocaleDateString("fa-IR")}
          </span>
        </div>
      ))}
    </div>
  )
}
