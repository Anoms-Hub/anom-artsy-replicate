import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, Sparkles, Shield, Check, X, Loader2, Save, Palette, Type } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BeingSelectionModal, BEINGS } from "@/components/BeingSelectionModal";
import { ProfileWordEditor } from "@/components/ProfileWordEditor";
import { useMissionAutoComplete } from "@/hooks/useMissionAutoComplete";
import { toast } from "sonner";

const PRIVILEGE_TIERS = ["Newcomer", "Citizen", "Member", "Contributor", "Guardian"];

const FONTS = [
  { id: "inter",        label: "Inter",           stack: "'Inter', sans-serif",                  preview: "The quick brown fox" },
  { id: "space-mono",  label: "Space Mono",      stack: "'Space Mono', monospace",             preview: "The quick brown fox" },
  { id: "vt323",       label: "VT323",           stack: "'VT323', monospace",                  preview: "THE QUICK BROWN FOX" },
  { id: "share-tech",  label: "Share Tech Mono", stack: "'Share Tech Mono', monospace",        preview: "The quick brown fox" },
  { id: "fira-code",   label: "Fira Code",       stack: "'Fira Code', monospace",              preview: "The quick brown fox" },
  { id: "courier-new", label: "Courier New",     stack: "'Courier New', Courier, monospace",   preview: "The quick brown fox" },
];

const THEMES = [
  { id: "dark", label: "Dark", description: "Deep space black — the default AO look", preview: "bg-[#0a0015]" },
  { id: "light", label: "Light", description: "Clean white with soft accents", preview: "bg-slate-100" },
  { id: "neon-blue", label: "Neon Blue", description: "Electric cyan command center", preview: "bg-[#001a2e]" },
  { id: "neon-purple", label: "Neon Purple", description: "Deep violet with pink glow", preview: "bg-[#0d0025]" },
];

export default function Settings() {
  useMissionAutoComplete();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const fullProfileQuery = trpc.profiles.getMyFullProfile.useQuery();
  const profile = fullProfileQuery.data?.profile;

  // Profile form state
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // Being modal
  const [showBeingModal, setShowBeingModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Font selector — persisted to localStorage, applied globally
  const [selectedFont, setSelectedFont] = useState(() => localStorage.getItem("ao_font_id") ?? "inter");

  // Apply saved font on mount
  useEffect(() => {
    const saved = localStorage.getItem("ao_font_id");
    if (saved) {
      const font = FONTS.find(f => f.id === saved);
      if (font) document.body.style.fontFamily = font.stack;
    }
  }, []);

  // Populate form once profile loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setPhotoUrl(profile.photoUrl || "");
      const customization = (profile.customizationData as Record<string, unknown> | null) ?? {};
      setGifUrl((customization.gifUrl as string) || "");
    }
  }, [profile]);

  // Username availability check
  const checkUsernameQuery = trpc.profiles.checkUsername.useQuery(
    { username },
    {
      enabled: username.length >= 3 && username !== (profile?.username ?? ""),
      onSuccess: (data: { available: boolean }) => {
        setUsernameStatus(data.available ? "available" : "taken");
      },
    } as any
  );

  // Sync check result when query resolves
  useEffect(() => {
    if (username.length < 3 || username === (profile?.username ?? "")) {
      setUsernameStatus("idle");
      return;
    }
    if (checkUsernameQuery.isLoading) {
      setUsernameStatus("checking");
    } else if (checkUsernameQuery.data) {
      setUsernameStatus(checkUsernameQuery.data.available ? "available" : "taken");
    }
  }, [checkUsernameQuery.isLoading, checkUsernameQuery.data, username, profile?.username]);

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setUsernameStatus("idle");
  };

  // Save profile mutation
  const updateBeingMutation = trpc.profiles.updateBeing.useMutation({
    onSuccess: () => {
      utils.profiles.getMyFullProfile.invalidate();
      toast.success("Profile saved!", { description: "Your changes are live on your public profile." });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save profile");
    },
  });

  const handleSave = () => {
    if (usernameStatus === "taken") {
      toast.error("Username is already taken");
      return;
    }
    // Validate URL fields: only send if empty (clears the value) or a valid URL.
    // An invalid partial URL would fail server-side Zod validation.
    const isValidUrl = (val: string) => {
      if (!val) return false;
      try { new URL(val); return true; } catch { return false; }
    };
    const safePhotoUrl = photoUrl === "" ? "" : isValidUrl(photoUrl) ? photoUrl : undefined;
    const safeGifUrl = gifUrl === "" ? "" : isValidUrl(gifUrl) ? gifUrl : undefined;

    if (photoUrl && safePhotoUrl === undefined) {
      toast.error("Photo URL is not a valid URL. Please enter a full URL starting with https://");
      return;
    }
    if (gifUrl && safeGifUrl === undefined) {
      toast.error("GIF URL is not a valid URL. Please enter a full URL starting with https://");
      return;
    }

    updateBeingMutation.mutate({
      username: username || undefined,
      bio: bio || undefined,
      photoUrl: safePhotoUrl,
      gifUrl: safeGifUrl,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">You need to be logged in to access Settings.</p>
          <Link href="/">
            <Button className="bg-pink-500 hover:bg-pink-600">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentBeing = profile?.beingType ? BEINGS.find((b) => b.id === profile.beingType) : null;
  const tierName = PRIVILEGE_TIERS[profile?.privilegeTier ?? 0] ?? "Newcomer";
  const memberSince = user ? new Date().getFullYear() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#0d0025] to-[#0a0015] text-white">
      {/* Being Selection Modal */}
      {showBeingModal && (
        <BeingSelectionModal
          open={showBeingModal}
          onComplete={() => {
            setShowBeingModal(false);
            utils.profiles.getMyFullProfile.invalidate();
          }}
        />
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <button className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </Link>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Profile Section */}
        <Card className="bg-black/60 border-pink-500/30 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-pink-400" />
            </div>
            <h2 className="text-lg font-bold text-pink-300">Profile</h2>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="your_username"
                  maxLength={32}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === "checking" && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                  {usernameStatus === "available" && <Check className="w-4 h-4 text-green-400" />}
                  {usernameStatus === "taken" && <X className="w-4 h-4 text-red-400" />}
                </div>
              </div>
              {usernameStatus === "taken" && (
                <p className="text-xs text-red-400 mt-1">That username is taken</p>
              )}
              {usernameStatus === "available" && (
                <p className="text-xs text-green-400 mt-1">Username is available</p>
              )}
              <p className="text-xs text-slate-600 mt-1">3–32 characters, letters/numbers/underscores/hyphens only</p>
            </div>

            {/* Bio + Photo — no-code word editor */}
            <ProfileWordEditor
              value={bio}
              photoUrl={photoUrl}
              gifUrl={gifUrl}
              onChange={setBio}
              onPhotoChange={setPhotoUrl}
              onGifChange={setGifUrl}
              maxLength={280}
            />

            <Button
              onClick={handleSave}
              disabled={updateBeingMutation.isPending || usernameStatus === "taken"}
              className={`flex items-center gap-2 transition-all duration-300 ${
                saveSuccess
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-pink-500 hover:bg-pink-600 text-white"
              }`}
            >
              {updateBeingMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saveSuccess ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </Button>
          </div>
        </Card>

        {/* Being Section */}
        <Card className="bg-black/60 border-cyan-500/30 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold text-cyan-300">Your Being</h2>
          </div>

          {currentBeing ? (
            <div className="flex items-center gap-4">
              <div className="text-5xl">{currentBeing.emoji}</div>
              <div className="flex-1">
                <p className="font-bold text-white">{profile?.beingName || currentBeing.name}</p>
                <p className="text-xs text-slate-500 mt-1">{currentBeing.title}</p>
                <p className="text-xs text-slate-500 mt-1">{currentBeing.description}</p>
              </div>
              <Button
                onClick={() => setShowBeingModal(true)}
                variant="outline"
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-sm"
              >
                Change Being
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm mb-3">You haven't chosen a being yet.</p>
              <Button
                onClick={() => setShowBeingModal(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
              >
                Choose Your Being
              </Button>
            </div>
          )}
        </Card>

        {/* Theme Section */}
        <Card className="bg-black/60 border-yellow-500/30 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Palette className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-yellow-300">Theme</h2>
              <p className="text-xs text-slate-500">Free basic themes — premium packs coming to the shop</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme) => {
              const isSelected = (profile?.backgroundId || "dark") === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    // Apply theme class immediately (optimistic) so the user sees it right away
                    const THEME_CLASSES = ["theme-dark", "theme-light", "theme-neon-blue", "theme-neon-purple"];
                    const THEME_MAP: Record<string, string> = {
                      dark: "theme-dark",
                      light: "theme-light",
                      "neon-blue": "theme-neon-blue",
                      "neon-purple": "theme-neon-purple",
                    };
                    const html = document.documentElement;
                    THEME_CLASSES.forEach(cls => html.classList.remove(cls));
                    html.classList.add(THEME_MAP[theme.id] ?? "theme-dark");
                    updateBeingMutation.mutate({ backgroundId: theme.id });
                    toast.success(`Theme changed to ${theme.label}`);
                  }}
                  className={`relative rounded-xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-yellow-400/60 bg-yellow-500/10 shadow-[0_0_12px_rgba(234,179,8,0.2)]"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className={`w-full h-8 rounded-md mb-3 ${theme.preview} border border-white/10`} />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{theme.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{theme.description}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-yellow-400 shrink-0" />}
                  </div>
                  {isSelected && (
                    <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Active</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
            <p className="text-xs text-slate-400">
              <span className="text-pink-300 font-semibold">Premium themes</span> — neon gradients, animated backgrounds, custom profile builds — are coming to the Pack Shop. Earn coins or purchase packs to unlock them.
            </p>
          </div>
        </Card>

        {/* Font Selector Section */}
        <Card className="bg-black/60 border-teal-500/30 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Type className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-teal-300">Font</h2>
              <p className="text-xs text-slate-500">Choose your preferred site font</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FONTS.map((font) => {
              const isSelected = selectedFont === font.id;
              return (
                <button
                  key={font.id}
                  onClick={() => {
                    setSelectedFont(font.id);
                    localStorage.setItem("ao_font_id", font.id);
                    document.body.style.fontFamily = font.stack;
                    toast.success(`Font changed to ${font.label}`);
                  }}
                  className={`relative rounded-xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-teal-400/60 bg-teal-500/10 shadow-[0_0_12px_rgba(0,200,180,0.15)]"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <p className="text-sm mb-1 text-white" style={{ fontFamily: font.stack }}>
                    {font.preview}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">{font.label}</p>
                    {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0" />}
                  </div>
                  {isSelected && (
                    <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">Active</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Account Info Section */}
        <Card className="bg-black/60 border-purple-500/30 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-purple-300">Account Info</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-slate-400">Display Name</span>
              <span className="text-sm text-white">{user.name || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-slate-400">Privilege Tier</span>
              <span className="text-sm font-semibold text-purple-300">{tierName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-slate-400">Social Good Score</span>
              <span className="text-sm font-bold text-cyan-400">{profile?.socialGoodScore ?? 0} pts</span>
            </div>
            {profile?.username && (
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-slate-400">Public Profile</span>
                <Link href={`/profile/${profile.username}`}>
                  <span className="text-sm text-cyan-400 hover:text-cyan-300 cursor-pointer">
                    /profile/{profile.username}
                  </span>
                </Link>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-400">Auth Provider</span>
              <span className="text-sm text-slate-300">Manus OAuth</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
