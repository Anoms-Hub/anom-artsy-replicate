import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Star, BookOpen, Palette, ArrowLeft, ExternalLink, Mail, Calendar, RefreshCw, Lock, Globe, GraduationCap, Brush } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

// Firefox themes
const FIREFOX_THEMES = [
  { name: "AO Eclipse", url: "https://addons.mozilla.org/en-US/firefox/addon/ao-eclipse/", preview: "https://addons.mozilla.org/user-media/version-previews/full/4085/4085204.png?modified=1783572047", colors: ["#0a0015", "#1a0035", "#c084fc"] },
  { name: "Anom Afterglow", url: "https://addons.mozilla.org/en-US/firefox/addon/anom-afterglow/", preview: "https://addons.mozilla.org/user-media/version-previews/full/4077/4077500.png?modified=1775672833", colors: ["#0a0015", "#22d3ee", "#f472b6"] },
  { name: "AO Dark Mode", url: "https://addons.mozilla.org/en-US/firefox/addon/ao-dark-mode/", preview: "https://addons.mozilla.org/user-media/version-previews/full/4084/4084554.png?modified=1782603889", colors: ["#0d0d1a", "#1a1a2e", "#4a4a7a"] },
  { name: "Fractal Dreamscape", url: "https://addons.mozilla.org/en-US/firefox/addon/fractal-dreamscape/", preview: "https://addons.mozilla.org/user-media/version-previews/full/4063/4063500.png?modified=1759586129", colors: ["#0d0020", "#7c3aed", "#06b6d4"] },
  { name: "blueblacksolids", url: "https://addons.mozilla.org/en-US/firefox/addon/blueblacksolids/", preview: "https://addons.mozilla.org/user-media/version-previews/full/4064/4064576.png?modified=1760908971", colors: ["#000814", "#001d3d", "#003566"] },
];

function GmailWidget({ isAdmin }: { isAdmin: boolean }) {
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading, refetch } = trpc.owner.getInbox.useQuery({ q: "in:inbox", maxResults: 5 }, { enabled: isAdmin && enabled });
  if (!isAdmin) return <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-500"><Lock className="w-6 h-6" /><p className="text-xs">Owner only</p></div>;
  if (!enabled) return <div className="flex flex-col items-center justify-center h-32 gap-2"><Mail className="w-6 h-6 text-cyan-400" /><Button size="sm" onClick={() => setEnabled(true)} className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs">Load Inbox</Button></div>;
  if (isLoading) return <div className="flex items-center justify-center h-32 gap-2 text-slate-400"><RefreshCw className="w-4 h-4 animate-spin" /><span className="text-xs">Loading...</span></div>;
  const threads = Array.isArray(data) ? data : (data as any)?.messages || (data as any)?.threads || [];
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-500">{threads.length} threads</span>
        <button onClick={() => refetch()} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Refresh</button>
      </div>
      {threads.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No recent messages</p> : threads.slice(0, 5).map((t: any, i: number) => (
        <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-slate-200 truncate flex-1">{t.subject || "(no subject)"}</p>
            <span className="text-xs text-slate-600 shrink-0">{t.date ? new Date(t.date).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}</span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">{t.from?.split("<")[0]?.trim() || t.from || "Unknown"}</p>
        </div>
      ))}
    </div>
  );
}

function CalendarWidget({ isAdmin }: { isAdmin: boolean }) {
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading, refetch } = trpc.owner.getCalendar.useQuery({ days: 14 }, { enabled: isAdmin && enabled });
  if (!isAdmin) return <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-500"><Lock className="w-6 h-6" /><p className="text-xs">Owner only</p></div>;
  if (!enabled) return <div className="flex flex-col items-center justify-center h-32 gap-2"><Calendar className="w-6 h-6 text-purple-400" /><Button size="sm" onClick={() => setEnabled(true)} className="bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-xs">Load Schedule</Button></div>;
  if (isLoading) return <div className="flex items-center justify-center h-32 gap-2 text-slate-400"><RefreshCw className="w-4 h-4 animate-spin" /><span className="text-xs">Loading...</span></div>;
  const events = Array.isArray(data) ? data : (data as any)?.events || [];
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-500">{events.length} upcoming</span>
        <button onClick={() => refetch()} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Refresh</button>
      </div>
      {events.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No upcoming events</p> : events.slice(0, 7).map((ev: any, i: number) => {
        const start = ev.start ? new Date(ev.start) : null;
        const day = start ? start.toLocaleDateString([], { weekday: "short" }) : "";
        return (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            {start && <div className="shrink-0 rounded-md px-2 py-1 bg-purple-500/20 text-purple-300 text-center min-w-[40px]"><div className="text-xs font-bold">{day}</div><div className="text-xs">{start.getDate()}</div></div>}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-200 truncate">{ev.summary || "(no title)"}</p>
              {start && <p className="text-xs text-slate-500 mt-0.5">{start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const creatorNotes = [
  {
    date: "Jul 2026",
    title: "The AO Universe is Opening",
    body: "Sanctuary is live. The platform we've been building — missions, beings, the Financial District, Creator Worlds — it's all here. This is the beginning of something real. Thank you for being early.",
    tag: "Platform Update",
    color: "pink",
  },
  {
    date: "Jun 2026",
    title: "Pixel & Dot: Season 1 in Development",
    body: "The animated series is in active storyboard phase. Pixel and Dot are two kids navigating the AO Universe — learning, earning, and discovering what it means to be a good citizen of a digital world. More soon.",
    tag: "Animation",
    color: "cyan",
  },
  {
    date: "May 2026",
    title: "Tater Nugget Joins the Universe",
    body: "My miniature pinscher Tater Nugget is now an official AO being archetype — the Chaos Agent. Unpredictable, creative, full of energy. If you picked Tater as your being, you already know.",
    tag: "Characters",
    color: "yellow",
  },
  {
    date: "Apr 2026",
    title: "Identity Art, Not Just Decoration",
    body: "Every background, portrait, and creator pack I make is built around one idea: your visuals should feel alive. Not generic. Not templated. Built for you, around your vibe, your story, your energy.",
    tag: "Design Philosophy",
    color: "purple",
  },
];

const pixelDotEpisodes = [
  {
    ep: "S1E1",
    title: "The First Mission",
    desc: "Pixel and Dot arrive in AO-City and receive their first mission from Clifford at Heartfield Commons.",
    status: "In Development",
  },
  {
    ep: "S1E2",
    title: "The Snack Quarter",
    desc: "Tater Nugget leads the kids on a chaotic tour of the Snack Quarter — and teaches them about budgeting.",
    status: "Outlined",
  },
  {
    ep: "S1E3",
    title: "Security Bot X-9 and the Credit Bureau",
    desc: "X-9 explains the Social Good Score and why trust is the most valuable currency in the universe.",
    status: "Outlined",
  },
];

const digitalGoods = [
  {
    icon: "🌌",
    title: "Universe Backgrounds",
    desc: "Custom 4K neon environments — AO-City skylines, district scenes, and personal space themes.",
    price: "From $18",
    tag: "Backgrounds",
  },
  {
    icon: "✨",
    title: "Identity Portraits",
    desc: "Your being, your vibe, your face — rendered in neon identity art built for profiles and banners.",
    price: "From $28",
    tag: "Portraits",
  },
  {
    icon: "🎨",
    title: "Creator Packs",
    desc: "Full digital identity kit: background, portrait, social headers, and a mood graphic — all matched.",
    price: "From $75",
    tag: "Packs",
  },
  {
    icon: "🏠",
    title: "Profile Decorations",
    desc: "Badges, frames, overlays, and accent graphics to decorate your AO profile page.",
    price: "From $12",
    tag: "Decorations",
  },
  {
    icon: "🎭",
    title: "Mood Collection",
    desc: "Expressive neon art for humor, emotion, attitude — designed to say exactly what you feel.",
    price: "From $15",
    tag: "Mood Art",
  },
  {
    icon: "🌟",
    title: "AO Symbol Pieces",
    desc: "Official AO Universe symbol art — limited edition digital prints and profile assets.",
    price: "From $20",
    tag: "AO Originals",
  },
];

export default function AnomsCorner() {
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#0d0025] to-[#0a001a] text-white">
      {/* Header */}
      <header className="border-b border-pink-500/20 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="text-gray-400 hover:text-pink-300 transition flex items-center gap-1 text-sm">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </button>
            </Link>
            <span className="text-gray-600">|</span>
            <span className="text-pink-400 font-bold flex items-center gap-2">
              <Heart className="w-4 h-4 fill-pink-400" /> Anom's Corner
            </span>
          </div>
          <Link href="/custom">
            <Button size="sm" className="bg-pink-600 hover:bg-pink-500 text-white gap-1">
              <Palette className="w-3 h-3" /> Commission Art
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="text-6xl mb-4">🐾</div>
        <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
          Anom's Corner
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-2">
          The personal hub of <span className="text-pink-400 font-semibold">Anom Originals</span> — creator, designer, and founder of the AO Universe.
        </p>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Home of Tater Nugget, Pixel & Dot, creator notes, digital art, and everything that makes this universe feel alive.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="#digital-goods">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white gap-2">
              <Sparkles className="w-4 h-4" /> Browse Digital Goods
            </Button>
          </a>
          <a href="#pixel-dot">
            <Button variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 gap-2">
              <BookOpen className="w-4 h-4" /> Pixel & Dot Series
            </Button>
          </a>
        </div>
      </section>

      {/* Digital Home — Admin-only personal hub */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-pink-400" />
          <h2 className="text-2xl font-black text-white">Digital Home</h2>
          <span className="text-xs text-gray-500 ml-1">Your life, all in one place</span>
        </div>

        {/* Quick Links & Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* YouTube */}
          <a href="https://www.youtube.com/channel/UCOnzMmc7fXdBHnhXct3GPSA" target="_blank" rel="noopener noreferrer"
            className="flex flex-col gap-3 p-4 rounded-xl bg-black/60 border border-red-500/30 hover:border-red-500/60 transition group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-red-300 transition">Anom's Corner</p>
                <p className="text-xs text-gray-500">YouTube Channel</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">AO character intros, mood memes, Pixel & Dot previews</p>
            <span className="text-xs text-red-400 group-hover:text-red-300 transition flex items-center gap-1">Visit Channel <ExternalLink className="w-3 h-3" /></span>
          </a>

          {/* Commission Email */}
          <a href="mailto:helloanomoriginals@gmail.com"
            className="flex flex-col gap-3 p-4 rounded-xl bg-black/60 border border-pink-500/30 hover:border-pink-500/60 transition group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-pink-300 transition">Commission Inbox</p>
                <p className="text-xs text-gray-500">Anom Originals</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 break-all">helloanomoriginals@gmail.com</p>
            <span className="text-xs text-pink-400 group-hover:text-pink-300 transition flex items-center gap-1">Send Email <ExternalLink className="w-3 h-3" /></span>
          </a>

          {/* Academic Email */}
          <a href="mailto:elizabeth.wood@snhu.edu"
            className="flex flex-col gap-3 p-4 rounded-xl bg-black/60 border border-blue-500/30 hover:border-blue-500/60 transition group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-blue-300 transition">Academic Email</p>
                <p className="text-xs text-gray-500">SNHU / Maestro</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 break-all">elizabeth.wood@snhu.edu</p>
            <span className="text-xs text-blue-400 group-hover:text-blue-300 transition flex items-center gap-1">Send Email <ExternalLink className="w-3 h-3" /></span>
          </a>

          {/* Firefox Themes */}
          <a href="https://addons.mozilla.org/en-US/firefox/user/anonymous-0708dd3a31dbe355ac36c66931d1261b/" target="_blank" rel="noopener noreferrer"
            className="flex flex-col gap-3 p-4 rounded-xl bg-black/60 border border-orange-500/30 hover:border-orange-500/60 transition group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
                <Brush className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-orange-300 transition">Firefox Themes</p>
                <p className="text-xs text-gray-500">5 published on AMO</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">AO Eclipse, Afterglow, Dark Mode, Fractal Dreamscape, blueblacksolids</p>
            <span className="text-xs text-orange-400 group-hover:text-orange-300 transition flex items-center gap-1">View All Themes <ExternalLink className="w-3 h-3" /></span>
          </a>
        </div>

        {/* Gmail + Calendar widgets — admin only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/60 border-cyan-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Gmail Inbox</h3>
                {!isAdmin && <span className="text-xs text-gray-500 ml-1">(owner only)</span>}
              </div>
            </div>
            <GmailWidget isAdmin={isAdmin} />
          </Card>
          <Card className="bg-black/60 border-purple-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Upcoming Schedule</h3>
                {!isAdmin && <span className="text-xs text-gray-500 ml-1">(owner only)</span>}
              </div>
            </div>
            <CalendarWidget isAdmin={isAdmin} />
          </Card>
        </div>

        {/* Firefox Themes Gallery */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Firefox Theme Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {FIREFOX_THEMES.map((theme) => (
              <a key={theme.name} href={theme.url} target="_blank" rel="noopener noreferrer"
                className="group rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition">
                <div className="h-16 overflow-hidden">
                  <img src={theme.preview} alt={theme.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="p-2 bg-black/80">
                  <p className="text-xs font-medium text-white truncate">{theme.name}</p>
                  <div className="flex gap-1 mt-1">
                    {theme.colors.map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Home — Personal hub */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-pink-400" />
          <h2 className="text-2xl font-black text-white">Digital Home</h2>
          <span className="text-xs text-gray-500 ml-1">Your life, all in one place</span>
        </div>

        {/* Quick Links & Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* YouTube */}
          <a href="https://www.youtube.com/channel/UCOnzMmc7fXdBHnhXct3GPSA" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl bg-black/60 border border-red-500/30 hover:border-red-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-red-300 transition">Anom's Corner</p>
              <p className="text-xs text-gray-500">YouTube • AO characters, mood memes, Pixel & Dot</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-red-400 transition ml-auto flex-shrink-0" />
          </a>

          {/* Commission Gmail */}
          <a href="mailto:helloanomoriginals@gmail.com"
            className="flex items-center gap-3 p-4 rounded-xl bg-black/60 border border-pink-500/30 hover:border-pink-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-pink-600 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-pink-300 transition">Commissions</p>
              <p className="text-xs text-gray-500 truncate">helloanomoriginals@gmail.com</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-pink-400 transition ml-auto flex-shrink-0" />
          </a>

          {/* iCloud — anom247 */}
          <a href="mailto:anom247@icloud.com"
            className="flex items-center gap-3 p-4 rounded-xl bg-black/60 border border-sky-500/30 hover:border-sky-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-sky-700 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M13.5 2C9.36 2 6 5.36 6 9.5c0 .17.01.34.02.51A5.5 5.5 0 0 0 1 15.5C1 18.54 3.46 21 6.5 21h11c2.76 0 5-2.24 5-5a5 5 0 0 0-4.5-4.97A7.5 7.5 0 0 0 13.5 2z"/></svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-sky-300 transition">iCloud Personal</p>
              <p className="text-xs text-gray-500 truncate">anom247@icloud.com</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-sky-400 transition ml-auto flex-shrink-0" />
          </a>

          {/* iCloud — anomoriginals */}
          <a href="mailto:anomoriginals@icloud.com"
            className="flex items-center gap-3 p-4 rounded-xl bg-black/60 border border-cyan-500/30 hover:border-cyan-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-cyan-700 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M13.5 2C9.36 2 6 5.36 6 9.5c0 .17.01.34.02.51A5.5 5.5 0 0 0 1 15.5C1 18.54 3.46 21 6.5 21h11c2.76 0 5-2.24 5-5a5 5 0 0 0-4.5-4.97A7.5 7.5 0 0 0 13.5 2z"/></svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition">iCloud Brand</p>
              <p className="text-xs text-gray-500 truncate">anomoriginals@icloud.com</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-cyan-400 transition ml-auto flex-shrink-0" />
          </a>

          {/* Academic Email */}
          <a href="mailto:elizabeth.wood@snhu.edu"
            className="flex items-center gap-3 p-4 rounded-xl bg-black/60 border border-blue-500/30 hover:border-blue-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-blue-300 transition">Academic</p>
              <p className="text-xs text-gray-500 truncate">elizabeth.wood@snhu.edu</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-blue-400 transition ml-auto flex-shrink-0" />
          </a>

          {/* Personal Gmail */}
          <a href="mailto:bethmarieshanley6@gmail.com"
            className="flex items-center gap-3 p-4 rounded-xl bg-black/60 border border-green-500/30 hover:border-green-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-green-300 transition">Personal</p>
              <p className="text-xs text-gray-500 truncate">bethmarieshanley6@gmail.com</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-green-400 transition ml-auto flex-shrink-0" />
          </a>

          {/* Firefox Themes */}
          <a href="https://addons.mozilla.org/en-US/firefox/user/anonymous-0708dd3a31dbe355ac36c66931d1261b/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl bg-black/60 border border-orange-500/30 hover:border-orange-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
              <Brush className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-orange-300 transition">Firefox Themes</p>
              <p className="text-xs text-gray-500">5 published on AMO</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-orange-400 transition ml-auto flex-shrink-0" />
          </a>
        </div>

        {/* Gmail + Calendar widgets — admin only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/60 border-cyan-500/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Gmail Inbox</h3>
              {!isAdmin && <span className="text-xs text-gray-500 ml-1">(owner only)</span>}
            </div>
            <GmailWidget isAdmin={isAdmin} />
          </Card>
          <Card className="bg-black/60 border-purple-500/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm">Upcoming Schedule</h3>
              {!isAdmin && <span className="text-xs text-gray-500 ml-1">(owner only)</span>}
            </div>
            <CalendarWidget isAdmin={isAdmin} />
          </Card>
        </div>

        {/* Firefox Themes Gallery */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Firefox Theme Gallery</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {FIREFOX_THEMES.map((theme) => (
              <a key={theme.name} href={theme.url} target="_blank" rel="noopener noreferrer"
                className="group rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition">
                <div className="h-16 overflow-hidden bg-gray-900">
                  <img src={theme.preview} alt={theme.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="p-2 bg-black/80">
                  <p className="text-xs font-medium text-white truncate">{theme.name}</p>
                  <div className="flex gap-1 mt-1">
                    {theme.colors.map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Tater Nugget Feature */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-pink-500/10 border border-yellow-500/30 p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="text-8xl flex-shrink-0">🐕</div>
          <div>
            <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">AO Being — The Chaos Agent</div>
            <h2 className="text-3xl font-black text-white mb-3">Tater Nugget</h2>
            <p className="text-gray-300 text-lg mb-4">
              Tater Nugget is a real miniature pinscher and the official Chaos Agent of the AO Universe. Unpredictable, creative, full of energy — and the inspiration behind one of the four being archetypes you can choose when you join Sanctuary.
            </p>
            <p className="text-gray-400 mb-4">
              If you chose Tater as your being, you're in the best company. Chaos Agents earn bonus coins for creative missions and discovery tasks — because sometimes the best path is the one nobody expected.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-500/30">Creativity</span>
              <span className="bg-orange-500/20 text-orange-300 text-xs px-3 py-1 rounded-full border border-orange-500/30">Discovery</span>
              <span className="bg-pink-500/20 text-pink-300 text-xs px-3 py-1 rounded-full border border-pink-500/30">Fun</span>
              <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30">Chaos Agent</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pixel & Dot Series */}
      <section id="pixel-dot" className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h2 className="text-3xl font-black text-white">Pixel & Dot</h2>
          <span className="bg-cyan-500/20 text-cyan-300 text-xs px-3 py-1 rounded-full border border-cyan-500/30 ml-2">Animated Series — Season 1 in Development</span>
        </div>
        <p className="text-gray-300 text-lg mb-8 max-w-3xl">
          Pixel and Dot are two kids navigating the AO Universe — learning about social good, financial literacy, community, and what it means to be a real citizen of a digital world. Each episode is set in a different district of AO-City.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {pixelDotEpisodes.map((ep) => (
            <Card key={ep.ep} className="bg-black/60 border-cyan-500/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded">{ep.ep}</span>
                <span className={`text-xs px-2 py-1 rounded ${ep.status === "In Development" ? "bg-pink-500/20 text-pink-300" : "bg-gray-500/20 text-gray-400"}`}>
                  {ep.status}
                </span>
              </div>
              <h3 className="font-bold text-white mb-2">{ep.title}</h3>
              <p className="text-sm text-gray-400">{ep.desc}</p>
            </Card>
          ))}
        </div>
        <p className="text-gray-500 text-sm">More episodes outlined. Season 1 targets 8 episodes covering all AO-City districts.</p>
      </section>

      {/* Digital Goods */}
      <section id="digital-goods" className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-6 h-6 text-purple-400" />
          <h2 className="text-3xl font-black text-white">Digital Goods</h2>
        </div>
        <p className="text-gray-400 mb-8">All digital — backgrounds, portraits, creator packs, and profile decorations. Delivered to your inbox after payment.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {digitalGoods.map((item) => (
            <Card key={item.title} className="bg-black/60 border-purple-500/20 p-5 hover:border-purple-500/50 transition group">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-white group-hover:text-purple-300 transition">{item.title}</h3>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded ml-2 flex-shrink-0">{item.tag}</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{item.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-pink-400 font-bold">{item.price}</span>
                <Link href="/custom">
                  <button className="text-xs text-purple-400 hover:text-purple-300 transition">Commission →</button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Link href="/custom">
            <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white gap-2 px-8">
              <Palette className="w-4 h-4" /> Request a Custom Commission
            </Button>
          </Link>
        </div>
      </section>

      {/* Creator Notes */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Star className="w-6 h-6 text-yellow-400" />
          <h2 className="text-3xl font-black text-white">Creator Notes</h2>
        </div>
        <div className="space-y-4">
          {creatorNotes.map((note) => (
            <Card key={note.title} className={`bg-black/60 border-${note.color}-500/20 p-6`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs font-bold text-${note.color}-400 bg-${note.color}-500/20 px-2 py-1 rounded mr-2`}>{note.tag}</span>
                  <span className="text-xs text-gray-500">{note.date}</span>
                </div>
              </div>
              <h3 className={`text-lg font-bold text-${note.color}-300 mb-2`}>{note.title}</h3>
              <p className="text-gray-300">{note.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* About Anom */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border border-pink-500/20 p-8 text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="text-3xl font-black text-white mb-4">About Anom</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-4">
            I'm Anom — solo founder of Anom Originals, creator of the AO Universe, and the person behind every piece of neon identity art on this platform. I've been building this brand since September 2019.
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            My work blends neon energy, emotional storytelling, and clean layout design to create identity-driven art that feels alive. The AO Universe is the world I'm building around that belief — a place where social good is rewarded, creativity is currency, and every member has a being that's uniquely theirs.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/custom">
              <Button className="bg-pink-600 hover:bg-pink-500 text-white gap-2">
                <Palette className="w-4 h-4" /> Commission Custom Art
              </Button>
            </Link>
            <Link href="/universe">
              <Button variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 gap-2">
                <Sparkles className="w-4 h-4" /> Explore the Universe
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-500/10 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 Anom Originals • Identity in Every Pixel</p>
        <p className="mt-1">
          <a href="mailto:helloanomoriginals@gmail.com" className="text-pink-400 hover:text-pink-300 transition">helloanomoriginals@gmail.com</a>
        </p>
      </footer>
    </div>
  );
}
