export interface Player {
  id: string
  name: string
  created_at: string
}

export interface Match {
  id: string
  player1_id: string
  player2_id: string
  winner_id: string
  notes: string | null
  played_at: string
  created_at: string
  player1?: Player
  player2?: Player
  winner?: Player
}

export interface Tournament {
  id: string
  name: string
  game_type: string | null
  tournament_date: string
  created_at: string
  placements?: TournamentPlacement[]
}

export interface TournamentPlacement {
  id: string
  tournament_id: string
  player_id: string
  placement: number
  created_at: string
  player?: Player
  tournament?: Tournament
}

export interface PlayerStats {
  player: Player
  totalWins: number
  totalLosses: number
  totalMatches: number
  winPercentage: number
  tournamentWins: number
  tournamentParticipations: number
}

export interface HeadToHead {
  opponent: Player
  wins: number
  losses: number
  total: number
}
