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

## Member Profile / Being Page (Jul 11 2026 — Session 4)
- [x] Extend drizzle schema: profileAwards, profileLikes, profileVisitors tables + extended profiles table (beingType, beingName, backgroundId, socialGoodScore, privilegeTier, username)
- [x] Run pnpm db:push to apply schema changes (all 3 new tables live in DB)
- [x] Add tRPC procedures: getByUsername, updateBeing, checkUsername, getAwards, grantAward, likeProfile, getLikeStatus, getLikeCount, getRecentVisitors, getMyFullProfile
- [x] Build Being Selection modal (4 archetypes: Clifford / Tater / X-9 / AO Symbol) — 3-step flow with username + bio setup
- [x] Build Member Profile page (/profile/:username) — being display, SGS bar, awards gallery, like button, visitor log (owner-only)
- [x] Upgrade Dashboard Profile tab — shows being info, SGS, privilege tier, links to public profile
- [x] Wire BeingSelectionModal into Dashboard — auto-shows on first login if no being chosen

## Dead Links & Missing Pages (Jul 11 2026 — Session 5)
- [x] Fix "Complete Mission" buttons — MissionDetailModal with 3-step flow (detail → confirm → success + coin animation)
- [x] Add Settings page (/settings) — profile bio/username editing, being change shortcut, account info display
- [x] Build Anom's Corner page (/anoms-corner) — Digital Home section with YouTube, 6 emails, Firefox themes, Gmail/Calendar widgets
- [x] Add Anom's Corner link to Dashboard hamburger menu
- [x] Add Settings link to Dashboard user menu (hamburger/profile dropdown)
- [x] Register /anoms-corner, /work, /services, /settings routes in App.tsx

## Content Migration from anomartsy.xyz (Jul 11 2026 — Session 5)
- [x] Build Anom's Corner page (/anoms-corner) — personal hub: Tater Nugget, Pixel & Dot, AO Universe lore, creator notes, Digital Home
- [ ] Build Custom Services page (/services) — digital commissions with PayPal payment links (shell exists at /services, needs real content)
- [ ] Build Work/Gallery page (/work) — art portfolio showcase with the 6 lanes (shell exists at /work, needs real content)
- [ ] Build Merch page (/merch) — Spreadshop embed/link, buyer pays own shipping, Printful-fulfilled
- [x] Add Settings page (/settings) — edit profile bio/username, change being, account info
- [x] Fix "Complete Mission" buttons — MissionDetailModal with confirm + success flow
- [x] Wire all new pages into App.tsx routes and Dashboard/Home nav
- [ ] Update Home page nav to match full site structure (Work, Custom, Merch, Anom's Corner)

## Session Jul 11 2026 — Nav, Settings Polish, Skill
- [x] Update Home page nav to include Settings and Anom's Corner links (also added Universe, Work, Services)
- [x] Settings page Save Changes button: loading spinner, green Saved! confirmation state, success toast with description
- [x] Create reusable skill: sanctuary-feature-workflow (4 patterns: modal confirm flow, settings page, IP protection, route+nav wiring)

## IP Protection (Jul 11 2026)
- [x] Build Terms of Service page (/terms) — copyright notice, IP ownership, DMCA contact, prohibited uses, coin economy disclaimer
- [x] Add CopyrightFooter component to Home and Anom's Corner; updated Home footer LEGAL links to /terms and DMCA email
- [x] Register /terms route in App.tsx

## Mission Action URL Flow (Jul 11 2026)
- [x] Add actionUrl column to missions table in schema, migrate DB
- [x] Seed existing missions with their actionUrl values (Welcome→/lounge, Perimeter→/universe-map, Resources→/universe-map, etc.)
- [x] Update MissionDetailModal: "Go Complete This Mission" button navigates to actionUrl?completeMission=ID
- [x] Add useMissionAutoComplete hook — reads ?completeMission=ID from URL, auto-fires mutation, shows success toast, strips param
- [x] Wire hook into Dashboard, Settings, UniverseMap, FinancialDistrict, AnomsCorner

## Mission Redesign + Universe Home (Jul 11 2026)
- [ ] Replace all 10 current missions with a proper onboarding feature-tour sequence (profile customization first, then platform exploration)
- [ ] Remove Lounge as a mission destination — Lounges are a Division, not an onboarding task
- [ ] Update all mission actionUrl values to match the new sequence
- [ ] Redesign post-login home as the AO Universe neon visual map (interactive districts)
- [ ] Wire universe map districts to their destination pages

## Identity Customization System
- [x] Add theme selector to Settings page — free basic themes: Dark (default), Light, Neon Blue, Neon Purple
- [ ] Persist theme selection through profile mutation into profiles.backgroundId and hydrate on load
- [ ] Apply selected theme globally via ThemeProvider / CSS variables (CSS variable switching not yet wired)
- [x] Build Coin Shop page (/shop) — cosmetics purchasable with Anom Coins, filter by type and tier
- [ ] Build Pack Shop Stripe payment flow — real-money pack purchases (Stripe integration pending)
- [x] Define pack tiers: Coin, Starter Pack, Creator Pack, Elite Pack
- [ ] Achievement unlock system — milestone rewards that cannot be purchased, only earned

## Admin Creator Shop
- [x] Build admin shop item management UI (/admin/shop) — create/edit/toggle/delete items with metadata
- [ ] Add real file upload to admin shop (file picker + S3 storage upload, not just URL entry)
- [x] Add shopItems and userPurchases tables to drizzle schema
- [x] Add admin-only tRPC procedures: createShopItem, updateShopItem, toggleShopItem, deleteShopItem
- [x] Add member-facing tRPC procedures: getItems, getMyPurchases, purchaseWithCoins
- [ ] Connect Stripe for real-money pack purchases (Stripe integration pending)
- [x] Build item preview / "try on" before purchase (hover preview via previewUrl field)
- [x] Add Shop Manager link to Dashboard hamburger menu (admin only)

## Anomoly AI Division (Planned)
- [ ] Confirm Anomoly's name spelling and role with Anom
- [ ] Build Anomoly AI Division page (/anomoly) — Division #8 in the 12 AO Universe Divisions
- [ ] Integrate Anomoly as platform guide chatbot (uses built-in LLM with AO Universe persona)
- [ ] Add Anomoly to the Universe Map as a district node
- [ ] Add Anomoly welcome message on first login (alongside Being Selection)

## Content Pages (Pending — Shells Exist)
- [ ] Build Work/Gallery page (/work) — 6 art lanes: Backgrounds, Profile Pictures, Mood Collection, Merch Designs, MP4 Motion Vault, Lifestyle & Gear
- [ ] Build Custom Services page (/services) — digital commissions, PayPal payment links, FB Marketplace CTA
- [ ] Build Merch page (/merch) — Spreadshop embed, Printful products, buyer pays shipping

## Universe Home Redesign
- [x] Replace all 10 missions with proper onboarding feature-tour sequence
- [x] Remove Lounge as a mission destination
- [x] Change post-login redirect from /dashboard to /universe
- [x] Fix UniverseMap Quick Travel — Financial District and Creator Worlds now live (were disabled)
- [x] Add Lounge and Anom's Corner to Quick Travel panel
- [x] Update UniverseMap header nav label from "Dashboard" to "Mission Hub"

## Session Jul 12 2026 — Upload, Theme Persistence, Anomaly Chatbot
- [ ] Add real S3 file upload to Admin Shop Manager (file picker + upload endpoint + stored URL)
- [ ] Persist theme selection to DB via profiles.backgroundId and hydrate on login
- [ ] Apply selected theme globally via CSS variables (ThemeProvider / root class switching)
- [ ] Build Anomaly AI guide chatbot (/anomaly) — interactive chatbot with AO Universe persona
- [ ] Add Anomaly to Universe Map as a district node
- [ ] Add Anomaly link to Dashboard hamburger menu and Home nav
- [ ] Create reusable skill: sanctuary-shop-identity-chatbot (documents shop upload, theme persistence, chatbot build)

## Off-Grid Game Integration (Jul 12 2026)
- [x] Build OffGrid.tsx React page at /games/off-grid — terminal interface, threat system, command processor, shop upgrades
- [x] Wire clearance coins to Sanctuary coin economy via tRPC games.earnCoins
- [x] Add Off-Grid card to Games Hub at /games
- [x] Register /games/off-grid route in App.tsx
- [x] Add useMissionAutoComplete hook to OffGrid page

## Off-Grid Terminal Enhancements (Jul 12 2026)
- [x] Color-code terminal output: red for threats, green for success/clearance, yellow for shop items
- [x] Auto-scroll terminal to bottom on new messages (useEffect on logs)
- [x] CRT monitor visual effect: scanlines overlay, phosphor glow, screen flicker animation
- [x] Create reusable skill: sanctuary-offgrid-game (documents the Off-Grid terminal game integration process)
- [x] Settings page: font selector for site-wide font (Space Mono, VT323, Courier New, Share Tech Mono, Fira Code) — persisted to localStorage
- [x] Off-Grid: slow threat spawn pacing (15s base interval, not 8s; scale with level)
- [x] Off-Grid: add visual property panel showing homestead graphics (garden, solar panels, cabin) that upgrade with player level

## SEO, Landing Page & Profile Editor (Jul 12 2026)
- [x] Create sanctuary-seo-meta skill (documents the SEO meta tag fix process for Sanctuary pages)
- [x] Landing page: add Social Good + Coin Rewards feature section (visual highlight, icons, short copy)
- [x] Profile word editor: no-code textarea with photo upload (S3) and Giphy picker, strictly no HTML/code input
- [x] Wire word editor into Settings.tsx profile card (replace plain textarea for bio)
- [x] Persist selected Giphy GIF URL to profile customizationData and render on profile pages
- [x] Request VITE_GIPHY_API_KEY secret for Giphy integration (see webdev_request_secrets below)
- [x] Server-side bio sanitization: strip HTML/code on updateBeing procedure before saving
- [x] Render saved customizationData.gifUrl on the public member profile page
- [x] Request VITE_GIPHY_API_KEY via webdev_request_secrets and verify Giphy search works

## Universe Map & Admin Editing (Jul 12 2026)
- [ ] Fix "canonical" and other jargon-heavy descriptions in Universe Map / world nodes
- [ ] Build interactive AO Universe Map page — visual world hierarchy, world cards, quick-travel, plain-language descriptions
- [ ] Admin inline content editor — admin can click any world/node description to edit it in-place and save to DB
- [ ] Admin can edit node names, descriptions, and status directly from the map page

## Admin Inline Editor & Deploy (Jul 12 2026 — TOP PRIORITY)
- [ ] Fix Universe Map copy (jargon cleanup) — save to file
- [ ] Fix SyntaxError: db export in server (browserConsole error)
- [ ] DB: create site_content table (key, value, updated_at, updated_by)
- [ ] tRPC: add content.get (public) and content.set (admin only) procedures
- [ ] Build EditableText component — admin sees pencil icon on hover, clicks to edit inline, saves on Enter/blur
- [ ] Wire EditableText into Universe Map node descriptions
- [ ] Wire EditableText into Landing Page hero copy
- [ ] Wire EditableText into AO-City and district descriptions
- [ ] Add admin guide to master plan document (step-by-step how-to)
- [ ] TypeScript check, checkpoint, ready for publish

## Admin Dashboard — Full Control Hub (TOP PRIORITY)
- [x] DB: create site_content table (key, value, label, page, updated_at)
- [x] DB: create admin_documents table (id, title, content, category, updated_at)
- [x] tRPC: content.getAll, content.set (admin only)
- [x] tRPC: adminDocs.list, adminDocs.upsert, adminDocs.delete (admin only)
- [x] Build /admin route — admin-only, redirects non-admins
- [x] Admin sidebar: Content Editor · Documents · Assets · How-To Guide · Settings
- [x] Content Editor tab: list all editable site text, click to edit inline, save to DB
- [x] Documents tab: store master plan, spark concept, lounge plan — view/edit/download
- [x] Assets tab: upload images, view stored assets with copy-URL button
- [ ] How-To Guide tab: step-by-step instructions for all admin tasks
- [x] EditableText component: pencil icon on hover (admin only), click to edit, Enter/blur to save
- [ ] Wire EditableText into Universe Map node descriptions
- [ ] Wire EditableText into Landing Page hero copy
- [x] Register /admin route in App.tsx
- [x] Upload sanctuary-master-plan.md and sanctuary-spark-concept.md to admin Documents
