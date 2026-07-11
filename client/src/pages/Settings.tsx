import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, Sparkles, Shield, Check, X, Loader2, Save } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BeingSelectionModal, BEINGS } from "@/components/BeingSelectionModal";
import { useMissionAutoComplete } from "@/hooks/useMissionAutoComplete";
import { toast } from "sonner";

const PRIVILEGE_TIERS = ["Newcomer", "Citizen", "Member", "Contributor", "Guardian"];

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
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // Being modal
  const [showBeingModal, setShowBeingModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Populate form once profile loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setPhotoUrl(profile.photoUrl || "");
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
    updateBeingMutation.mutate({
      username: username || undefined,
      bio: bio || undefined,
      photoUrl: photoUrl || undefined,
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

            {/* Bio */}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the AO Universe who you are..."
                maxLength={280}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 resize-none"
              />
              <p className="text-xs text-slate-600 mt-1 text-right">{bio.length}/280</p>
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Profile Photo URL</label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
              {photoUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={photoUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-white/20" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <span className="text-xs text-slate-500">Preview</span>
                </div>
              )}
            </div>

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
