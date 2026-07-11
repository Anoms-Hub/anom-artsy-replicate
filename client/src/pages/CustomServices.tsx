import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, ArrowLeft, ExternalLink, Sparkles, CheckCircle, Mail } from "lucide-react";
import { CopyrightFooter } from "@/components/CopyrightFooter";

const services = [
  {
    title: "Custom Neon Portrait",
    desc: "A high-impact identity piece designed for profiles, banners, and branding. Your face, your being, your energy — in neon.",
    price: "$28",
    paypalUrl: "https://www.paypal.com/ncp/payment/VH5WE6LGSWB78",
    tag: "Most Popular",
    tagColor: "pink",
    includes: ["High-res PNG delivery", "Profile + banner size", "1 revision included", "Delivered within 5 days"],
  },
  {
    title: "Themed Background",
    desc: "Custom 4K wallpaper or social header designed around your specific mood, vibe, or AO Universe district.",
    price: "$24",
    paypalUrl: "https://www.paypal.com/ncp/payment/VH5WE6LGSWB78",
    tag: "Digital",
    tagColor: "cyan",
    includes: ["4K resolution PNG", "Desktop + mobile sizes", "AO Universe or custom theme", "Delivered within 4 days"],
  },
  {
    title: "Creator Pack",
    desc: "Full digital identity kit — background, portrait, social headers, and a mood graphic. All matched to your vibe.",
    price: "$75",
    paypalUrl: "https://www.paypal.com/ncp/payment/7WN8ZDRBVBV82",
    tag: "Best Value",
    tagColor: "purple",
    includes: ["Portrait + background + headers", "Mood graphic included", "2 revisions included", "Delivered within 7 days"],
  },
  {
    title: "Profile Decoration Set",
    desc: "Badges, frames, overlays, and accent graphics to decorate your AO profile page or social presence.",
    price: "$18",
    paypalUrl: "https://www.paypal.com/ncp/payment/VH5WE6LGSWB78",
    tag: "Digital",
    tagColor: "yellow",
    includes: ["5-piece decoration set", "Transparent PNG files", "AO Universe themed", "Delivered within 3 days"],
  },
];

const businessServices = [
  {
    title: "Shop Audit",
    price: "$25",
    desc: "Quick written review with honest feedback on visuals, branding, listings, and what needs attention first.",
    paypalUrl: "https://www.paypal.com/ncp/payment/VH5WE6LGSWB78",
  },
  {
    title: "Shop Refresh",
    price: "$95",
    desc: "Banner update, profile/shop image polish, and a cleaner visual presentation for an existing Etsy or digital space.",
    paypalUrl: "https://www.paypal.com/ncp/payment/7WN8ZDRBVBV82",
  },
  {
    title: "Full Brand Build",
    price: "$195",
    desc: "Custom banner, polished product imagery, visual cleanup, and listing presentation guidance.",
    paypalUrl: "https://www.paypal.com/ncp/payment/X47DQNAPWQBK8",
  },
  {
    title: "Brand + Social Starter",
    price: "$295",
    desc: "Full brand build plus matching social graphics so your brand feels connected everywhere.",
    paypalUrl: "https://www.paypal.com/ncp/payment/8JE3UQAUU24LJ",
  },
];

const addOns = [
  { title: "5 Listing Image Polish Set", price: "$45", paypalUrl: "https://www.paypal.com/ncp/payment/QRKZD4XEBBC5U" },
  { title: "Listing Description Cleanup", price: "$40", paypalUrl: "https://www.paypal.com/ncp/payment/QTZJ42GLP3KVQ" },
  { title: "Matching Social Post Set", price: "$65", paypalUrl: "https://www.paypal.com/ncp/payment/75DUV9MBXY3EC" },
  { title: "Custom Promo Graphic", price: "$35", paypalUrl: "https://www.paypal.com/ncp/payment/8JECQDP4FJC6G" },
];

export default function CustomServices() {
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
            <span className="text-purple-400 font-bold flex items-center gap-2">
              <Palette className="w-4 h-4" /> Custom Services
            </span>
          </div>
          <a href="mailto:helloanomoriginals@gmail.com">
            <Button size="sm" variant="outline" className="border-pink-500/40 text-pink-300 hover:bg-pink-500/20 gap-1">
              <Mail className="w-3 h-3" /> Get a Quote
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="text-5xl mb-4">🎨</div>
        <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
          Your Vision, My Neon
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-2">
          Custom digital art that hits different. Tell me your vibe, your story, your chaos — I'll turn it into a glowing identity piece built to stand out.
        </p>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          All digital delivery. No shipping. Files sent directly to your email after payment.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="#individual">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white gap-2">
              <Sparkles className="w-4 h-4" /> Individual Services
            </Button>
          </a>
          <a href="#business">
            <Button variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20">
              Business & Brand
            </Button>
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Choose a Service", desc: "Pick the package that fits your need", icon: "🎯" },
            { step: "2", title: "Pay via PayPal", desc: "Secure payment through PayPal Business", icon: "💳" },
            { step: "3", title: "Send Your Brief", desc: "Email your vibe, references, and details", icon: "📧" },
            { step: "4", title: "Receive Your Art", desc: "High-res files delivered to your inbox", icon: "✨" },
          ].map((s) => (
            <div key={s.step} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xs font-bold text-gray-500 mb-1">STEP {s.step}</div>
              <div className="font-bold text-white mb-1">{s.title}</div>
              <div className="text-xs text-gray-400">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Individual Services */}
      <section id="individual" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-black text-white mb-2">For Individuals</h2>
        <p className="text-gray-400 mb-8">Identity art, built around you.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((svc) => (
            <Card key={svc.title} className="bg-black/60 border-purple-500/20 p-6 hover:border-purple-500/40 transition">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-white">{svc.title}</h3>
                <span className={`text-xs bg-${svc.tagColor}-500/20 text-${svc.tagColor}-300 border border-${svc.tagColor}-500/30 px-2 py-1 rounded flex-shrink-0 ml-2`}>
                  {svc.tag}
                </span>
              </div>
              <p className="text-gray-400 mb-4">{svc.desc}</p>
              <ul className="space-y-1 mb-5">
                {svc.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-pink-400">{svc.price}</span>
                <a href={svc.paypalUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-1">
                    <ExternalLink className="w-3 h-3" /> Book via PayPal
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Business Services */}
      <section id="business" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-black text-white mb-2">For Businesses & Creators</h2>
        <p className="text-gray-400 mb-8">Streamlined, intentional visuals for Etsy sellers and digital creators who want to stand out.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {businessServices.map((svc) => (
            <Card key={svc.title} className="bg-black/60 border-cyan-500/20 p-5 hover:border-cyan-500/40 transition">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-white">{svc.title}</h3>
                <span className="text-xl font-black text-cyan-400 ml-2">{svc.price}</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">{svc.desc}</p>
              <a href={svc.paypalUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-cyan-700 hover:bg-cyan-600 text-white gap-1">
                  <ExternalLink className="w-3 h-3" /> Book This Service
                </Button>
              </a>
            </Card>
          ))}
        </div>

        {/* Add-ons */}
        <h3 className="text-xl font-bold text-white mb-4">Add-Ons</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {addOns.map((addon) => (
            <Card key={addon.title} className="bg-black/40 border-white/10 p-4 text-center">
              <div className="font-semibold text-white text-sm mb-1">{addon.title}</div>
              <div className="text-pink-400 font-bold mb-3">{addon.price}</div>
              <a href={addon.paypalUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="border-pink-500/30 text-pink-300 hover:bg-pink-500/20 text-xs w-full">
                  Add This
                </Button>
              </a>
            </Card>
          ))}
        </div>
      </section>

      {/* Custom Quote CTA */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border border-pink-500/20 p-8 text-center">
          <div className="text-4xl mb-4">💌</div>
          <h2 className="text-3xl font-black text-white mb-3">Need Something More Custom?</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6">
            Multi-piece projects, seasonal launches, full brand builds, and AO Universe commissions can all be quoted as custom packages. Final files are delivered after scope is approved and payment is complete.
          </p>
          <a href="mailto:helloanomoriginals@gmail.com?subject=Custom Commission Request">
            <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white gap-2 px-8">
              <Mail className="w-4 h-4" /> Email for a Custom Quote
            </Button>
          </a>
          <p className="text-gray-500 text-sm mt-3">helloanomoriginals@gmail.com</p>
        </div>
      </section>

      <CopyrightFooter />
    </div>
  );
}
