import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useMissionAutoComplete } from "@/hooks/useMissionAutoComplete";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, Plus, Lock, MessageSquare, Heart, Zap, Globe } from "lucide-react";
import { CopyrightFooter } from "@/components/CopyrightFooter";

export default function Lounge() {
  useMissionAutoComplete();
  const { user, isAuthenticated } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<"community" | "family" | "friend" | "fan">("community");

  const loungesQuery = trpc.lounges.getLounges.useQuery();
  const utils = trpc.useUtils();

  const createLoungeMutation = trpc.lounges.createLounge.useMutation({
    onSuccess: () => {
      utils.lounges.getLounges.invalidate();
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
    },
  });

  const TYPE_COLORS: Record<string, string> = {
    community: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    family: "text-red-400 bg-red-500/10 border-red-500/30",
    friend: "text-green-400 bg-green-500/10 border-green-500/30",
    fan: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  };

  const TYPE_ICONS: Record<string, React.ReactNode> = {
    community: <Globe className="w-4 h-4" />,
    family: <Heart className="w-4 h-4" />,
    friend: <Users className="w-4 h-4" />,
    fan: <Zap className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#0d0025] to-[#0a0015] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-pink-500/20 bg-black/60 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </button>
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  Lounges
                </h1>
                <p className="text-xs text-slate-500">Community spaces in the AO Universe</p>
              </div>
            </div>
          </div>
          {isAuthenticated && (
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Lounge
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Create form */}
        {showCreate && isAuthenticated && (
          <Card className="bg-black/60 border-pink-500/40 p-6 mb-8">
            <h2 className="text-lg font-bold text-pink-300 mb-4">Create a Lounge</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Lounge"
                  maxLength={64}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500/60"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What's this lounge about?"
                  maxLength={280}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500/60 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {(["community", "family", "friend", "fan"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      className={`px-3 py-1.5 rounded-full text-xs border capitalize transition ${
                        newType === t
                          ? TYPE_COLORS[t]
                          : "border-white/10 text-slate-400 hover:border-white/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (!newName.trim()) return;
                    createLoungeMutation.mutate({
                      name: newName.trim(),
                      description: newDesc.trim() || undefined,
                      type: newType,
                    });
                  }}
                  disabled={!newName.trim() || createLoungeMutation.isPending}
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  {createLoungeMutation.isPending ? "Creating..." : "Create Lounge"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  className="border-white/20 text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Lounges grid */}
        {!isAuthenticated ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-pink-500/40 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Join the Community</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Sign in to browse community lounges, create your own space, and connect with other members.
            </p>
            <Button onClick={() => startLogin()} className="bg-pink-500 hover:bg-pink-600 text-white">
              Sign In to Continue
            </Button>
          </div>
        ) : loungesQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : loungesQuery.data && loungesQuery.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loungesQuery.data.map((lounge) => (
              <Card key={lounge.id} className="bg-black/60 border-white/10 hover:border-pink-500/40 transition-all p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border capitalize ${TYPE_COLORS[lounge.type] ?? TYPE_COLORS.community}`}>
                    {TYPE_ICONS[lounge.type]}
                    {lounge.type}
                  </div>
                  {lounge.isPrivate && (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
                <h3 className="font-bold text-white mb-1 group-hover:text-pink-300 transition-colors">
                  {lounge.name}
                </h3>
                {lounge.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{lounge.description}</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat coming soon</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-pink-500/40 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Lounges Yet</h2>
            <p className="text-slate-400 text-sm mb-6">
              Be the first to create a community space in the AO Universe.
            </p>
            <Button onClick={() => setShowCreate(true)} className="bg-pink-500 hover:bg-pink-600 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Create the First Lounge
            </Button>
          </div>
        )}
      </main>

      <CopyrightFooter />
    </div>
  );
}
