import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  ArrowLeft, Globe, Plus, Star, Lock, ChevronRight,
  Users, Zap, Sparkles, BookOpen, Coins, CheckCircle, Map
} from "lucide-react";

// ─── Social Good Pillars ──────────────────────────────────────────────────────
const PILLARS = [
  { id: "education", label: "Education", emoji: "📚", description: "Teach, inform, and grow knowledge" },
  { id: "environment", label: "Environment", emoji: "🌱", description: "Protect and celebrate the natural world" },
  { id: "community", label: "Community", emoji: "🤝", description: "Build belonging and connection" },
  { id: "creativity", label: "Creativity", emoji: "🎨", description: "Celebrate art, music, and expression" },
  { id: "wellness", label: "Wellness", emoji: "💙", description: "Support mental and physical health" },
];

// ─── Demo worlds (placeholder until backend is wired) ─────────────────────────
interface DemoWorld {
  id: string;
  name: string;
  creator: string;
  tagline: string;
  pillar: string;
  pillarEmoji: string;
  color: string;
  borderColor: string;
  glowColor: string;
  beings: string[];
  missions: number;
  members: number;
  status: "live" | "coming";
}

const DEMO_WORLDS: DemoWorld[] = [
  {
    id: "ao-city",
    name: "AO-City",
    creator: "Anom Originals",
    tagline: "The Canonical Capital — where every journey begins",
    pillar: "Community",
    pillarEmoji: "🤝",
    color: "from-cyan-500 to-pink-500",
    borderColor: "border-cyan-500/50",
    glowColor: "rgba(6,182,212,0.3)",
    beings: ["Clifford 🐕", "Tater Nugget 🐾", "Security Bot X-9 🤖", "The AO Symbol ⚡"],
    missions: 10,
    members: 0,
    status: "live",
  },
];

// ─── World Creation Form ──────────────────────────────────────────────────────
function WorldCreationForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    pillar: "",
    description: "",
    primaryColor: "#00eaff",
    accentColor: "#ff00cc",
    being1: "",
    being2: "",
    mission1: "",
    mission2: "",
    mission3: "",
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const steps = [
    { label: "Identity", icon: <Globe className="w-4 h-4" /> },
    { label: "Social Good", icon: <Star className="w-4 h-4" /> },
    { label: "Beings", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Missions", icon: <Zap className="w-4 h-4" /> },
    { label: "Review", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const selectedPillar = PILLARS.find(p => p.id === form.pillar);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0a0e1a] border border-purple-500/40 rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 0 40px rgba(168,85,247,0.3)" }}>
        {/* Form header */}
        <div className="border-b border-purple-500/20 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Register Your World</h3>
              <p className="text-xs text-gray-500">Step {step} of {steps.length}: {steps[step - 1].label}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-xl">×</button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-white/5">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs transition-all ${
                i + 1 === step
                  ? "bg-purple-500/10 text-purple-300 border-b-2 border-purple-500"
                  : i + 1 < step
                  ? "text-green-400"
                  : "text-gray-600"
              }`}
            >
              {i + 1 < step ? <CheckCircle className="w-3.5 h-3.5" /> : s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Form body */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <h4 className="text-white font-bold">World Identity</h4>
              <p className="text-xs text-gray-500">Give your world a name and a one-line description that tells members what it's about.</p>
              <div>
                <label className="text-xs text-gray-400 block mb-1">World Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  placeholder="e.g. The Crystal Reef, Nova Station, Pixel Plains..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tagline *</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => update("tagline", e.target.value)}
                  placeholder="A short phrase that captures your world's vibe"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="Tell members what your world is about, who lives here, and what they can do..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={e => update("primaryColor", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs text-gray-500">{form.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={e => update("accentColor", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs text-gray-500">{form.accentColor}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h4 className="text-white font-bold">Social Good Pillar</h4>
              <p className="text-xs text-gray-500">Every world in the AO Universe must declare a social good pillar. This is displayed publicly and factors into the Social Good Score system.</p>
              <div className="grid grid-cols-1 gap-2">
                {PILLARS.map(pillar => (
                  <button
                    key={pillar.id}
                    onClick={() => update("pillar", pillar.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      form.pillar === pillar.id
                        ? "border-purple-500/60 bg-purple-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <span className="text-2xl">{pillar.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{pillar.label}</p>
                      <p className="text-xs text-gray-500">{pillar.description}</p>
                    </div>
                    {form.pillar === pillar.id && <CheckCircle className="w-4 h-4 text-purple-400 ml-auto" />}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h4 className="text-white font-bold">Your Beings</h4>
              <p className="text-xs text-gray-500">Name the original beings (characters) who live in your world. These will appear on your world's node in the AO Universe Map. You can add more after publishing.</p>
              <div className="space-y-3">
                {[
                  { key: "being1", label: "Being 1 (Guide)" },
                  { key: "being2", label: "Being 2 (Optional)" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-400 block mb-1">{label}</label>
                    <input
                      type="text"
                      value={form[key as keyof typeof form]}
                      onChange={e => update(key, e.target.value)}
                      placeholder="e.g. Luna the Starkeeper, Byte the Robot Fox..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60"
                    />
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <p className="font-bold mb-1">About Being Registration</p>
                <p className="text-gray-400">Your beings will be reviewed by AO admin before appearing on the universe map. This ensures all beings in the AO multiverse meet the community standards. Review typically takes 1-3 days.</p>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h4 className="text-white font-bold">Your First Missions</h4>
              <p className="text-xs text-gray-500">Every world needs at least 3 missions — activities that earn AO Coins for visitors. These can be creative prompts, community challenges, or learning activities.</p>
              <div className="space-y-3">
                {[
                  { key: "mission1", label: "Mission 1 *" },
                  { key: "mission2", label: "Mission 2 *" },
                  { key: "mission3", label: "Mission 3 *" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-400 block mb-1">{label}</label>
                    <input
                      type="text"
                      value={form[key as keyof typeof form]}
                      onChange={e => update(key, e.target.value)}
                      placeholder="e.g. Share a piece of art inspired by your world, Write a haiku about your being..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h4 className="text-white font-bold">Review Your World</h4>
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{ borderColor: form.primaryColor + "60", boxShadow: `0 0 20px ${form.primaryColor}20` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.accentColor})` }}>
                    🌍
                  </div>
                  <div>
                    <p className="font-bold text-white">{form.name || "Unnamed World"}</p>
                    <p className="text-xs text-gray-500">{form.tagline || "No tagline set"}</p>
                  </div>
                </div>
                {selectedPillar && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>{selectedPillar.emoji}</span>
                    <span className="text-gray-300">{selectedPillar.label}</span>
                    <span className="text-gray-500">— {selectedPillar.description}</span>
                  </div>
                )}
                {form.being1 && (
                  <p className="text-xs text-gray-400">Guide Being: <span className="text-white">{form.being1}</span></p>
                )}
                <div className="text-xs text-gray-500">
                  {[form.mission1, form.mission2, form.mission3].filter(Boolean).length} missions defined
                </div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300">
                <p className="font-bold mb-1">What happens next</p>
                <p className="text-gray-400">Your world application will be reviewed by AO admin. Once approved, your world node will appear on the AO Universe Map and members can begin traveling to it. You'll receive a notification when it goes live.</p>
              </div>
            </>
          )}
        </div>

        {/* Form footer */}
        <div className="border-t border-white/5 p-5 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition text-sm"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          {step < steps.length ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !form.name || step === 2 && !form.pillar}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={() => {
                // Future: submit to backend
                alert("World application submitted! (Backend integration coming soon — this is the UI skeleton.)");
                onClose();
              }}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition"
            >
              Submit World Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── World Card ───────────────────────────────────────────────────────────────
function WorldCard({ world }: { world: DemoWorld }) {
  return (
    <div
      className={`rounded-xl border ${world.borderColor} bg-black/60 p-5 transition-all hover:bg-black/80`}
      style={{ boxShadow: `0 0 20px ${world.glowColor}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-bold text-lg bg-gradient-to-r ${world.color} bg-clip-text text-transparent`}>
              {world.name}
            </p>
            {world.status === "live" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40">Live</span>
            )}
          </div>
          <p className="text-xs text-gray-500">{world.tagline}</p>
        </div>
        <div className="text-xs text-gray-500 text-right shrink-0">
          <p>by <span className="text-gray-300">{world.creator}</span></p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          {world.pillarEmoji} {world.pillar}
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" /> {world.missions} missions
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {world.members} members
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {world.beings.map(b => (
          <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">{b}</span>
        ))}
      </div>

      {world.status === "live" ? (
        <Link href="/dashboard">
          <button className={`w-full py-2 rounded-lg bg-gradient-to-r ${world.color} text-white font-bold text-sm hover:opacity-90 transition`}>
            Travel to {world.name} →
          </button>
        </Link>
      ) : (
        <button disabled className="w-full py-2 rounded-lg bg-gray-800 text-gray-500 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" /> Coming Soon
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreatorWorlds() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filterPillar, setFilterPillar] = useState<string>("all");

  const filteredWorlds = DEMO_WORLDS.filter(w =>
    filterPillar === "all" ? true : w.pillar.toLowerCase() === filterPillar
  );

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Space Mono', monospace" }}>
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/universe">
              <button className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition text-sm">
                <ArrowLeft className="w-4 h-4" />
                Universe Map
              </button>
            </Link>
            <div className="w-px h-5 bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  Creator Worlds
                </h1>
                <p className="text-xs text-gray-500">Sovereign territories in the AO multiverse</p>
              </div>
            </div>
          </div>
          {isAuthenticated ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Register a World
            </button>
          ) : (
            <button
              onClick={() => startLogin()}
              className="px-4 py-2 rounded-lg border border-purple-500/50 text-purple-400 text-sm hover:bg-purple-500/10 transition"
            >
              Sign In to Build
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-xs text-purple-400 tracking-widest uppercase mb-2">The AO Multiverse</p>
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 mb-3">
            Build Your World.
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Every creator in the AO Universe can build a sovereign world — with original beings, missions, and lore. Your world runs on AO infrastructure. Your members use the same coin ledger and Social Good Score. You own the creative territory.
          </p>
        </div>

        {/* What you get */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: <Map className="w-5 h-5" />, label: "Universe Map Node", desc: "Your world appears on the AO map", color: "text-cyan-400" },
            { icon: <Coins className="w-5 h-5" />, label: "Coin Economy", desc: "Full access to AO Coin infrastructure", color: "text-yellow-400" },
            { icon: <Star className="w-5 h-5" />, label: "SGS Integration", desc: "Members bring their Social Good Score", color: "text-purple-400" },
            { icon: <BookOpen className="w-5 h-5" />, label: "Mission Builder", desc: "Create custom missions for visitors", color: "text-green-400" },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
              <div className={`${item.color} flex justify-center mb-2`}>{item.icon}</div>
              <p className="text-xs font-bold text-white mb-1">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs text-gray-500">Filter by pillar:</span>
          <button
            onClick={() => setFilterPillar("all")}
            className={`text-xs px-3 py-1 rounded-full border transition ${filterPillar === "all" ? "border-white/40 text-white bg-white/10" : "border-white/10 text-gray-400 hover:border-white/30"}`}
          >
            All
          </button>
          {PILLARS.map(p => (
            <button
              key={p.id}
              onClick={() => setFilterPillar(p.id)}
              className={`text-xs px-3 py-1 rounded-full border transition ${filterPillar === p.id ? "border-purple-500/60 text-purple-300 bg-purple-500/10" : "border-white/10 text-gray-400 hover:border-white/30"}`}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>

        {/* World grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {filteredWorlds.map(world => (
            <WorldCard key={world.id} world={world} />
          ))}

          {/* Open slots */}
          {[1, 2].map(i => (
            <button
              key={`slot-${i}`}
              onClick={() => isAuthenticated ? setShowForm(true) : startLogin()}
              className="rounded-xl border border-dashed border-purple-500/20 bg-black/20 p-5 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/20 transition">
                <Plus className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-sm font-bold text-purple-400 mb-1">Open World Slot</p>
              <p className="text-xs text-gray-600">Be one of the first creators in the AO Universe</p>
              <p className="text-xs text-purple-500 mt-2 opacity-0 group-hover:opacity-100 transition">
                {isAuthenticated ? "Register your world →" : "Sign in to claim →"}
              </p>
            </button>
          ))}
        </div>

        {/* Requirements */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            World Registration Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              { label: "World name and lore summary", desc: "Who lives here, what the world is about" },
              { label: "Social good pillar declaration", desc: "One of 5 pillars — displayed publicly, affects SGS" },
              { label: "At least 2 original beings", desc: "Uploaded as art assets, reviewed by AO admin" },
              { label: "At least 3 missions", desc: "Creator-authored activities that earn AO Coins" },
              { label: "Visual identity", desc: "Color palette — AI-generated art is welcome" },
              { label: "Community standards agreement", desc: "SFW, inclusive, no hate speech or adult content" },
            ].map(req => (
              <div key={req.label} className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm">{req.label}</p>
                  <p className="text-xs text-gray-500">{req.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* World creation form modal */}
      {showForm && <WorldCreationForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
