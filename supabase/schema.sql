-- Waterloo Seltzer Rankings Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Flavors table
CREATE TABLE flavors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly matchups table
CREATE TABLE monthly_matchups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office TEXT NOT NULL CHECK (office IN ('austin', 'charlotte')),
  flavor_1_id UUID NOT NULL REFERENCES flavors(id),
  flavor_2_id UUID NOT NULL REFERENCES flavors(id),
  month TEXT NOT NULL, -- Format: YYYY-MM
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(office, month)
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matchup_id UUID NOT NULL REFERENCES monthly_matchups(id),
  office TEXT NOT NULL CHECK (office IN ('austin', 'charlotte')),
  favorite_flavor_id UUID NOT NULL REFERENCES flavors(id),
  flavor_1_rating INTEGER NOT NULL CHECK (flavor_1_rating >= 1 AND flavor_1_rating <= 5),
  flavor_2_rating INTEGER NOT NULL CHECK (flavor_2_rating >= 1 AND flavor_2_rating <= 5),
  voter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(matchup_id, voter_id) -- Prevent duplicate votes
);

-- Indexes for performance
CREATE INDEX idx_matchups_office_month ON monthly_matchups(office, month);
CREATE INDEX idx_matchups_active ON monthly_matchups(is_active);
CREATE INDEX idx_votes_matchup ON votes(matchup_id);
CREATE INDEX idx_votes_voter ON votes(voter_id);

-- Row Level Security (RLS) Policies
ALTER TABLE flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_matchups ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Everyone can read flavors
CREATE POLICY "Flavors are viewable by everyone"
  ON flavors FOR SELECT
  USING (true);

-- Everyone can read matchups
CREATE POLICY "Matchups are viewable by everyone"
  ON monthly_matchups FOR SELECT
  USING (true);

-- Everyone can read votes (for leaderboard)
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

-- Everyone can insert votes (anonymous voting)
CREATE POLICY "Anyone can vote"
  ON votes FOR INSERT
  WITH CHECK (true);

-- ============================================
-- SEED DATA: All Waterloo Flavors
-- ============================================

INSERT INTO flavors (name, description, image_url) VALUES
  ('Banana Berry Bliss', 'A creamy, dreamy blend of ripe Banana and notes of sweet Berry', NULL),
  ('Melon Medley', 'Bright, refreshing, and impossible to resist', NULL),
  ('Lemon Italian Ice', 'A sun-drenched rush of lemony sour and sweet', NULL),
  ('Summer Berry', 'Refreshingly bright, flavorful and aromatic', NULL),
  ('Ruby Red Tangerine', 'An electrifying blend of tart and sweet', NULL),
  ('Guava Berry', 'A tropical blend in a class of its own', NULL),
  ('Raspberry Nectarine', 'A uniquely dazzling combination', NULL),
  ('Tropical Fruit', 'A sunshine-y medley of citrus and summer fruits', NULL),
  ('Blackberry Lemonade', 'A dynamic twist on classic country lemonade', NULL),
  ('Lemon-Lime', 'A nostalgic Lemon-Lime twist and a refreshing citrus finish', NULL),
  ('Strawberry', 'Playful, bright and refreshing', NULL),
  ('Peach', 'Delightfully ripe, authentic flavor', NULL),
  ('Cherry Limeade', 'The perfect mash-up of lime citrus and bright red cherries', NULL),
  ('Black Cherry', 'Refreshingly crisp and complex', NULL),
  ('Grape', 'Refreshingly crisp and full-bodied', NULL),
  ('Orange Vanilla', 'A playful combo of juicy Orange notes and Vanilla cream', NULL),
  ('Watermelon', 'Familiar and fantastic', NULL);

-- ============================================
-- EXAMPLE: Creating a monthly matchup
-- Uncomment and modify for your first month
-- ============================================

-- First, get the flavor IDs you want to use:
-- SELECT id, name FROM flavors;

-- Then create matchups (replace the UUIDs with actual flavor IDs):
-- INSERT INTO monthly_matchups (office, flavor_1_id, flavor_2_id, month, is_active) VALUES
--   ('austin', 'FLAVOR_1_UUID', 'FLAVOR_2_UUID', '2026-02', true),
--   ('charlotte', 'FLAVOR_3_UUID', 'FLAVOR_4_UUID', '2026-02', true);
