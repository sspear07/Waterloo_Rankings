-- Public Sentiment Feature - Database Schema
-- Run this in Supabase SQL Editor to add sentiment tables

-- Flavor sentiment scores and summaries
CREATE TABLE flavor_sentiment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flavor_id UUID NOT NULL REFERENCES flavors(id) ON DELETE CASCADE,
  sentiment_score FLOAT NOT NULL CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
  sentiment_label TEXT NOT NULL CHECK (sentiment_label IN ('Positive', 'Neutral', 'Negative')),
  summary TEXT,
  comment_count INTEGER DEFAULT 0,
  avg_rating FLOAT CHECK (avg_rating >= 1.0 AND avg_rating <= 5.0),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(flavor_id)
);

-- Notable Amazon reviews for each flavor
CREATE TABLE flavor_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flavor_id UUID NOT NULL REFERENCES flavors(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  review_title TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_date TEXT,
  is_notable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sentiment_flavor ON flavor_sentiment(flavor_id);
CREATE INDEX idx_sentiment_score ON flavor_sentiment(sentiment_score DESC);
CREATE INDEX idx_comments_flavor ON flavor_comments(flavor_id);
CREATE INDEX idx_comments_notable ON flavor_comments(is_notable) WHERE is_notable = true;
CREATE INDEX idx_comments_rating ON flavor_comments(rating DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE flavor_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavor_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read sentiment data
CREATE POLICY "Sentiment is viewable by everyone"
  ON flavor_sentiment FOR SELECT
  USING (true);

-- Everyone can read comments
CREATE POLICY "Comments are viewable by everyone"
  ON flavor_comments FOR SELECT
  USING (true);

-- Only authenticated service role can insert/update (for scripts)
-- Note: Scripts will use the service role key, not anon key
