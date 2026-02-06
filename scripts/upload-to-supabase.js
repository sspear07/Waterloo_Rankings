/**
 * Supabase Upload Script
 *
 * Reads sentiment results from data/sentiment-results.json
 * Uploads to Supabase flavor_sentiment and flavor_comments tables
 *
 * Usage: node scripts/upload-to-supabase.js
 *
 * Requires environment variables:
 * - VITE_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Initialize Supabase client with service role key
 */
function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, serviceKey);
}

/**
 * Get flavor ID by name
 */
async function getFlavorId(supabase, flavorName) {
  const { data, error } = await supabase
    .from('flavors')
    .select('id')
    .eq('name', flavorName)
    .single();

  if (error) {
    console.warn(`  Could not find flavor "${flavorName}": ${error.message}`);
    return null;
  }

  return data.id;
}

/**
 * Upsert sentiment data for a flavor
 */
async function upsertSentiment(supabase, flavorId, sentimentData) {
  const { error } = await supabase
    .from('flavor_sentiment')
    .upsert({
      flavor_id: flavorId,
      sentiment_score: sentimentData.sentiment_score,
      sentiment_label: sentimentData.sentiment_label,
      summary: sentimentData.summary,
      comment_count: sentimentData.review_count,
      avg_rating: sentimentData.avg_rating,
      last_updated: new Date().toISOString(),
    }, {
      onConflict: 'flavor_id',
    });

  if (error) {
    throw new Error(`Failed to upsert sentiment: ${error.message}`);
  }
}

/**
 * Insert notable reviews for a flavor
 */
async function insertComments(supabase, flavorId, reviews) {
  // First, delete existing comments for this flavor
  await supabase
    .from('flavor_comments')
    .delete()
    .eq('flavor_id', flavorId);

  // Insert new reviews
  const commentRows = reviews.map(r => ({
    flavor_id: flavorId,
    comment_text: r.body.slice(0, 2000),
    review_title: r.title,
    rating: r.rating,
    review_date: r.date,
    is_notable: true,
  }));

  if (commentRows.length > 0) {
    const { error } = await supabase
      .from('flavor_comments')
      .insert(commentRows);

    if (error) {
      throw new Error(`Failed to insert reviews: ${error.message}`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('=== Upload to Supabase ===\n');

  // Read sentiment results
  const resultsPath = path.join(__dirname, '..', 'data', 'sentiment-results.json');

  if (!fs.existsSync(resultsPath)) {
    console.error('Error: sentiment-results.json not found. Run analyze-sentiment.js first.');
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  const { sentiments, notable_reviews } = results;

  // Initialize Supabase
  const supabase = getSupabaseClient();
  console.log('Connected to Supabase.\n');

  // Upload sentiment for each flavor
  console.log('Uploading sentiment data...');

  for (const [flavorName, sentimentData] of Object.entries(sentiments)) {
    const flavorId = await getFlavorId(supabase, flavorName);

    if (!flavorId) {
      continue;
    }

    try {
      await upsertSentiment(supabase, flavorId, sentimentData);

      // Get notable reviews for this flavor
      const flavorReviews = notable_reviews.filter(r => r.flavor === flavorName);
      await insertComments(supabase, flavorId, flavorReviews);

      console.log(`  ✓ ${flavorName}: ${sentimentData.sentiment_label} (${flavorReviews.length} notable reviews)`);
    } catch (err) {
      console.error(`  ✗ ${flavorName}: ${err.message}`);
    }
  }

  console.log('\n=== Upload Complete ===');

  // Verify data
  const { count: sentimentCount } = await supabase
    .from('flavor_sentiment')
    .select('*', { count: 'exact', head: true });

  const { count: commentCount } = await supabase
    .from('flavor_comments')
    .select('*', { count: 'exact', head: true });

  console.log(`\nVerification:`);
  console.log(`  Sentiment records: ${sentimentCount}`);
  console.log(`  Notable reviews: ${commentCount}`);
}

main().catch(console.error);
