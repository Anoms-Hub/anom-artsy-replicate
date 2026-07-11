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

## New Tasks (Jul 11 2026)
- [x] Create reusable skill: drizzle-superjson-fix (documents the JSON.parse/stringify fix for Drizzle ORM + superjson)
- [x] Add tRPC procedure: games.earnCoins — persists mini-game coin earnings to DB (coinTransactions + coins balance)
- [x] Wire Games Hub coin callbacks to the new tRPC earnCoins mutation
- [x] Add live coin balance indicator to Dashboard nav bar (updates immediately on earn, flashes yellow with sparkle icon)
- [x] Build Recent Earnings activity feed on Dashboard (shows game + mission coin history, top 5 with link to full history)

## Quality Follow-ups (Jul 11 2026)
- [ ] Wrap earnCoins DB writes in a single atomic transaction (currently two separate writes — could desync on failure)
- [ ] Add error handling to Games Hub earn flow — show failure toast if mutation fails, don't count coins locally on error
- [ ] Block coin earning in Games Hub when user is not logged in (show login prompt instead)

## New Tasks (Jul 11 2026 — Session 2)
- [x] Create reusable skill: mini-game-coin-economy (documents the full process of integrating mini-games with a tRPC coin economy)
- [x] Games Hub: show login prompt for unauthenticated users instead of silently skipping coin persistence
- [x] Dashboard: add confetti animation when coin balance increases
- [x] Recent Earnings feed: add filter tabs (All / Games / Missions)

## AO Universe 4-Tier World System (Jul 11 2026 — Session 3)
- [x] Update architecture doc: lock in Universe → Worlds → Planets → Neighborhoods hierarchy
- [x] Build AO Universe Map page (/universe) — interactive neon district map of AO-City + multiverse world nodes
- [x] Add Universe Map link to Dashboard nav and Home page
- [x] Build Financial District page (/financial-district) — Security Bot X-9 guide, 4 lesson modules, quiz system, coin rewards
- [ ] Add financialLessons and savingsVault tables to drizzle schema (lesson progress is local state for now — backend persistence is next phase)
- [x] Build Creator Worlds Registry page (/worlds) — world creation form (5-step), world listing, travel mechanic skeleton
- [ ] Add worlds table to drizzle schema (name, creatorId, socialGoodPillar, description, tier, status) — UI skeleton done, backend next
- [x] Wire universe map world nodes to creator worlds registry (Creator Worlds node links to /worlds)
