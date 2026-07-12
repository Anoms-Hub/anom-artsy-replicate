/**
 * ProfileWordEditor
 *
 * A no-code bio editor for Sanctuary member profiles.
 * Members can type plain text, upload a photo (to S3 via /api/upload/profile-photo),
 * and search/insert Giphy GIFs. No HTML, markdown, or code is ever accepted.
 *
 * Props:
 *   value      — current bio text (plain text only)
 *   photoUrl   — current profile photo URL
 *   onChange   — called with new bio text
 *   onPhotoChange — called with new photo URL (S3 /manus-storage/... or external)
 *   maxLength  — max bio chars (default 280)
 */

import { useRef, useState } from "react";
import { Image, Search, X, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY as string | undefined;
const GIPHY_SEARCH_URL = "https://api.giphy.com/v1/gifs/search";
const GIPHY_TRENDING_URL = "https://api.giphy.com/v1/gifs/trending";

interface GiphyResult {
  id: string;
  title: string;
  images: { fixed_height_small: { url: string; width: string; height: string } };
}

interface Props {
  value: string;
  photoUrl?: string;
  gifUrl?: string;
  onChange: (text: string) => void;
  onPhotoChange: (url: string) => void;
  onGifChange?: (gifUrl: string) => void;
  maxLength?: number;
}

export function ProfileWordEditor({
  value,
  photoUrl,
  gifUrl: externalGifUrl,
  onChange,
  onPhotoChange,
  onGifChange,
  maxLength = 280,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showGiphy, setShowGiphy] = useState(false);
  const [giphyQuery, setGiphyQuery] = useState("");
  const [giphyResults, setGiphyResults] = useState<GiphyResult[]>([]);
  const [giphyLoading, setGiphyLoading] = useState(false);
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);

  // ── Text input ────────────────────────────────────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    // Strip any HTML tags — members cannot inject markup
    const stripped = raw.replace(/<[^>]*>/g, "");
    if (stripped.length <= maxLength) {
      onChange(stripped);
    }
  };

  // ── Photo upload ──────────────────────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG, JPEG, GIF, or WEBP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5 MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/profile-photo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Upload failed");
      }
      const { url } = await res.json();
      onPhotoChange(url);
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingPhoto(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Giphy search ──────────────────────────────────────────────────────────
  const searchGiphy = async (query: string) => {
    if (!GIPHY_API_KEY) {
      toast.error("Giphy is not configured. Ask the site owner to add a Giphy API key.");
      return;
    }
    setGiphyLoading(true);
    try {
      const url = query.trim()
        ? `${GIPHY_SEARCH_URL}?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=18&rating=g`
        : `${GIPHY_TRENDING_URL}?api_key=${GIPHY_API_KEY}&limit=18&rating=g`;
      const res = await fetch(url);
      const json = await res.json();
      setGiphyResults(json.data ?? []);
    } catch {
      toast.error("Could not load GIFs. Try again.");
    } finally {
      setGiphyLoading(false);
    }
  };

  const openGiphy = () => {
    setShowGiphy(true);
    if (giphyResults.length === 0) searchGiphy("");
  };

  const selectGif = (gif: GiphyResult) => {
    const gifUrl = gif.images.fixed_height_small.url;
    setSelectedGifUrl(gifUrl);
    // Persist the GIF URL via the onGifChange callback (stored in customizationData)
    if (onGifChange) onGifChange(gifUrl);
    setShowGiphy(false);
    toast.success("GIF added to your profile!");
  };

  return (
    <div className="space-y-4">
      {/* Photo section */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 bg-white/5 flex-shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <Image className="w-6 h-6" />
            </div>
          )}
          {uploadingPhoto && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-300 mb-1.5">Profile Photo</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3 h-3" />
              {uploadingPhoto ? "Uploading…" : "Upload Photo"}
            </button>
            {photoUrl && (
              <button
                type="button"
                onClick={() => onPhotoChange("")}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1">PNG, JPEG, GIF, or WEBP · max 5 MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Bio textarea */}
      <div>
        <label className="block text-sm text-slate-400 mb-1.5">
          Bio
          <span className="text-xs text-slate-600 ml-2">Plain text only — no code or formatting</span>
        </label>
        <textarea
          value={value}
          onChange={handleTextChange}
          placeholder="Tell the AO Universe who you are…"
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          {GIPHY_API_KEY ? (
            <button
              type="button"
              onClick={openGiphy}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Search className="w-3 h-3" />
              Add a GIF via Giphy
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-slate-600 cursor-default select-none" title="GIF support coming soon">
              <Search className="w-3 h-3" />
              GIF support coming soon
            </span>
          )}
          <span className={`text-xs ${value.length >= maxLength ? "text-red-400" : "text-slate-600"}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      </div>

      {/* Selected GIF preview — show either newly picked or existing from profile */}
      {(selectedGifUrl || externalGifUrl) && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-purple-500/20">
          <img src={selectedGifUrl ?? externalGifUrl ?? undefined} alt="Selected GIF" className="w-16 h-16 rounded object-cover" />
          <div className="flex-1">
            <p className="text-xs text-slate-400">GIF added to your profile</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedGifUrl(null)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Giphy picker modal */}
      {showGiphy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d0025] border border-purple-500/40 rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-purple-300">Add a GIF</h3>
              <button
                type="button"
                onClick={() => setShowGiphy(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search bar */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={giphyQuery}
                  onChange={(e) => setGiphyQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") searchGiphy(giphyQuery); }}
                  placeholder="Search GIFs…"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60"
                />
                <button
                  type="button"
                  onClick={() => searchGiphy(giphyQuery)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                >
                  Search
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1.5">All GIFs are G-rated and SFW</p>
            </div>

            {/* GIF grid */}
            <div className="p-4 h-72 overflow-y-auto">
              {giphyLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : giphyResults.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  {GIPHY_API_KEY ? "No GIFs found. Try a different search." : "Giphy not configured."}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {giphyResults.map((gif) => (
                    <button
                      key={gif.id}
                      type="button"
                      onClick={() => selectGif(gif)}
                      className="rounded-lg overflow-hidden border border-white/10 hover:border-purple-400/60 transition-all duration-200 hover:scale-105"
                    >
                      <img
                        src={gif.images.fixed_height_small.url}
                        alt={gif.title}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Giphy attribution */}
            <div className="px-4 pb-4 text-center">
              <p className="text-xs text-slate-600">Powered by Giphy · G-rated content only</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
