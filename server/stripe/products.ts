/**
 * AO Universe — Digital Products & Subscription Plans
 * All prices are in USD cents (e.g. 999 = $9.99)
 */

export interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  category: "art-pack" | "creator-pack" | "commission" | "merch" | "bundle";
  emoji: string;
  features: string[];
  stripePriceId?: string; // set after creating in Stripe Dashboard
  coinDiscountEligible?: boolean; // art-packs, creator-packs, merch, bundles only (not commissions/subscriptions)
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // cents/month
  interval: "month" | "year";
  emoji: string;
  features: string[];
  stripePriceId?: string; // set after creating in Stripe Dashboard
  highlight?: boolean;
}

export const DIGITAL_PRODUCTS: DigitalProduct[] = [
  // ── Digital Art Packs ──────────────────────────────────────────────────────
  {
    id: "art-pack-neon-cyberpunk",
    name: "Neon Cyberpunk Art Pack",
    description: "A curated collection of neon/cyberpunk digital identity art assets — icons, backgrounds, and overlays crafted by Anom Originals.",
    price: 999,
    category: "art-pack",
    emoji: "🌆",
    coinDiscountEligible: true,
    features: [
      "20+ high-res PNG assets",
      "Neon & cyberpunk aesthetic",
      "Commercial use license",
      "Instant digital download",
    ],
  },
  {
    id: "art-pack-ao-universe",
    name: "AO Universe Character Pack",
    description: "Official AO Universe character art — Clifford, Tater Nugget, X-9, and the AO Symbol — in sticker-ready and wallpaper formats.",
    price: 799,
    category: "art-pack",
    emoji: "✨",
    coinDiscountEligible: true,
    features: [
      "4 official AO Universe characters",
      "Sticker-ready transparent PNGs",
      "Wallpaper & banner formats",
      "Personal use license",
    ],
  },
  {
    id: "art-pack-pixel-dot",
    name: "Pixel & Dot Animation Pack",
    description: "Exclusive art assets from the Pixel & Dot animated series — backgrounds, character sprites, and scene elements.",
    price: 1299,
    category: "art-pack",
    emoji: "🎬",
    coinDiscountEligible: true,
    features: [
      "30+ series art assets",
      "Pixel & Dot characters",
      "Background scenes",
      "Fan & personal use license",
    ],
  },

  // ── Creator Packs ──────────────────────────────────────────────────────────
  {
    id: "creator-pack-brand-starter",
    name: "Brand Starter Creator Pack",
    description: "Everything a new creator needs to establish their digital identity — logo templates, color palettes, and social media asset kits.",
    price: 1999,
    category: "creator-pack",
    emoji: "🎨",
    coinDiscountEligible: true,
    features: [
      "Logo template kit (editable SVG)",
      "5 curated color palettes",
      "Social media banner templates",
      "Brand guide PDF",
      "Commercial use license",
    ],
  },
  {
    id: "creator-pack-social-good",
    name: "Social Good Creator Pack",
    description: "Branded assets and templates for creators building community-focused, social-good content in the AO Universe.",
    price: 1499,
    category: "creator-pack",
    emoji: "💫",
    coinDiscountEligible: true,
    features: [
      "Community post templates",
      "Social good badge set",
      "AO Universe co-branding assets",
      "Usage guidelines included",
    ],
  },

  // ── Custom Portrait Commission ─────────────────────────────────────────────
  {
    id: "commission-custom-portrait",
    name: "Custom Digital Portrait",
    description: "Commission a one-of-a-kind custom digital portrait by Anom Originals. Neon/cyberpunk style, delivered as high-res PNG within 7–14 business days.",
    price: 4999,
    category: "commission",
    emoji: "🖼️",
    // coinDiscountEligible: false — commissions are not eligible
    features: [
      "1 custom character/portrait",
      "Neon/cyberpunk art style",
      "High-res PNG delivery",
      "1 revision included",
      "7–14 business day turnaround",
      "Personal & commercial use",
    ],
  },
  {
    id: "commission-being-portrait",
    name: "AO Being Portrait Commission",
    description: "Get your Sanctuary Being (Clifford, Tater, X-9, or AO Symbol) rendered as a custom portrait with your personal touches.",
    price: 2999,
    category: "commission",
    emoji: "🌟",
    // coinDiscountEligible: false — commissions are not eligible
    features: [
      "Your chosen AO Being",
      "Custom color/accessory options",
      "High-res PNG + web-optimized JPG",
      "5–10 business day turnaround",
      "Personal use license",
    ],
  },

  // ── Pixel & Dot Digital Merch ──────────────────────────────────────────────
  {
    id: "merch-pixel-dot-sticker-pack",
    name: "Pixel & Dot Digital Sticker Pack",
    description: "Animated and static digital stickers featuring Pixel, Dot, and friends — perfect for Discord, Telegram, and social media.",
    price: 499,
    category: "merch",
    emoji: "🐾",
    coinDiscountEligible: true,
    features: [
      "24 digital stickers",
      "Animated GIF + static PNG",
      "Discord & Telegram ready",
      "Personal use license",
    ],
  },
  {
    id: "merch-tater-nugget-pack",
    name: "Tater Nugget Fan Pack",
    description: "A dedicated digital pack celebrating Tater Nugget — Anom's miniature pinscher and brand mascot. Stickers, wallpapers, and emotes.",
    price: 699,
    category: "merch",
    emoji: "🐕",
    coinDiscountEligible: true,
    features: [
      "Tater Nugget sticker set (12 designs)",
      "Phone & desktop wallpapers",
      "Discord emote set",
      "Personal use license",
    ],
  },

  // ── Bundle ─────────────────────────────────────────────────────────────────
  {
    id: "bundle-ao-universe-ultimate",
    name: "AO Universe Ultimate Bundle",
    description: "The complete AO Universe digital collection — all art packs, creator pack, and sticker sets in one discounted bundle.",
    price: 3999,
    category: "bundle",
    emoji: "🌌",
    coinDiscountEligible: true,
    features: [
      "All 3 art packs included",
      "Brand Starter Creator Pack",
      "Pixel & Dot Sticker Pack",
      "Tater Nugget Fan Pack",
      "Save over 40% vs. individual",
      "Commercial use license",
    ],
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "explorer",
    name: "Explorer",
    description: "Begin your journey in the AO Universe. Access missions, earn coins, and build your being.",
    price: 299,
    interval: "month",
    emoji: "⚡",
    features: [
      "Full mission access",
      "Anom Coin earning",
      "Being customization",
      "Community lounges",
      "Basic profile badge",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    description: "Unlock creative tools, priority commission slots, and exclusive creator-only content.",
    price: 799,
    interval: "month",
    emoji: "🎨",
    highlight: true,
    features: [
      "Everything in Explorer",
      "Priority commission queue",
      "Exclusive creator missions",
      "Monthly art pack drop",
      "Creator badge on profile",
      "Early access to new worlds",
    ],
  },
  {
    id: "founder",
    name: "Founder",
    description: "The highest tier — reserved for those who believe in the AO Universe from the start. Lifetime perks and direct access to Anom.",
    price: 1999,
    interval: "month",
    emoji: "🌟",
    features: [
      "Everything in Creator",
      "Founder badge (permanent)",
      "Monthly 1:1 check-in with Anom",
      "Input on new features & worlds",
      "Free commission credit ($30/mo)",
      "Name in the AO Universe credits",
    ],
  },
];

export const getProductById = (id: string): DigitalProduct | undefined =>
  DIGITAL_PRODUCTS.find(p => p.id === id);

export const getPlanById = (id: string): SubscriptionPlan | undefined =>
  SUBSCRIPTION_PLANS.find(p => p.id === id);
