import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/navigation"
import { StatsCard } from "@/components/stats-card"
import { ActionCard } from "@/components/action-card"
import { RecentActivity } from "@/components/recent-activity"
import { PlayerCard } from "@/components/player-card"
import { Users, Swords, Trophy, Medal, Target, Award } from "lucide-react"
import type { Player, Match, Tournament, PlayerStats } from "@/lib/types"

async function getDashboardData() {
  const supabase = await createClient()

  // Get all players
  const { data: players } = await supabase.from("players").select("*").order("created_at", { ascending: false })

  // Get all matches with player details
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      player1:players!matches_player1_id_fkey(*),
      player2:players!matches_player2_id_fkey(*),
      winner:players!matches_winner_id_fkey(*)
    `)
    .order("played_at", { ascending: false })
    .limit(5)

  // Get tournaments
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("tournament_date", { ascending: false })
    .limit(5)

  // Get tournament placements for counting wins
  const { data: placements } = await supabase.from("tournament_placements").select("*")

  return {
    players: (players || []) as Player[],
    matches: (matches || []) as Match[],
    tournaments: (tournaments || []) as Tournament[],
    placements: placements || [],
  }
}

function calculatePlayerStats(
  players: Player[],
  matches: Match[],
  placements: { player_id: string; placement: number }[],
): PlayerStats[] {
  return players.map((player) => {
    const playerMatches = matches.filter((m) => m.player1_id === player.id || m.player2_id === player.id)
    const wins = matches.filter((m) => m.winner_id === player.id).length
    const losses = playerMatches.length - wins
    const tournamentWins = placements.filter((p) => p.player_id === player.id && p.placement === 1).length
    const tournamentParticipations = placements.filter((p) => p.player_id === player.id).length

    return {
      player,
      totalWins: wins,
      totalLosses: losses,
      totalMatches: playerMatches.length,
      winPercentage: playerMatches.length > 0 ? (wins / playerMatches.length) * 100 : 0,
      tournamentWins,
      tournamentParticipations,
    }
  })
}

export default async function HomePage() {
  const { players, matches, tournaments, placements } = await getDashboardData()

  // Get all matches for stats calculation
  const supabase = await createClient()
  const { data: allMatches } = await supabase.from("matches").select("*")

  const playerStats = calculatePlayerStats(players, allMatches || [], placements)
  const topPlayers = [...playerStats]
    .sort((a, b) => b.totalWins - a.totalWins || b.winPercentage - a.winPercentage)
    .slice(0, 3)

  const totalMatches = allMatches?.length || 0

  // Combine recent activities
  const activities = [
    ...matches.map((m) => ({ type: "match" as const, data: m, date: new Date(m.played_at) })),
    ...tournaments.map((t) => ({ type: "tournament" as const, data: t, date: new Date(t.tournament_date) })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)
    .map(({ type, data }) => ({ type, data }))

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-background px-4 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-primary/20">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">بلک لیست</h1>
            <p className="text-sm text-muted-foreground">ردیاب مسابقات گیمینگ</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatsCard title="بازیکنان" value={players.length} icon={Users} variant="primary" />
          <StatsCard title="مسابقات" value={totalMatches} icon={Swords} variant="accent" />
          <StatsCard title="تورنمنت‌ها" value={tournaments.length} icon={Trophy} variant="success" />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">دسترسی سریع</h2>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard href="/match" title="ثبت مسابقه" description="ثبت نتیجه جدید" icon={Swords} variant="primary" />
            <ActionCard
              href="/tournament"
              title="تورنمنت جدید"
              description="ثبت تورنمنت"
              icon={Trophy}
              variant="accent"
            />
            <ActionCard href="/players" title="بازیکنان" description="مدیریت بازیکنان" icon={Users} />
            <ActionCard href="/leaderboard" title="جدول امتیازات" description="رتبه‌بندی کلی" icon={Medal} />
          </div>
        </section>

        {/* Top Players */}
        {topPlayers.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-semibold text-foreground">برترین‌ها</h2>
            </div>
            <div className="space-y-2">
              {topPlayers.map((stats, index) => (
                <PlayerCard key={stats.player.id} stats={stats} rank={index + 1} showRank />
              ))}
            </div>
          </section>
        )}

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">فعالیت‌های اخیر</h2>
          <RecentActivity activities={activities} />
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
