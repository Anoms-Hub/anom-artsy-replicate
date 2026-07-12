import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Heart, Zap, Shield, Star, ChevronRight, Check } from "lucide-react";

type BeingType = "clifford" | "tater" | "x9" | "ao-symbol";

interface Being {
  id: BeingType;
  name: string;
  title: string;
  description: string;
  personality: string;
  power: string;
  color: string;
  gradient: string;
  borderColor: string;
  icon: React.ReactNode;
  emoji: string;
  traits: string[];
}

const BEINGS: Being[] = [
  {
    id: "clifford",
    name: "Clifford",
    title: "The Warm Guardian",
    description: "Clifford embodies warmth, community, and the belief that every person belongs somewhere. His Warm Aura makes everyone around him feel welcome.",
    personality: "Empathetic, patient, community-first",
    power: "Warm Aura — earns bonus coins on community missions",
    color: "text-rose-400",
    gradient: "from-rose-950/60 to-pink-950/40",
    borderColor: "border-rose-500/50 hover:border-rose-400",
    icon: <Heart className="w-8 h-8" />,
    emoji: "🌸",
    traits: ["Community", "Patience", "Warmth"],
  },
  {
    id: "tater",
    name: "Tater Nugget",
    title: "The Chaos Agent",
    description: "Tater Nugget is pure chaotic-good energy — unpredictable, joyful, and always finding the fun in everything. His Chaos Field makes every game a little more exciting.",
    personality: "Playful, spontaneous, joy-seeking",
    power: "Chaos Field — random bonus coin events in mini-games",
    color: "text-yellow-400",
    gradient: "from-yellow-950/60 to-amber-950/40",
    borderColor: "border-yellow-500/50 hover:border-yellow-400",
    icon: <Zap className="w-8 h-8" />,
    emoji: "⚡",
    traits: ["Creativity", "Discovery", "Fun"],
  },
  {
    id: "x9",
    name: "Security Bot X-9",
    title: "The Precise Protector",
    description: "X-9 operates by rules, logic, and an unwavering commitment to order. He believes that mastering systems — financial, social, or otherwise — is the path to true freedom.",
    personality: "Methodical, disciplined, rule-following",
    power: "System Mastery — bonus SGS from Financial District lessons",
    color: "text-cyan-400",
    gradient: "from-cyan-950/60 to-blue-950/40",
    borderColor: "border-cyan-500/50 hover:border-cyan-400",
    icon: <Shield className="w-8 h-8" />,
    emoji: "🤖",
    traits: ["Discipline", "Loyalty", "Financial Literacy"],
  },
  {
    id: "ao-symbol",
    name: "The AO Symbol",
    title: "The Cosmic Catalyst",
    description: "The AO Symbol is the source of all Guardian power in the universe. Rare, powerful, and deeply connected to the fabric of the AO Universe itself.",
    personality: "Visionary, rare, universe-aware",
    power: "Circuit Blessing — amplifies all coin earnings across all worlds",
    color: "text-purple-400",
    gradient: "from-purple-950/60 to-violet-950/40",
    borderColor: "border-purple-500/50 hover:border-purple-400",
    icon: <Star className="w-8 h-8" />,
    emoji: "✨",
    traits: ["Guardian", "World-Builder", "AO Symbol"],
  },
];

interface BeingSelectionModalProps {
  open: boolean;
  onComplete: () => void;
  /** Optional label for the final CTA button. Defaults to "Head to Missions →" */
  completeCta?: string;
}

export function BeingSelectionModal({ open, onComplete, completeCta = "Head to Missions →" }: BeingSelectionModalProps) {
  const [step, setStep] = useState<"select" | "name" | "done">("select");
  const [selectedBeing, setSelectedBeing] = useState<Being | null>(null);
  const [beingName, setBeingName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateBeing = trpc.profiles.updateBeing.useMutation();
  const utils = trpc.useUtils();

  const handleSelectBeing = (being: Being) => {
    setSelectedBeing(being);
    setBeingName(being.name); // default name is the being's name
  };

  const handleNext = () => {
    if (!selectedBeing) return;
    setStep("name");
  };

  const handleSave = async () => {
    if (!selectedBeing) return;
    if (!beingName.trim()) {
      setError("Give your being a name");
      return;
    }
    if (username && !/^[a-zA-Z0-9_-]{3,32}$/.test(username)) {
      setError("Username must be 3-32 characters, letters/numbers/underscores/hyphens only");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateBeing.mutateAsync({
        beingType: selectedBeing.id,
        beingName: beingName.trim(),
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      await utils.profiles.getMyFullProfile.invalidate();
      setStep("done");
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl bg-gray-950 border border-purple-500/30 text-white p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {step === "select" && "Choose Your Being"}
              {step === "name" && "Name Your Being"}
              {step === "done" && "Welcome to the AO Universe!"}
            </DialogTitle>
            <p className="text-sm text-gray-400 mt-1">
              {step === "select" && "Your being is your identity across all worlds in the AO Universe. Choose wisely — this is who you are."}
              {step === "name" && "Give your being a name and set up your profile. You can always update this later."}
              {step === "done" && "Your being has been registered in the AO Universe. Your journey begins now."}
            </p>
          </DialogHeader>
        </div>

        {/* Step: Select Being */}
        {step === "select" && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BEINGS.map((being) => (
                <button
                  key={being.id}
                  onClick={() => handleSelectBeing(being)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 bg-gradient-to-br ${being.gradient} ${being.borderColor} ${
                    selectedBeing?.id === being.id
                      ? "ring-2 ring-white/30 scale-[1.02]"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {selectedBeing?.id === being.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`${being.color} mb-2`}>{being.icon}</div>
                  <div className="font-bold text-white text-sm">{being.name}</div>
                  <div className={`text-xs ${being.color} mb-2`}>{being.title}</div>
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{being.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {being.traits.map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {selectedBeing && (
              <div className={`p-3 rounded-lg bg-gradient-to-r ${selectedBeing.gradient} border ${selectedBeing.borderColor}`}>
                <p className={`text-xs font-semibold ${selectedBeing.color} mb-0.5`}>Special Power</p>
                <p className="text-xs text-gray-200">{selectedBeing.power}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleNext}
                disabled={!selectedBeing}
                className="bg-purple-600 hover:bg-purple-500 text-white gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Name & Profile */}
        {step === "name" && selectedBeing && (
          <div className="p-6 space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${selectedBeing.gradient} border ${selectedBeing.borderColor}`}>
              <div className={selectedBeing.color}>{selectedBeing.icon}</div>
              <div>
                <div className="font-bold text-white text-sm">{selectedBeing.name}</div>
                <div className={`text-xs ${selectedBeing.color}`}>{selectedBeing.title}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">
                  Being Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={beingName}
                  onChange={(e) => setBeingName(e.target.value)}
                  placeholder={`e.g. ${selectedBeing.name} the Brave`}
                  maxLength={64}
                  className="bg-gray-900 border-white/20 text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">This is the name others will see on your profile.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">
                  Username <span className="text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="your-username"
                    maxLength={32}
                    className="bg-gray-900 border-white/20 text-white placeholder-gray-500 pl-7"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Your shareable profile URL: anomarsty.lol/profile/your-username</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">
                  Bio <span className="text-gray-500">(optional)</span>
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the universe who you are..."
                  maxLength={280}
                  rows={2}
                  className="bg-gray-900 border-white/20 text-white placeholder-gray-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{bio.length}/280</p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => setStep("select")}
                className="text-gray-400 hover:text-white"
              >
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !beingName.trim()}
                className="bg-purple-600 hover:bg-purple-500 text-white gap-2"
              >
                {saving ? (
                  <>Registering your being...</>
                ) : (
                  <>Enter the Universe <Sparkles className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && selectedBeing && (
          <div className="p-8 text-center space-y-4">
            <div className={`text-6xl mb-2`}>{selectedBeing.emoji}</div>
            <div className={`text-2xl font-bold ${selectedBeing.color}`}>{beingName}</div>
            <div className="text-gray-300 text-sm">{selectedBeing.title}</div>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Your being has been registered in the AO Universe. Head to Heartfield Commons to begin your first missions.
            </p>
            <div className="flex justify-center gap-1 pt-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${selectedBeing.color.replace("text-", "bg-")} animate-pulse`}
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <div className="pt-2">
              <Button
                onClick={onComplete}
                className="bg-purple-600 hover:bg-purple-500 text-white gap-2 px-6"
              >
                {completeCta}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { BEINGS };
export type { Being, BeingType };
