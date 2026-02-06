/**
 * Sentiment Analysis Script
 *
 * Reads Amazon reviews from data/amazon-reviews.json
 * Uses OpenAI API to analyze sentiment and identify notable reviews
 * Outputs results to data/sentiment-results.json
 *
 * Usage: node scripts/analyze-sentiment.js
 *
 * Requires environment variables:
 * - OPENAI_API_KEY
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Call OpenAI API
 */
async function callOpenAI(messages, jsonMode = false) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Analyze sentiment for a flavor's reviews
 */
async function analyzeFlavorSentiment(flavor, reviews) {
  if (reviews.length === 0) {
    return {
      sentiment_score: 0,
      sentiment_label: 'Neutral',
      summary: 'No reviews found for this flavor.',
      notable_indices: [],
    };
  }

  const reviewsText = reviews
    .map((r, i) => `[${i}] (${r.rating}/5 stars) "${r.title}" - ${r.body.slice(0, 500)}`)
    .join('\n\n');

  const prompt = `Analyze these Amazon reviews about "${flavor}" Waterloo sparkling water.

REVIEWS:
${reviewsText}

Respond with a JSON object containing:
{
  "sentiment_score": <number from -1.0 (very negative) to 1.0 (very positive)>,
  "sentiment_label": <"Positive" | "Neutral" | "Negative">,
  "summary": <1-2 short, casual sentences about what reviewers say it tastes like. Use their own words and comparisons where possible. Keep it blunt and conversational — no marketing speak or flowery language. Think Reddit comment, not product description.>,
  "notable_indices": <array of review indices [0-${reviews.length - 1}] that are particularly interesting, funny, or helpful - pick up to 5>
}

Focus on what reviewers say the flavor TASTES like — specific comparisons, creative descriptions, and honest reactions.
Pull out the most vivid and memorable taste descriptions. Ignore comments about shipping, packaging, or the Waterloo brand in general.
If reviews are mixed, mention both sides (e.g. "some love it, others say it tastes like X").
For notable_indices, look for reviews that are entertaining, insightful, or particularly well-written.`;

  const result = await callOpenAI(
    [{ role: 'user', content: prompt }],
    true
  );

  const parsed = JSON.parse(result);

  return {
    sentiment_score: parsed.sentiment_score,
    sentiment_label: parsed.sentiment_label,
    summary: parsed.summary,
    notable_indices: (parsed.notable_indices || [])
      .filter(i => i >= 0 && i < reviews.length),
  };
}

/**
 * Main function
 */
async function main() {
  console.log('=== Sentiment Analysis ===\n');

  // Read Amazon reviews
  const reviewsPath = path.join(__dirname, '..', 'data', 'amazon-reviews.json');

  if (!fs.existsSync(reviewsPath)) {
    console.error('Error: amazon-reviews.json not found. Run parse-amazon-reviews.js first.');
    process.exit(1);
  }

  const allReviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));
  console.log(`Loaded ${allReviews.length} reviews.\n`);

  // Group reviews by flavor
  const reviewsByFlavor = {};
  for (const review of allReviews) {
    const flavor = review.flavor || 'Unknown';
    if (!reviewsByFlavor[flavor]) {
      reviewsByFlavor[flavor] = [];
    }
    reviewsByFlavor[flavor].push(review);
  }

  // Analyze each flavor
  const sentiments = {};
  const notableReviews = [];

  for (const [flavor, reviews] of Object.entries(reviewsByFlavor)) {
    console.log(`Analyzing "${flavor}" (${reviews.length} reviews)...`);

    // Compute average star rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    try {
      const analysis = await analyzeFlavorSentiment(flavor, reviews);

      sentiments[flavor] = {
        sentiment_score: analysis.sentiment_score,
        sentiment_label: analysis.sentiment_label,
        summary: analysis.summary,
        avg_rating: Math.round(avgRating * 100) / 100,
        review_count: reviews.length,
      };

      // Collect notable reviews with full data
      for (const idx of analysis.notable_indices) {
        notableReviews.push({
          ...reviews[idx],
          flavor,
        });
      }

      console.log(`  Score: ${analysis.sentiment_score.toFixed(2)} (${analysis.sentiment_label}), Avg rating: ${avgRating.toFixed(1)}/5`);

      // Rate limiting - wait between API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`  Error analyzing ${flavor}: ${err.message}`);
      sentiments[flavor] = {
        sentiment_score: 0,
        sentiment_label: 'Neutral',
        summary: 'Analysis failed.',
        avg_rating: Math.round(avgRating * 100) / 100,
        review_count: reviews.length,
      };
    }
  }

  // Write results
  const outputPath = path.join(__dirname, '..', 'data', 'sentiment-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    sentiments,
    notable_reviews: notableReviews,
    analyzed_at: new Date().toISOString(),
  }, null, 2));

  // Summary
  console.log('\n=== Summary ===');

  const sortedFlavors = Object.entries(sentiments)
    .sort((a, b) => b[1].sentiment_score - a[1].sentiment_score);

  console.log('\nRankings by sentiment:');
  sortedFlavors.forEach(([flavor, data], i) => {
    const bar = '█'.repeat(Math.round((data.sentiment_score + 1) * 5));
    console.log(`${i + 1}. ${flavor}: ${data.sentiment_score.toFixed(2)} ${bar} (${data.avg_rating}/5 stars, ${data.review_count} reviews)`);
  });

  console.log(`\nNotable reviews found: ${notableReviews.length}`);
  console.log(`Output saved to: ${outputPath}`);
}

main().catch(console.error);
