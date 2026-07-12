import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useMissionAutoComplete } from "@/hooks/useMissionAutoComplete";
import { ArrowLeft, Globe, Map, Star, Zap, Lock, ChevronRight, Users, Coins, BookOpen, Gamepad2 } from "lucide-react";
import { CopyrightFooter } from "@/components/CopyrightFooter";

// ─── 4-Tier Hierarchy Data ──────────────────────────────────────────────────

type Tier = "universe" | "world" | "planet" | "neighborhood";

interface Node {
  id: string;
  name: string;
  tier: Tier;
  tagline: string;
  being?: string;
  beingEmoji?: string;
  color: string;
  glowColor: string;
  borderColor: string;
  status: "live" | "coming" | "creator";
  route?: string;
  children?: string[]; // child node ids
  coins?: number;
  members?: number;
  socialGoodPillar?: string;
  description: string;
}

const NODES: Record<string, Node> = {
  // ── TIER 0: THE AO UNIVERSE ──────────────────────────────────────────────
  "ao-universe": {
    id: "ao-universe",
    name: "The AO Universe",
    tier: "universe",
    tagline: "Where Every Being Has a Story",
    color: "from-pink-500 to-cyan-500",
    glowColor: "rgba(236,72,153,0.4)",
    borderColor: "border-pink-500/60",
    status: "live",
    description: "The canonical home of all AO beings, worlds, planets, and neighborhoods. Every member who joins enters here first. The AO Universe is the ledger of record for all coin earnings, Social Good Scores, and being identities across every world in the multiverse.",
    children: ["ao-city", "creator-worlds"],
    members: 0,
  },

  // ── TIER 1: WORLDS ───────────────────────────────────────────────────────
  "ao-city": {
    id: "ao-city",
    name: "AO-City",
    tier: "world",
    tagline: "The Canonical Capital",
    being: "The AO Symbol",
    beingEmoji: "⚡",
    color: "from-cyan-500 to-purple-500",
    glowColor: "rgba(6,182,212,0.35)",
    borderColor: "border-cyan-500/60",
    status: "live",
    description: "AO-City is Anom Originals' canonical home world — a neon-cyberpunk metropolis where tech and nature collide. It is the first world every member enters, and the source of all Guardian power in the universe.",
    children: ["heartfield-commons", "snack-quarter", "financial-district", "neon-gallery", "broadcast-tower", "the-core"],
    socialGoodPillar: "Community",
  },
  "creator-worlds": {
    id: "creator-worlds",
    name: "Creator Worlds",
    tier: "world",
    tagline: "Sovereign Creative Territories",
    beingEmoji: "🌍",
    color: "from-purple-500 to-pink-500",
    glowColor: "rgba(168,85,247,0.35)",
    borderColor: "border-purple-500/60",
    status: "live",
    route: "/worlds",
    description: "Any verified creator can build and publish their own world — a sovereign node in the AO multiverse with original beings, missions, and lore. Creator worlds run on AO infrastructure but are owned by their creators.",
    children: ["creator-world-1"],
  },

  // ── TIER 2: PLANETS (AO-City Districts) ──────────────────────────────────
  "heartfield-commons": {
    id: "heartfield-commons",
    name: "Heartfield Commons",
    tier: "planet",
    tagline: "Clifford's Domain",
    being: "Clifford",
    beingEmoji: "🐕",
    color: "from-red-500 to-amber-500",
    glowColor: "rgba(239,68,68,0.3)",
    borderColor: "border-red-500/50",
    status: "live",
    route: "/dashboard",
    description: "The warmth district. Clifford guides new members through onboarding, orientation missions, and the coin economy. The emotional anchor of AO-City.",
    socialGoodPillar: "Community",
  },
  "snack-quarter": {
    id: "snack-quarter",
    name: "The Snack Quarter",
    tier: "planet",
    tagline: "Tater Nugget's Domain",
    being: "Tater Nugget",
    beingEmoji: "🐾",
    color: "from-yellow-400 to-orange-500",
    glowColor: "rgba(250,204,21,0.3)",
    borderColor: "border-yellow-400/50",
    status: "live",
    route: "/games",
    description: "Chaotic-good energy. Tater Nugget hosts the Games Hub here — mini-games, coin rushes, and the Snack Vault. The primary engagement district for casual members.",
    socialGoodPillar: "Creativity",
  },
  "financial-district": {
    id: "financial-district",
    name: "The Financial District",
    tier: "planet",
    tagline: "Security Bot X-9's Domain",
    being: "Security Bot X-9",
    beingEmoji: "🤖",
    color: "from-green-400 to-cyan-500",
    glowColor: "rgba(74,222,128,0.3)",
    borderColor: "border-green-400/50",
    status: "live",
    route: "/financial-district",
    description: "Where fiscal responsibility is taught through the coin economy. Security Bot X-9 guides members through savings, checking, credit, and the Social Good Score system.",
    socialGoodPillar: "Education",
  },
  "neon-gallery": {
    id: "neon-gallery",
    name: "The Neon Gallery",
    tier: "planet",
    tagline: "Art & Identity District",
    beingEmoji: "🎨",
    color: "from-pink-500 to-purple-500",
    glowColor: "rgba(236,72,153,0.3)",
    borderColor: "border-pink-500/50",
    status: "coming",
    description: "Creator portfolios, digital art drops, custom portraits, and identity-driven visual storytelling. The creative showcase of AO-City.",
    socialGoodPillar: "Creativity",
  },
  "broadcast-tower": {
    id: "broadcast-tower",
    name: "The Broadcast Tower",
    tier: "planet",
    tagline: "Media & Storytelling District",
    beingEmoji: "📡",
    color: "from-blue-500 to-cyan-400",
    glowColor: "rgba(59,130,246,0.3)",
    borderColor: "border-blue-500/50",
    status: "coming",
    description: "Home of the Pixel & Dot animated series, story arcs, and lore updates. Where the AO Universe narrative lives and grows.",
    socialGoodPillar: "Education",
  },
  "the-core": {
    id: "the-core",
    name: "The Core",
    tier: "planet",
    tagline: "Heart of AO-City",
    being: "The AO Symbol",
    beingEmoji: "⚡",
    color: "from-cyan-400 to-pink-500",
    glowColor: "rgba(6,182,212,0.4)",
    borderColor: "border-cyan-400/60",
    status: "live",
    route: "/dashboard",
    description: "The center of AO-City and source of all Guardian power. The mission board, Social Good Credit system, and coin ledger all live here. The AO Symbol watches over everything.",
    socialGoodPillar: "Community",
  },
  "creator-world-1": {
    id: "creator-world-1",
    name: "Your World",
    tier: "world",
    tagline: "Build Your Universe",
    beingEmoji: "✨",
    color: "from-gray-600 to-gray-700",
    glowColor: "rgba(107,114,128,0.2)",
    borderColor: "border-gray-600/40",
    status: "creator",
    route: "/worlds",
    description: "This node is waiting for a creator. Build your own world with original beings, missions, and lore — all running on AO infrastructure.",
  },
};

// ─── Tier colors / labels ────────────────────────────────────────────────────
const TIER_META: Record<Tier, { label: string; sublabel: string; icon: React.ReactNode }> = {
  universe: { label: "Universe", sublabel: "The AO multiverse — all worlds, all beings", icon: <Star className="w-4 h-4" /> },
  world: { label: "World", sublabel: "Sovereign creative territories", icon: <Globe className="w-4 h-4" /> },
  planet: { label: "Planet / District", sublabel: "Neighborhoods within a world", icon: <Map className="w-4 h-4" /> },
  neighborhood: { label: "Neighborhood", sublabel: "Micro-communities within a planet", icon: <Users className="w-4 h-4" /> },
};

// ─── Node Card ───────────────────────────────────────────────────────────────
function NodeCard({ node, onClick, isSelected }: { node: Node; onClick: () => void; isSelected: boolean }) {
  const statusBadge = node.status === "live"
    ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40">Live</span>
    : node.status === "creator"
    ? <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40">Open Slot</span>
    : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 border border-gray-600">Coming Soon</span>;

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer group
        ${isSelected
          ? `${node.borderColor} bg-black/70 shadow-lg`
          : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60"
        }`}
      style={isSelected ? { boxShadow: `0 0 20px ${node.glowColor}` } : {}}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{node.beingEmoji || "🌐"}</span>
          <div>
            <p className={`font-bold text-sm bg-gradient-to-r ${node.color} bg-clip-text text-transparent`}>
              {node.name}
            </p>
            <p className="text-xs text-gray-500">{node.tagline}</p>
          </div>
        </div>
        {statusBadge}
      </div>
      {node.being && (
        <p className="text-xs text-gray-500 mt-2">Guide: <span className="text-gray-300">{node.being}</span></p>
      )}
      {node.socialGoodPillar && (
        <p className="text-xs text-gray-500 mt-1">Pillar: <span className="text-cyan-400">{node.socialGoodPillar}</span></p>
      )}
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function UniverseMap() {
  useMissionAutoComplete();
  const { isAuthenticated } = useAuth();
  const [selectedId, setSelectedId] = useState<string>("ao-universe");
  const [activeTier, setActiveTier] = useState<Tier | "all">("all");

  const selected = NODES[selectedId];

  // Filtered nodes for the grid
  const visibleNodes = Object.values(NODES).filter(n =>
    activeTier === "all" ? true : n.tier === activeTier
  );

  // Tier breadcrumb for selected node
  const tierMeta = TIER_META[selected.tier];

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Space Mono', monospace" }}>
      {/* Neon grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition text-sm">
                <ArrowLeft className="w-4 h-4" />
                Mission Hub
              </button>
            </Link>
            <div className="w-px h-5 bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
                  AO Universe Map
                </h1>
                <p className="text-xs text-gray-500">Universe → Worlds → Planets → Neighborhoods</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <button
                onClick={() => startLogin()}
                className="text-sm px-4 py-2 rounded border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition"
              >
                Sign In to Join
              </button>
            )}
            <Link href="/worlds">
              <button className="text-sm px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition">
                Build a World
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-xs text-cyan-400 tracking-widest uppercase mb-2">The 4-Tier Hierarchy</p>
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-400 mb-3">
            One Universe.<br />Infinite Worlds.
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            The AO Universe is the canonical home. Creators build their own worlds within it.
            Every world has planets. Every planet has neighborhoods. Your being travels through all of them.
          </p>
        </div>

        {/* Tier hierarchy visual */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {(["universe", "world", "planet", "neighborhood"] as Tier[]).map((tier, i) => (
            <div key={tier} className="flex items-center gap-2">
              <button
                onClick={() => setActiveTier(activeTier === tier ? "all" : tier)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                  activeTier === tier
                    ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300"
                    : "border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200"
                }`}
              >
                {TIER_META[tier].icon}
                {TIER_META[tier].label}
              </button>
              {i < 3 && <ChevronRight className="w-3 h-3 text-gray-600" />}
            </div>
          ))}
          {activeTier !== "all" && (
            <button
              onClick={() => setActiveTier("all")}
              className="text-xs text-gray-500 hover:text-gray-300 underline ml-2"
            >
              Show all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Node grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Group by tier */}
            {(["universe", "world", "planet"] as Tier[]).map(tier => {
              const tierNodes = visibleNodes.filter(n => n.tier === tier);
              if (tierNodes.length === 0) return null;
              return (
                <div key={tier}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-widest">
                      {TIER_META[tier].icon}
                      {TIER_META[tier].label}
                    </div>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tierNodes.map(node => (
                      <NodeCard
                        key={node.id}
                        node={node}
                        onClick={() => setSelectedId(node.id)}
                        isSelected={selectedId === node.id}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Neighborhood placeholder */}
            {(activeTier === "all" || activeTier === "neighborhood") && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-widest">
                    <Users className="w-4 h-4" />
                    Neighborhood
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
                  <p className="text-gray-500 text-sm">Neighborhoods are micro-communities within planets.</p>
                  <p className="text-gray-600 text-xs mt-1">They unlock as planets grow. Coming in a future update.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Detail panel */}
          <div className="space-y-4">
            {/* Selected node detail */}
            <div
              className={`rounded-xl border ${selected.borderColor} bg-black/60 p-5`}
              style={{ boxShadow: `0 0 30px ${selected.glowColor}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selected.beingEmoji || "🌐"}</span>
                <div>
                  <p className={`text-xl font-bold bg-gradient-to-r ${selected.color} bg-clip-text text-transparent`}>
                    {selected.name}
                  </p>
                  <p className="text-xs text-gray-500">{selected.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  selected.status === "live"
                    ? "bg-green-500/20 text-green-400 border-green-500/40"
                    : selected.status === "creator"
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                    : "bg-gray-700 text-gray-400 border-gray-600"
                }`}>
                  {selected.status === "live" ? "● Live" : selected.status === "creator" ? "✦ Open Slot" : "◌ Coming Soon"}
                </span>
                <span className="text-xs text-gray-500 capitalize">{TIER_META[selected.tier].label}</span>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-4">{selected.description}</p>

              {selected.being && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Guide Being</p>
                    <p className="text-sm font-medium text-white">{selected.being}</p>
                  </div>
                </div>
              )}

              {selected.socialGoodPillar && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Social Good Pillar</p>
                    <p className="text-sm font-medium text-white">{selected.socialGoodPillar}</p>
                  </div>
                </div>
              )}

              {selected.children && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Contains {selected.children.length} sub-node{selected.children.length !== 1 ? "s" : ""}</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.children.map(childId => {
                      const child = NODES[childId];
                      if (!child) return null;
                      return (
                        <button
                          key={childId}
                          onClick={() => setSelectedId(childId)}
                          className="text-xs px-2 py-1 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition"
                        >
                          {child.beingEmoji} {child.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Travel button */}
              {selected.route && selected.status === "live" ? (
                <Link href={selected.route}>
                  <button className={`w-full py-2.5 rounded-lg bg-gradient-to-r ${selected.color} text-white font-bold text-sm hover:opacity-90 transition`}>
                    Travel Here →
                  </button>
                </Link>
              ) : selected.route && selected.status === "coming" ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg bg-gray-800 text-gray-500 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Coming Soon
                </button>
              ) : selected.status === "creator" ? (
                <Link href="/worlds">
                  <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition">
                    Claim This Slot →
                  </button>
                </Link>
              ) : null}
            </div>

            {/* Quick links */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Quick Travel</p>
              <div className="space-y-2">
                <Link href="/dashboard">
                  <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition text-left">
                    <Zap className="w-4 h-4 text-pink-400" />
                    <div>
                      <p className="text-sm text-white">Mission Hub</p>
                      <p className="text-xs text-gray-500">Heartfield Commons / The Core</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-600 ml-auto" />
                  </button>
                </Link>
                <Link href="/games">
                  <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition text-left">
                    <Gamepad2 className="w-4 h-4 text-yellow-400" />
                    <div>
                      <p className="text-sm text-white">Games Hub</p>
                      <p className="text-xs text-gray-500">The Snack Quarter</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-600 ml-auto" />
                  </button>
                </Link>
                <Link href="/financial-district">
                  <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition text-left">
                    <BookOpen className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-sm text-white">Financial District</p>
                      <p className="text-xs text-gray-500">Security Bot X-9's Domain</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-600 ml-auto" />
                  </button>
                </Link>
                <Link href="/worlds">
                  <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition text-left">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-sm text-white">Creator Worlds</p>
                      <p className="text-xs text-gray-500">Sovereign Creative Territories</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-600 ml-auto" />
                  </button>
                </Link>
                <Link href="/lounge">
                  <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition text-left">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-sm text-white">Lounges</p>
                      <p className="text-xs text-gray-500">Community Spaces</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-600 ml-auto" />
                  </button>
                </Link>
                <Link href="/anoms-corner">
                  <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition text-left">
                    <Star className="w-4 h-4 text-pink-400" />
                    <div>
                      <p className="text-sm text-white">Anom's Corner</p>
                      <p className="text-xs text-gray-500">Creator Hub</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-600 ml-auto" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Social Good Score teaser */}
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <p className="text-sm font-bold text-yellow-300">Social Good Score</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your SGS travels with you across every world in the AO Universe. Earn it through missions, games, and community contributions. Use it to unlock the Financial District's credit system.
              </p>
              {!isAuthenticated && (
                <button
                  onClick={() => startLogin()}
                  className="mt-3 w-full py-2 rounded-lg border border-yellow-500/40 text-yellow-300 text-xs hover:bg-yellow-500/10 transition"
                >
                  Sign in to see your score
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <CopyrightFooter />
    </div>
  );
}
