import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { BottomNav } from "@/components/navigation"
import { StatsCard } from "@/components/stats-card"
import { cn } from "@/lib/utils"
import { ChevronRight, Trophy, Swords, Target, TrendingUp, TrendingDown, Medal, Award } from "lucide-react"
import type { Player, Match, TournamentPlacement, HeadToHead } from "@/lib/types"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getPlayerData(playerId: string) {
  const supabase = await createClient()

  // Get player
  const { data: player } = await supabase.from("players").select("*").eq("id", playerId).single()

  if (!player) return null

  // Get all matches for this player
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      player1:players!matches_player1_id_fkey(*),
      player2:players!matches_player2_id_fkey(*),
      winner:players!matches_winner_id_fkey(*)
    `)
    .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
    .order("played_at", { ascending: false })

  // Get tournament placements
  const { data: placements } = await supabase
    .from("tournament_placements")
    .select(`
      *,
      tournament:tournaments(*)
    `)
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })

  // Get all players for head-to-head
  const { data: allPlayers } = await supabase.from("players").select("*").neq("id", playerId)

  return {
    player: player as Player,
    matches: (matches || []) as Match[],
    placements: (placements || []) as TournamentPlacement[],
    allPlayers: (allPlayers || []) as Player[],
  }
}

function calculateHeadToHead(playerId: string, matches: Match[], allPlayers: Player[]): HeadToHead[] {
  const headToHead: HeadToHead[] = []

  allPlayers.forEach((opponent) => {
    const vsMatches = matches.filter(
      (m) =>
        (m.player1_id === playerId && m.player2_id === opponent.id) ||
        (m.player2_id === playerId && m.player1_id === opponent.id),
    )

    if (vsMatches.length > 0) {
      const wins = vsMatches.filter((m) => m.winner_id === playerId).length
      headToHead.push({
        opponent,
        wins,
        losses: vsMatches.length - wins,
        total: vsMatches.length,
      })
    }
  })

  return headToHead.sort((a, b) => b.total - a.total)
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params
  const data = await getPlayerData(id)

  if (!data) {
    notFound()
  }

  const { player, matches, placements, allPlayers } = data

  // Calculate stats
  const totalWins = matches.filter((m) => m.winner_id === player.id).length
  const totalLosses = matches.length - totalWins
  const winPercentage = matches.length > 0 ? (totalWins / matches.length) * 100 : 0
  const tournamentWins = placements.filter((p) => p.placement === 1).length

  const headToHead = calculateHeadToHead(player.id, matches, allPlayers)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-background px-4 pt-6 pb-6">
        <Link
          href="/players"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
          بازگشت
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{player.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{player.name}</h1>
            {tournamentWins > 0 && (
              <div className="flex items-center gap-1 text-gold mt-1">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">{tournamentWins} قهرمانی</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard title="برد" value={totalWins} icon={TrendingUp} variant="success" />
          <StatsCard title="باخت" value={totalLosses} icon={TrendingDown} variant="default" />
          <StatsCard title="کل مسابقات" value={matches.length} icon={Swords} variant="primary" />
          <StatsCard title="درصد برد" value={`${winPercentage.toFixed(0)}%`} icon={Target} variant="accent" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Tournament History */}
        {placements.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">تورنمنت‌ها</h2>
            </div>
            <div className="space-y-2">
              {placements.map((placement) => (
                <div key={placement.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{placement.tournament?.name}</h3>
                      <p className="text-xs text-muted-foreground">{placement.tournament?.game_type || "تورنمنت"}</p>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                        placement.placement === 1 && "bg-gold/20 text-gold",
                        placement.placement === 2 && "bg-silver/20 text-silver",
                        placement.placement === 3 && "bg-bronze/20 text-bronze",
                        placement.placement > 3 && "bg-secondary text-muted-foreground",
                      )}
                    >
                      {placement.placement === 1 && <Medal className="h-4 w-4" />}
                      {placement.placement === 2 && <Award className="h-4 w-4" />}#{placement.placement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Head to Head */}
        {headToHead.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Swords className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">رودررو</h2>
            </div>
            <div className="space-y-2">
              {headToHead.map((h2h) => {
                const isWinning = h2h.wins > h2h.losses
                const isLosing = h2h.losses > h2h.wins
                const ratio = h2h.total >= 5 ? (isLosing ? h2h.losses / h2h.wins : h2h.wins / h2h.losses) : 0
                const isNemesis = isLosing && ratio >= 2
                const isDominating = isWinning && ratio >= 2

                return (
                  <Link
                    key={h2h.opponent.id}
                    href={`/players/${h2h.opponent.id}`}
                    className="flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:border-muted-foreground/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <span className="font-medium text-foreground">{h2h.opponent.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{h2h.opponent.name}</h3>
                        {isNemesis && <span className="text-xs text-destructive">نمسیس!</span>}
                        {isDominating && <span className="text-xs text-success">تسلط کامل</span>}
                      </div>
                    </div>
                    <div className="text-left">
                      <span
                        className={cn(
                          "font-bold",
                          isWinning && "text-success",
                          isLosing && "text-destructive",
                          !isWinning && !isLosing && "text-foreground",
                        )}
                      >
                        {h2h.wins} - {h2h.losses}
                      </span>
                      <p className="text-xs text-muted-foreground">{h2h.total} بازی</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Recent Matches */}
        {matches.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">مسابقات اخیر</h2>
            <div className="space-y-2">
              {matches.slice(0, 10).map((match) => {
                const opponent = match.player1_id === player.id ? match.player2 : match.player1
                const won = match.winner_id === player.id

                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-8 rounded-full", won ? "bg-success" : "bg-destructive")} />
                      <div>
                        <p className="font-medium text-foreground">vs {opponent?.name}</p>
                        {match.notes && <p className="text-xs text-muted-foreground">{match.notes}</p>}
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={cn("text-sm font-medium", won ? "text-success" : "text-destructive")}>
                        {won ? "برد" : "باخت"}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(match.played_at).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {matches.length === 0 && placements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Swords className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>هنوز مسابقه‌ای ثبت نشده</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
