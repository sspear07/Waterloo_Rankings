# Waterloo Seltzer Rankings

A simple web app for employees to rank Waterloo seltzer flavors available in company fridges at Austin and Charlotte offices.

## Features

- Vote on this month's two flavors for your office
- Pick your favorite in a head-to-head matchup
- Rate each flavor from 1-5 stars
- View results and all-time leaderboard
- Filter leaderboard by office

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Hosting**: Vercel (recommended)

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sspear07/Waterloo_Rankings.git
cd Waterloo_Rankings
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
4. Go to **Settings > API** to get your project URL and anon key

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Monthly Administration

Each month, you need to set up the new flavor matchups:

### 1. Deactivate Previous Month's Matchups

In Supabase SQL Editor:

```sql
UPDATE monthly_matchups SET is_active = false WHERE month = '2026-01';
```

### 2. Get Flavor IDs

```sql
SELECT id, name FROM flavors ORDER BY name;
```

### 3. Create New Matchups

```sql
INSERT INTO monthly_matchups (office, flavor_1_id, flavor_2_id, month, is_active) VALUES
  ('austin', 'FLAVOR_1_UUID', 'FLAVOR_2_UUID', '2026-02', true),
  ('charlotte', 'FLAVOR_3_UUID', 'FLAVOR_4_UUID', '2026-02', true);
```

### 4. Add New Flavors (if seasonal)

```sql
INSERT INTO flavors (name, description, image_url) VALUES
  ('New Seasonal Flavor', 'A refreshing seasonal taste', '/images/new-flavor.png');
```

## Adding Flavor Images

1. Download images from [drinkwaterloo.com/flavors](https://www.drinkwaterloo.com/flavors/)
2. Save them to `public/images/` (e.g., `black-cherry.png`)
3. Update the flavor in Supabase:

```sql
UPDATE flavors SET image_url = '/images/black-cherry.png' WHERE name = 'Black Cherry';
```

## Deploying to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

Your site will be live at `your-project.vercel.app`

### Custom Domain (Later)

To add a custom domain:
1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your domain and follow DNS configuration instructions

## Project Structure

```
waterloo-rankings/
├── public/
│   └── images/           # Flavor images
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route pages (Home, Vote, Results)
│   ├── lib/              # Supabase client & utilities
│   ├── App.jsx           # Router setup
│   └── main.jsx          # Entry point
├── supabase/
│   └── schema.sql        # Database schema
└── package.json
```

## Future Enhancements

- [ ] ELO ranking system using head-to-head data
- [ ] Community insights integration
- [ ] Admin panel for easier monthly updates
- [ ] Historical monthly results archive
