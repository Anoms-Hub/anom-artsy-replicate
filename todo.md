# Sanctuary Platform TODO

## Completed
- [x] Fix Dashboard "Loading missions..." bug (superjson [Max Depth] issue with Drizzle ORM result objects — fixed with JSON.parse/stringify round-trip in db.ts)
- [x] Fix function naming errors in db.ts (getCoinHistory, updateProfile, getUserById)
- [x] Fix CSS @import placement warning in index.css
- [x] Build Games Hub page (/games) with all 5 games:
  - [x] AO Universe Trivia (10 questions, 5 coins per correct answer)
  - [x] Neon Memory (match AO icons, 25 coins for completion)
  - [x] AO Mood Matcher (character match, free)
  - [x] Snack Vault Rush (clicker, 10 coins per level)
  - [x] AO Terminal / Anom Tycoon (economic sim, 15-20 coins per milestone)
- [x] Add Games link to Dashboard navigation tabs
- [x] Add Games link from Home page Mini-Games feature card
- [x] Wire /games route in App.tsx

## Pending
- [ ] Connect Games coin earnings to actual tRPC backend (currently tracked locally per session)
- [ ] Add leaderboard for Trivia and Memory games
- [ ] **AO Universe Map** - Interactive visual map inside the Sanctuary dashboard showing the entire AO ecosystem: which projects connect to which domains, how data flows between them, the coin economy, mission hub, lounges, and all interconnected systems. Neon command center aesthetic. Members can see how everything connects. Could also serve as an onboarding guide for new members.
