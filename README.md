# Waterloo Seltzer Rankings

A web app for employees to rank Waterloo seltzer flavors available in company fridges at Austin and Charlotte offices.

**Live site:** [waterloorankings.vercel.app](https://waterloorankings.vercel.app/)

---

## Background

My employer stocks Waterloo sparkling water in our office fridges, but each month they rotate in just two flavors per office. My coworkers and I would debate which flavors were best so I decided to settle the debate with this site. Now we have an official leaderboard, and the data can speak for itself.

---

## Features

- Vote on this month's two flavors for your office
- Pick your favorite in a head-to-head matchup
- Rate each flavor from 1-5 stars
- View results and all-time leaderboard
- Filter leaderboard by office (Austin vs Charlotte)

---

## How I Built It

### Tech Stack

| Layer | Technology | Why I Chose It |
|-------|------------|----------------|
| **Frontend** | React 18 + Vite | Fast development, hot reload, modern tooling |
| **Styling** | Tailwind CSS | Rapid UI development without writing custom CSS |
| **Database** | Supabase (PostgreSQL) | Free tier, real-time capabilities, easy auth if needed later |
| **Charts** | Recharts | Simple React-based charting for the leaderboard |
| **Hosting** | Vercel | Seamless GitHub integration, automatic deployments |
| **Analytics** | Vercel Analytics | Track engagement without complex setup |

### Database Design

I designed three tables to handle the voting system:

- **`flavors`** - Master list of all Waterloo flavors with names, descriptions, and images
- **`monthly_matchups`** - Tracks which two flavors are available each month per office
- **`votes`** - Stores individual votes with ratings and head-to-head picks

This structure allows for easy monthly updates and supports future features like ELO rankings based on head-to-head data.

### Vote Limiting Without User Accounts

I wanted voting to be frictionless (no login required), but also prevent ballot stuffing. My solution:

1. Generate a unique voter ID on first visit and store it in localStorage
2. Check against the database before showing the vote form
3. If the voter ID already voted this month, redirect to results

This keeps honest people honest while avoiding the friction of user authentication.

### Monthly Administration

Each month I update the database with new flavor matchups via SQL queries. I documented the process in [`supabase/README.md`](./supabase/README.md) so it takes just a few minutes.

---

## Project Structure

```
waterloo-rankings/
├── public/
│   └── images/           # Flavor and office images
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── FlavorCard    # Displays flavor with image and selection state
│   │   ├── StarRating    # Interactive 1-5 star input
│   │   ├── LeaderboardChart  # Horizontal bar chart with Recharts
│   │   └── ...
│   ├── pages/
│   │   ├── Home          # Office selection
│   │   ├── Vote          # Two-step voting flow
│   │   └── Results       # Monthly results + all-time leaderboard
│   └── lib/
│       ├── supabase.js   # Database client
│       └── voteStorage.js # Voter ID management
├── supabase/
│   ├── schema.sql        # Database schema and seed data
│   └── README.md         # Monthly administration guide
└── package.json
```

---

## Future Enhancements

- [ ] ELO ranking system using head-to-head matchup data
- [ ] Historical view of past monthly results
- [ ] Public sentiment ranking of each flavor based on internet data
