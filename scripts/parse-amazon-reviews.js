/**
 * Parse Amazon Reviews from copy-pasted text file
 *
 * Extracts: rating, date, title, flavor, review text
 * Run with: node scripts/parse-amazon-reviews.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = path.join(__dirname, 'amazon-reviews.txt');
const outputPath = path.join(__dirname, '..', 'data', 'amazon-reviews.json');

const text = fs.readFileSync(inputPath, 'utf-8');
const lines = text.split(/\r?\n/);

const reviews = [];
let i = 0;

while (i < lines.length) {
  // Look for the rating line pattern: "X.0 out of 5 stars [Title]"
  const ratingMatch = lines[i].match(/^(\d(?:\.\d)?) out of 5 stars (.+)$/);

  if (ratingMatch) {
    const rating = parseFloat(ratingMatch[1]);
    const title = ratingMatch[2].trim();

    // Next line should be the date
    i++;
    const dateLine = lines[i] || '';
    const dateMatch = dateLine.match(/Reviewed in the United States on (.+)/);
    const date = dateMatch ? dateMatch[1].trim() : '';

    // Next line should be the flavor + "Verified Purchase"
    i++;
    const flavorLine = lines[i] || '';
    const flavorMatch = flavorLine.match(/Flavor Name:\s*(.+?)(?:Verified Purchase|$)/);
    const flavor = flavorMatch ? flavorMatch[1].trim() : '';

    // Collect review body lines until we hit a stopping pattern
    i++;
    const bodyLines = [];
    while (i < lines.length) {
      const line = lines[i];

      // Stop conditions: "Helpful", "Report", next review's rating, or helpful vote count
      if (/^\d+ people found this helpful$/.test(line) ||
          /^One person found this helpful$/.test(line) ||
          line === 'Helpful' ||
          line === 'Report' ||
          line === 'Customer image' ||
          /^\d(?:\.\d)? out of 5 stars .+$/.test(line)) {
        break;
      }

      bodyLines.push(line);
      i++;
    }

    const body = bodyLines.join('\n').trim();

    if (body) {
      reviews.push({ rating, date, title, flavor, body });
    }

    // Skip past "Helpful" and "Report" lines
    while (i < lines.length && (
      /^\d+ people found this helpful$/.test(lines[i]) ||
      /^One person found this helpful$/.test(lines[i]) ||
      lines[i] === 'Helpful' ||
      lines[i] === 'Report' ||
      lines[i] === 'Customer image' ||
      lines[i].trim() === ''
    )) {
      i++;
    }

    // Skip the reviewer name line (next review's author) - don't increment here,
    // the main loop will handle finding the next rating line
  } else {
    i++;
  }
}

// Ensure data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(reviews, null, 2));

console.log(`Parsed ${reviews.length} reviews`);
console.log(`Output saved to: ${outputPath}`);

// Summary
const flavorCounts = {};
const ratingCounts = {};
reviews.forEach((r) => {
  const f = r.flavor || 'Unknown';
  flavorCounts[f] = (flavorCounts[f] || 0) + 1;
  ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
});

console.log('\nBy flavor:');
Object.entries(flavorCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([flavor, count]) => console.log(`  ${flavor}: ${count}`));

console.log('\nBy rating:');
Object.entries(ratingCounts)
  .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
  .forEach(([rating, count]) => console.log(`  ${rating} stars: ${count}`));
