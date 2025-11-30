-- Black List Gaming Match Tracker Database Schema

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table for 1v1 match tracking
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  notes TEXT,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_players CHECK (player1_id != player2_id),
  CONSTRAINT valid_winner CHECK (winner_id = player1_id OR winner_id = player2_id)
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game_type TEXT,
  tournament_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournament placements table
CREATE TABLE IF NOT EXISTS tournament_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  placement INTEGER NOT NULL CHECK (placement > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, player_id),
  UNIQUE(tournament_id, placement)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_winner ON matches(winner_id);
CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_placements_tournament ON tournament_placements(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_placements_player ON tournament_placements(player_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(tournament_date DESC);

-- Enable RLS (no authentication needed for this app - it's a local tracking tool)
-- Using permissive policies for public access
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_placements ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required)
CREATE POLICY "Public read access for players" ON players FOR SELECT USING (true);
CREATE POLICY "Public insert access for players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for players" ON players FOR UPDATE USING (true);
CREATE POLICY "Public delete access for players" ON players FOR DELETE USING (true);

CREATE POLICY "Public read access for matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public insert access for matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Public delete access for matches" ON matches FOR DELETE USING (true);

CREATE POLICY "Public read access for tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public insert access for tournaments" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for tournaments" ON tournaments FOR UPDATE USING (true);
CREATE POLICY "Public delete access for tournaments" ON tournaments FOR DELETE USING (true);

CREATE POLICY "Public read access for tournament_placements" ON tournament_placements FOR SELECT USING (true);
CREATE POLICY "Public insert access for tournament_placements" ON tournament_placements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for tournament_placements" ON tournament_placements FOR UPDATE USING (true);
CREATE POLICY "Public delete access for tournament_placements" ON tournament_placements FOR DELETE USING (true);
