import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Palette, Sparkles, ExternalLink } from "lucide-react";

const lanes = [
  {
    icon: "🌌",
    title: "Backgrounds",
    desc: "Custom 4K neon environments and headers built to shape the mood of your space. AO-City skylines, district scenes, personal themes.",
    tags: ["4K Resolution", "Desktop + Mobile", "AO Universe Themes"],
    color: "purple",
    cta: "Commission a Background",
  },
  {
    icon: "✨",
    title: "Profile Pictures",
    desc: "Identity portraits and avatars crafted with glow, personality, and presence. Your face, your being, your energy.",
    tags: ["High-Res PNG", "Profile + Banner", "Neon Identity"],
    color: "pink",
    cta: "Commission a Portrait",
  },
  {
    icon: "🎭",
    title: "Mood Collection",
    desc: "Expressive neon art made for humor, emotion, attitude, and visual storytelling. Say exactly what you feel.",
    tags: ["Expressive", "Emotion-Driven", "Shareable"],
    color: "cyan",
    cta: "Commission Mood Art",
  },
  {
    icon: "🎨",
    title: "Creator Packs",
    desc: "Full digital identity kits — background, portrait, social headers, and a mood graphic. All matched to your vibe.",
    tags: ["Full Kit", "Matched Set", "Social-Ready"],
    color: "yellow",
    cta: "Commission a Pack",
  },
  {
    icon: "🏠",
    title: "Profile Decorations",
    desc: "Badges, frames, overlays, and accent graphics to decorate your AO profile page and social presence.",
    tags: ["Transparent PNG", "AO Themed", "5-Piece Sets"],
    color: "green",
    cta: "Commission Decorations",
  },
  {
    icon: "🌟",
    title: "AO Originals",
    desc: "Official AO Universe symbol art — limited edition digital prints and profile assets from the canon.",
    tags: ["Limited Edition", "AO Canon", "Digital Print"],
    color: "orange",
    cta: "Commission AO Art",
  },
];

const colorMap: Record<string, string> = {
  purple: "border-purple-500/30 hover:border-purple-500/60",
  pink: "border-pink-500/30 hover:border-pink-500/60",
  cyan: "border-cyan-500/30 hover:border-cyan-500/60",
  yellow: "border-yellow-500/30 hover:border-yellow-500/60",
  green: "border-green-500/30 hover:border-green-500/60",
  orange: "border-orange-500/30 hover:border-orange-500/60",
};

const tagColorMap: Record<string, string> = {
  purple: "bg-purple-500/20 text-purple-300",
  pink: "bg-pink-500/20 text-pink-300",
  cyan: "bg-cyan-500/20 text-cyan-300",
  yellow: "bg-yellow-500/20 text-yellow-300",
  green: "bg-green-500/20 text-green-300",
  orange: "bg-orange-500/20 text-orange-300",
};

export default function WorkGallery() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#0d0025] to-[#0a001a] text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="text-gray-400 hover:text-purple-300 transition flex items-center gap-1 text-sm">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </button>
            </Link>
            <span className="text-gray-600">|</span>
            <span className="text-purple-400 font-bold flex items-center gap-2">
              <Palette className="w-4 h-4" /> Work
            </span>
          </div>
          <Link href="/custom">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white gap-1">
              <Palette className="w-3 h-3" /> Commission Art
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="text-5xl mb-4">🎨</div>
        <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
          The Lanes
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-2">
          Visual solutions and digital goods — all built around identity, mood, and neon storytelling.
        </p>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Every piece is custom. Every piece is digital. Every piece is built to feel alive.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/custom">
            <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white gap-2">
              <Sparkles className="w-4 h-4" /> Commission Custom Art
            </Button>
          </Link>
        </div>
      </section>

      {/* The Lanes Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lanes.map((lane) => (
            <Card
              key={lane.title}
              className={`bg-black/60 p-6 transition group ${colorMap[lane.color]}`}
            >
              <div className="text-4xl mb-4">{lane.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition">
                {lane.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{lane.desc}</p>
              <div className="flex flex-wrap gap-1 mb-5">
                {lane.tags.map((tag) => (
                  <span key={tag} className={`text-xs px-2 py-0.5 rounded ${tagColorMap[lane.color]}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <Link href="/custom">
                <Button
                  size="sm"
                  variant="outline"
                  className={`border-${lane.color}-500/30 text-${lane.color}-300 hover:bg-${lane.color}-500/20 w-full`}
                >
                  {lane.cta} →
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-500/20 p-8">
          <h2 className="text-3xl font-black text-white mb-4">Identity First.</h2>
          <p className="text-gray-300 text-lg mb-4">
            Anom Originals is built on one belief: your visuals should feel alive — not generic, flat, or forgettable.
          </p>
          <p className="text-gray-400 mb-6">
            I build digital visuals that are expressive, intentional, and unmistakably personal. My work blends neon energy, emotional storytelling, and clean layout design to create identity-driven art. If you want visuals that hit harder than templates and feel like they belong to you, you're in the right place.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Neon glow with dark base",
              "Bold but clean presentation",
              "Expressive identity-driven visuals",
              "Mood-first creative direction",
            ].map((point) => (
              <div key={point} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-pink-400 mt-0.5">✦</span>
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Ready to Build Your Piece?</h2>
        <p className="text-gray-400 mb-6">Tell me what you're imagining — or tell me the vibe and let me run wild.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/custom">
            <Button className="bg-pink-600 hover:bg-pink-500 text-white gap-2 px-8">
              <Palette className="w-4 h-4" /> Request a Commission
            </Button>
          </Link>
          <Link href="/anoms-corner">
            <Button variant="outline" className="border-purple-500/40 text-purple-300 hover:bg-purple-500/20 gap-2">
              <Sparkles className="w-4 h-4" /> Visit Anom's Corner
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-purple-500/10 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 Anom Originals • Identity in Every Pixel</p>
      </footer>
    </div>
  );
}
