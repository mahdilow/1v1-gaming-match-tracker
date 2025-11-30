-- Activities table to store all notifications and feed items
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'match_result', 'tournament_complete', 'rank_change', 'winning_streak', 'rivalry_update', 'new_player', 'milestone'
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL, -- emoji or icon name
  color TEXT NOT NULL, -- 'blue', 'gold', 'green', 'red', 'orange', 'teal', 'purple'
  metadata JSONB DEFAULT '{}', -- extra data like player_ids, streak_count, etc.
  related_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  related_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  related_tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient polling
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_related_player ON activities(related_player_id);

-- RLS Policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for activities" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Public insert access for activities" ON activities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete access for activities" ON activities
  FOR DELETE USING (true);
