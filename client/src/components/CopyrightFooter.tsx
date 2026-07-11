import { Link } from "wouter";

/**
 * CopyrightFooter — appears on all public-facing pages.
 * Puts the world on notice that AO Universe, Sanctuary, Pixel & Dot,
 * and all associated IP belong to Eliza Wood / Anom Originals.
 */
export function CopyrightFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/60 backdrop-blur-sm mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Brand marks row */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-slate-500 mb-4">
          {["AO Universe™", "Sanctuary™", "Pixel & Dot™", "Anom Originals™"].map((mark) => (
            <span key={mark} className="hover:text-slate-400 transition-colors">{mark}</span>
          ))}
        </div>

        {/* Main copyright line */}
        <p className="text-center text-xs text-slate-500 mb-2">
          © 2019–{year}{" "}
          <span className="text-slate-300 font-semibold">Eliza Wood / Anom Originals</span>.
          {" "}All rights reserved. All characters, worlds, lore, and platform design are original works.
        </p>

        {/* Links row */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <Link href="/terms">
            <span className="text-cyan-500/70 hover:text-cyan-400 transition-colors cursor-pointer">
              Terms of Service &amp; Legal
            </span>
          </Link>
          <span className="text-slate-700">·</span>
          <a href="mailto:helloanomoriginals@gmail.com" className="text-cyan-500/70 hover:text-cyan-400 transition-colors">
            Contact / DMCA
          </a>
          <span className="text-slate-700">·</span>
          <a href="https://anomarsty.lol" className="text-cyan-500/70 hover:text-cyan-400 transition-colors">
            anomarsty.lol
          </a>
        </div>

        {/* Unauthorized use warning */}
        <p className="text-center text-xs text-slate-700 mt-3">
          Unauthorized reproduction, scraping, or commercial use of any content is prohibited and may constitute copyright infringement.
        </p>
      </div>
    </footer>
  );
}
