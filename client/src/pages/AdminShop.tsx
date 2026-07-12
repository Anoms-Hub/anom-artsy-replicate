import { useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Package, Edit2, Trash2, Eye, EyeOff,
  Zap, Crown, Sparkles, ShoppingBag
} from "lucide-react";
import type { ShopItem } from "../../../drizzle/schema";

const ITEM_TYPES = [
  { value: "sticker", label: "Sticker", icon: "🎨" },
  { value: "background", label: "Background", icon: "🖼️" },
  { value: "emote", label: "Emote / Bling Icon", icon: "✨" },
  { value: "profile_build", label: "Profile Build", icon: "🏗️" },
  { value: "gif_pack", label: "GIF Pack", icon: "🎬" },
  { value: "color_theme", label: "Color Theme", icon: "🎨" },
  { value: "decoration", label: "Decoration", icon: "💎" },
] as const;

const TIERS = [
  { value: "free", label: "Free", color: "text-gray-400", bg: "bg-gray-500/20 border-gray-500/40" },
  { value: "coin", label: "Coin Shop", color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/40" },
  { value: "starter", label: "Starter Pack", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/40" },
  { value: "creator", label: "Creator Pack", color: "text-purple-400", bg: "bg-purple-500/20 border-purple-500/40" },
  { value: "elite", label: "Elite Pack", color: "text-pink-400", bg: "bg-pink-500/20 border-pink-500/40" },
] as const;

type ItemType = typeof ITEM_TYPES[number]["value"];
type TierType = typeof TIERS[number]["value"];

interface FormState {
  name: string;
  description: string;
  type: ItemType;
  tier: TierType;
  coinPrice: string;
  realPrice: string;
  imageUrl: string;
  previewUrl: string;
  sortOrder: string;
}

const defaultForm: FormState = {
  name: "",
  description: "",
  type: "sticker",
  tier: "coin",
  coinPrice: "50",
  realPrice: "",
  imageUrl: "",
  previewUrl: "",
  sortOrder: "0",
};

export default function AdminShop() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, field: "imageUrl" | "previewUrl") => {
    const isImage = field === "imageUrl";
    if (isImage) setUploadingImage(true); else setUploadingPreview(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/shop-asset", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Upload failed");
      }
      const { url } = await res.json() as { url: string };
      setForm(f => ({ ...f, [field]: url }));
      toast.success(isImage ? "Image uploaded!" : "Preview uploaded!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      if (isImage) setUploadingImage(false); else setUploadingPreview(false);
    }
  };

  const itemsQuery = trpc.shop.getAllItems.useQuery();
  const items = itemsQuery.data ?? [];

  const createMutation = trpc.shop.createItem.useMutation({
    onSuccess: () => {
      toast.success("Item added to shop!");
      utils.shop.getAllItems.invalidate();
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.shop.updateItem.useMutation({
    onSuccess: () => {
      toast.success("Item updated!");
      utils.shop.getAllItems.invalidate();
      setEditingId(null);
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.shop.deleteItem.useMutation({
    onSuccess: () => {
      toast.success("Item removed from shop");
      utils.shop.getAllItems.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleActiveMutation = trpc.shop.updateItem.useMutation({
    onSuccess: () => utils.shop.getAllItems.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  // Guard: admin only
  if (!user || (user as any).role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a0015] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Admin access required.</p>
          <Link href="/dashboard">
            <Button className="bg-pink-500 hover:bg-pink-600">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const payload = {
      name: form.name.trim(),
      description: form.description || undefined,
      type: form.type,
      tier: form.tier,
      coinPrice: parseInt(form.coinPrice) || 0,
      realPrice: form.realPrice ? parseFloat(form.realPrice) : undefined,
      imageUrl: form.imageUrl || undefined,
      previewUrl: form.previewUrl || undefined,
      sortOrder: parseInt(form.sortOrder) || 0,
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      type: item.type,
      tier: item.tier,
      coinPrice: String(item.coinPrice ?? 0),
      realPrice: item.realPrice ? String(item.realPrice) : "",
      imageUrl: item.imageUrl || "",
      previewUrl: item.previewUrl || "",
      sortOrder: String(item.sortOrder ?? 0),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const tierInfo = (tier: string) => TIERS.find(t => t.value === tier) ?? TIERS[1];
  const typeInfo = (type: string) => ITEM_TYPES.find(t => t.value === type) ?? ITEM_TYPES[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#0d0025] to-[#0a0015] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </button>
            </Link>
            <div className="w-px h-5 bg-gray-700" />
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-400" />
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                Shop Manager
              </h1>
            </div>
          </div>
          <Button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
            className="bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Add / Edit Form */}
        {showForm && (
          <Card className="bg-black/60 border-pink-500/40 p-6">
            <h2 className="text-lg font-bold text-pink-300 mb-5 flex items-center gap-2">
              <Package className="w-5 h-5" />
              {editingId !== null ? "Edit Item" : "Add New Item"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1.5">Item Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Neon Bling Icon Pack Vol. 1"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500/60"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What's in this item? What does it do?"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500/60 resize-none"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as ItemType }))}
                  className="w-full bg-[#0d0025] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/60"
                >
                  {ITEM_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>

              {/* Tier */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Tier / Shop</label>
                <select
                  value={form.tier}
                  onChange={e => setForm(f => ({ ...f, tier: e.target.value as TierType }))}
                  className="w-full bg-[#0d0025] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/60"
                >
                  {TIERS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Coin Price */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Coin Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400 text-sm">🪙</span>
                  <input
                    type="number"
                    min="0"
                    value={form.coinPrice}
                    onChange={e => setForm(f => ({ ...f, coinPrice: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/60"
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">Set 0 for free items</p>
              </div>

              {/* Real Price */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Real Money Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.realPrice}
                    onChange={e => setForm(f => ({ ...f, realPrice: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/60"
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">Leave blank for coin-only items</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Item Image</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, "imageUrl"); }}
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    variant="outline"
                    className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-sm"
                  >
                    {uploadingImage ? "Uploading..." : form.imageUrl ? "Replace Image" : "Upload Image"}
                  </Button>
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-white/20" />
                  )}
                  {form.imageUrl && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: "" }))} className="text-slate-500 hover:text-red-400 text-xs">Remove</button>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">PNG, JPEG, GIF, WEBP, SVG — max 20MB</p>
              </div>

              {/* Preview Upload */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Preview Image <span className="text-slate-600">(optional — for hover preview)</span></label>
                <input
                  ref={previewInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, "previewUrl"); }}
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => previewInputRef.current?.click()}
                    disabled={uploadingPreview}
                    variant="outline"
                    className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 text-sm"
                  >
                    {uploadingPreview ? "Uploading..." : form.previewUrl ? "Replace Preview" : "Upload Preview"}
                  </Button>
                  {form.previewUrl && (
                    <img src={form.previewUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-white/20" />
                  )}
                  {form.previewUrl && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, previewUrl: "" }))} className="text-slate-500 hover:text-red-400 text-xs">Remove</button>
                  )}
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Sort Order <span className="text-slate-600">(higher = shown first)</span></label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>


            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId !== null ? "Update Item" : "Add to Shop"}
              </Button>
              <Button onClick={cancelForm} variant="outline" className="border-white/20 text-slate-300">
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Items", value: items.length, icon: <Package className="w-4 h-4 text-cyan-400" /> },
            { label: "Active", value: items.filter((i: ShopItem) => i.isActive).length, icon: <Eye className="w-4 h-4 text-green-400" /> },
            { label: "Coin Shop", value: items.filter((i: ShopItem) => i.tier === "coin").length, icon: <Zap className="w-4 h-4 text-yellow-400" /> },
            { label: "Premium Packs", value: items.filter((i: ShopItem) => ["starter","creator","elite"].includes(i.tier)).length, icon: <Crown className="w-4 h-4 text-pink-400" /> },
          ].map(stat => (
            <Card key={stat.label} className="bg-black/40 border-white/10 p-4 flex items-center gap-3">
              {stat.icon}
              <div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Items Grid */}
        {itemsQuery.isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading shop items...</div>
        ) : items.length === 0 ? (
          <Card className="bg-black/40 border-white/10 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No items in the shop yet</p>
            <p className="text-slate-600 text-sm mb-6">Add your first sticker, background, emote, or pack to get started.</p>
            <Button onClick={() => setShowForm(true)} className="bg-pink-500 hover:bg-pink-600">
              <Plus className="w-4 h-4 mr-2" /> Add First Item
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item: ShopItem) => {
              const tier = tierInfo(item.tier);
              const type = typeInfo(item.type);
              return (
                <Card
                  key={item.id}
                  className={`bg-black/40 border-white/10 overflow-hidden transition-all ${!item.isActive ? "opacity-50" : ""}`}
                >
                  {/* Image */}
                  <div className="relative h-32 bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{type.icon}</span>
                    )}
                    {/* Tier badge */}
                    <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full border font-semibold ${tier.bg} ${tier.color}`}>
                      {tier.label}
                    </span>
                    {!item.isActive && (
                      <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-gray-900/80 text-gray-400 border border-gray-700">
                        Hidden
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="font-bold text-white text-sm truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{type.label}</p>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{item.description}</p>
                    )}

                    {/* Pricing */}
                    <div className="flex items-center gap-3 mt-3">
                      {(item.coinPrice ?? 0) > 0 && (
                        <span className="text-xs text-yellow-400 font-semibold">🪙 {item.coinPrice}</span>
                      )}
                      {item.realPrice && (
                        <span className="text-xs text-green-400 font-semibold">${item.realPrice}</span>
                      )}
                      {(item.coinPrice ?? 0) === 0 && !item.realPrice && (
                        <span className="text-xs text-gray-400">Free</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(item)}
                        className="flex-1 border-white/20 text-slate-300 hover:text-white text-xs"
                      >
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActiveMutation.mutate({ id: item.id, isActive: !item.isActive })}
                        className="border-white/20 text-slate-300 hover:text-white"
                        title={item.isActive ? "Hide from shop" : "Show in shop"}
                      >
                        {item.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Remove "${item.name}" from the shop?`)) {
                            deleteMutation.mutate({ id: item.id });
                          }
                        }}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tip */}
        <Card className="bg-black/40 border-cyan-500/20 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 space-y-1">
              <p><span className="text-cyan-300 font-semibold">Tip:</span> Upload your images using the Manus file uploader first, then paste the returned URL into the Image URL field. This ensures your images load fast and never expire.</p>
              <p>Use <span className="text-yellow-300">Coin Shop</span> tier for items members can buy with earned coins. Use <span className="text-pink-300">Starter / Creator / Elite Pack</span> tiers for premium real-money packages.</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
