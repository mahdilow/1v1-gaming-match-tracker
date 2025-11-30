-- Enable Realtime on the activities table
-- This allows all connected clients to receive instant notifications

-- First, ensure the activities table exists and has the replica identity set
ALTER TABLE activities REPLICA IDENTITY FULL;

-- Add the activities table to the supabase_realtime publication
-- This is required for Realtime to work
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- Also enable realtime for matches and tournaments for future use
ALTER TABLE matches REPLICA IDENTITY FULL;
ALTER TABLE tournaments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
