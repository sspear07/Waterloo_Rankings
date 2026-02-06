# Supabase Monthly Administration Guide

This guide explains how to update the Waterloo Rankings database each month.

## Monthly Checklist

Each month when new flavors are stocked in the office fridges:

1. Deactivate the previous month's matchups
2. Create new matchups for the current month
3. (If needed) Add any new flavors to the database

---

## Step 1: Deactivate Previous Month's Matchups

In the Supabase SQL Editor, run:

```sql
UPDATE monthly_matchups
SET is_active = false
WHERE month = '2026-02';  -- Replace with the previous month
```

---

## Step 2: Get Flavor IDs

Look up the IDs for the flavors you need:

```sql
SELECT id, name FROM flavors ORDER BY name;
```

Copy the UUIDs for the flavors in each office this month.

---

## Step 3: Create New Matchups

Insert new matchups for both offices:

```sql
INSERT INTO monthly_matchups (office, flavor_1_id, flavor_2_id, month, is_active) VALUES
  ('austin', 'PASTE_FLAVOR_1_UUID', 'PASTE_FLAVOR_2_UUID', '2026-03', true),
  ('charlotte', 'PASTE_FLAVOR_3_UUID', 'PASTE_FLAVOR_4_UUID', '2026-03', true);
```

Replace:
- `PASTE_FLAVOR_X_UUID` with actual flavor UUIDs from Step 2
- `2026-03` with the current month in `YYYY-MM` format

---

## Adding New Flavors

If a new or seasonal flavor appears that isn't in the database:

### Option A: Via SQL Editor

```sql
INSERT INTO flavors (name, description, image_url) VALUES
  ('New Flavor Name', 'A description of the flavor', '/images/new-flavor.png');
```

### Option B: Via Table Editor

1. Go to **Table Editor** → **flavors**
2. Click **Insert row**
3. Fill in:
   - `name`: Flavor name (must match exactly for consistency)
   - `description`: Short description
   - `image_url`: Path to image (e.g., `/images/flavor-name.png`)

### Adding Flavor Images

1. Download the flavor image from [drinkwaterloo.com/flavors](https://www.drinkwaterloo.com/flavors/)
2. Save to `public/images/` in your project (use lowercase, hyphenated names)
3. Commit and push to GitHub (Vercel will auto-deploy)
4. Update the flavor's `image_url` in Supabase

---

## Quick Reference: Table Structure

### `flavors`
| Column | Description |
|--------|-------------|
| id | Auto-generated UUID |
| name | Flavor name |
| description | Short description |
| image_url | Path or URL to image |

### `monthly_matchups`
| Column | Description |
|--------|-------------|
| id | Auto-generated UUID |
| office | `austin` or `charlotte` |
| flavor_1_id | UUID from flavors table |
| flavor_2_id | UUID from flavors table |
| month | Format: `YYYY-MM` |
| is_active | `true` for current month |

### `votes`
| Column | Description |
|--------|-------------|
| id | Auto-generated UUID |
| matchup_id | UUID from monthly_matchups |
| office | `austin` or `charlotte` |
| favorite_flavor_id | Which flavor won head-to-head |
| flavor_1_rating | 1-5 stars |
| flavor_2_rating | 1-5 stars |
| voter_id | Browser-generated ID |

---

## Troubleshooting

**"No active matchup found"** error on the site:
- Check that a matchup exists for the current month with `is_active = true`
- Verify the `month` format is correct (`YYYY-MM`)

**Images not showing:**
- Check the `image_url` path is correct
- If using local images, ensure they're in `public/images/` and deployed

**Duplicate vote error:**
- Each `voter_id` can only vote once per matchup
- Users can clear browser localStorage to vote again (for testing)
